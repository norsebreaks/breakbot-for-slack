export interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correctAnswer?: string;
    incorrectAnswers?: string[];
    allAnswers?: string[];
    randomisedAnswers?: string[]
}
export function allAnswers(triviaQuestion:TriviaQuestion): string[] {
    var answers: string[] = [];
    triviaQuestion.incorrectAnswers.forEach(a => {
        answers.push(a);
    });
    answers.push(triviaQuestion.correctAnswer);
    return answers;
}
export function randomisedOrder(triviaQuestion: TriviaQuestion){
    var answers = allAnswers(triviaQuestion)
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
}
