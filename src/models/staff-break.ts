import { DateTime } from "luxon";
import { DateHandler } from "../extensions/date-handler";
import { BreakType } from "./break-type";

export interface StaffBreak {
    userId: string;
    breakType: BreakType;
    startTime: DateTime;
    timer?: NodeJS.Timeout;
}
export function getDueDate(staffBreak: StaffBreak): DateTime{
    var due = DateHandler.dueDate(staffBreak.breakType.duration);
    return due;
}
export function timerMiliseconds(staffBreak: StaffBreak): number {
    return (staffBreak.breakType.duration * 60) * 1000;    
}
export function breakExpired(staffBreak): boolean{
    if(getDueDate(staffBreak) < DateHandler.currentDate()){
        return true;
    }
    return false;
}
export function timerRemainingMiliseconds(staffBreak: StaffBreak): number {
    var startTimeMS = staffBreak.startTime.toMillis();
    var currentTimeMS = DateHandler.currentDate().toMillis();
    return currentTimeMS - startTimeMS;
}
