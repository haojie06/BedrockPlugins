import { system } from "../system";
import {getName} from "../utils"
import {db,QUERY_MISB_BYNAME,misbDB,alertDB} from "../database";
import { destroyCountMap } from "../utils";
interface DestroyStatus {
    startTime:number;
    bx:number;
    by:number;
    bz:number;
}

let destroyStatusMap = new Map();

export function destroyReg(){
    server.log("MisBehavior 防破坏作弊模块已加载");
    
    system.listenForEvent("minecraft:block_destruction_started",data=>{
        try {
            let player = data.data.player;
            let bPosition = data.data.block_position;
            let playerName = getName(player);
            /*
            let ds:DestroyStatus = {
                startTime:date.getTime(),
                bx:bPosition.x,
                by:bPosition.y,
                bz:bPosition.z
            };
            */
            destroyStatusMap.set(playerName,"start");
        } catch (error) {
            server.log("MISBEHAVIOR:防破坏作弊模块出错");
        }
    });

    system.listenForEvent("minecraft:block_destruction_stopped",data=>{
        try {
            let player = data.data.player;
            let playerName = getName(player);
            let progress = data.data.destruction_progress;
            let bPosition = data.data.block_position;
            
            destroyStatusMap.delete(playerName);
        } catch (error) {
            server.log("MISBEHAVIOR:防破坏作弊模块出错");
        }
    });

    system.listenForEvent("minecraft:player_destroyed_block",data=>{
        try {
            let player = data.data.player;
            let bPosition = data.data.block_position;
            let blockName = data.data.block_identifier;
            let playerName = getName(player);

            //添加破坏计数器
            //system.sendText(player,`方块破坏 ${bPosition.x} ${bPosition.y} ${bPosition.z}`);
            if(destroyCountMap.has(playerName)){
                let count = destroyCountMap.get(playerName);
                destroyCountMap.set(playerName,count+1);
            }
            else{
                destroyCountMap.set(playerName,1);
            }
            if(!destroyStatusMap.has(playerName)){
                system.sendText(player,`检测到异常`);
                misbDB(playerName,"瞬间破坏",`检测到伪创造瞬间破坏作弊`,"自动检测");
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c自动检测：高度怀疑${playerName}使用了伪创造瞬间破坏,踢出"}]}`,data=>{});
                server.log(`自动检测：高度怀疑${playerName}使用了伪创造瞬间破坏,踢出`);
                system.destroyEntity(player);

                //依赖EasyList
                let datas = db.query(QUERY_MISB_BYNAME,{$name:playerName});
                if (datas.length > 3){
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                    system.executeCommand(`fban ${playerName} misbehaviour-autoban`,data=>{});
                }
            }
            else{
            }



        } catch (error) {
            
        }
    });
}
