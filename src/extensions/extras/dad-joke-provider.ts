import axios from "@slack/web-api/node_modules/axios";
import { MessageHandler } from "../message-handler";

export class DadJokeProvider {
  //Example of using a simple API to create unique responses

  //URL where the data is coming from
  private static providerUrl: string =
    "https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes";

  //Function that will actually post the message
  static postToChannel() {
    //Placeholder variable to save memory address space.
    var message = "";
    //Get the data from the provided URL, set 'message' to whatever data you want, api should have docs on the properties
    axios
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
        MessageHandler.postMessage(message);
      });
  }
}
