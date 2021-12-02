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
exports.MessageHandler = void 0;
class MessageHandler {
    constructor(boltApp) {
        MessageHandler.boltApp = boltApp;
    }
    static postMessage(message, channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channelId == null || this.channelId.length < 1) {
                console.error("No bot channel specified");
                return;
            }
            function channel() {
                if (channelId != null && channelId.length > 1) {
                    return channelId;
                }
                return MessageHandler.channelId;
            }
            function iconUrl() {
                if (MessageHandler.iconUrl != null && MessageHandler.iconUrl.length > 0) {
                    return MessageHandler.iconUrl;
                }
                return null;
            }
            var chatArgs = {
                channel: channel(),
                icon_url: iconUrl()
            };
            chatArgs.text = message;
            var response = yield this.boltApp.client.chat.postMessage(chatArgs);
            return response;
        });
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=message-handler.js.map