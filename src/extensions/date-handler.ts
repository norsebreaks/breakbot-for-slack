import { DateTime } from "luxon";
export class DateHandler {
    //Timezones can be found here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones and use the TZ database name column
    static timezone: string = "Pacific/Auckland";
    static locale: string = "en-NZ"
    static currentDate(): DateTime {
       return DateTime.now().setLocale(DateHandler.locale).setZone(DateHandler.timezone);
    }
    static dueDate(duration: number): DateTime {
        var due = DateHandler.currentDate().plus({minutes: duration});
        return due;
    }
}
