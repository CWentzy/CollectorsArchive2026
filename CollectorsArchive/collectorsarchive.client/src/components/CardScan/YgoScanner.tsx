/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import cv from "@techstark/opencv-js";
//const cvAny: any = cv;
//import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import "./scanner.css";
import { CloseButton } from "@mantine/core";

type YgoScanResult = {
    name: string;
    passcode: string;
    setCode: string;
};

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
    const [setCodeText, setSetCodeText] = useState("");
    const [nameText, setNameText] = useState("");
    const passcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const nameCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Canvases for upscaling ROis
    const passcodeUpscaledCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCodeUpscaledCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const nameUpscaledCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Processed canvases for ROIs OCR
    const passcodeProcessedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCodeProcessedCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const nameProcessedCanvasRef = useRef<HTMLCanvasElement | null>(null);

    //These are for seeing what hte cropped ROIs look like (Jack Remove after....)
    const [passcodeUpscaledPreview, setPasscodeUpscaledPreview] = useState<string | null>(null);
    const [passcodeProcessedPreview, setPasscodeProcessedPreview] = useState<string | null>(null);

    const [setCodeUpscaledPreview, setSetCodeUpscaledPreview] = useState<string | null>(null);
    const [setCodeProcessedPreview, setSetCodeProcessedPreview] = useState<string | null>(null);

    const [nameUpscaledPreview, setNameUpscaledPreview] = useState<string | null>(null);
    const [nameProcessedPreview, setNameProcessedPreview] = useState<string | null>(null);

    //const [rawPasscodeText, setRawPasscodeText] = useState("");
    //const [rawSetCodeText, setRawSetCodeText] = useState("");
    //const [rawNameText, setRawNameText] = useState("");

    const [passcodeAttempts, setPasscodeAttempts] = useState<string[]>([]);
    const [setCodeAttempts, setSetCodeAttempts] = useState<string[]>([]);
    const [rawPasscodeAttempts, setRawPasscodeAttempts] = useState<string[]>([]);
    const [rawSetCodeAttempts, setRawSetCodeAttempts] = useState<string[]>([]);

    // Worker ref for Tesseract OCR
    const workerRef = useRef<any>(null);

    // Main function to run OCR on the captured card image and extract passcode, setcode, and name
    async function runYgoOcr(cardCanvas: HTMLCanvasElement) {
        const passcodeCanvas = passcodeCanvasRef.current;
        const setCodeCanvas = setCodeCanvasRef.current;
        const nameCanvas = nameCanvasRef.current;

        const passcodeUpscaledCanvas = passcodeUpscaledCanvasRef.current;
        const setCodeUpscaledCanvas = setCodeUpscaledCanvasRef.current;
        const nameUpscaledCanvas = nameUpscaledCanvasRef.current;

        const passcodeProcessedCanvas = passcodeProcessedCanvasRef.current;
        const setCodeProcessedCanvas = setCodeProcessedCanvasRef.current;
        const nameProcessedCanvas = nameProcessedCanvasRef.current;

        const worker = workerRef.current;
        if (!worker) {
            setScanStatus("OCR worker not ready.");
            return;
        }

        if (
            !passcodeCanvas ||
            !setCodeCanvas ||
            !nameCanvas ||
            !passcodeUpscaledCanvas ||
            !setCodeUpscaledCanvas ||
            !nameUpscaledCanvas
        ) {
            return;
        }

        if (
            !passcodeProcessedCanvas ||
            !setCodeProcessedCanvas ||
            !nameProcessedCanvas
        ) {
            return;
        }

        setScanStatus("Preparing OCR regions...");

        //Croping the 3 ROIs from the card canvas to their own canvases
        cropNormalizedRoiToCanvas(cardCanvas, passcodeCanvas, PASSCODE_ROI);
        cropNormalizedRoiToCanvas(cardCanvas, setCodeCanvas, SETCODE_ROI);
        cropNormalizedRoiToCanvas(cardCanvas, nameCanvas, NAME_ROI);

        //Upscaling the ROIs *****************************************************************************
        upscaleCanvas(passcodeCanvas, passcodeUpscaledCanvas, 6);
        upscaleCanvas(setCodeCanvas, setCodeUpscaledCanvas, 6);
        upscaleCanvas(nameCanvas, nameUpscaledCanvas, 2);

        setPasscodeUpscaledPreview(passcodeUpscaledCanvas.toDataURL("image/png"));
        setSetCodeUpscaledPreview(setCodeUpscaledCanvas.toDataURL("image/png"));
        setNameUpscaledPreview(nameUpscaledCanvas.toDataURL("image/png"));

        //Preprocessing the upscaled ROIs for better OCR results
        preprocessOcrCanvas(passcodeUpscaledCanvas, passcodeProcessedCanvas);
        preprocessOcrCanvas(setCodeUpscaledCanvas, setCodeProcessedCanvas);
        preprocessOcrCanvas(nameUpscaledCanvas, nameProcessedCanvas);

        setPasscodeProcessedPreview(passcodeProcessedCanvas.toDataURL("image/png"));
        setSetCodeProcessedPreview(setCodeProcessedCanvas.toDataURL("image/png"));
        setNameProcessedPreview(nameProcessedCanvas.toDataURL("image/png"));

        setScanStatus("Verifying passcode and set code...");


        const passcodeVotes: string[] = [];
        const setCodeVotes: string[] = [];

        const rawPasscodeList: string[] = [];
        const cleanedPasscodeList: string[] = [];

        const rawSetCodeList: string[] = [];
        const cleanedSetCodeList: string[] = [];

        for (let i = 0; i < 5; i++) {
            const rawPasscode = await recognizeTextFromCanvasWithWorker(
                worker,
                passcodeProcessedCanvas,
                //passcodeUpscaledCanvas,
                //passcodeCanvas,
                "0123456789"
            );

            const cleanedPasscode = cleanPasscode(rawPasscode);

            //Test arrays to see all the OCR results for tweaking purposes (Jack remove after)
            rawPasscodeList.push(rawPasscode);
            cleanedPasscodeList.push(cleanedPasscode);

            if (isValidPasscode(cleanedPasscode)) {
                passcodeVotes.push(cleanedPasscode);
            }

            const rawSetCode = await recognizeTextFromCanvasWithWorker(
                worker,
                //setCodeProcessedCanvas,
                setCodeUpscaledCanvas,
                //setCodeCanvas,
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"
            );

            const cleanedSetCode = cleanSetCode(rawSetCode);

            // Test arrays to see all the OCR results for tweaking purposes (Jack remove after)
            rawSetCodeList.push(rawSetCode);
            cleanedSetCodeList.push(cleanedSetCode);

            if (isLikelySetCode(cleanedSetCode)) {
                setCodeVotes.push(cleanedSetCode);
            }

            setScanStatus(`Verifying scan ${i + 1}/5...`);
        }


        // Set the attempts arrays for debugging purposes, to see all the OCR results (Jack remove after)
        setRawPasscodeAttempts(rawPasscodeList);
        setPasscodeAttempts(cleanedPasscodeList);

        setRawSetCodeAttempts(rawSetCodeList);
        setSetCodeAttempts(cleanedSetCodeList);



        const finalPasscode = getMostFrequentValue(passcodeVotes);
        const finalSetCode = getMostFrequentValue(setCodeVotes);

        setPasscodeText(finalPasscode || "");
        setSetCodeText(finalSetCode || "");

        setScanStatus("Reading card name...");

        const rawName = await recognizeTextFromCanvasWithWorker(
            worker,
            //nameProcessedCanvas
            nameUpscaledCanvas
        );

        const cleanedName = cleanCardName(rawName);
        setNameText(cleanedName);

        setScanStatus("Scan complete.");

        const result = {
            passcode: finalPasscode || "",
            setCode: finalSetCode || "",
            name: cleanedName || "",
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
            const sharpnessGood = sharpnessScore >= 14;

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
                <p className="status-small">Set Code: {setCodeText || "—"}</p>
                <p className="status-small">Name: {nameText || "—"}</p>
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



            {/* <div style={{ marginTop: 20 }}>
        <p className="status-small">Raw Passcode: {rawPasscodeText || "—"}</p>
        <p className="status-small">Raw Set Code: {rawSetCodeText || "—"}</p>
        <p className="status-small">Raw Name: {rawNameText || "—"}</p>
      </div> */}

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

                <p className="status-small" style={{ marginTop: 12 }}>Raw Set Code Attempts:</p>
                {rawSetCodeAttempts.map((value, index) => (
                    <p key={`raw-set-${index}`} className="status-small">
                        {index + 1}. {JSON.stringify(value) || "—"}
                    </p>
                ))}

                <p className="status-small" style={{ marginTop: 12 }}>Cleaned Set Code Attempts:</p>
                {setCodeAttempts.map((value, index) => (
                    <p key={`clean-set-${index}`} className="status-small">
                        {index + 1}. {value || "—"}
                    </p>
                ))}
            </div>


            {/* Also teh div above is from testing what the raw text and cleaned text was providing... will not be needed later */}
            {/* Remove these 6 images after, only used for tweaking processing */}

            <div style={{ marginTop: 24 }}>
                <h3>OCR Debug Previews</h3>

                {passcodeUpscaledPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Passcode Upscaled</p>
                        <img
                            src={passcodeUpscaledPreview}
                            alt="Passcode upscaled"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}

                {passcodeProcessedPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Passcode Processed</p>
                        <img
                            src={passcodeProcessedPreview}
                            alt="Passcode processed"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}

                {setCodeUpscaledPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Set Code Upscaled</p>
                        <img
                            src={setCodeUpscaledPreview}
                            alt="Set code upscaled"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}

                {setCodeProcessedPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Set Code Processed</p>
                        <img
                            src={setCodeProcessedPreview}
                            alt="Set code processed"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}

                {nameUpscaledPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Name Upscaled</p>
                        <img
                            src={nameUpscaledPreview}
                            alt="Name upscaled"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}

                {nameProcessedPreview && (
                    <div style={{ marginTop: 16 }}>
                        <p className="status-small">Name Processed</p>
                        <img
                            src={nameProcessedPreview}
                            alt="Name processed"
                            style={{ width: "100%", maxWidth: 320, borderRadius: 8 }}
                        />
                    </div>
                )}
            </div>

            <canvas ref={captureCanvasRef} style={{ display: "none" }} />
            <canvas ref={croppedCanvasRef} style={{ display: "none" }} />
            <canvas ref={processedCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeCanvasRef} style={{ display: "none" }} />
            <canvas ref={setCodeCanvasRef} style={{ display: "none" }} />
            <canvas ref={nameCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeUpscaledCanvasRef} style={{ display: "none" }} />
            <canvas ref={setCodeUpscaledCanvasRef} style={{ display: "none" }} />
            <canvas ref={nameUpscaledCanvasRef} style={{ display: "none" }} />
            <canvas ref={passcodeProcessedCanvasRef} style={{ display: "none" }} />
            <canvas ref={setCodeProcessedCanvasRef} style={{ display: "none" }} />
            <canvas ref={nameProcessedCanvasRef} style={{ display: "none" }} />
        </section>
    );
}

