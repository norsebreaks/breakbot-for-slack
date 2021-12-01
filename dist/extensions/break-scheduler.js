"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakScheduler = void 0;
const date_handler_1 = require("./date-handler");
const staff_break_1 = require("../models/staff-break");
class BreakScheduler {
    constructor() {
        this.maxStaffBreaks = 2;
        //Different break types go in here. The Name param is used for finding the type.
        this.breakTypes = [
            {
                name: "break",
                duration: 15
            },
            {
                name: "lunch",
                duration: 30
            },
            {
                name: "long",
                duration: 45
            },
            {
                name: "training",
                duration: 60
            }
        ];
        this.currentStaffBreak = [];
    }
    getWhoIsOnBreak() {
        var responseString = "";
        //In here, you can adjust the message that sends depending on how many people are on breaks.
        //Manny's original ones are in here, but obviously will not account for if there are more than 2 people away at a time.
        //It just adds to the responseString variable, to minimise code repetition.
        if (this.currentStaffBreak.length == 1) {
            responseString = `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:`;
        }
        if (this.currentStaffBreak.length == 2) {
            responseString = `There are *two* people away at the moment :sob:`;
        }
        //For loop adds to response for each staff member on break;
        for (var i = 0; i < this.currentStaffBreak.length; i++) {
            responseString += `*<@${this.currentStaffBreak[i].userId}>* is back at *${staff_break_1.getDueDate(this.currentStaffBreak[i])}* currently at *${this.currentStaffBreak[i].breakType.name}*`;
        }
        //Default return is that there is no one on break.
        responseString = "*No-one* is on break at the moment :upside_down_face:";
        return responseString;
    }
    saveBreaksToFile() {
    }
    readBreaksFromFile() {
    }
    addStaffBreak(userId, breakTypeName) {
        //Find the break type in the 
        var breakType = this.breakTypes.find(b => b.name.toLowerCase() == breakTypeName.toLowerCase());
        var staffBreak = {
            userId: userId,
            breakType: breakType,
            startTime: date_handler_1.DateHandler.currentDate
        };
        this.currentStaffBreak.push(staffBreak);
        console.log(`Added break for ${staffBreak.userId}`);
    }
    removeStaffBreak(userId) {
        //First check to see if the user is actually on a break
        var matchedStaffBreak = this.currentStaffBreak.find(b => b.userId == userId);
        if (matchedStaffBreak == null) {
            return "User not in break list.";
        }
        //Removes staff break from list
        this.currentStaffBreak = this.currentStaffBreak.filter(b => b.userId != userId);
        return '';
    }
    breakNames() {
        var names = [];
        this.breakTypes.forEach(bt => {
            names.push(bt.name.toLowerCase());
        });
        return names;
    }
}
exports.BreakScheduler = BreakScheduler;
//# sourceMappingURL=break-scheduler.js.map