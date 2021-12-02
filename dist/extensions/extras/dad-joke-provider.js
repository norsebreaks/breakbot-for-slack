"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DadJokeProvider = void 0;
const axios_1 = __importDefault(require("@slack/web-api/node_modules/axios"));
const message_handler_1 = require("../message-handler");
class DadJokeProvider {
    //Function that will actually post the message
    static postToChannel() {
        //Placeholder variable to save memory address space.
        var message = "";
        //Get the data from the provided URL, set 'message' to whatever data you want, api should have docs on the properties
        axios_1.default
            .get(this.providerUrl)
            .then((res) => {
            message = `${res.data.setup} \r ${res.data.punchline}`;
        })
            //Then if there's an error, chuck it in the console, and set message saying something is borked
            .catch((error) => {
            console.log(error);
            message = `DadJokes api is down :(`;
        })
            //Then post whatever 'message' is to the chat
            .then(() => {
            message_handler_1.MessageHandler.postMessage(message);
        });
    }
}
exports.DadJokeProvider = DadJokeProvider;
//Example of using a simple API to create unique responses
//URL where the data is coming from
DadJokeProvider.providerUrl = "https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes";
//# sourceMappingURL=dad-joke-provider.js.map