/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import cv from "@techstark/opencv-js";
//const cvAny: any = cv;
//import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import "./scanner.css";
import { CloseButton } from "@mantine/core";
import {
    type YgoScanResult,
    type NormalizedRoi,
    PASSCODE_ROIS,
    cleanPasscode,
    isValidPasscode,
    getMostFrequentValue,
    pickBestPasscode,
} from "./ygoRules";


type YgoLiveScannerProps = {
    onScanComplete?: (result: YgoScanResult) => void | Promise<void>;
    onClose?: () => void;
};

type Point2 = {
    x: number;
    y: number;
};

type RectBounds = {
    x: number;
    y: number;
    w: number;
    h: number;
};

type EdgeSearchResult = {
    bounds: RectBounds | null;
    quadPoints?: Point2[] | null;
    debugImageUrl?: string | null;
};


export default function YgoLiveScanner({
    onScanComplete,
    onClose,
}: YgoLiveScannerProps) {
    // Refs for video element, offscreen canvas, guide box, media stream, and analysis interval
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const croppedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const guideRef = useRef<HTMLDivElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analysisIntervalRef = useRef<number | null>(null);

    // State for tracking status messages and guide analysis results
    const [status, setStatus] = useState("Starting camera...");
    const [cameraReady, setCameraReady] = useState(false);
    const [brightness, setBrightness] = useState<number | null>(null);
    const [sharpness, setSharpness] = useState<number | null>(null);

    // These refs track how many consecutive good frames we've seen and whether we've already captured a card image
    const [goodFrameCount, setGoodFrameCount] = useState(0);
    const goodFrameCountRef = useRef(0);
    const capturedRef = useRef(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // CV processing canvas
    const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);

    // State for extracted ROIs
    const [scanStatus, setScanStatus] = useState("Waiting for card...");
    const [passcodeText, setPasscodeText] = useState("");
    const passcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Canvases for upscaling ROis
    const passcodeUpscaledCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Processed canvases for ROIs OCR
    const passcodeProcessedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    //These are for seeing what hte cropped ROIs look like (Jack Remove after....)
    const [passcodeUpscaledPreviews, setPasscodeUpscaledPreviews] = useState<string[]>([]);
    const [passcodeProcessedPreviews, setPasscodeProcessedPreviews] = useState<string[]>([]);


    const [passcodeAttempts, setPasscodeAttempts] = useState<string[]>([]);
    const [rawPasscodeAttempts, setRawPasscodeAttempts] = useState<string[]>([]);

    // Worker ref for Tesseract OCR
    const workerRef = useRef<any>(null);

    // Main function to run OCR on the captured card image and extract passcode, setcode, and name
    async function runYgoOcr(cardCanvas: HTMLCanvasElement) {
        const passcodeCanvas = passcodeCanvasRef.current;
        const passcodeUpscaledCanvas = passcodeUpscaledCanvasRef.current;
        const passcodeProcessedCanvas = passcodeProcessedCanvasRef.current;

        const worker = workerRef.current;
        if (!worker) {
            setScanStatus("OCR worker not ready.");
            return;
        }

        if (
            !passcodeCanvas ||
            !passcodeUpscaledCanvas ||
            !passcodeProcessedCanvas
        ) {
            return;
        }

        setScanStatus("Preparing passcode regions...");

        const roiUpscaledCanvases: HTMLCanvasElement[] = [];
        const roiProcessedCanvases: HTMLCanvasElement[] = [];

        const upscaledPreviewList: string[] = [];
        const processedPreviewList: string[] = [];

        for (let i = 0; i < PASSCODE_ROIS.length; i++) {
            const roiCanvas = document.createElement("canvas");
            const roiUpscaledCanvas = document.createElement("canvas");
            const roiProcessedCanvas = document.createElement("canvas");

            cropNormalizedRoiToCanvas(cardCanvas, roiCanvas, PASSCODE_ROIS[i]);
            upscaleCanvas(roiCanvas, roiUpscaledCanvas, 6);
            preprocessOcrCanvas(roiUpscaledCanvas, roiProcessedCanvas);

            roiUpscaledCanvases.push(roiUpscaledCanvas);
            roiProcessedCanvases.push(roiProcessedCanvas);

            upscaledPreviewList.push(roiUpscaledCanvas.toDataURL("image/png"));
            processedPreviewList.push(roiProcessedCanvas.toDataURL("image/png"));
        }

        setPasscodeUpscaledPreviews(upscaledPreviewList);
        setPasscodeProcessedPreviews(processedPreviewList);

        setScanStatus("Verifying passcode...");

        const passcodeVotes: string[] = [];
        const rawPasscodeList: string[] = [];
        const cleanedPasscodeList: string[] = [];

        for (let attempt = 0; attempt < 5; attempt++) {
            for (let roiIndex = 0; roiIndex < roiProcessedCanvases.length; roiIndex++) {
                const rawPasscode = await recognizeTextFromCanvasWithWorker(
                    worker,
                    roiProcessedCanvases[roiIndex],
                    "0123456789"
                );

                const cleanedPasscode = cleanPasscode(rawPasscode);

                rawPasscodeList.push(`ROI ${roiIndex + 1}: ${rawPasscode}`);
                cleanedPasscodeList.push(`ROI ${roiIndex + 1}: ${cleanedPasscode}`);

                if (isValidPasscode(cleanedPasscode)) {
                    passcodeVotes.push(cleanedPasscode);
                }
            }

            setScanStatus(`Verifying passcode ${attempt + 1}/5...`);
        }

        setRawPasscodeAttempts(rawPasscodeList);
        setPasscodeAttempts(cleanedPasscodeList);

        const finalPasscode =
            pickBestPasscode(passcodeVotes) || getMostFrequentValue(passcodeVotes) || "";

        setPasscodeText(finalPasscode);
        setScanStatus("Scan complete.");

        const result: YgoScanResult = {
            passcode: finalPasscode,
            setCode: "",
            name: "",
        };

        await onScanComplete?.(result);
    }

    useEffect(() => {
        let mounted = true;

        async function initWorker() {
            try {
                setScanStatus("Loading OCR...");
                const worker = await createWorker("eng");

                if (!mounted) {
                    await worker.terminate();
                    return;
                }

                workerRef.current = worker;
                setScanStatus("Waiting for card...");
            } catch (error) {
                console.error("Failed to load Tesseract worker:", error);
                setScanStatus("OCR failed to load.");
            }
        }

        initWorker();

        return () => {
            mounted = false;

            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        async function startCamera() {
            try {
                setStatus("Requesting camera access...");

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { ideal: 3840 },
                        height: { ideal: 2160 },
                    },
                    audio: false,
                });

                streamRef.current = stream;

                const track = stream.getVideoTracks()[0];

                const supported = navigator.mediaDevices.getSupportedConstraints();
                const capabilities =
                    typeof (track as any).getCapabilities === "function"
                        ? (track as any).getCapabilities()
                        : null;

                const constraints: MediaTrackConstraints = {
                    width: { ideal: 3840 },
                    height: { ideal: 2160 },
                    frameRate: { ideal: 15, max: 24 },
                };

                if (!supported.frameRate) {
                    delete constraints.frameRate;
                }

                if (capabilities && "focusMode" in capabilities) {
                    (constraints as any).focusMode = "continuous";
                }

                try {
                    await track.applyConstraints(constraints);
                } catch (err) {
                    console.warn("Could not apply preferred camera constraints:", err);
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setCameraReady(true);
                setStatus("Camera ready. Analyzing guide box...");
            } catch (error) {
                console.error("Camera error:", error);
                setStatus("Could not access camera.");
            }
        }

        startCamera();

        return () => {
            if (analysisIntervalRef.current !== null) {
                window.clearInterval(analysisIntervalRef.current);
            }

            if (streamRef.current) {
                for (const track of streamRef.current.getTracks()) {
                    track.stop();
                }
            }
        };
    }, []);

    useEffect(() => {
        if (!cameraReady) return;

        function analyzeFrame() {
            const video = videoRef.current;
            const canvas = captureCanvasRef.current;
            const guide = guideRef.current;

            if (!video || !canvas || !guide) return;
            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const videoRect = video.getBoundingClientRect();
            const guideRect = guide.getBoundingClientRect();

            const rawVideoWidth = video.videoWidth;
            const rawVideoHeight = video.videoHeight;

            const displayWidth = videoRect.width;
            const displayHeight = videoRect.height;

            const videoAspect = rawVideoWidth / rawVideoHeight;
            const displayAspect = displayWidth / displayHeight;

            let renderedWidth = 0;
            let renderedHeight = 0;
            let offsetX = 0;
            let offsetY = 0;

            if (videoAspect > displayAspect) {
                renderedHeight = displayHeight;
                renderedWidth = renderedHeight * videoAspect;
                offsetX = (renderedWidth - displayWidth) / 2;
            } else {
                renderedWidth = displayWidth;
                renderedHeight = renderedWidth / videoAspect;
                offsetY = (renderedHeight - displayHeight) / 2;
            }

            const scaleX = rawVideoWidth / renderedWidth;
            const scaleY = rawVideoHeight / renderedHeight;

            const visibleGuideX = guideRect.left - videoRect.left;
            const visibleGuideY = guideRect.top - videoRect.top;

            const guideX = Math.max(
                0,
                Math.floor((visibleGuideX + offsetX) * scaleX)
            );

            const guideY = Math.max(
                0,
                Math.floor((visibleGuideY + offsetY) * scaleY)
            );

            const guideWidth = Math.min(
                rawVideoWidth - guideX,
                Math.floor(guideRect.width * scaleX)
            );

            const guideHeight = Math.min(
                rawVideoHeight - guideY,
                Math.floor(guideRect.height * scaleY)
            );

            if (guideWidth <= 0 || guideHeight <= 0) return;

            const guideFrame = ctx.getImageData(guideX, guideY, guideWidth, guideHeight);

            //Passcode sharpness check
            const croppedCanvas = croppedCanvasRef.current;
            if (!croppedCanvas) return;

            croppedCanvas.width = guideWidth;
            croppedCanvas.height = guideHeight;

            const croppedCtx = croppedCanvas.getContext("2d");
            if (!croppedCtx) return;

            croppedCtx.drawImage(
                canvas,
                guideX,
                guideY,
                guideWidth,
                guideHeight,
                0,
                0,
                guideWidth,
                guideHeight
            );

            const avgBrightness = getAverageBrightness(guideFrame.data);
            const sharpnessScore = getSharpnessScore(guideFrame);

            setBrightness(avgBrightness);
            setSharpness(sharpnessScore);

            // What we check before capturing a fram**********************************************************************
            //************************************************************************************************************
            const brightnessGood = avgBrightness >= 70 && avgBrightness <= 190;
            const sharpnessGood = sharpnessScore >= 13;   //SHarpness is the deciding factor, lightitng is usually not the issue

            if (brightnessGood && sharpnessGood) {
                goodFrameCountRef.current++;
                setGoodFrameCount(goodFrameCountRef.current);

                setStatus("Hold steady...");


                //Check how many frames are needed before the capture.
                //*********************************************** */
                //********************************************* */
                if (goodFrameCountRef.current >= 3 && !capturedRef.current) {
                    capturedRef.current = true;

                    const croppedCanvas = croppedCanvasRef.current;
                    if (!croppedCanvas) return;

                    croppedCanvas.width = guideWidth;
                    croppedCanvas.height = guideHeight;

                    const croppedCtx = croppedCanvas.getContext("2d");
                    if (!croppedCtx) return;

                    croppedCtx.drawImage(
                        canvas,
                        guideX,
                        guideY,
                        guideWidth,
                        guideHeight,
                        0,
                        0,
                        guideWidth,
                        guideHeight
                    );

                    const processedCanvas = processedCanvasRef.current;

                    let finalCanvasForOcr: HTMLCanvasElement = croppedCanvas;

                    if (processedCanvas) {
                        const detection = findCardBoundsInsideGuide(croppedCanvas, processedCanvas);
                        setProcessedImage(detection.debugImageUrl ?? null);

                        if (detection.quadPoints && detection.quadPoints.length === 4) {
                            const warpedCardCanvas = document.createElement("canvas");

                            const warped = warpCardToCanvas(
                                croppedCanvas,
                                warpedCardCanvas,
                                detection.quadPoints,
                                900, //420
                                1300  //610
                            );

                            if (warped) {
                                finalCanvasForOcr = warpedCardCanvas;
                                setStatus("Card detected and flattened!");
                            } else if (detection.bounds) {
                                const detectedCardCanvas = document.createElement("canvas");
                                cropBoundsToCanvas(croppedCanvas, detectedCardCanvas, detection.bounds);
                                finalCanvasForOcr = detectedCardCanvas;
                                setStatus("Card detected and cropped.");
                            } else {
                                setStatus("Guide captured, warp failed.");
                            }
                        } else if (detection.bounds) {
                            const detectedCardCanvas = document.createElement("canvas");
                            cropBoundsToCanvas(croppedCanvas, detectedCardCanvas, detection.bounds);
                            finalCanvasForOcr = detectedCardCanvas;
                            setStatus("Card detected and cropped.");
                        } else {
                            setStatus("Guide captured, card bounds not refined.");
                        }
                    }

                    const captured = finalCanvasForOcr.toDataURL("image/png");
                    setCapturedImage(captured);

                    runYgoOcr(finalCanvasForOcr).catch((error) => {
                        console.error("OCR failed:", error);
                        setScanStatus("OCR failed.");
                    });
                }
            } else {
                goodFrameCountRef.current = 0;

                if (!brightnessGood) {
                    setStatus("Lighting needs adjustment.");
                } else if (!sharpnessGood) {
                    setStatus("Image is blurry.");
                }
            }
        }

        analysisIntervalRef.current = window.setInterval(analyzeFrame, 250);

        return () => {
            if (analysisIntervalRef.current !== null) {
                window.clearInterval(analysisIntervalRef.current);
            }
        };
    }, [cameraReady]);

    return (
        <section className="scanner">
            <CloseButton
                variant="transparent"
                size="xl"
                radius="xl"
                onClick={onClose}
                pos="absolute"
                top={20}
                right={20}
            />
            <div className="video-shell">
                <video
                    ref={videoRef}
                    className="scanner-video"
                    playsInline
                    muted
                    autoPlay
                />

                <div className="overlay">
                    <div ref={guideRef} className="card-guide">
                        <div className="roi-label">Card guide</div>

                        <div className="sub-roi name-roi">Name</div>
                        <div className="sub-roi passcode-roi">Passcode</div>
                        <div className="sub-roi setcode-roi">Set Code</div>
                    </div>
                </div>

                <div className="debug-panel">
                    <div>Brightness: {brightness?.toFixed(2)}</div>
                    <div>Sharpness: {sharpness?.toFixed(2)}</div>
                    <div>Stable Frames: {goodFrameCount}</div>
                    <div>Status: {status}</div>
                </div>
            </div>

            <div style={{ marginTop: 20 }}>
                <p className="status">{scanStatus}</p>
                <p className="status-small">Passcode: {passcodeText || "—"}</p>
            </div>

            <p className="status">{status}</p>

            <p className="status-small">
                {cameraReady
                    ? `Guide brightness: ${brightness !== null ? brightness.toFixed(1) : "Measuring..."
                    }`
                    : "Waiting for camera..."}
            </p>

            <p className="status-small">
                {cameraReady
                    ? `Guide sharpness: ${sharpness !== null ? sharpness.toFixed(1) : "Measuring..."
                    }`
                    : ""}
            </p>

            {capturedImage && (
                <div style={{ marginTop: 20 }}>
                    <h3>Captured Frame</h3>
                    <img
                        src={capturedImage}
                        alt="Captured card"
                        style={{ width: "100%", borderRadius: 12 }}
                    />
                </div>
            )}

            {processedImage && (
                <div style={{ marginTop: 20 }}>
                    <h3>OpenCV Processed</h3>
                    <img
                        src={processedImage}
                        alt="OpenCV processed card"
                        style={{ width: "100%", borderRadius: 12 }}
                    />
                </div>
            )}


            <div style={{ marginTop: 20 }}>
                <h3>OCR Attempts</h3>

                <p className="status-small">Raw Passcode Attempts:</p>
                {rawPasscodeAttempts.map((value, index) => (
                    <p key={`raw-pass-${index}`} className="status-small">
                        {index + 1}. {JSON.stringify(value) || "—"}
                    </p>
                ))}

                <p className="status-small" style={{ marginTop: 12 }}>Cleaned Passcode Attempts:</p>
                {passcodeAttempts.map((value, index) => (
                    <p key={`clean-pass-${index}`} className="status-small">
                        {index + 1}. {value || "—"}
                    </p>
                ))}

            </div>


            {/* Also teh div above is from testing what the raw text and cleaned text was providing... will not be needed later */}
            {/* Remove these 6 images after, only used for tweaking processing */}

            <div style={{ marginTop: 24 }}>
    <h3>Passcode ROI Debug</h3>

    {passcodeUpscaledPreviews.map((img, index) => (
        <div key={`upscaled-${index}`} style={{ marginTop: 16 }}>
            <p className="status-small">ROI {index + 1} Upscaled</p>
            <img
                src={img}
                alt={`ROI ${index + 1} upscaled`}
                style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
            />
        </div>
    ))}

    {passcodeProcessedPreviews.map((img, index) => (
        <div key={`processed-${index}`} style={{ marginTop: 16 }}>
            <p className="status-small">ROI {index + 1} Processed</p>
            <img
                src={img}
                alt={`ROI ${index + 1} processed`}
                style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
            />
        </div>
    ))}
</div>

            <canvas ref={captureCanvasRef} style={{ display: "none" }} />
            <canvas ref={croppedCanvasRef} style={{ display: "none" }} />
            <canvas ref={processedCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeUpscaledCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeProcessedCanvasRef} style={{ display: "none" }} />
        </section>
    );
}

