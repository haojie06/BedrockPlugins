//领地保护模块
import { system } from "./system";
import { Vec,getVecOfEntity,getDimensionOfEntity,getName,checkAdmin } from "./utils";
import {db,SELECT_ZONE_BY_POSANDLAND,SELECT_LAND_BY_POS,SELECT_RESIDENT_BY_LAND_AND_NAME} from "./database";
//允许玩家打开的开关（按钮/拉杆/）方块
let switchList = ["minecraft:stone_button","minecraft:wooden_button","minecraft:lever","minecraft:acacia_button","minecraft:birch_button","minecraft:dark_oak_button","minecraft:jungle_button","minecraft:spruce_button"];
let doorList = ["minecraft:wooden_door","minecraft:acacia_door","minecraft:birch_door","minecraft:dark_oak_door","minecraft:jungle_door","minecraft:spruce_door", "minecraft:wooden_trapdoor","minecraft:acacia_trapdoor","minecraft:birch_trapdoor","minecraft:dark_oak_trapdoor","minecraft:jungle_trapdoor","minecraft:spruce_trapdoor"];
//添加flag后玩家可以打开的容器
let containerList = [];
//添加了flag后可以使用的工具类方块
let functionBlockList = ["minecraft:grindstone","minecraft:cartography_table","minecraft:stonecutter_block","minecraft:crafting_table","minecraft:enchanting_table","minecraft:ender_chest","minecraft:anvil"];
//添加了flag也无法攻击的实体（盔甲架一类）
let mobCannotAttack = ["minecraft:armor_stand","minecraft:boat","minecraft:chest_minecart","minecraft:command_block_minecart","minecraft:hopper_minecart","minecraft:minecart","minecraft:tnt_minecart","minecraft:item_frame","minecraft:painting"];
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
        //查看玩家是否在子领地内
        datas = Array.from(db.query(SELECT_ZONE_BY_POSANDLAND,{$px,$py,$pz,$landname:data.name}));
        if(datas.length != 0 ){
            let dat = datas[0];
            system.sendText(player,`§3你已来到${dat.owner}的子领地${dat.zonename} (${dat.sposition})~(${dat.eposition})`,5);
        }
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
                    system.sendText(player,`§e欢迎来到领地:${data.name} 领地主人:${data.owner}`,5);
                }
                else{
                    comp.data.showTime = 6;
                    system.sendText(player,`§e你已回到你的领地:${data.name}`,5);                
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
                    system.sendText(player,`§e欢迎来到领地:${data.name} 领地主人:${data.owner}`,5);
                }
                else{
                    system.sendText(player,`§e你已回到你的领地:${data.name}`,5);                
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
        try {
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
            //再检查该玩家是否是这个领地的居民
            let $landname = datas[0].name;
            let $playername = getName(player); 
            let residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME,{$landname,$playername});
            if(residents.length == 0){
                //未找到该玩家有此领地的破坏权限
            system.sendText(player,`你没有权限破坏(${bPosition.x},${bPosition.y},${bPosition.z})处的方块\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
            return false;
            }
            else{
                //子领地检查
                datas = Array.from(db.query(SELECT_ZONE_BY_POSANDLAND,{$px,$py,$pz,$landname}));
                if(datas.length == 0){
                    //此处没有子领地
                    return true;
                }
                else{
                    //判断是否有子领地的权限
                    let dat = datas[0];
                    let trust = String(dat.trust);
                    if(trust.indexOf($playername) != -1)
                    {
                        return true;
                    }
                    else{
                        system.sendText(player,`你没有权限破坏(${bPosition.x},${bPosition.y},${bPosition.z})处的方块\n所属子领地${dat.zonename} 主人:${dat.owner}`);
                        return false;
                    }
                }
            }
            }
            else{
                return true;
            }
        }
        } catch (error) {
            server.log("方块破坏拦截出错");
        }
});
}

export function interactCheck(){
    system.handlePolicy(MinecraftPolicy.PlayerUseItemOn,(data,def)=>{
        try {
            let player = data.player;
            let playerPos = data.pos;
            let block = data.block;
            let item = data.item;
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
                //查看交互的方块是否是开关
                let flags = String(datas[0].flags); 
                if((switchList.indexOf(block.__identifier__) != -1) && (flags.indexOf("useswitch") != -1)){
                    //交互的是开关，判断是否空手
                    if(item.__identifier__ == "minecraft:undefined"){
                    return true;
                    }
                    else{
                        system.sendText(player,`领地已打开开关交互权限,但是请空手使用`);
                        return false; 
                    }
                }
                else if ((doorList.indexOf(block.__identifier__) != -1) && (flags.indexOf("opendoor") != -1)){
                    if(item.__identifier__ == "minecraft:undefined"){
                        return true;
                        }
                    else{
                        system.sendText(player,`领地已打开开门权限,但是请空手使用`);
                        return false; 
                    }
                }
                else if ((functionBlockList.indexOf(block.__identifier__) != -1) && (flags.indexOf("functionblock") != -1)){
                    if(item.__identifier__ == "minecraft:undefined"){
                        return true;
                        }
                    else{
                        system.sendText(player,`领地已打开功能方块使用权限,但是请空手使用`);
                        return false; 
                    }
                }
                else{
                    system.sendText(player,`你没有权限与(${bPosition.x},${bPosition.y},${bPosition.z})处的方块交互\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
                    return false;
                }
                }
                else{
                    //判断方块是否在子领地中
                    datas = Array.from(db.query(SELECT_ZONE_BY_POSANDLAND,{$px,$py,$pz,$landname}));
                    if(datas.length == 0){
                    return true;
                    }
                    else{
                        //判断玩家是否有子领地权限
                        let dat = datas[0];
                        let trust = String(dat.trust);
                        if(trust.indexOf($playername) != -1){
                            return true;
                        }
                        else{
                            //是否要应用flag？ 暂时不受领地flag影响
                            system.sendText(player,`你没有权限与(${bPosition.x},${bPosition.y},${bPosition.z})处的方块交互\n所属子领地${dat.zonename} 主人:${dat.owner}`);
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        } catch (error) {
            server.log("方块交互拦截出错");
        }
});
}


