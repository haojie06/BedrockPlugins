import {backReg} from "./commands/back";
import {warpReg} from "./commands/warp";
import {homeReg} from "./commands/home";
import {tpReg} from "./commands/tp";
import {buildToolsReg} from "./commands/buildtools"
import {toolReg} from "./commands/tools";
import {utilsReg,getName} from "./utils";
import {system} from "./system"


system.initialize = function() {
    server.log("EasyEssentials 2.0 created by haojie06 loaded");
    system.listenForEvent("minecraft:entity_created",onPlayerCreated);
    utilsReg(system);
    backReg(system);
    warpReg(system);
    homeReg(system);
    tpReg(system);
    toolReg(system);
    buildToolsReg();
}



function onPlayerCreated(data){
    var entity = data.data.entity;
    if (!entity) throw "not entity";
    if (entity.__identifier__ == "minecraft:player") {
        server.log("玩家加入游戏");
        //let ecmp = system.getComponent(entity,MinecraftComponent.ExtraData);
        //server.log(ecmp.data.value.Variant.toString());
        //let name = getName(entity);
        //let out = ecmp.data.toString();
        //system.executeCommand(`tell @a[name=${name}] §e服务器已使用EasyEssentials 2.0`,(data)=>{});
    }
}