// Preprocessing for OCR ROIs. Just for card ROIs not fullcard
function preprocessOcrCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
) {
    let src: any = null;
    let gray: any = null;
    let inverted: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        inverted = new cv.Mat();

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Invert so dark text becomes light text
        cv.bitwise_not(gray, inverted);

        // Show result
        cv.imshow(outputCanvas, inverted);
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (inverted) inverted.delete();
    }
}


function findCardBoundsInsideGuide(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas?: HTMLCanvasElement
): EdgeSearchResult {
    let src: any = null;
    let gray: any = null;
    //let filtered: any = null;
    let blurred: any = null;
    let thresh: any = null;
    let contours: any = null;
    let hierarchy: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        //filtered = new cv.Mat();
        blurred = new cv.Mat();
        thresh = new cv.Mat();
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        //cv.bilateralFilter(gray, filtered, 9, 75, 75);

        //cv.GaussianBlur(filtered, blurred, new cv.Size(5, 5), 0);
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        cv.Canny(blurred, thresh, 75, 150);

        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
        cv.dilate(thresh, thresh, kernel);
        cv.dilate(thresh, thresh, kernel); //dilate again lol even crispier edges hopefully...

        kernel.delete();

        cv.findContours(
            thresh,
            contours,
            hierarchy,
            cv.RETR_LIST,
            cv.CHAIN_APPROX_SIMPLE
        );

        const width = src.cols;
        const height = src.rows;

        let bestBounds: RectBounds | null = null;
        let bestArea = 0;
        let bestContour: any = null;
        let bestQuadPoints: Point2[] | null = null;

        for (let i = 0; i < contours.size(); i++) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);

            // Skip small contours that probably arent the card... can tweak to get perfect later...
            if (area < width * height * 0.10) {
                contour.delete();
                continue;
            }

            const peri = cv.arcLength(contour, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(contour, approx, 0.03 * peri, true);

            if (approx.rows >= 4 && approx.rows <= 6) {
                const rect = cv.boundingRect(approx);
                const aspect = rect.width / rect.height;

                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;

                const frameCenterX = width / 2;
                const frameCenterY = height / 2;

                const distX = Math.abs(centerX - frameCenterX);
                const distY = Math.abs(centerY - frameCenterY);

                const nearCenter =
                    distX <= width * 0.25 &&
                    distY <= height * 0.25;

                const bigEnough =
                    rect.width > width * 0.20 &&
                    rect.height > height * 0.30;

                const cardAspect =
                    aspect > 0.45 &&
                    aspect < 0.95;

                if (
                    approx.rows >= 4 &&
                    approx.rows <= 8 &&
                    nearCenter &&
                    bigEnough &&
                    cardAspect &&
                    area > bestArea
                ) {
                    bestArea = area;

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
            }

            approx.delete();
            contour.delete();
        }

        if (outputCanvas) {
            const debugMat = src.clone();

            if (bestContour) {
                const vec = new cv.MatVector();
                vec.push_back(bestContour);

                // Draw contour
                cv.drawContours(debugMat, vec, 0, new cv.Scalar(0, 255, 0, 255), 3);

                // Draw boundng box
                if (bestBounds) {
                    cv.rectangle(
                        debugMat,
                        new cv.Point(bestBounds.x, bestBounds.y),
                        new cv.Point(
                            bestBounds.x + bestBounds.w,
                            bestBounds.y + bestBounds.h
                        ),
                        new cv.Scalar(255, 0, 0, 255),
                        2
                    );
                }

                vec.delete();
            } else {
                cv.imshow(outputCanvas, thresh);
                return {
                    bounds: null,
                    quadPoints: null,
                    debugImageUrl: outputCanvas.toDataURL("image/png"),
                };
            }

            cv.imshow(outputCanvas, debugMat);

            const debugImageUrl = outputCanvas.toDataURL("image/png");

            if (bestContour) bestContour.delete();
            debugMat.delete();

            return {
                bounds: bestBounds,
                quadPoints: bestQuadPoints,
                debugImageUrl,
            };
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
        //if (filtered) filtered.delete(); //Filtered for background struggles... didnt really work, could remove later 
        //(2 more lines above with all the processing features that can be removed too(filtered stuff))
        if (blurred) blurred.delete();
        if (thresh) thresh.delete();
        if (contours) contours.delete();
        if (hierarchy) hierarchy.delete();
    }
}