export function attackCheck(){
    system.handlePolicy(MinecraftPolicy.PlayerAttackEntity,(data,def)=>{
        try {
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
            let flags = String(datas[0].flags);
            if(datas.length != 0){
                let $landname = datas[0].name;
                let residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME,{$landname,$playername});
    
                if(residents.length == 0){
                //未找到该玩家有此领地的破坏权限
                if (flags.indexOf("attackmob")!=-1) {
                    if(mobCannotAttack.indexOf(target.__identifier__) == -1){
                        return true;
                    }
                    else{
                        system.sendText(player,`领地已打开攻击实体权限,但是此实体不可攻击`);
                        return false;
                    }
                }
                system.sendText(player,`你没有权限攻击(${$px},${$py},${$pz})处的实体\n所属领地${datas[0].name} 主人:${datas[0].owner}`);
                return false;
                }
                else{ 
                    //检查实体是否位于子领地中
                    datas = Array.from(db.query(SELECT_ZONE_BY_POSANDLAND,{$px,$py,$pz,$landname}));
                    if(datas.length == 0){
                    return true;
                    }
                    else{
                        let dat = datas[0];
                        let trust = String(dat.trust);
                        if(trust.indexOf($playername) != -1)
                        {
                            return true;
                        }
                        else{
                            system.sendText(player,`你没有权限攻击(${$px},${$py},${$pz})处的实体\n所属子领地${dat.zonename} 主人:${dat.owner}`);
                        }
                    }
                }
            }
            return true;
        }
        } catch (error) {
            //server.log("攻击实体拦截出错");
        }

});
}