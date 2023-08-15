export const bytesToMbps = (bytes: number) => {
    return Number(((bytes / 1000000) * 8).toFixed(2));
}