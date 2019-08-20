import {getName,checkAdmin,getTime,getDimensionOfEntity} from "../utils";
import {system,playerKicked,kickTickReset,IUseCraftTableComponent} from "../system";
import {db,misbDB,alertDB,DELETE_ALERT_AUTOCHECK_LOG,QUERY_ALL_ALERTS,INSERT_ALERTS,DELETE_MISB_AUTOCHECK_LOG,DELETE_MISB_LOG,INSERT_MISB,QUERY_ALL_MISB,QUERY_MISB_BYNAME} from "../database";
import {enchMap,levelMap} from "./data";

let playerQuery;
let cannotPushContainerList = ["minecraft:smoker","minecraft:barrel","minecraft:blast_furnace","minecraft:grindstone","minecraft:crafting_table","minecraft:dropper","minecraft:hopper","minecraft:trapped_chest","minecraft:lit_furnace","minecraft:furnace","minecraft:chest","minecraft:dispenser"];
let unusualBlockList = ["minecraft:spawn_egg","minecraft:invisibleBedrock","minecraft:invisiblebedrock","minecraft:bedrock","minecraft:mob_spawner","minecraft:end_portal_frame","minecraft:barrier","minecraft:command_block"];
//熊孩子喜欢刷的物品列表 (正常游戏很难获得一组的物品)
let alertItemList = ["minecraft:nether_star","minecraft:sticky_piston","minecraft:piston","minecraft:fire","minecraft:diamond_block","minecraft:enchanting_table","minecraft:brewing_stand","minecraft:dragon_egg","minecraft:emerald_block","minecraft:ender_chest","minecraft:beacon","minecraft:slime","minecraft:experience_bottle","minecraft:skull","minecraft:end_crystal"];
//危险度超过这个数会封禁玩家
let kickLine = 3,banLine=15;
//正常等级临界值  超出这个等级会被踢出
let normalLv = 150;
let tick = 0;


export function ItemModuleReg() {
    server.log("防物品作弊模块已加载");
    let date = new Date();
    
    system.listenForEvent("minecraft:entity_death",data=>{
        let entity = data.data.entity;
        try {
            if(entity){
                if (entity.__identifier__ == "minecraft:player") {
                    //背包检查
                    invCheck(entity);
                }
            }
        } catch (error) {
            
        }
    });

//阻止普通玩家放置不应该放置的东西（基岩/刷怪箱...）
system.listenForEvent("minecraft:player_placed_block",data=>{
    let player = data.data.player;
    if(!checkAdmin(player)){
        let bPosition = data.data.block_position;
        let playerName = getName(player);
        //不是op才需要进行判断
        let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
        let tickingArea = tickAreaCmp.data.ticking_area;
        let placeBlock = system.getBlock(tickingArea,bPosition.x,bPosition.y,bPosition.z).__identifier__;
        if(unusualBlockList.indexOf(placeBlock) != -1){
            //放置了不该有的方块
            system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ fill ${bPosition.x} ${bPosition.y} ${bPosition.z} ${bPosition.x} ${bPosition.y} ${bPosition.z} air 0 replace`,data=>{});
            
            system.sendText(player,`你哪来的方块？`);
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c大家小心,${playerName}放置了${placeBlock}"}]}`,data=>{});
            playerKicked.push(player);
            kickTickReset();
            
            server.log(`${playerName}异常放置${placeBlock}`);
            db.update(INSERT_MISB,{
                $time:getTime(),
                $name:playerName,
                $position:`${bPosition.x} ${bPosition.y} ${bPosition.z}`,
                $behavior:`放置异常物品`,
                $description:placeBlock,
                $extra:"",
                $dim:getDimensionOfEntity(player),
                $timestamp:date.getTime()
            });
            //依赖EasyList
            let datas = db.query(QUERY_MISB_BYNAME,{$name:playerName});
            if (datas.length > 3){
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                system.executeCommand(`fban ${playerName} misbehaviour-place`,data=>{});
            }
        }
    }
});



