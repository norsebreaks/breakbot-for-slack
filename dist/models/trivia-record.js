"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalPoints = void 0;
function totalPoints(triviaRecord) {
    var sum = triviaRecord.shillingsAwarded.reduce((a, b) => a + b, 0);
    return sum;
}
exports.totalPoints = totalPoints;
//# sourceMappingURL=trivia-record.js.map