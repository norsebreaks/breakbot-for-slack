"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwareResponseProvider = void 0;
const message_handler_1 = require("../message-handler");
class AwareResponseProvider {
    //Space for non '$bb' messages to be checked, if custom responses are desired, but not with need for complex logic like fetching from an API.
    static checkMessage(message) {
        var msg = message.toLowerCase();
        //Basically just needs to follow this pattern
        if (msg.includes('kitomba')) {
            message_handler_1.MessageHandler.postMessage(`:k::k-i::k-t::k-o::k-m::k-b::k-a:`);
            //Optional return;, otherwise it will continue through the list and potentially post multiple messages, which may not be desired.
            return;
        }
        ;
        if (msg.includes(':robot_face:')) {
            message_handler_1.MessageHandler.postMessage(':heartbeat:');
            return;
        }
        if (msg.includes('dog') || msg.includes('doge')) {
            message_handler_1.MessageHandler.postMessage(':doge:');
            return;
        }
    }
}
exports.AwareResponseProvider = AwareResponseProvider;
//# sourceMappingURL=aware-response-provider.js.map