system.listenForEvent("minecraft:entity_carried_item_changed",data=>{
    try{
    let entity = data.data.entity;
    if(entity){
    let item = data.data.carried_item;
    if(entity.__identifier__ == "minecraft:player"){
        if(!checkAdmin(entity)){
            if(unusualBlockList.indexOf(item.__identifier__) != -1){
                let playerName = getName(entity);
                system.sendText(entity,`你持有违禁品`);
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}不知道从哪里拿出了违禁品:${item.__identifier__}"}]}`,data=>{});
                system.executeCommand(`clear @a[name="${playerName}"] ${item.__identifier__.split(":")[1]} 0 1000`,data=>{});
                playerKicked.push(entity);
                kickTickReset();
                server.log(`${playerName}持有违禁品${item.__identifier__}`);
                db.update(INSERT_MISB,{
                    $time:getTime(),
                    $name:playerName,
                    $position:"",
                    $behavior:`持有违禁品`,
                    $description:`${item.__identifier__}`,
                    $extra:"",
                    $dim:getDimensionOfEntity(entity),
                    $timestamp:date.getTime()
                });
                //依赖EasyList
                let datas = db.query(QUERY_MISB_BYNAME,{$name:playerName});
                if (datas.length > 3){
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                    system.executeCommand(`fban ${playerName} misbehaviour-have`,data=>{});
                }
            }
        }
    }
}
}catch (err){
    server.log("出现错误");
}
});



//防刷

system.listenForEvent("minecraft:block_interacted_with",data=>{
    let player = data.data.player;
    try {
        let bPosition = data.data.block_position;
        let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
        let tickingArea = tickAreaCmp.data.ticking_area;
        let interactBlock = system.getBlock(tickingArea,bPosition.x,bPosition.y,bPosition.z).__identifier__;
        if(interactBlock == "minecraft:crafting_table"){
            let comp = system.getComponent<IUseCraftTableComponent>(player,"misbehavior:useCraftTable");
            comp.data.ifUse = true;
            system.applyComponentChanges(player,comp);
            system.sendText(player,"打开工作台后进入无法拾取的状态，请右键（手机点击）其他方块解除状态");
        }
        else{
            let comp = system.getComponent<IUseCraftTableComponent>(player,"misbehavior:useCraftTable");
            if(comp.data.ifUse == true){
            system.sendText(player,`解除无法拾取物品的状态`);
            comp.data.ifUse = false;
            comp.data.ifShow = false;
            system.applyComponentChanges(player,comp);
            }
        }
    } catch (error) {
        
    }

});


//使用工作台的时候无法捡起物品

system.handlePolicy(MinecraftPolicy.EntityPickItemUp,(data,def)=>{
    let player = data.entity;
    try {
        if(player.__identifier__ == "minecraft:player"){
            let comp = system.getComponent<IUseCraftTableComponent>(player,"misbehavior:useCraftTable");
                if(comp.data.ifUse == true){
                    if(comp.data.ifShow == false){
                        system.sendText(player,`请右键任意方块解除无法拾取的状态`);
                        comp.data.ifShow = true;
                        system.applyComponentChanges(player,comp);
                    }
                    return false;
                }
                else{
                    return true;
                }
        }
            else{
                return true;
            }
    } catch (error) {
        return true;
    }
});

