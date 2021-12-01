"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHandler = void 0;
const luxon_1 = require("luxon");
class DateHandler {
    static currentDate() {
        return luxon_1.DateTime.now().setLocale(DateHandler.locale).setZone(DateHandler.timezone);
    }
    static dueDate(duration) {
        var due = DateHandler.currentDate().plus({ minutes: duration });
        return due;
    }
}
exports.DateHandler = DateHandler;
//Timezones can be found here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones and use the TZ database name column
DateHandler.timezone = "Pacific/Auckland";
DateHandler.locale = "en-NZ";
//# sourceMappingURL=date-handler.js.map