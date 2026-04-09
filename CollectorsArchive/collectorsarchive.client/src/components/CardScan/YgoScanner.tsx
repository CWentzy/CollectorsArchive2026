/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import "./scanner.css";
import { CloseButton } from "@mantine/core";
import {
    type NormalizedPasscodeRoi,
    PASSCODE_ROI,
    cleanPasscode,
    isValidPasscode,
    getMostFrequentPasscodeValue,
    pickBestPasscode,
} from "./ygoRules";

import {
    //type NormalizedNameRoi,
    NAME_ROI,
    cleanName,
    isValidName,
    getMostFrequentNameValue,
    pickBestName,
} from "./mtgRules";

import {
    preprocessYgoLightCanvas,
    preprocessYgoDarkCanvas,
    preprocessMtgNameCanvas,
} from "./preprocessing";

import { findCardBoundsInsideGuide, warpCardToCanvas, cropBoundsToCanvas } from "./cardProcessing";


type YgoLiveScannerProps = {
    onScanComplete?: (result: ScanResult) => void | Promise<void>;
    onClose?: () => void;
};

type ScanMode = "YGO" | "MTG";

type ScanResult = {
    mode: ScanMode;
    value: string;
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

    //These are for seeing what hte cropped ROIs look like (Jack Remove after....)
    const [passcodeUpscaledPreviews, setPasscodeUpscaledPreviews] = useState<string[]>([]);
    const [passcodeProcessedPreviews, setPasscodeProcessedPreviews] = useState<string[]>([]);


    const [passcodeAttempts, setPasscodeAttempts] = useState<string[]>([]);
    const [rawPasscodeAttempts, setRawPasscodeAttempts] = useState<string[]>([]);

    //UI for tweaking sharpness threshold, as it can be the deciding factor in many cases, and lighting is usually not the issue.
    const [sharpnessThreshold, setSharpnessThreshold] = useState(30);

    //Used for tracking the users best sharpness to score to auto lower the threshold for capture
    const [maxSharpnessSeen, setMaxSharpnessSeen] = useState<number>(30);
    const frameCounterRef = useRef(0);
    const recentMaxSharpnessRef = useRef(0);
    const lastSharpnessTimeRef = useRef(new Date().getTime());

    //Toggle state for YGO and MTG
    const [scanMode, setScanMode] = useState<ScanMode>("YGO");

    // Worker ref for Tesseract OCR
    const workerRef = useRef<any>(null);

    // Main function to run OCR on the captured card image and extract passcode, setcode, and name
    const runYgoOcr = useCallback(async (cardCanvas: HTMLCanvasElement) => {

        const worker = workerRef.current;
        if (!worker) {
            setScanStatus("OCR worker not ready.");
            return;
        }

        setScanStatus("Preparing passcode regions...");

        const roiUpscaledCanvases: HTMLCanvasElement[] = [];
        const roiProcessedCanvases: HTMLCanvasElement[] = [];

        const upscaledPreviewList: string[] = [];
        const processedPreviewList: string[] = [];

        const roiCanvas = document.createElement("canvas");
        const roiUpscaledCanvas = document.createElement("canvas");
        const roiProcessedCanvas = document.createElement("canvas");

        if (scanMode == "YGO") {
            cropNormalizedRoiToCanvas(cardCanvas, roiCanvas, PASSCODE_ROI[0]);
        } else if (scanMode == "MTG") {
            cropNormalizedRoiToCanvas(cardCanvas, roiCanvas, NAME_ROI[0]);
        }

        upscaleCanvas(roiCanvas, roiUpscaledCanvas, 6);

        if (scanMode === "YGO") {
            preprocessYgoLightCanvas(roiUpscaledCanvas, roiProcessedCanvas);
        } else {
            preprocessMtgNameCanvas(roiUpscaledCanvas, roiProcessedCanvas);
        }

        roiUpscaledCanvases.push(roiUpscaledCanvas);
        roiProcessedCanvases.push(roiProcessedCanvas);

        upscaledPreviewList.push(roiUpscaledCanvas.toDataURL("image/png"));
        processedPreviewList.push(roiProcessedCanvas.toDataURL("image/png"));

        setPasscodeUpscaledPreviews(upscaledPreviewList);
        setPasscodeProcessedPreviews(processedPreviewList);

        setScanStatus("Verifying passcode...");

        const passcodeVotes: string[] = [];
        const rawPasscodeList: string[] = [];
        const cleanedPasscodeList: string[] = [];
        const whitelist = scanMode === "YGO" ? "0123456789" : ""; // Get the appropriate whitelist based on the current scan mode


        for (let attempt = 0; attempt < 3; attempt++) {
            for (let roiIndex = 0; roiIndex < roiProcessedCanvases.length; roiIndex++) {
                const rawPasscode = await recognizeTextFromCanvasWithWorker(
                    worker,
                    roiProcessedCanvases[roiIndex],
                    whitelist //Sending whitelist for YGO specific or not for MTG
                );

                if (scanMode == "YGO") {
                    const cleanedPasscode = cleanPasscode(rawPasscode);

                    rawPasscodeList.push(`ROI ${roiIndex + 1}: ${rawPasscode}`);
                    cleanedPasscodeList.push(`ROI ${roiIndex + 1}: ${cleanedPasscode}`);

                    if (isValidPasscode(cleanedPasscode)) {
                        passcodeVotes.push(cleanedPasscode);
                    }
                } else if (scanMode == "MTG") {
                    const cleanedPasscode = cleanName(rawPasscode);

                    rawPasscodeList.push(`ROI ${roiIndex + 1}: ${rawPasscode}`);
                    cleanedPasscodeList.push(`ROI ${roiIndex + 1}: ${cleanedPasscode}`);

                    if (isValidName(cleanedPasscode)) {
                        passcodeVotes.push(cleanedPasscode);
                    }
                }

            }

            setScanStatus(`Verifying scan ${attempt + 1}/3...`);
        }

        //If light YGO scan failed we try the dark YGO scan 3 times
        // ---------- DARK FALLBACK ----------
        if (scanMode === "YGO" && passcodeVotes.length === 0) {
            setScanStatus("Switching to dark scan...");

            for (let attempt = 0; attempt < 3; attempt++) {
                for (let roiIndex = 0; roiIndex < roiUpscaledCanvases.length; roiIndex++) {

                    const processedCanvas = document.createElement("canvas");

                    preprocessYgoDarkCanvas(
                        roiUpscaledCanvases[roiIndex],
                        processedCanvas
                    );

                    const rawPasscode = await recognizeTextFromCanvasWithWorker(
                        worker,
                        processedCanvas,
                        "0123456789"
                    );

                    const cleanedPasscode = cleanPasscode(rawPasscode);

                    rawPasscodeList.push(`Dark ROI ${roiIndex + 1}: ${rawPasscode}`);
                    cleanedPasscodeList.push(`Dark ROI ${roiIndex + 1}: ${cleanedPasscode}`);

                    if (isValidPasscode(cleanedPasscode)) {
                        passcodeVotes.push(cleanedPasscode);
                    }
                }

                setScanStatus(`Dark scan ${attempt + 1}/3...`);
            }
        }

        setRawPasscodeAttempts(rawPasscodeList);
        setPasscodeAttempts(cleanedPasscodeList);

        let finalValue: string = "";
        if (scanMode == "YGO") {
            finalValue = pickBestPasscode(passcodeVotes) || getMostFrequentPasscodeValue(passcodeVotes) || "";
        } else if (scanMode == "MTG") {
            finalValue = pickBestName(passcodeVotes) || getMostFrequentNameValue(passcodeVotes) || "";
        }
        

        setPasscodeText(finalValue);
        setScanStatus("Scan complete.");


        let isValidResult = false;

        if (scanMode === "YGO") {
            isValidResult = isValidPasscode(finalValue);
        } else if (scanMode === "MTG") {
            isValidResult =
                finalValue.trim().length >= 3 &&
                /[A-Za-z]/.test(finalValue);
        }

        //Resetting the scanner if the result is not valid, allowing the user to try again without needing to manually reset.
        if (!isValidResult) {
            capturedRef.current = false;
            goodFrameCountRef.current = 0;
            setGoodFrameCount(0);
            recentMaxSharpnessRef.current = 0;
            frameCounterRef.current = 0;
            setMaxSharpnessSeen(0);

            return;
        }

        const result: ScanResult = {
            mode: scanMode,
            value: finalValue,
        };

        //await onScanComplete?.(result);
    }, [onScanComplete, scanMode]);

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


            //NEW ADAPTIVE THRESHOLD LOGIC****************************************************
            const avgBrightness = getAverageBrightness(guideFrame.data);
            const sharpnessScore = getSharpnessScore(guideFrame);

            setBrightness(avgBrightness);
            setSharpness(sharpnessScore);

            //Used for a wait before setting max sharpness seen (ignore initian grab)
            const now = new Date().getTime();

            // Wait 2s before learning max
            if (now - lastSharpnessTimeRef.current < 2000) {
                return;
            }

            // Only sample sharpness every few frames
            frameCounterRef.current++;

            if (frameCounterRef.current % 3 === 0) {
                if (sharpnessScore > recentMaxSharpnessRef.current) {
                    recentMaxSharpnessRef.current = sharpnessScore;

                    
                    const newThreshold = Math.max(10, sharpnessScore - 1);  //CHnage to 2 if 1 less than max is too strict

                    setSharpnessThreshold(newThreshold);
                    setMaxSharpnessSeen(sharpnessScore);
                }
            }

            const brightnessGood = avgBrightness >= 70 && avgBrightness <= 190;
            const sharpnessGood = sharpnessScore >= sharpnessThreshold;
            //END OF NEW ADAPTIVE SHARPNESS THRESHOLD LOGIC****************************************************

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
    }, [cameraReady, sharpnessThreshold, runYgoOcr]);

    //Reset adaptive sharpness tracking when the user changes scan mode.
    useEffect(() => {
        recentMaxSharpnessRef.current = 0;
        frameCounterRef.current = 0;
    }, [scanMode]);

    return (
        <section className="scanner">
            <div style={{ marginTop: 12 }}>
                <label className="status-small">Scanner Mode</label>
                <select
                    value={scanMode}
                    onChange={(e) => setScanMode(e.target.value as ScanMode)}
                    style={{
                        width: "100%",
                        marginTop: 8,
                        padding: "10px 12px",
                        borderRadius: 8,
                        fontSize: 16,
                    }}
                >
                    <option value="YGO">Yu-Gi-Oh!</option>
                    <option value="MTG">Magic: The Gathering</option>
                </select>
            </div>
            <div style={{ marginTop: 12 }}>
                <label className="status-small">
                    Sharpness Threshold: {sharpnessThreshold}
                </label>
                <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={sharpnessThreshold}
                    onChange={(e) => setSharpnessThreshold(Number(e.target.value))}
                    style={{ width: "100%", marginTop: 8, fontSize: 16 }}
                />
            </div>
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
                    <div>Mode: {scanMode}</div>
                    <div>Brightness: {brightness?.toFixed(2)}</div>
                    <div>Sharpness: {sharpness?.toFixed(2)}</div>
                    <div>Stable Frames: {goodFrameCount}</div>
                    <div>Status: {status}</div>
                    <div>Base Threshold: {sharpnessThreshold}</div>
                    <div>Max Sharpness Seen: {maxSharpnessSeen.toFixed(2)}</div>
                    <div>
                        Active Threshold:{" "}
                        {Math.max(sharpnessThreshold, maxSharpnessSeen - 2).toFixed(2)}
                    </div>
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
        </section>
    );
}




function cropNormalizedRoiToCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement,
    roi: NormalizedPasscodeRoi
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