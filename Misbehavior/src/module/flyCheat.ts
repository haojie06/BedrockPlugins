import { system } from "../system";
import {getName,checkFlying,checkAdmin,checkMayFly} from "../utils"
import {db,QUERY_MISB_BYNAME,misbDB,alertDB} from "../database";

interface FlyStatus {
    px:number;
    py:number;
    pz:number;
}
let flyStatusMap = new Map();
let misbFlyCountMap = new Map();
//目前飞行判断方法 两次检测中玩家周围都是空气 且坐标不发生改变
export function flyCheatReg() {
    server.log("反飞行作弊模块已加载");

    system.registerCommand("flycheck",{
        description:"检查异常飞行",
        permission:1,
        overloads:[{
            parameters:[{
                name:"player",
                type:"player"
            }],
                handler([players]){
                    try {
                        let sTime = new Date().getTime();
                        for(let player of players){
                            //获得玩家周围的方块
                            if (player) {
                            if(checkAdmin(player)){
                                continue;
                            }
                            let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
                            let tickingArea = tickAreaCmp.data.ticking_area;
                            let posCmp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                            let x:number = Math.floor(posCmp.data.x);
                            let y:number = Math.floor(posCmp.data.y);
                            let z:number = Math.floor(posCmp.data.z);
                            //let curBlock = system.getBlock(tickingArea,x,y+i,z).__identifier__;
                            //脚底下9个方块全部是air
                            let temp = system.getBlock(tickingArea,x,y-1,z).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x+1,y-1,z+1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x-1,y-1,z-1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x+1,y-1,z-1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x-1,y-1,z+1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x,y-1,z+1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x,y-1,z-1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x+1,y-1,z).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x-1,y-1,z).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            //排除挂在梯子上的情况。。
                            temp = system.getBlock(tickingArea,x-1,y,z).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x+1,y,z).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x,y,z-1).__identifier__;
                            if(temp != "minecraft:air"){continue;}
                            temp = system.getBlock(tickingArea,x,y,z+1).__identifier__;
                            if(temp != "minecraft:air"){continue;}

                            //system.sendText(player,`疑似飞行`);
                            let playerName = getName(player);
                            //查看是否上一次也是这里
                            if(flyStatusMap.has(playerName)){
                                let fs:FlyStatus = flyStatusMap.get(playerName);
                                //空中停留判定为飞行（也许可以优化一下这个判断？）  改成小范围停留也算了
                                if(x > fs.px-2 && x < fs.px+2 && y == fs.py && z > fs.pz-2 && z < fs.pz+2){
                                    if(!checkMayFly(player)){
                                    //system.sendText(player,`判定为异常飞行`);
                                    misbDB(playerName,"飞行作弊",`检测到飞行作弊`,"自动检测");
                                    if(misbFlyCountMap.has(playerName)){
                                        let count = misbFlyCountMap.get(playerName);
                                        if(count > 2){
                                            //踢出玩家
                                            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c自动检测：检测到${playerName}违反引力作用,踢出"}]}`,data=>{});
                                            server.log(`自动检测：检测到${playerName}飞行作弊,踢出`);
                                            system.destroyEntity(player);
                                            misbFlyCountMap.delete(playerName);
                                        }
                                        else{
                                            //仅仅是把玩家拉回地面 (最多向下100)
                                            misbFlyCountMap.set(playerName,count+1);
                                            for(let i = 1;i < 100;i++){
                                                let block = system.getBlock(tickingArea,x,y-i,z).__identifier__;
                                                if(block != "minecraft:air"){
                                                    system.executeCommand(`tp @a[name="${playerName}"] ${x} ${y-i+1} ${z}`,data=>{});
                                                    system.sendText(player,`你受到地心引力作用`);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    else{
                                        misbFlyCountMap.set(playerName,0);
                                    }
                                    }
                                    else{
                                        system.sendText(player,`你有飞行权限`,5);
                                    }
                                }
                                else{
                                    //删除记录重新记录
                                    flyStatusMap.delete(playerName);
                                }
                            }
                            else{
                                let fs:FlyStatus = {
                                    px:x,
                                    py:y,
                                    pz:z
                                };
                                flyStatusMap.set(playerName,fs);
                            }
                            }
                        }
                        let eTime = new Date().getTime();
                        server.log(`飞行检测耗时${eTime - sTime}ms`)
                    } catch (error) {
                        
                    }

        }
        } as CommandOverload<["player"]>
    ]
    });
}
