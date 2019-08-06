import { ItemModuleReg } from "./module/ItemCheat";
import {system,playerKicked,kickTickAdd,IUseCraftTableComponent} from "./system";
import {enchantReg,enchantCheck} from "./module/enchantCheat";
let tick = 0;



system.initialize = function () {
    server.log("Misbehavior loaded");

    system.registerComponent("misbehavior:isplayer", {});
    //这个组件记录玩家是否打开了工作台（打开工作台的时候将无法捡起物品,防刷）
    system.registerComponent("misbehavior:useCraftTable",{
        ifUse:false,
        ifShow:false
    });
    
    system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated,data=>{
        let entity = data.data.entity;
        if (entity.__identifier__ == "minecraft:player") {
        system.createComponent(entity,"misbehavior:isplayer");
        system.createComponent<IUseCraftTableComponent>(entity,"misbehavior:useCraftTable");
    }
});

ItemModuleReg();

    
}

system.update = function () {

    if(kickTickAdd()){
        for(let index in playerKicked){
            system.destroyEntity(playerKicked[index]);
            playerKicked.splice(Number(index),1);
        }
    }

}
