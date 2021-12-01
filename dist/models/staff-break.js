"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerRemainingMiliseconds = exports.breakExpired = exports.timerMiliseconds = exports.getDueDate = void 0;
const date_handler_1 = require("../extensions/date-handler");
function getDueDate(staffBreak) {
    var due = date_handler_1.DateHandler.dueDate(staffBreak.breakType.duration);
    return due;
}
exports.getDueDate = getDueDate;
function timerMiliseconds(staffBreak) {
    return (staffBreak.breakType.duration * 60) * 1000;
}
exports.timerMiliseconds = timerMiliseconds;
function breakExpired(staffBreak) {
    if (getDueDate(staffBreak) < date_handler_1.DateHandler.currentDate()) {
        return true;
    }
    return false;
}
exports.breakExpired = breakExpired;
function timerRemainingMiliseconds(staffBreak) {
    var startTimeMS = staffBreak.startTime.toMillis();
    var currentTimeMS = date_handler_1.DateHandler.currentDate().toMillis();
    return currentTimeMS - startTimeMS;
}
exports.timerRemainingMiliseconds = timerRemainingMiliseconds;
//# sourceMappingURL=staff-break.js.map