// Preprocessing for OCR ROIs. Just for card ROIs not fullcard
//function preprocessOcrCanvas(                        ******first version***** greyish background
//    sourceCanvas: HTMLCanvasElement,
//    outputCanvas: HTMLCanvasElement
//) {
//    let src: any = null;
//    let gray: any = null;
//    let inverted: any = null;

//    try {
//        src = cv.imread(sourceCanvas);
//        gray = new cv.Mat();
//        inverted = new cv.Mat();

//        // Convert to grayscale
//        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

//        // Invert so dark text becomes light text
//        cv.bitwise_not(gray, inverted);

//        // Show result
//        cv.imshow(outputCanvas, inverted);
//    } finally {
//        if (src) src.delete();
//        if (gray) gray.delete();
//        if (inverted) inverted.delete();
//    }
//}



 //***** second version with Black and White contrast from threshold ****************
function preprocessOcrCanvas(                         
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
) {
    let src: any = null;
    let gray: any = null;
    let blurred: any = null;
    let thresh: any = null;
    let inverted: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        blurred = new cv.Mat();
        thresh = new cv.Mat();
        inverted = new cv.Mat();

        // Grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Light blur to smooth noise
        cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);

        // Stronger separation of text from background
        cv.threshold(
            blurred,
            thresh,
            0,
            255,
            cv.THRESH_BINARY + cv.THRESH_OTSU
        );

        // Invert so text is light on dark if that works better for OCR
        cv.bitwise_not(thresh, inverted);

        cv.imshow(outputCanvas, inverted);
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (blurred) blurred.delete();
        if (thresh) thresh.delete();
        if (inverted) inverted.delete();
    }
}



