import { BreakScheduler } from "./extensions/break-scheduler";
import { DateTime } from "luxon";
import { MessageHandler } from "./extensions/message-handler";
import * as fs from "fs";

const { App } = require("@slack/bolt");
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  port: process.env.PORT || 3000,
  //botId: process.env.BOT_USER_ID,
});

const hotword = process.env.HOT_WORD || '$bb';
const channelId = process.env.SLACK_CHANNEL_ID;
const breakScheduler = new BreakScheduler();
const messageHandler = new MessageHandler(app);

app.message(async ({ message }) => {
  //Ignore all messages that don't start with $bb, by just returning
  if(!message.text.toLowerCase().startsWith('$bb')){
    return;
  }
  //remove $bb from message for easier processing
  var msg: string = message.text.slice(3);
  //and then remove the next character if it's a space, provides safety if a user misses a space
  if(msg[0] == ' '){
    msg = msg.slice(1);
  }

  //Message handler functions go below

  ////First check if it is a type of break
  if(breakScheduler.breakNames().includes(msg.toLowerCase())){
    await breakScheduler.addStaffBreak(message.user, msg.toLowerCase());
  }
  ////Then check if it is a break being cancelled
  if(msg.toLowerCase() == 'cancel'){
    await breakScheduler.cancelBreak(message.user);
  }
});
(async () => {
  await app.start();
  MessageHandler.channelId = channelId;
  breakScheduler.readBreaksFromFile();
  console.log("Bolt server running");
})();
