"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomisedOrder = exports.allAnswers = void 0;
function allAnswers(triviaQuestion) {
    var answers = [];
    triviaQuestion.incorrectAnswers.forEach(a => {
        answers.push(a);
    });
    answers.push(triviaQuestion.correctAnswer);
    return answers;
}
exports.allAnswers = allAnswers;
function randomisedOrder(triviaQuestion) {
    var answers = allAnswers(triviaQuestion);
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
}
exports.randomisedOrder = randomisedOrder;
//# sourceMappingURL=trivia-question.js.map