// ROI for 3 key areas: name, passcode, and setcode *****************************************************************

type NormalizedRoi = {
    x: number;
    y: number;
    w: number;
    h: number;
};

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



//ROI Sizing ******************************************************************************

const NAME_ROI: NormalizedRoi = {
    x: 0.03,
    y: 0.03,
    w: 0.81,
    h: 0.09,
};

const PASSCODE_ROI: NormalizedRoi = {
    x: 0.038,
    y: 0.95,
    w: 0.15,
    h: 0.03,
};

const SETCODE_ROI: NormalizedRoi = {
    x: 0.705,
    y: 0.71,
    w: 0.24,
    h: 0.03,
};

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

// Text cleaning *******************************************************************************************

function cleanPasscode(text: string): string {
    return text.replace(/[^0-9]/g, "").slice(0, 8);
}

function cleanSetCode(text: string): string {
    const cleaned = text
        .toUpperCase()
        .replace(/O/g, "0")  // Will break real O's but fine for demo
        .replace(/[_—–]/g, "-")
        .replace(/[^A-Z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/-+$/g, "") // remove trailing dash
        .trim();

    const match = cleaned.match(/[A-Z0-9]{4}-[A-Z]{2}[0-9]{3}/);

    return match ? match[0] : "";
}

function cleanCardName(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/[^\w\s\-'.:]/g, "")
        .trim();
}

// Multiple OCR results handling ***************************************************************************************

function isValidPasscode(text: string): boolean {
    return /^\d{8}$/.test(text);
}

function isLikelySetCode(text: string): boolean {
    return /^[A-Z0-9]{4}-[A-Z]{2}[0-9]{3}$/.test(text);
}

function getMostFrequentValue(values: string[]): string {
    const counts = new Map<string, number>();

    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    let bestValue = "";
    let bestCount = 0;

    for (const [value, count] of counts.entries()) {
        if (count > bestCount) {
            bestValue = value;
            bestCount = count;
        }
    }

    return bestValue;
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