import { MessageHandler } from "./message-handler";

export class InfoProvider {
    private static helpMessage(): string { return '- *this help screen*' +
    '\n       `$bb ?`' +
    '\n- *see who is currently on break*' +
    '\n       `$bb info`' +
    '\n- *take a break*' +
    '\n       `$bb long`  for taking a cheeky 45er' +
    '\n       `$bb lunch` for taking a 30 minute break' +
    '\n       `$bb break` for taking a 15 minute break' +
    '\n       `$bb training` for taking a 60 minute training session' +
    '\n       `$bb cancel` to cancel your break`' +
    //'\n- *random stuff*' +
    //'\n       `$bb trivia`' +
    //'\n       `$bb shillings` to see how many somali shillings are in yo bank' +
    //'\n       `$bb meme`' +
    '\n       `$bb dadjoke`' +
    '\n :robot_face:  :robot_face:  :robot_face:'
}
    static async postHelp(){
        MessageHandler.postMessage(this.helpMessage());
    }
}
