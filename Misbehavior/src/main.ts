import { ItemModuleReg,invCheck } from "./module/ItemCheat";
import {system,playerKicked,kickTickAdd,IUseCraftTableComponent} from "./system";
import {destroyReg} from "./module/destroyCheat";
import {flyCheatReg} from "./module/flyCheat";
let tick = 0;
let tick2 = 0;



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
        try {
            if(entity){
                if (entity.__identifier__ == "minecraft:player") {
                system.createComponent(entity,"misbehavior:isplayer");
                system.createComponent<IUseCraftTableComponent>(entity,"misbehavior:useCraftTable");
                }
            }
        } catch (error) {
            
        }

});

ItemModuleReg();
destroyReg();
flyCheatReg();
}

system.update = function () {
    tick++;
    tick2++;
    if(tick > 1200){
        tick = 0;
        //system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c进行背包检查"}]}`,data=>{});
        system.executeCommand(`invcheck @a`,data=>{});
    }
    if(tick2 > 20){
        tick2 = 0;
        system.executeCommand(`flycheck @a`,data=>{});
    }
    if(kickTickAdd()){
        for(let index in playerKicked){
            system.destroyEntity(playerKicked[index]);
            playerKicked.splice(Number(index),1);
        }
    }

}
