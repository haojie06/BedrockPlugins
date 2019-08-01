import { system } from "./system";
import {commandsReg} from "./commands"
import {moveCheck,breakCheck,interactCheck,attackCheck} from "./protect"
let playerQuery;
let tick = 0;
system.initialize = function () {
    server.log("Myland Loaded");
    commandsReg();
    breakCheck();
    interactCheck();
    attackCheck();

    system.registerComponent("myland:isplayer", {});
    system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated,data=>{
        let entity = data.data.entity;
        if (entity.__identifier__ == "minecraft:player") {
        system.createComponent(entity,"myland:isplayer");
    }});

    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"myland:isplayer");
}

system.update = function () {
    tick++;
    if(tick == 20){
        tick = 0;
        let players = system.getEntitiesFromQuery(playerQuery);
        for (let player of players) {
            moveCheck(player);
        }
    }
}