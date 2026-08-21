export function isJSON(json: string) {
    try {
        JSON.parse(json);
        return true;
    } catch {
        return false
    }
}