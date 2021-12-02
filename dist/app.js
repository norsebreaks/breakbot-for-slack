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
const break_scheduler_1 = require("./extensions/break-scheduler");
const message_handler_1 = require("./extensions/message-handler");
const global_settings_1 = require("./extensions/global-settings");
const info_provider_1 = require("./extensions/info-provider");
const dad_joke_provider_1 = require("./extensions/extras/dad-joke-provider");
const meme_provider_1 = require("./extensions/extras/meme-provider");
const { App } = require("@slack/bolt");
const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    port: process.env.PORT || 3000,
    botId: process.env.SLACK_BOT_ID || "",
});
const hotword = process.env.HOT_WORD || "$bb";
const channelId = process.env.SLACK_CHANNEL_ID;
const breakScheduler = new break_scheduler_1.BreakScheduler();
const messageHandler = new message_handler_1.MessageHandler(app);
app.message(({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    if (global_settings_1.GlobalSettings.verboseLogging) {
        console.log(message);
    }
    if (message.text == null) {
        if (global_settings_1.GlobalSettings.verboseLogging) {
            console.log("No message.text on object");
        }
        return;
    }
    //Ignore all messages that don't start with $bb, by just returning
    if (!message.text.toLowerCase().startsWith("$bb")) {
        return;
    }
    //remove $bb from message for easier processing
    var msg = message.text.slice(3);
    //and then remove the next character if it's a space, provides safety if a user misses a space
    if (msg[0] == " ") {
        msg = msg.slice(1);
    }
    //Message handler functions go below
    ///First check if it is a type of break
    if (breakScheduler.breakNames().includes(msg.toLowerCase())) {
        yield breakScheduler.addStaffBreak(message.user, msg.toLowerCase());
    }
    ///Then check if it is a break being cancelled
    if (msg.toLowerCase() == "cancel") {
        yield breakScheduler.cancelBreak(message.user);
    }
    ////Other staff can go below
    if (msg.toLowerCase() == "?") {
        yield info_provider_1.InfoProvider.postHelp();
    }
    if (msg.toLowerCase() == "info") {
        breakScheduler.getWhoIsOnBreak();
    }
    /////Example using DadJoke, can be found in ./extensions/extras
    if (msg.toLowerCase() == "dadjoke" || msg.toLowerCase() == "dad joke") {
        dad_joke_provider_1.DadJokeProvider.postToChannel();
    }
    if (msg.toLowerCase() == "meme") {
        meme_provider_1.MemeProvider.postToChannel();
    }
}));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield app.start();
    message_handler_1.MessageHandler.channelId = channelId;
    breakScheduler.readBreaksFromFile();
    global_settings_1.GlobalSettings.verboseLogging = true;
    console.log("Bolt server running");
}))();
//# sourceMappingURL=app.js.map