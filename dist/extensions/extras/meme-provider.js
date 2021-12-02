"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const message_handler_1 = require("../message-handler");
class MemeProvider {
    static postToChannel() {
        var message = "";
        axios_1.default
            .get(this.providerUrl)
            .then((res) => {
            message = res.data.url;
        })
            .catch((error) => {
            console.log(error);
            message = `Meme api is down :(`;
        })
            .then(() => {
            message_handler_1.MessageHandler.postMessage(message);
        });
    }
}
exports.MemeProvider = MemeProvider;
MemeProvider.providerUrl = "https://meme-api.herokuapp.com/gimme";
//# sourceMappingURL=meme-provider.js.map