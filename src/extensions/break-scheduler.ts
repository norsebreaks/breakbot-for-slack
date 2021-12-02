import { DateHandler } from "./date-handler";
import { BreakType } from "../models/break-type";
import {
  breakExpired,
  getDueDate,
  StaffBreak,
  timerMiliseconds,
  timerRemainingMiliseconds,
} from "../models/staff-break";
import { DateTime } from "luxon";
import { MessageHandler } from "./message-handler";
import * as fs from "fs";
import { GlobalSettings } from "./global-settings";

export class BreakScheduler {
  constructor() {}
  maxStaffBreaks: number = 2;
  //Different break types go in here. The Name param is used for finding the type.
  breakTypes: BreakType[] = [
    {
      name: "break",
      duration: 15,
      emoji: ":fries:",
    },
    {
      name: "lunch",
      duration: 30,
      emoji: ":hamburger:",
    },
    {
      name: "long",
      duration: 45,
      emoji: ":bento:",
    },
    {
      name: "training",
      duration: 60,
      emoji: ":book:",
    },
  ];
  breakNames(): string[] {
    var names: string[] = [];
    this.breakTypes.forEach((bt) => {
      names.push(bt.name.toLowerCase());
    });
    return names;
  }
  currentStaffBreaks: StaffBreak[] = [];
  staffBreaksFileName: string = "staff_breaks.json";

  //These are the generic response strings, written as functions so that arguments can be passed if needed
  breakAddedResponse(
    userId: string,
    breakType: BreakType,
    dueTime: DateTime
  ): string {
    return `Hello *<@${userId}>* you can go to ${breakType.name} now ${breakType.emoji}
    see you back at *${dueTime.toFormat("t")}*`;
  }
  breakCancelResponse(userId: string) {
    return `No worries *<@${userId}>*, welcome back! :no_mouth:`;
  }
  breakCancelFailedResponse(userId: string) {
    return `You're not on break *<@${userId}>*, ya doofus! :no_mouth:`;
  }
  staffAlreadyOnBreakResponse(staffBreak: StaffBreak): string {
    return `*<@${staffBreak.userId}>*, you are *already* on ${staffBreak.breakType.name} you silly billy! :robot_face:`;
  }
  noStaffOnBreakResponse(): string {
    return "*No-one* is on break at the moment :upside_down_face:";
  }
  onePersonOnBreakResponse(): string {
    return `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:`;
  }
  twoPeopleOnBreakResponse(): string {
    return "There are *two* people away at the moment :sob:";
  }
  currentBreakPattern(staffBreak: StaffBreak): string {
    return `\n*<@${staffBreak.userId}>* is back at *${getDueDate(
      staffBreak
    ).toFormat("t")}* currently at *${staffBreak.breakType.name}*`;
  }
  staffBackFromBreakResponse(staffBreak: StaffBreak): string {
    return `*<@${staffBreak.userId}>* is back from ${staffBreak.breakType.name}! :robot_face:`;
  }
  breakSlotsFullResponse(userId: string): string {
    return `Sorry *<@${userId}>*, there are already ${this.maxStaffBreaks} people away :unamused:`;
  }
  //Main functions
  getWhoIsOnBreak() {
    var responseString: string = "";
    console.log(this.currentStaffBreaks.length);
    //In here, you can adjust the message that sends depending on how many people are on breaks.
    //Manny's original ones are in here, but obviously will not account for if there are more than 2 people away at a time, but easy enough to adjust if needed.
    switch (this.currentStaffBreaks.length) {
      case 1: {
        responseString = this.onePersonOnBreakResponse();
        break;
      }
      case 2: {
        responseString = this.twoPeopleOnBreakResponse();
        break;
      }
      case 0: {
        responseString = this.noStaffOnBreakResponse();
        break;
      }
    }
    //For loop adds to response for each staff member on break;
    for (var i = 0; i < this.currentStaffBreaks.length; i++) {
      responseString += this.currentBreakPattern(this.currentStaffBreaks[i]);
    }
    //Default return is that there is no one on break.

    return MessageHandler.postMessage(responseString);
  }