function findCardBoundsInsideGuide(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas?: HTMLCanvasElement
): EdgeSearchResult {
    let src: any = null;
    let gray: any = null;
    let blurred: any = null;
    let binary: any = null;
    let contours: any = null;
    let hierarchy: any = null;
    let debugMask: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        blurred = new cv.Mat();
        binary = new cv.Mat();
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        debugMask = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Threshold tends to work better than raw edges for "one card on light background"
        cv.threshold(
            blurred,
            binary,
            0,
            255,
            cv.THRESH_BINARY_INV + cv.THRESH_OTSU
        );

        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
        cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);
        cv.dilate(binary, binary, kernel);
        kernel.delete();

        binary.copyTo(debugMask);

        cv.findContours(
            binary,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        const width = src.cols;
        const height = src.rows;
        const frameCenterX = width / 2;
        const frameCenterY = height / 2;

        let bestBounds: RectBounds | null = null;
        let bestContour: any = null;
        let bestQuadPoints: Point2[] | null = null;
        let bestScore = -Infinity;

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);

            if (area < width * height * 0.05) {
                contour.delete();
                continue;
            }

            const peri = cv.arcLength(contour, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(contour, approx, 0.03 * peri, true);

            const rect = cv.boundingRect(contour);
            const aspect = rect.width / rect.height;

            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;
            const distX = Math.abs(centerX - frameCenterX) / width;
            const distY = Math.abs(centerY - frameCenterY) / height;

            const nearCenter =
                distX <= 0.35 &&
                distY <= 0.35;

            const bigEnough =
                rect.width > width * 0.18 &&
                rect.height > height * 0.25;

            const cardAspect =
                aspect > 0.40 &&
                aspect < 1.10;

            if (!nearCenter || !bigEnough || !cardAspect) {
                approx.delete();
                contour.delete();
                continue;
            }

            // Score biggest plausible contour, with a mild center bonus
            const normalizedArea = area / (width * height);
            const centerPenalty = distX + distY;
            const quadBonus = approx.rows === 4 ? 0.08 : 0;

            const score = normalizedArea - centerPenalty + quadBonus;

            if (score > bestScore) {
                bestScore = score;

                if (bestContour) bestContour.delete();
                bestContour = approx.clone();

                bestBounds = {
                    x: rect.x,
                    y: rect.y,
                    w: rect.width,
                    h: rect.height,
                };

                if (approx.rows === 4) {
                    bestQuadPoints = contourToPoints(approx);
                } else {
                    bestQuadPoints = null;
                }
            }

            approx.delete();
            contour.delete();
        }

        if (outputCanvas) {
            const debugMat = src.clone();

            if (bestContour) {
                const vec = new cv.MatVector();
                vec.push_back(bestContour);

                cv.drawContours(debugMat, vec, 0, new cv.Scalar(0, 255, 0, 255), 3);

                if (bestBounds) {
                    cv.rectangle(
                        debugMat,
                        new cv.Point(bestBounds.x, bestBounds.y),
                        new cv.Point(bestBounds.x + bestBounds.w, bestBounds.y + bestBounds.h),
                        new cv.Scalar(255, 0, 0, 255),
                        2
                    );
                }

                vec.delete();
                cv.imshow(outputCanvas, debugMat);

                const debugImageUrl = outputCanvas.toDataURL("image/png");

                bestContour.delete();
                debugMat.delete();

                return {
                    bounds: bestBounds,
                    quadPoints: bestQuadPoints,
                    debugImageUrl,
                };
            } else {
                cv.imshow(outputCanvas, debugMask);
                const debugImageUrl = outputCanvas.toDataURL("image/png");
                return {
                    bounds: null,
                    quadPoints: null,
                    debugImageUrl,
                };
            }
        }

        if (bestContour) bestContour.delete();

        return {
            bounds: bestBounds,
            quadPoints: bestQuadPoints,
            debugImageUrl: null,
        };
    } catch (error) {
        console.error("Contour detection error:", error);
        return { bounds: null, quadPoints: null, debugImageUrl: null };
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (blurred) blurred.delete();
        if (binary) binary.delete();
        if (contours) contours.delete();
        if (hierarchy) hierarchy.delete();
        if (debugMask) debugMask.delete();
    }
}



function cropNormalizedRoiToCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    roi: NormalizedRoi
) {
    const sx = Math.floor(sourceCanvas.width * roi.x);
    const sy = Math.floor(sourceCanvas.height * roi.y);
    const sw = Math.floor(sourceCanvas.width * roi.w);
    const sh = Math.floor(sourceCanvas.height * roi.h);

    outputCanvas.width = sw;
    outputCanvas.height = sh;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
}

// 
function cropBoundsToCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    bounds: RectBounds
) {
    outputCanvas.width = bounds.w;
    outputCanvas.height = bounds.h;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
        sourceCanvas,
        bounds.x,
        bounds.y,
        bounds.w,
        bounds.h,
        0,
        0,
        bounds.w,
        bounds.h
    );
}

function upscaleCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    scale: number
) {
    const newWidth = Math.max(1, Math.floor(sourceCanvas.width * scale));
    const newHeight = Math.max(1, Math.floor(sourceCanvas.height * scale));

    outputCanvas.width = newWidth;
    outputCanvas.height = newHeight;

    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
        sourceCanvas,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
        0,
        0,
        newWidth,
        newHeight
    );
}



//Read the points from the contour we captured with CV
function contourToPoints(contour: any): Point2[] {
    const points: Point2[] = [];

    for (let i = 0; i < contour.rows; i++) {
        const point = contour.intPtr(i, 0);
        points.push({
            x: point[0],
            y: point[1],
        });
    }

    return points;
}


