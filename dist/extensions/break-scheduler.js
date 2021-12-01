"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakScheduler = void 0;
const date_handler_1 = require("./date-handler");
const staff_break_1 = require("../models/staff-break");
const message_handler_1 = require("./message-handler");
class BreakScheduler {
    constructor() {
        this.maxStaffBreaks = 2;
        //Different break types go in here. The Name param is used for finding the type.
        this.breakTypes = [
            {
                name: "break",
                duration: 15,
                emoji: ''
            },
            {
                name: "lunch",
                duration: 30,
                emoji: ''
            },
            {
                name: "long",
                duration: 45,
                emoji: ''
            },
            {
                name: "training",
                duration: 60,
                emoji: ''
            },
            {
                name: "test",
                duration: 0.1,
                emoji: ''
            },
            {
                name: "30secs",
                duration: 0.5,
                emoji: ''
            }
        ];
        this.currentStaffBreaks = [];
    }
    breakNames() {
        var names = [];
        this.breakTypes.forEach(bt => {
            names.push(bt.name.toLowerCase());
        });
        return names;
    }
    //These are the generic response strings, written as functions so that arguments can be passed if needed
    breakAddedResponse(userId, breakType, dueTime) {
        return `Hello *<@${userId}>* you can go to ${breakType.name} now ${breakType.emoji}
    see you back at *${dueTime.toFormat('t')}*`;
    }
    breakCancelResponse(userId) {
        return `No worries *<@${userId}>*, welcome back! :no_mouth:`;
    }
    breakCancelFailedResponse(userId) {
        return `You're not on break *<@${userId}>*, ya doofus! :no_mouth:`;
    }
    staffAlreadyOnBreakResponse(staffBreak) {
        return `*<@${staffBreak.userId}>*, you are *already* on ${staffBreak.breakType.name} you silly billy! :robot_face:`;
    }
    noStaffOnBreakResponse() {
        return "*No-one* is on break at the moment :upside_down_face:";
    }
    onePersonOnBreakResponse() {
        return `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:`;
    }
    twoPeopleOnBreakResponse() {
        return "There are *two* people away at the moment :sob:";
    }
    currentBreakPattern(staffBreak) {
        return `*<@${staffBreak.userId}>* is back at *${staff_break_1.getDueDate(staffBreak)}* currently at *${staffBreak.breakType.name}*`;
    }
    staffBackFromBreakResponse(staffBreak) {
        return `*<@${staffBreak.userId}>* is back from ${staffBreak.breakType.name}! :robot_face:`;
    }
    breakSlotsFullResponse(userId) {
        return `Sorry *<@${userId}>*, there are already ${this.maxStaffBreaks} people away :unamused:`;
    }
    //Main functions
    getWhoIsOnBreak() {
        var responseString = "";
        //In here, you can adjust the message that sends depending on how many people are on breaks.
        //Manny's original ones are in here, but obviously will not account for if there are more than 2 people away at a time, but easy enough to adjust if needed.
        switch (this.currentStaffBreaks.length) {
            case 1:
                responseString = this.onePersonOnBreakResponse();
            case 2:
                responseString = this.twoPeopleOnBreakResponse();
        }
        //For loop adds to response for each staff member on break;
        for (var i = 0; i < this.currentStaffBreaks.length; i++) {
            responseString += this.currentBreakPattern(this.currentStaffBreaks[i]);
        }
        //Default return is that there is no one on break.
        responseString = this.noStaffOnBreakResponse();
        return responseString;
    }
    addStaffBreak(userId, breakTypeName) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check to see if user is already on a break
            var matchedStaffBreak = this.currentStaffBreaks.find(b => b.userId == userId);
            if (matchedStaffBreak != null) {
                yield message_handler_1.MessageHandler.postMessage(this.staffAlreadyOnBreakResponse(matchedStaffBreak));
                return;
            }
            //Then check to see if all the break slots are already used up
            if (this.breakSlotAvailable() == false) {
                yield message_handler_1.MessageHandler.postMessage(this.breakSlotsFullResponse(userId));
                return;
            }
            //If those checks pass, then actually schedule the break
            var staffBreak = {
                userId: userId,
                breakType: this.breakTypes.find(b => b.name.toLowerCase() == breakTypeName.toLowerCase()),
                startTime: date_handler_1.DateHandler.currentDate()
            };
            this.currentStaffBreaks.push(staffBreak);
            console.log(`Added break for ${staffBreak.userId}`);
            yield message_handler_1.MessageHandler.postMessage(this.breakAddedResponse(staffBreak.userId, staffBreak.breakType, staff_break_1.getDueDate(staffBreak)));
            this.startBreak(staffBreak);
            return;
        });
    }
    removeStaffBreak(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            //First check to see if the user is actually on a break
            var matchedStaffBreak = this.currentStaffBreaks.find(b => b.userId == userId);
            if (matchedStaffBreak == null) {
                return "User not in break list.";
            }
            //Removes staff break from list
            this.currentStaffBreaks = this.currentStaffBreaks.filter(b => b.userId != userId);
            yield message_handler_1.MessageHandler.postMessage(this.staffBackFromBreakResponse(matchedStaffBreak));
        });
    }
    cancelBreak(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var matchedStaffBreak = this.currentStaffBreaks.find(b => b.userId == userId);
            if (matchedStaffBreak == null) {
                return "User not in break list.";
            }
            clearTimeout(matchedStaffBreak.timer);
            //Removes staff break from list
            this.currentStaffBreaks = this.currentStaffBreaks.filter(b => b.userId != userId);
            console.log(`Break cancelled for ${userId}`);
            yield message_handler_1.MessageHandler.postMessage(this.breakCancelResponse(userId));
            return;
        });
    }
    startBreak(staffBreak) {
        staffBreak.timer = setTimeout(() => {
            this.removeStaffBreak(staffBreak.userId);
        }, staff_break_1.timerMiliseconds(staffBreak));
    }
    saveBreaksToFile() {
    }
    readBreaksFromFile() {
    }
    breakSlotAvailable() {
        if (this.currentStaffBreaks.length == this.maxStaffBreaks) {
            return false;
        }
        return true;
    }
}
exports.BreakScheduler = BreakScheduler;
//# sourceMappingURL=break-scheduler.js.map