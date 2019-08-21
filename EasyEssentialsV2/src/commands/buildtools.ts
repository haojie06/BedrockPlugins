import {getName,getPositionofEntity,getDimensionOfEntity} from "../utils";
import { system } from "../system";
//简易创世神
let selectTool = "minecraft:wooden_axe";
interface SelectPoint {
    sdim:string;
    sx:number;
    sy:number;
    sz:number;
    ex:number;
    ey:number;
    ez:number;
    size:number;
}
let pointMap = new Map();

export function buildToolsReg() {
    //system = sys;
    //选点

    system.listenForEvent("minecraft:block_interacted_with",data=>{
        let player = data.data.player;
        if(player){
        const hand = system.getComponent<IHandContainerComponent>(player, MinecraftComponent.HandContainer);
        const item = hand.data[0];
        let itemName = item.__identifier__;
        if(itemName == selectTool){
            let playerName = getName(player);
            let blockPos = data.data.block_position;
            //选取两点后应在数据库中进行检查
            if(pointMap.has(playerName)){
            let sp = pointMap.get(playerName);
            //之前选过领地的点
            if(sp.ex == 0 && sp.ey == 0){
                //第二个点还未选取的时候
                let dim = getDimensionOfEntity(player);
                if(dim != sp.sdim){
                    system.sendText (player,"无法建立选区，跨维度选取是不行滴");
                    pointMap.delete(playerName);
                }

                sp.ex = blockPos.x;
                sp.ey = blockPos.y;
                sp.ez = blockPos.z;
                let divX = Math.abs(sp.ex-sp.sx) + 1;
                let divY = Math.abs(sp.ey - sp.sy) + 1;
                let divZ = Math.abs(sp.ez - sp.sz) + 1;
                let size = divX * divY * divZ;
                sp.size = divX * divY * divZ;
                system.sendText(player,`建筑工:你已经选取了(${sp.sx},${sp.sy},${sp.sz}) 至 (${sp.ex},${sp.ey},${sp.ez}) 体积为:${size}的区域\n输入§e/bfill§r填充方块`);
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
                    ez:0,
                    size:0
                };
                sp.sdim = dim;
                sp.sx = blockPos.x;
                //暂时y方向全部计入领地
                sp.sy = blockPos.y;
                sp.sz = blockPos.z;
                pointMap.set(playerName,sp);
                system.sendText(player,`建筑工: 你已选取第一点（${sp.sx},${sp.sy},${sp.sz})`);
            }
        }
    }});

    system.registerCommand("bfill",{
        description:"填充工具",
        permission:1,
        overloads:[{
            parameters:[
                {
                type: "block",
                name: "方块"
                },
                {
                type: "int",
                name: "数据值"
                },
                {
                    type: "string",
                    name: "模式",
                    optional: true
                }
            ],
            handler([block,data,mode]){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                let playerName = getName(this.entity);
                if(!pointMap.has(playerName)) throw "你还没有选点哦,使用木斧选点";
                let sp:SelectPoint = pointMap.get(playerName);
                if(sp.size == 0) throw "你只选了一个点";
                block = block.split(":")[1];
                if(mode == ""){
                    system.executeCommand(`execute @a[name="${playerName}"] ~~~ fill ${sp.sx} ${sp.sy} ${sp.sz} ${sp.ex} ${sp.ey} ${sp.ez} ${block} ${data}`,data=>{});
                }
                else{
                    system.executeCommand(`execute @a[name="${playerName}"] ~~~ fill ${sp.sx} ${sp.sy} ${sp.sz} ${sp.ex} ${sp.ey} ${sp.ez} ${block} ${data} ${mode}`,data=>{});
                }
                pointMap.delete(playerName);
                system.sendText(this.entity,`成功执行bfill`);
            }
        }as CommandOverload<["block","int","string"]>]
    });
}