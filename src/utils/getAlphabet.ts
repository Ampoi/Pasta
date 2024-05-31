export function getAlphabet(n: number): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabet = lower + upper;

    let result = '';
    
    while (n >= 0) {
        result = alphabet[n % alphabet.length] + result;
        n = Math.floor(n / alphabet.length) - 1;
    }

    return result;
}