// Order the points before we move to wrap
function orderCorners(points: Point2[]): Point2[] {
    if (points.length !== 4) return points;

    const sums = points.map((p) => p.x + p.y);
    const diffs = points.map((p) => p.x - p.y);

    const topLeft = points[sums.indexOf(Math.min(...sums))];
    const bottomRight = points[sums.indexOf(Math.max(...sums))];
    const topRight = points[diffs.indexOf(Math.max(...diffs))];
    const bottomLeft = points[diffs.indexOf(Math.min(...diffs))];

    return [topLeft, topRight, bottomRight, bottomLeft];
}


// Function to wrap the "card" to the canvas to read... to get perf ROIs
function warpCardToCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    corners: Point2[],
    outputWidth = 420,
    outputHeight = 610
): boolean {
    let src: any = null;
    let dst: any = null;
    let srcTri: any = null;
    let dstTri: any = null;
    let transform: any = null;

    try {
        if (corners.length !== 4) return false;

        src = cv.imread(sourceCanvas);
        dst = new cv.Mat();

        const ordered = orderCorners(corners);

        srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            ordered[0].x, ordered[0].y,
            ordered[1].x, ordered[1].y,
            ordered[2].x, ordered[2].y,
            ordered[3].x, ordered[3].y,
        ]);

        dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            outputWidth - 1, 0,
            outputWidth - 1, outputHeight - 1,
            0, outputHeight - 1,
        ]);

        transform = cv.getPerspectiveTransform(srcTri, dstTri);
        cv.warpPerspective(
            src,
            dst,
            transform,
            new cv.Size(outputWidth, outputHeight),
            //cv.INTER_LINEAR,
            cv.INTER_CUBIC,
            cv.BORDER_CONSTANT,
            new cv.Scalar()
        );

        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;
        cv.imshow(outputCanvas, dst);

        return true;
    } catch (error) {
        console.error("warpCardToCanvas error:", error);
        return false;
    } finally {
        if (src) src.delete();
        if (dst) dst.delete();
        if (srcTri) srcTri.delete();
        if (dstTri) dstTri.delete();
        if (transform) transform.delete();
    }
}


