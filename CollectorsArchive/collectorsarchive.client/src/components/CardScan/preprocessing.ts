/* eslint-disable @typescript-eslint/no-explicit-any */
import cv from "@techstark/opencv-js";

export function preprocessYgoLightCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
) {
    let src: any = null;
    let gray: any = null;
    let thresh: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        thresh = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Light / normal backgrounds
        cv.threshold(gray, thresh, 70, 255, cv.THRESH_BINARY_INV);

        cv.imshow(outputCanvas, thresh);
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (thresh) thresh.delete();
    }
}

export function preprocessYgoDarkCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
) {
    let src: any = null;
    let gray: any = null;
    let blurred: any = null;
    let thresh: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        blurred = new cv.Mat();
        thresh = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);

        // Better for blue / purple / darker cards
        cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

        cv.imshow(outputCanvas, thresh);
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (blurred) blurred.delete();
        if (thresh) thresh.delete();
    }
}

export function preprocessMtgNameCanvas(
    sourceCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
) {
    let src: any = null;
    let gray: any = null;
    let thresh: any = null;

    try {
        src = cv.imread(sourceCanvas);
        gray = new cv.Mat();
        thresh = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // MTG name
        cv.threshold(gray, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        cv.imshow(outputCanvas, thresh);
    } finally {
        if (src) src.delete();
        if (gray) gray.delete();
        if (thresh) thresh.delete();
    }
}