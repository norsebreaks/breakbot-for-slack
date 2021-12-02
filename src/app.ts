import { BreakScheduler } from "./extensions/break-scheduler";
import { DateTime } from "luxon";
import { MessageHandler } from "./extensions/message-handler";
import * as fs from "fs";
import { GlobalSettings } from "./extensions/global-settings";
import { InfoProvider } from "./extensions/info-provider";
import { DadJokeProvider } from "./extensions/extras/dad-joke-provider";
import { MemeProvider } from "./extensions/extras/meme-provider";
import { TriviaProvider } from "./extensions/extras/trivia-provider";
import { AwareResponseProvider } from "./extensions/extras/aware-response-provider";

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
const verboseLogging: boolean =
  eval(process.env.SLACK_BOT_VERBOSE_LOGS) || false;
const enableAwareResponses = eval(process.env.SLACK_BOT_AWARE_RESPONSE) || true;
const slackBotIconUrl = process.env.SLACK_BOT_IMAGE_URL || "";

const breakScheduler = new BreakScheduler();
const messageHandler = new MessageHandler(app);

const serverStartMessage: string = "BreakBot for Slack Started";
//Starts the bot
(async () => {
  await app.start();
  MessageHandler.channelId = channelId;
  MessageHandler.iconUrl = slackBotIconUrl;
  breakScheduler.readBreaksFromFile();
  TriviaProvider.loadPointsFile();
  GlobalSettings.verboseLogging = verboseLogging;
  console.log(serverStartMessage);
})();


//Incoming message handling
app.message(async ({ message }) => {
  if (GlobalSettings.verboseLogging) {
    console.log(message);
  }
  //If there's no actual message, return.
  if (message.text == null) {
    if (GlobalSettings.verboseLogging) {
      console.log("No message.text on object");
    }
    return;
  }
  //Ignore all messages that don't start with $bb, and when trivia mode is not active
  if (
    !message.text.toLowerCase().startsWith("$bb") &&
    TriviaProvider.triviaActive() == false
  ) {
    //Optional check for non $bb messages
    if (enableAwareResponses == true) {
      //New options can be added in ./src/extensions/extras/aware-response-provider.ts
      AwareResponseProvider.checkMessage(message.text);
    }
    return;
  }
  //Only check trivia answers where $bb is excluded
  if (
    !message.text.toLowerCase().startsWith("$bb") &&
    TriviaProvider.triviaActive() == true
  ) {
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

  /////Example using DadJoke, can be found in ./src/extensions/extras
  if (msg.toLowerCase() == "dadjoke" || msg.toLowerCase() == "dad joke") {
    DadJokeProvider.postToChannel();
  }
  if (msg.toLowerCase() == "meme") {
    MemeProvider.postToChannel();
  }
  //////Trivia too, if desired
  if (msg.toLowerCase() == "trivia") {
    TriviaProvider.postQuestionToChannel();
  }
  if (msg.toLowerCase() == "shillings") {
    TriviaProvider.getPoints(message.user);
  }
});
