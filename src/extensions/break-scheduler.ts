import { DateHandler } from './date-handler';
import { BreakType } from '../models/break-type'
import { getDueDate, StaffBreak } from '../models/staff-break'
import { DateTime } from 'luxon';
export class BreakScheduler {

    maxStaffBreaks: number = 2;
    //Different break types go in here. The Name param is used for finding the type.
    breakTypes: BreakType[] = [
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
    ]
    currentStaffBreak: StaffBreak[] = [];
    
    //These are the generic response strings
    breakAddedResponse(userId: string, breakType: BreakType, dueTime: DateTime): string { 
        return `Hello *<@${userId}>* you can go to ${breakType.name} now ${breakType.emoji}
    see you back at *${dueTime.toFormat('t')}*`}

    getWhoIsOnBreak(): string{
        var responseString: string = "";
        //In here, you can adjust the message that sends depending on how many people are on breaks.
        //Manny's original ones are in here, but obviously will not account for if there are more than 2 people away at a time.
        //It just adds to the responseString variable, to minimise code repetition.
        if(this.currentStaffBreak.length == 1){
            responseString = `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:`
        }
        if(this.currentStaffBreak.length == 2){
            responseString = `There are *two* people away at the moment :sob:`
        }
        //For loop adds to response for each staff member on break;
        for(var i = 0; i < this.currentStaffBreak.length; i++){
            responseString += `*<@${this.currentStaffBreak[i].userId}>* is back at *${getDueDate(this.currentStaffBreak[i])}* currently at *${this.currentStaffBreak[i].breakType.name}*`
        }
        //Default return is that there is no one on break.
        responseString = "*No-one* is on break at the moment :upside_down_face:"

        return responseString;
    }
    saveBreaksToFile(){

    }
    readBreaksFromFile(){

    }
    addStaffBreak(userId: string, breakTypeName: string): string{
        var staffBreak: StaffBreak = {
            userId: userId,
            breakType: this.breakTypes.find(b => b.name.toLowerCase() == breakTypeName.toLowerCase()),
            startTime: DateHandler.currentDate
        }
        this.currentStaffBreak.push(staffBreak);
        console.log(`Added break for ${staffBreak.userId}`);
        return this.breakAddedResponse(staffBreak.userId, staffBreak.breakType, getDueDate(staffBreak))
    }
    removeStaffBreak(userId:string): string{
        //First check to see if the user is actually on a break
        var matchedStaffBreak: StaffBreak = this.currentStaffBreak.find(b => b.userId == userId);
        if(matchedStaffBreak == null){
            return "User not in break list.";
        } 
        //Removes staff break from list
        this.currentStaffBreak = this.currentStaffBreak.filter(b => b.userId != userId);
        return '';
    }
    breakNames(): string[]{
        var names: string[] = [];
        this.breakTypes.forEach(bt => {
            names.push(bt.name.toLowerCase());
        });
        return names;
    }
}