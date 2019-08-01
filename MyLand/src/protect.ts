//领地保护模块
import { system } from "./system";
import { Vec,getVecOfEntity,getDimensionOfEntity,getName,checkAdmin } from "./utils";
import {db,SELECT_LAND_BY_POS,SELECT_RESIDENT_BY_LAND_AND_NAME} from "./database";
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
        let data = datas[0];
        system.sendText(player,`§e你已来到${data.owner}的领地:${data.name} (${data.sposition})至(${data.eposition})`,5);
    }
    else{
        //server.log(`玩家不在领地内`);
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