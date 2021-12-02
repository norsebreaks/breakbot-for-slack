import { BreakScheduler } from "./extensions/break-scheduler";
import { DateTime } from "luxon";
import { MessageHandler } from "./extensions/message-handler";
import * as fs from "fs";
import { GlobalSettings } from "./extensions/global-settings";
import { InfoProvider } from "./extensions/info-provider";
import { DadJokeProvider } from "./extensions/extras/dad-joke-provider";
import { MemeProvider } from "./extensions/extras/meme-provider";
import { TriviaProvider } from "./extensions/extras/trivia-provider";

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
const verboseLogging: boolean = eval(process.env.SLACK_BOT_VERBOSE_LOGS);
const breakScheduler = new BreakScheduler();
const messageHandler = new MessageHandler(app);

app.message(async ({ message }) => {
  if (GlobalSettings.verboseLogging) {
    console.log(message);
  }
  if(message.text == null){
    if(GlobalSettings.verboseLogging){
      console.log("No message.text on object");
    }
    return;
  }
  //Ignore all messages that don't start with $bb, and when trivia mode is not active
  if (!message.text.toLowerCase().startsWith("$bb") && TriviaProvider.triviaActive() == false) {
    return;
  }
  //Only check trivia answers where $bb is excluded
  if(!message.text.toLowerCase().startsWith("$bb") && TriviaProvider.triviaActive() == true){
    TriviaProvider.checkUserAnswer(message.user, message.text);
    return;
  }
  //remove $bb from message for easier processing
  var msg: string = message.text.slice(3);
  //and then remove the next character if it's a space, provides safety if a user misses a space
  if (msg[0] == " ") {
    msg = msg.slice(1);
  }

  //Message handler functions go below

  ///First check if it is a type of break
  if (breakScheduler.breakNames().includes(msg.toLowerCase())) {
    await breakScheduler.addStaffBreak(message.user, msg.toLowerCase());
  }
  ///Then check if it is a break being cancelled
  if (msg.toLowerCase() == "cancel") {
    await breakScheduler.cancelBreak(message.user);
  }

  ////Other staff can go below
  if (msg.toLowerCase() == "?") {
    await InfoProvider.postHelp();
  }
  if (msg.toLowerCase() == "info") {
    breakScheduler.getWhoIsOnBreak();
  }

  /////Example using DadJoke, can be found in ./extensions/extras
  if (msg.toLowerCase() == "dadjoke" || msg.toLowerCase() == "dad joke") {
    DadJokeProvider.postToChannel();
  }
  if (msg.toLowerCase() == "meme") {
    MemeProvider.postToChannel();
  }
  if(msg.toLowerCase() == "trivia"){
    TriviaProvider.postQuestionToChannel();
  }
  if(msg.toLowerCase() == "shillings"){
    TriviaProvider.getPoints(message.user);
  }
});

(async () => {
  await app.start();
  MessageHandler.channelId = channelId;
  breakScheduler.readBreaksFromFile();
  TriviaProvider.loadPointsFile();
  GlobalSettings.verboseLogging = verboseLogging;
  console.log("Bolt server running");
})();
