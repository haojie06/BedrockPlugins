//领地保护模块
import { system } from "./system";
import { Vec,getVecOfEntity,getDimensionOfEntity,getName,checkAdmin } from "./utils";
import {db,SELECT_LAND_BY_POS,SELECT_RESIDENT_BY_LAND_AND_NAME} from "./database";

export interface IfInLnadComponent{
        //现在是否在领地内
        now:boolean,
        //进入时的显示时间
        showTime:number,
        //当前在谁的领地内
        whosLand:string,
        //领地的名字
        landName:string,
        //上一次检测时是否在领地内
        justNow:boolean
}
//移动提醒/限制
export function moveCheck(player:IEntity) {
    //let pVec:Vec = getVecOfEntity(player);
    let pComp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
    let $px = Math.floor(pComp.data.x);
    let $py = Math.floor(pComp.data.y);
    let $pz = Math.floor(pComp.data.z);
    let $sdim = getDimensionOfEntity(player);


    let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
    
    if (datas.length != 0) {
        //server.log(`检测到玩家在领地内`);
        if(system.hasComponent(player,"myland:ifInLand")){
        let data = datas[0];
        let comp = system.getComponent<IfInLnadComponent>(player,"myland:ifInLand");
        let justNow = comp.data.justNow;
        let now = comp.data.now;

        let playerName = getName(player);

        //所处领地发生变化的时候 清空原有的组件
        if(comp.data.landName != data.name && comp.data.landName != ""){
            system.sendText(player,`§a再见！你已离开${comp.data.whosLand}的领地:${comp.data.landName}`,5);
            comp.data.justNow = false;
            comp.data.now = false;
            comp.data.landName = "";
            comp.data.whosLand = "";
            comp.data.showTime = 0;
            system.applyComponentChanges(player,comp);
            //system.sendText(player,`玩家所在领地发生变化`);
        }
        else{
            if(justNow == false && now == false){
                //system.sendText(player,`初次进入领地`);
                //刚刚进入领地
                comp.data.now = true;
                comp.data.whosLand = String(data.owner);
                comp.data.landName = String(data.name);
                if(playerName != data.owner){
                //持续三轮检测
                    comp.data.showTime = 15;
                    system.sendText(player,`§e欢迎来到领地:${data.name} 领地主人:${data.owner} 领地范围:(${data.sposition})至(${data.eposition})`,5);
                }
                else{
                    comp.data.showTime = 6;
                    system.sendText(player,`§e你已回到你的领地:${data.name} (${data.sposition})至(${data.eposition})`,5);                
                }
                system.applyComponentChanges(player, comp);
            }
            else if(justNow == false && now == true){
                //已经在领地内了
                //system.sendText(player,`刚刚进入领地`);
                comp.data.showTime -= 1; 
                if(comp.data.showTime <= 0){
                    
                    comp.data.justNow = true;
                    comp.data.showTime = 0;
                }
                system.applyComponentChanges(player, comp);
                if(playerName != data.owner){
                    system.sendText(player,`§e欢迎来到领地:${data.name} 领地主人:${data.owner} 领地范围:(${data.sposition})至(${data.eposition})`,5);
                }
                else{
                    system.sendText(player,`§e你已回到你的领地:${data.name} (${data.sposition})至(${data.eposition})`,5);                
                }
            }
            else if(justNow == true && now == true){
                //不再显示
            }
        }
        }
    else{
        //system.sendText(player,`你缺少了组件`);
    }
}
    else{
        //server.log(`玩家不在领地内`);
        //判断玩家是否是刚刚离开领地
        let comp = system.getComponent<IfInLnadComponent>(player,"myland:ifInLand");
        let justNow = comp.data.justNow;
        let now = comp.data.now;
        let whosLand = comp.data.whosLand;
        let landName = comp.data.landName;
        if(landName != ""){
            //刚刚离开领地
            comp.data.justNow = false;
            comp.data.now = false;
            system.sendText(player,`§a再见！你已离开${comp.data.whosLand}的领地:${comp.data.landName}`,5);
            comp.data.whosLand = "";
            comp.data.landName = "";
            comp.data.showTime = 0;
            system.applyComponentChanges(player,comp);
        }
    }
}
//方块破坏拦截
export function breakCheck(){
    system.handlePolicy(MinecraftPolicy.PlayerDestroyBlock,(data,def)=>{
        let block = data.block;
        let bPosition = block.block_position;
        let $px = bPosition.x;
        let $py = bPosition.y;
        let $pz = bPosition.z;
        //先判断方块是否在领地内
        let player = data.player;
        if(checkAdmin(player) == false){
        let $sdim = getDimensionOfEntity(player);
        let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
        if(datas.length != 0){
        //再检查该玩家是否有这个领地的权限
        let $landname = datas[0].name;
        let $playername = getName(player); 
        let residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME,{$landname,$playername});
        if(residents.length == 0){
            //未找到该玩家有此领地的破坏权限
        system.sendText(player,`你没有权限破坏(${bPosition.x},${bPosition.y},${bPosition.z})处的方块\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
        return false;
        }
        else{ 
            return true;
        }
        }
        else{
            return true;
        }
    }});
}

export function interactCheck(){
    system.handlePolicy(MinecraftPolicy.PlayerUseItemOn,(data,def)=>{
        let player = data.player;
        let playerPos = data.pos;
        let block = data.block;
        if(checkAdmin(player) == false){
        let bPosition = block.block_position;
        let $px = bPosition.x;
        let $py = bPosition.y;
        let $pz = bPosition.z;
        //先判断方块是否在领地内
        let $sdim = getDimensionOfEntity(player);
        let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
        if(datas.length != 0){
            let $landname = datas[0].name;
            let $playername = getName(player); 
            let residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME,{$landname,$playername});

            if(residents.length == 0){
                //未找到该玩家有此领地的破坏权限
            system.sendText(player,`你没有权限与(${bPosition.x},${bPosition.y},${bPosition.z})处的方块交互\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
            return false;
            }
            else{ 
                return true;
            }
        }
        return true;
    }});
}


export function attackCheck(){
    system.handlePolicy(MinecraftPolicy.PlayerAttackEntity,(data,def)=>{
        let player = data.player;
        let target = data.target;
        let pComp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
        let $px = Math.floor(pComp.data.x);
        let $py = Math.floor(pComp.data.y);
        let $pz = Math.floor(pComp.data.z);
        let $playername = getName(player);
        if(checkAdmin(player) == false){
        //先判断方块是否在领地内
        let $sdim = getDimensionOfEntity(player);
        let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
        if(datas.length != 0){
            let $landname = datas[0].name;
            
            let residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME,{$landname,$playername});

            if(residents.length == 0){
                //未找到该玩家有此领地的破坏权限
            system.sendText(player,`你没有权限攻击(${$px},${$py},${$pz})处的实体\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
            return false;
            }
            else{ 
                return true;
            }
        }
        return true;
    }
});
}