import { App } from "@slack/bolt";
import { ChatPostMessageArguments } from "@slack/web-api";

export class MessageHandler {
    static boltApp: App;
    static channelId: string;
    constructor(boltApp: App){
        MessageHandler.boltApp = boltApp;
    }
    static async postMessage(message: string, channelId?: string){
        if(this.channelId == null || this.channelId.length < 1){
            console.error("No bot channel specified");
        }
        function channel(): string{
            if(channelId != null && channelId.length > 1){
                return channelId;
            }
            return MessageHandler.channelId;
        }
        var chatArgs: ChatPostMessageArguments = {
            channel: channel(),
            text: message
        }
        console.log(message);
        var response = await this.boltApp.client.chat.postMessage(chatArgs);
        return response;
    }
}
