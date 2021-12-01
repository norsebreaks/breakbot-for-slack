import { DateHandler } from './date-handler';
import { BreakType } from '../models/break-type'
import { getDueDate, StaffBreak, timerMiliseconds } from '../models/staff-break'
import { DateTime } from 'luxon';
import { MessageHandler } from './message-handler';
import { response } from 'express';
export class BreakScheduler {

    maxStaffBreaks: number = 2;
    //Different break types go in here. The Name param is used for finding the type.
    breakTypes: BreakType[] = [
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
    ]
    breakNames(): string[]{
        var names: string[] = [];
        this.breakTypes.forEach(bt => {
            names.push(bt.name.toLowerCase());
        });
        return names;
    }
    currentStaffBreaks: StaffBreak[] = [];
    
    //These are the generic response strings
    breakAddedResponse(userId: string, breakType: BreakType, dueTime: DateTime): string { 
        return `Hello *<@${userId}>* you can go to ${breakType.name} now ${breakType.emoji}
    see you back at *${dueTime.toFormat('t')}*`}
    breakEndedResponse(){

    }
    staffAlreadyOnBreakResponse(staffBreak: StaffBreak): string{
        return `*<@${staffBreak.userId}>*, you are *already* on ${staffBreak.breakType.name} you silly billy! :robot_face:`
    }
    noStaffOnBreakResponse(): string {
        return "*No-one* is on break at the moment :upside_down_face:"
    }
    onePersonOnBreakResponse(): string {
        return `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:`;
    }
    twoPeopleOnBreakResponse(): string {
        return "There are *two* people away at the moment :sob:"
    }
    currentBreakPattern(staffBreak: StaffBreak): string{
        return `*<@${staffBreak.userId}>* is back at *${getDueDate(staffBreak)}* currently at *${staffBreak.breakType.name}*`
    }
    staffBackFromBreakResponse(staffBreak: StaffBreak): string {
        return `*<@${staffBreak.userId}>* is back from ${staffBreak.breakType.name}! :robot_face:`;
    }
    breakSlotsFullResponse(userId: string): string{
        return `Sorry *<@${userId}>*, there are already ${this.maxStaffBreaks} people away :unamused:`;
    }
    //Main functions
    getWhoIsOnBreak(): string{
        var responseString: string = "";
        //In here, you can adjust the message that sends depending on how many people are on breaks.
        //Manny's original ones are in here, but obviously will not account for if there are more than 2 people away at a time, but easy enough to adjust if needed.
        switch(this.currentStaffBreaks.length){
            case 1:
                responseString = this.onePersonOnBreakResponse();
            case 2:
                responseString = this.twoPeopleOnBreakResponse();
        }
        //For loop adds to response for each staff member on break;
        for(var i = 0; i < this.currentStaffBreaks.length; i++){
            responseString += this.currentBreakPattern(this.currentStaffBreaks[i]);
        }
        //Default return is that there is no one on break.
        responseString = this.noStaffOnBreakResponse();

        return responseString;
    }

    async addStaffBreak(userId: string, breakTypeName: string){
        //Check to see if user is already on a break
        var matchedStaffBreak: StaffBreak = this.currentStaffBreaks.find(b => b.userId == userId);
        if(matchedStaffBreak != null){
            await MessageHandler.postMessage(this.staffAlreadyOnBreakResponse(matchedStaffBreak));
            return;
        }

        //Then check to see if all the break slots are already used up
        if(this.breakSlotAvailable() == false){
            await MessageHandler.postMessage(this.breakSlotsFullResponse(userId));
            return;
        }
        
        //If those checks pass, then actually schedule the break
        var staffBreak: StaffBreak = {
            userId: userId,
            breakType: this.breakTypes.find(b => b.name.toLowerCase() == breakTypeName.toLowerCase()),
            startTime: DateHandler.currentDate
        }
        this.currentStaffBreaks.push(staffBreak);
        console.log(`Added break for ${staffBreak.userId}`);
        
        await MessageHandler.postMessage(this.breakAddedResponse(staffBreak.userId, staffBreak.breakType, getDueDate(staffBreak)));
        this.startBreak(staffBreak);
    }
    async removeStaffBreak(userId:string){
        //First check to see if the user is actually on a break
        var matchedStaffBreak: StaffBreak = this.currentStaffBreaks.find(b => b.userId == userId);
        if(matchedStaffBreak == null){
            return "User not in break list.";
        } 
        //Removes staff break from list
        this.currentStaffBreaks = this.currentStaffBreaks.filter(b => b.userId != userId);
        await MessageHandler.postMessage(this.staffBackFromBreakResponse(matchedStaffBreak));
    }

    startBreak(staffBreak: StaffBreak){
        setTimeout(() => {
            this.removeStaffBreak(staffBreak.userId);
        }, timerMiliseconds(staffBreak));
    }
    saveBreaksToFile(){

    }
    readBreaksFromFile(){

    }
    breakSlotAvailable(): boolean{
        if(this.currentStaffBreaks.length == this.maxStaffBreaks){
            return false;
        }
        return true;
    }
}