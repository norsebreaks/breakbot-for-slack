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
exports.InfoProvider = void 0;
const message_handler_1 = require("./message-handler");
class InfoProvider {
    static helpMessage() {
        return '- *this help screen*' +
            '\n       `$bb ?`' +
            '\n- *see who is currently on break*' +
            '\n       `$bb info`' +
            '\n- *take a break*' +
            '\n       `$bb long`  for taking a cheeky 45er' +
            '\n       `$bb lunch` for taking a 30 minute break' +
            '\n       `$bb break` for taking a 15 minute break' +
            '\n       `$bb training` for taking a 60 minute training session' +
            '\n       `$bb cancel` to cancel your break`' +
            '\n- *random stuff*' +
            '\n       `$bb trivia`' +
            '\n       `$bb shillings` to see how many somali shillings are in yo bank' +
            '\n       `$bb meme`' +
            '\n       `$bb dadjoke`' +
            '\n :robot_face:  :robot_face:  :robot_face:';
    }
    static postHelp() {
        return __awaiter(this, void 0, void 0, function* () {
            message_handler_1.MessageHandler.postMessage(this.helpMessage());
        });
    }
}
exports.InfoProvider = InfoProvider;
//# sourceMappingURL=info-provider.js.map