system.handlePolicy(MinecraftPolicy.EntityPickItemUp,(data,def)=>{
    let player = data.entity;
    try{
        if(player.__identifier__ == "minecraft:player"){
            let extradata = system.getComponent(player,MinecraftComponent.ExtraData).data;
            //server.log(extradata.toString());
            //system.sendText(player,);
            //UI容器中必须九个都为空才能拾取
            let uiEmptyContainerCount = 0;
            for(let i = 0;i < 9;i++){
                let cName = extradata.value.UntrackedInteractionUIContainer.value[i].value.Name.value;
                if(cName == ""){
                    uiEmptyContainerCount ++;
                }
            }
            if(uiEmptyContainerCount == 9){
                return true;
            }
            else{
                return false;
            }
        }
    }catch(error){
        return true;
    }
});

    

    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"misbehavior:isplayer");
    system.listenForEvent("minecraft:piston_moved_block",data=>{
        try {
            let pPosition = data.data.piston_position;
            let bPosition = data.data.block_position;
            let players = system.getEntitiesFromQuery(playerQuery);
            let suspect;
            //首先利用
            for (let player of players){
                let px,py,pz;
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                //server.log(`共找到${players.length}个在线玩家`);
                if(px >= (pPosition.x-10) && px <= (pPosition.x+10) && py >= (pPosition.y-10) && py <= (pPosition.y+10) && pz >= (pPosition.z-10) && pz <= (pPosition.z+10) && !checkAdmin(player)){
                    //此人为嫌疑人
                    let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
                    let tickingArea = tickAreaCmp.data.ticking_area;
                    let playerName = getName(player);
                    let pushBlock = system.getBlock(tickingArea,bPosition.x,bPosition.y,bPosition.z).__identifier__;
                    if(cannotPushContainerList.indexOf(pushBlock) != -1){
                        system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ fill ${bPosition.x} ${bPosition.y} ${bPosition.z} ${bPosition.x} ${bPosition.y} ${bPosition.z} air 0 replace`,data=>{});
                        system.sendText(player,`你想做什么？`);
                        server.log(`玩家${playerName}有刷物品嫌疑`);
                        db.update(INSERT_MISB,{
                            $time:getTime(),
                            $name:playerName,
                            $position:`${bPosition.x} ${bPosition.y} ${bPosition.z}`,
                            $behavior:`刷物品嫌疑`,
                            $description:`推动容器${pushBlock}`,
                            $extra:"",
                            $dim:getDimensionOfEntity(player),
                            $timestamp:date.getTime()
                        });
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}有刷物品的嫌疑"}]}`,data=>{});

                        let datas = db.query(QUERY_MISB_BYNAME,{$name:playerName});
                        if (datas.length > 3){
                            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                            system.executeCommand(`fban ${playerName} misbehaviour-push`,data=>{});
                        }
                    }
                    else{
    
                    }
                }
            }
        } catch (error) {
            
        }

    });


    //查询命令
    system.registerCommand("misblog",{
        description:"查看不当行为记录",
        permission:1,
        overloads:[{
          parameters:[],
          handler([]){
            let datas = Array.from(db.query(QUERY_ALL_MISB,{}));
            let show = "";
            for (let index in datas){
                let data = datas[index];
                show += `§a<${index}>${data.time} ${data.name} ${data.behavior} ${data.description}\n`;
            }
            return show;
        }
        } as CommandOverload<[]>
      ]
      });

      system.registerCommand("alertlog",{
        description:"查看异常警告记录",
        permission:1,
        overloads:[{
          parameters:[],
          handler([]){
            let datas = Array.from(db.query(QUERY_ALL_ALERTS,{}));
            let show = "";
            for (let index in datas){
                let data = datas[index];
                show += `§a<${index}>${data.time} ${data.name} ${data.alert} ${data.description}\n`;
            }
            return show;
        }
        } as CommandOverload<[]>
      ]
      });



      system.registerCommand("autocheckclear",{
        description:"清空自动检测记录",
        permission:1,
        overloads:[{
          parameters:[],
          handler([]){
            let res = db.update(DELETE_MISB_AUTOCHECK_LOG,{});
            return `删除${res}条自动检测记录`;
        }
        } as CommandOverload<[]>
      ]
      });

      system.registerCommand("alertlogclear",{
        description:"清空自动检测记录（异常检测）",
        permission:1,
        overloads:[{
          parameters:[],
          handler([]){
            let res = db.update(DELETE_ALERT_AUTOCHECK_LOG,{});
            return `删除${res}条自动检测记录`;
        }
        } as CommandOverload<[]>
      ]
      });
      
      system.registerCommand("invcheck",{
        description:"检查背包",
        permission:0,
        overloads:[{
            parameters:[{
            name:"玩家",
            type:"player"
            }],
        handler([player]){
            let date = new Date();
            let stime = date.getTime();
            for(let p of player){
                let res = invCheck(p);
            }
            let etime = new Date().getTime();
            return `检查了${player.length}个玩家 耗时${etime - stime}ms`;
            }
    }as CommandOverload<["player"]>]
});

}
//背包自动检查 检查异常物品/异常附魔
export function invCheck(entity:IEntity){
    
    if(checkAdmin(entity)){
        return `该玩家有免检查权限`;
    }
    let extradata = system.getComponent(entity,MinecraftComponent.ExtraData).data;
    //严重性计数
    let count = 0;
    //附魔不可超过的等级
    let maxLevel = 5;
    let playerName = getName(entity);
    let level = extradata.value.PlayerLevel.value;
    //玩家等级异常
    //system.sendText(entity,`你的等级${level}`);
    if(level > normalLv){
        //出现异常等级的附魔 进行处理并记录到数据库中
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被检测到等级异常 lv:${level}"}]}`,data=>{});
        //记录异常
        misbDB(playerName,"异常等级",`${level}级`,"自动检测");
        system.destroyEntity(entity);
    }
    //装备栏检查
    for(let i = 0;i<4;i++){
        let armorName = extradata.value.Armor.value[i].value.Name.value
        if(armorName == undefined || armorName == ""){
            continue;
        }
        let enchantNum;
        try{
            enchantNum = extradata.value.Armor.value[i].value.tag.value.ench.value.length;
        }catch(err){
            enchantNum = 0;
        }
        if(enchantNum != 0){
            for(let j = 0;j < enchantNum;j++){
            let enchId = String(extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.id.value);
            let enchLv = extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.lvl.value;
            let enchName = enchMap.get(enchId);
            if(enchLv > maxLevel){
                //出现异常等级的附魔 进行处理并记录到数据库中
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${armorName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`,data=>{});
                //记录异常
                misbDB(playerName,"异常附魔",`物品:${armorName} 附魔${enchName}:${enchLv}级 [装备栏]`,"自动检测");
                count++;
            }
            }
        }
    }

    //物品栏检查
    for(let i = 0;i<36;i++){
        let invName = extradata.value.Inventory.value[i].value.Name.value;
        if(invName == undefined || invName == ""){
            continue;
        }

        let invCount = Number(extradata.value.Inventory.value[i].value.Count.value);

        //检查物品是否违禁品
        if(unusualBlockList.indexOf(invName) != -1){
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被检测到持有违禁品:${invName} 数量:${invCount}"}]}`,data=>{});
            //记录异常
            misbDB(playerName,"违禁品",`物品:${invName}数量:${invCount} [物品栏]`,"自动检测");
            count++;
        }
        //检测玩家是否持有异常数量的物品
        if(alertItemList.indexOf(invName) != -1 && invCount > 63){
            alertDB(playerName,"异常数量物品",`物品:${invName}数量:${invCount} [物品栏]`,"自动检测");
            server.log(`检测到${playerName}拥有异常数量物品 物品:${invName}数量:${invCount} [物品栏]`);
        }

        let enchantNum;
        try{
            enchantNum = extradata.value.Inventory.value[i].value.tag.value.ench.value.length;
        }catch(err){
            enchantNum = 0;
        }
        
        if(enchantNum != 0){
            for(let j = 0;j < enchantNum;j++){
            let enchId = String(extradata.value.Inventory.value[i].value.tag.value.ench.value[j].value.id.value);
            let enchLv = extradata.value.Inventory.value[i].value.tag.value.ench.value[j].value.lvl.value;
            let enchName = enchMap.get(enchId);
            if(enchLv > maxLevel){
                //出现异常等级的附魔 进行处理并记录到数据库中
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${invName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`,data=>{});
                //记录异常
                misbDB(playerName,"异常附魔",`物品:${invName} 附魔${enchName}:${enchLv}级 [物品栏]`,"自动检测");
                count++;
            }
            }
        }
    }

    //末影箱检查
    for(let i=0;i<27;i++){
        let invName = extradata.value.EnderChestInventory.value[i].value.Name.value;
        if(invName == undefined || invName == ""){
            continue;
        }
        let invCount = Number(extradata.value.EnderChestInventory.value[i].value.Count.value);

        if(unusualBlockList.indexOf(invName) != -1){
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的末影箱被检测出包含违禁品:${invName} 数量:${invCount}"}]}`,data=>{});
            //记录异常
            misbDB(playerName,"违禁品",`物品:${invName}数量:${invCount} [末影箱]`,"自动检测");
            count++;
        }

        if(alertItemList.indexOf(invName) != -1 && invCount > 63){
            alertDB(playerName,"异常数量物品",`物品:${invName}数量:${invCount} [末影箱]`,"自动检测");
            server.log(`检测到${playerName}拥有异常数量物品 物品:${invName}数量:${invCount} [末影箱]`);
        }

        let enchantNum;
        try{
            enchantNum = extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value.length;
        }catch(err){
            enchantNum = 0;
        }
        if(enchantNum != 0){
            for(let j = 0;j < enchantNum;j++){
            let enchId = String(extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value[j].value.id.value);
            let enchLv = extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value[j].value.lvl.value;
            let enchName = enchMap.get(enchId);
            if(enchLv > maxLevel){
                //出现异常等级的附魔 进行处理并记录到数据库中
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${invName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`,data=>{});
                //记录异常
                misbDB(playerName,"异常附魔",`物品:${invName} 附魔${enchName}:${enchLv}级 [末影箱]`,"自动检测");
                count++;
            }
            }
        }
    }
    //system.sendText(entity,`完成检查 危险度:${count}`);
    if(count > banLine){
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的危险度${count}超过上限${kickLine} 踢出"}]}`,data=>{});
        server.log(`${playerName}的危险度${count}超过上限${banLine} 封禁`);
        system.executeCommand(`fban ${playerName} misbehaviour-autocheck`,data=>{});
    }
    else if(count > kickLine){
    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的危险度${count}超过上限${kickLine} 踢出"}]}`,data=>{});
    server.log(`${playerName}的危险度${count}超过上限${kickLine} 踢出`);
    system.executeCommand(`clear @a[name="${playerName}"]`,data=>{});
    system.destroyEntity(entity);
    }
    return `检查完成 危险度${count}`;
}