  async addStaffBreak(userId: string, breakTypeName: string) {
    //Check to see if user is already on a break
    var matchedStaffBreak: StaffBreak = this.currentStaffBreaks.find(
      (b) => b.userId == userId
    );

    if (matchedStaffBreak != null) {
      await MessageHandler.postMessage(
        this.staffAlreadyOnBreakResponse(matchedStaffBreak)
      );
      return;
    }

    //Then check to see if all the break slots are already used up
    if (this.breakSlotAvailable() == false) {
      await MessageHandler.postMessage(this.breakSlotsFullResponse(userId));
      return;
    }

    //If those checks pass, then actually schedule the break
    var staffBreak: StaffBreak = {
      userId: userId,
      breakType: this.breakTypes.find(
        (b) => b.name.toLowerCase() == breakTypeName.toLowerCase()
      ),
      startTime: DateHandler.currentDate(),
    };
    this.currentStaffBreaks.push(staffBreak);
    if (GlobalSettings.verboseLogging == true) {
      console.log(`Added break for ${staffBreak.userId}`);
    }

    await MessageHandler.postMessage(
      this.breakAddedResponse(
        staffBreak.userId,
        staffBreak.breakType,
        getDueDate(staffBreak)
      )
    );
    this.saveBreaksToFile();
    this.startBreak(staffBreak);
    return;
  }
  async removeStaffBreak(userId: string) {
    //First check to see if the user is actually on a break
    var matchedStaffBreak: StaffBreak = this.currentStaffBreaks.find(
      (b) => b.userId == userId
    );
    if (matchedStaffBreak == null) {
      return "User not in break list.";
    }
    //Removes staff break from list
    this.currentStaffBreaks = this.currentStaffBreaks.filter(
      (b) => b.userId != userId
    );
    await MessageHandler.postMessage(
      this.staffBackFromBreakResponse(matchedStaffBreak)
    );
    this.saveBreaksToFile();
  }
  async cancelBreak(userId: string) {
    var matchedStaffBreak: StaffBreak = this.currentStaffBreaks.find(
      (b) => b.userId == userId
    );
    if (matchedStaffBreak == null) {
      await MessageHandler.postMessage(this.breakCancelFailedResponse(userId));
      return "User not in break list.";
    }

    clearTimeout(matchedStaffBreak.timer);
    //Removes staff break from list
    this.currentStaffBreaks = this.currentStaffBreaks.filter(
      (b) => b.userId != userId
    );
    if (GlobalSettings.verboseLogging == true) {
      console.log(`Break cancelled for ${userId}`);
    }
    await MessageHandler.postMessage(this.breakCancelResponse(userId));
    this.saveBreaksToFile();
    return;
  }
  startBreak(staffBreak: StaffBreak) {
    staffBreak.timer = setTimeout(() => {
      this.removeStaffBreak(staffBreak.userId);
    }, timerMiliseconds(staffBreak));
  }
  breakSlotAvailable(): boolean {
    if (this.currentStaffBreaks.length == this.maxStaffBreaks) {
      return false;
    }
    return true;
  }

  //File System Related Stuff
  saveBreaksToFile() {
    fs.writeFile(
      `./${this.staffBreaksFileName}`,
      JSON.stringify(this.currentStaffBreaks),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        if (GlobalSettings.verboseLogging == true) {
          console.log(`Break list saved to ${this.staffBreaksFileName}.`);
        }
      }
    );
  }
  readBreaksFromFile() {
    if (!fs.existsSync(`./${this.staffBreaksFileName}`)) {
      if (GlobalSettings.verboseLogging == true) {
        console.log(`No ${this.staffBreaksFileName} to load.`);
      }
      return;
    }
    fs.readFile(`./${this.staffBreaksFileName}`, "utf8", (err, jsonString) => {
      if (err) {
        console.log(`Error opening ${this.staffBreaksFileName}`);
        return;
      }
      var breaksList: any[] = JSON.parse(jsonString);
      breaksList.forEach((staffBreak) => {
        var parsedBreak: StaffBreak = {
          userId: staffBreak.userId,
          breakType: staffBreak.breakType,
          startTime: DateTime.fromISO(staffBreak.startTime),
        };
        if (!breakExpired(parsedBreak)) {
          parsedBreak.timer = setTimeout(() => {
            this.removeStaffBreak(parsedBreak.userId);
          }, timerRemainingMiliseconds(parsedBreak));
          this.currentStaffBreaks.push(parsedBreak);
        }
      });
    });
    return;
  }
}