async function recognizeTextFromCanvasWithWorker(
    worker: any,
    canvas: HTMLCanvasElement,
    whitelist?: string
): Promise<string> {
    await worker.setParameters({
        tessedit_char_whitelist: whitelist ?? "",
        tessedit_pageseg_mode: "7",
    });

    const result = await worker.recognize(canvas);

    //let text = result.data.text ?? "";
    const text = result.data.text ?? "";
    return text.trim();
}


// Brightness*******************************************************************************************
function getAverageBrightness(pixelData: Uint8ClampedArray): number {
    let total = 0;
    let pixelCount = 0;

    for (let i = 0; i < pixelData.length; i += 4) {
        const red = pixelData[i];
        const green = pixelData[i + 1];
        const blue = pixelData[i + 2];

        const brightness = (red + green + blue) / 3;

        total += brightness;
        pixelCount++;
    }

    if (pixelCount === 0) return 0;

    return total / pixelCount;
}

//Sharpness********************************************************************************************
function getSharpnessScore(imageData: ImageData): number {
    const { data, width, height } = imageData;

    if (width < 3 || height < 3) return 0;

    const gray = new Float32Array(width * height);

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];

        gray[j] = red * 0.299 + green * 0.587 + blue * 0.114;
    }

    let totalEdgeStrength = 0;
    let sampleCount = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const center = y * width + x;

            const left = gray[center - 1];
            const right = gray[center + 1];
            const top = gray[center - width];
            const bottom = gray[center + width];

            const dx = Math.abs(right - left);
            const dy = Math.abs(bottom - top);

            totalEdgeStrength += dx + dy;
            sampleCount++;
        }
    }

    if (sampleCount === 0) return 0;

    return totalEdgeStrength / sampleCount;
}