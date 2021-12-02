export interface TriviaRecord {
    userId: string;
    shillingsAwarded: number[];
    total?: number;
}
export function totalPoints(triviaRecord:TriviaRecord): number {
    var sum = triviaRecord.shillingsAwarded.reduce((a, b) => a + b, 0);
    return sum;
}
