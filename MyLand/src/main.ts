import { system } from "./system";
import {commandsReg} from "./commands"
import {moveCheck,breakCheck,interactCheck,attackCheck,IfInLnadComponent} from "./protect"
let playerQuery;
let tick = 0;
system.initialize = function () {
    server.log("Myland Loaded");
    commandsReg();
    breakCheck();
    interactCheck();
    attackCheck();



    system.registerComponent("myland:isplayer", {});
    //用于在玩家进入他人领地/退出他人领地的时候显示
    system.registerComponent("myland:ifInLand", {
        //现在是否在领地内
        now:false,
        //进入时的显示时间
        showTime:0,
        //当前在谁的领地内
        whosLand:"",
        //领地的名字
        landName:"",
        //上一次检测时是否在领地内
        justNow:false
    });

    system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated,data=>{
        let entity = data.data.entity;
        if (entity.__identifier__ == "minecraft:player") {
        system.createComponent(entity,"myland:isplayer");
        system.createComponent<IfInLnadComponent>(entity,"myland:ifInLand");
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