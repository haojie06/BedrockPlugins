import { ItemModuleReg,invCheck } from "./module/ItemCheat";
import {system,playerKicked,kickTickAdd,IUseCraftTableComponent} from "./system";
import {destroyReg} from "./module/destroyCheat";
import {db,QUERY_MISB_BYNAME,misbDB,alertDB} from "./database";
import {flyCheatReg} from "./module/flyCheat";
import {destroyCountMap,getDesTimeStamp,setDesTimeStamp} from "./utils";
let tick = 0;
let tick2 = 0;
let tick3 = 0;


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
    tick3++;
    if(tick > 1200){
        tick = 0;
        //system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c进行背包检查"}]}`,data=>{});
        system.executeCommand(`invcheck @a`,data=>{});
    }
    if(tick2 > 20){
        tick2 = 0;
        system.executeCommand(`flycheck @a`,data=>{});
    }
    if(tick3 > 200){
        tick3 = 0;
        //防止异常破坏速度
        for(let key of destroyCountMap.keys()){
            let count = 0;
            let useTime = 0;
            let destroyCountTimeStamp = getDesTimeStamp();
            if(destroyCountTimeStamp != 0){
                let nowTimeStamp = new Date().getTime();
                useTime = (nowTimeStamp - destroyCountTimeStamp) / 1000;
                count = destroyCountMap.get(key) / useTime;
            }else{
                count = destroyCountMap.get(key) / 10;
            }
            setDesTimeStamp(new Date().getTime());
            //system.executeCommand(`tellraw @a[name="${key}"] {"rawtext":[{"text":"200tick中总共破坏了${destroyCountMap.get(key)}个方块 平均每秒你破坏了${count}个方块 200tick耗时${useTime}s"}]}`,data=>{});
            if(count > 12){
                //异常的破坏速度
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c检测到${key}的破坏速度异常,平均每秒破坏了${count}个方块"}]}`,data=>{});
                server.log(`检测到${key}的破坏速度异常,平均每秒破坏了${count}个方块`);
                //依赖EasyList
                system.executeCommand(`fkick @a[name="${key}"]`,data=>{});
                misbDB(key,"破坏速度作弊",`平均每秒破坏${count}个方块`,"自动检测");

                let datas = db.query(QUERY_MISB_BYNAME,{$name:key});
                if (datas.length > 3){
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${key}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                    system.executeCommand(`fban ${key} misbehaviour-autoban`,data=>{});
                }

            }
            destroyCountMap.delete(key);
        }
    }
    if(kickTickAdd()){
        for(let index in playerKicked){
            system.destroyEntity(playerKicked[index]);
            playerKicked.splice(Number(index),1);
        }
    }

}
