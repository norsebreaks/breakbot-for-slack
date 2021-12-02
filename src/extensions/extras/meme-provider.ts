import axios from "axios";
import { MessageHandler } from "../message-handler";

export class MemeProvider {
  private static providerUrl: string = "https://meme-api.herokuapp.com/gimme";

  static postToChannel() {
    var message = "";
    axios
      .get(this.providerUrl)
      .then((res) => {
        message = res.data.url;
      })
      .catch((error) => {
        console.log(error);
        message = `Meme api is down :(`;
      })
      .then(() => {
        MessageHandler.postMessage(message);
      });
  }
}
