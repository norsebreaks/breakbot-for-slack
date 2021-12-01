"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerMiliseconds = exports.getDueDate = void 0;
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
//# sourceMappingURL=staff-break.js.map