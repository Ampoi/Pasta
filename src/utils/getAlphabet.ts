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

export function getNumber(alphabet: string): number {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const alphabetList = (lower + upper).split('');

    let result = 0;
    for (let i = 0; i < alphabet.length; i++) {
        result = result * alphabetList.length + alphabetList.indexOf(alphabet[i]);
    }

    return result;
}