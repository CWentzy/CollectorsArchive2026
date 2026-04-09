/* eslint-disable @typescript-eslint/no-explicit-any */
//All cv stuff for getting full card
import cv from "@techstark/opencv-js";

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

export function findCardBoundsInsideGuide(
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

export function cropBoundsToCanvas(
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
export function warpCardToCanvas(
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