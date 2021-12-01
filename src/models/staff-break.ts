import { DateTime } from "luxon";
import { DateHandler } from "../extensions/date-handler";
import { BreakType } from "./break-type";

export interface StaffBreak {
    userId: string;
    breakType: BreakType;
    startTime: DateTime;
}
export function getDueDate(staffBreak: StaffBreak): DateTime{
    var due = DateHandler.dueDate(staffBreak.breakType.duration);
    return due;
}
