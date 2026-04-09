// mtgRules.ts - Magic: The Gathering card scanning rules and utilities
//
//
//
//

export type NormalizedNameRoi = {
    x: number;
    y: number;
    w: number;
    h: number;
};

// Name ROI
export const NAME_ROI: NormalizedNameRoi[] = [
    {
        x: 0.05,
        y: 0.045,
        w: 0.80,
        h: 0.06,
    },
];

export function cleanName(text: string): string {
    return text
        .replace(/\s+/g, " ")
        .replace(/[^A-Za-z0-9\s,'\-.:/]/g, "")
        .replace(/[\s,'\-.:/]+$/g, "") 
        .trim();
}

export function isValidName(text: string): boolean {
    const trimmed = text.trim();

    if (trimmed.length < 3) return false;
    if (!/[A-Za-z]/.test(trimmed)) return false;

    return true;
}

export function getMostFrequentNameValue(values: string[]): string {
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

export function pickBestName(values: string[]): string {
    const validValues = values.filter(isValidName);

    if (validValues.length === 0) {
        return "";
    }

    const mostFrequent = getMostFrequentNameValue(validValues);

    if (mostFrequent) {
        return mostFrequent;
    }

    return validValues[0];
}