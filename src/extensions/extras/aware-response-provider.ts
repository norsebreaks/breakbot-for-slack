import { MessageHandler } from "../message-handler";

export class AwareResponseProvider {
    
    //Space for non '$bb' messages to be checked, if custom responses are desired, but not with need for complex logic like fetching from an API.
    static checkMessage(message: string){
        var msg = message.toLowerCase();

        //Basically just needs to follow this pattern
        if(msg.includes('kitomba')){
            MessageHandler.postMessage(`:k::k-i::k-t::k-o::k-m::k-b::k-a:`);
            //Optional return;, otherwise it will continue through the list and potentially post multiple messages, which may not be desired.
            return;
        };
        if(msg.includes(':robot_face:')){
            MessageHandler.postMessage(':heartbeat:');
            return;
        }
        if(msg.includes('dog') || msg.includes('doge')){
            MessageHandler.postMessage(':doge:');
            return;
        }
    }
}
