"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDueDate = void 0;
const date_handler_1 = require("../extensions/date-handler");
function getDueDate(staffBreak) {
    var due = date_handler_1.DateHandler.dueDate(staffBreak.breakType.duration);
    return due;
}
exports.getDueDate = getDueDate;
//# sourceMappingURL=staff-break.js.map