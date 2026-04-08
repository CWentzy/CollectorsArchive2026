// ygoRules.ts - Yu-Gi-Oh! card scanning rules and utilities
//
//
//

//export type YgoScanResult = {
//    name: string;
//    passcode: string;
//    setCode: string;
//};

export type NormalizedPasscodeRoi = {
    x: number;
    y: number;
    w: number;
    h: number;
};

// Passcode ROI
export const PASSCODE_ROI: NormalizedPasscodeRoi[] = [
    {
        x: 0.038,
        y: 0.945,
        w: 0.15,
        h: 0.04,
    },
];

export function cleanPasscode(text: string): string {
    return text.replace(/[^0-9]/g, "").slice(0, 8);
}

export function isValidPasscode(text: string): boolean {
    return /^\d{8}$/.test(text);
}

export function getMostFrequentPasscodeValue(values: string[]): string {
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

export function pickBestPasscode(values: string[]): string {
    const validValues = values.filter(isValidPasscode);

    if (validValues.length === 0) {
        return "";
    }

    const mostFrequent = getMostFrequentPasscodeValue(validValues);

    if (mostFrequent) {
        return mostFrequent;
    }

    return validValues[0];
}