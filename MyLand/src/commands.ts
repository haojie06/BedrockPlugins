import { system } from "./system";
import {getName,getDimensionOfEntity,getVecOfEntity,Vec} from "./utils"
let selectTool = "minecraft:wooden_hoe";
interface SelectPoint {
    sdim:string;
    sx:number;
    sy:number;
    sz:number;
    ex:number;
    ey:number;
    ez:number;
}
let pointMap = new Map();
let sp:SelectPoint = {
    sdim:'0',
    sx:0,
    sy:0,
    sz:0,
    ex:0,
    ey:0,
    ez:0
};
export function commandReg() {
    //领地选择
    system.listenForEvent("minecraft:block_destruction_started",data=>{
        let player = data.data.player;
        const hand = system.getComponent<IHandContainerComponent>(player, MinecraftComponent.HandContainer);
        const item = hand.data[0];
        let itemName = item.__identifier__;
        if(itemName == selectTool){
            let playerName = getName(player);
            let blockPos = data.data.block_position;
            //选取两点后应在数据库中进行检查
            if(pointMap.has(playerName)){
            let sp = pointMap.get(playerName);
            if(sp.ex == 0){
                //第二个点还未选取的时候
                let dim = getDimensionOfEntity(player);
                if(dim != sp.sdim){
                    system.sendText (player,"无法创建领地，跨维度选取是不行滴");
                    pointMap.delete(playerName);
                }
                else{
                sp.ex = blockPos.x;
                sp.ey = blockPos.y;
                sp.ez = blockPos.z;
                let divX = Math.abs(sp.ex-sp.sx) + 1;
                let divY = Math.abs(sp.ey - sp.sy) + 1;
                let divZ = Math.abs(sp.ez - sp.sz) + 1;
                let size = divX * divY * divZ;
                system.sendText(player,`你已经选取了(${sp.sx},${sp.sy},${sp.sz}) 至 (${sp.ex},${sp.ey},${sp.ez}) 体积为:${size}的区域`);
                }
            }else{
                //选取第三个点的时候删除之前的选区
                pointMap.delete(playerName);
                system.sendText(player,`删除之前的选区`);
            }
            }
            else{
                //第一次设点
                let dim = getDimensionOfEntity(player);
                let sp:SelectPoint = {
                    sdim:"",
                    sx:0,
                    sy:0,
                    sz:0,
                    ex:0,
                    ey:0,
                    ez:0
                };
                sp.sdim = dim;
                sp.sx = blockPos.x;
                sp.sy = blockPos.y;
                sp.sz = blockPos.z;
                pointMap.set(playerName,sp);
                system.sendText(player,`你已选取领地第一点（${sp.sx},${sp.sy},${sp.sz}）`);
            }
        }
    });
    //创建领地 （op）
    system.registerCommand("createland",{
        description: "创建领地",
        permission: 1,
        overloads:[
            {
                parameters: [],
                handler(){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    const entity = this.entity;
                    let dim = getDimensionOfEntity(entity);
                    if(pointMap.has(this.name)){
                    return "已创建领地";
                    }
                    else{
                        return "无法创建领地";
                    }
                }
            } as CommandOverload<[]>
        ]
    });
}