import {getName,checkAdmin} from "../utils";
import {system,playerKicked,kickTickReset,IUseCraftTableComponent} from "../system";
let playerQuery;
let cannotPushContainerList = ["minecraft:smoker","minecraft:barrel","minecraft:blast_furnace","minecraft:grindstone","minecraft:crafting_table","minecraft:dropper","minecraft:hopper","minecraft:trapped_chest","minecraft:lit_furnace","minecraft:furnace","minecraft:chest","minecraft:dispenser"];
let unusualBlockList = ["minecraft:invisiblebedrock","minecraft:bedrock","minecraft:mob_spawner","minecraft:end_portal_frame","minecraft:barrier","minecraft:command_block"];
let enchMap = new Map<string,string>();
let levelMap = new Map<string,number>();

enchMap.set("0","protection");
enchMap.set("1","fire_aspect");
enchMap.set("2","feather_falling");
enchMap.set("3","blast_protection");
enchMap.set("4","projectile_protection");
enchMap.set("5","thorns");

enchMap.set("6","respiration");
enchMap.set("7","depth_strider");
enchMap.set("8","aqua_affinity");
enchMap.set("9","sharpness");
enchMap.set("10","smite");
enchMap.set("11","bane_of_arthropods");

enchMap.set("12","knockback");
enchMap.set("13","fire_aspect");
enchMap.set("14","looting");
enchMap.set("15","efficiency");
enchMap.set("16","silk_touch");
enchMap.set("17","unbreaking");

enchMap.set("18","fortune");
enchMap.set("19","power");
enchMap.set("20","punch");
enchMap.set("21","flame");
enchMap.set("22","infinity");
enchMap.set("23","luck_of_the_sea");

enchMap.set("24","lure");
enchMap.set("25","frost_walker");
enchMap.set("26","mending");
enchMap.set("27","");
enchMap.set("28","");
enchMap.set("29","impaling");

enchMap.set("30","riptide");
enchMap.set("31","loyalty");
enchMap.set("32","channeling");



export function ItemModuleReg() {
    server.log("防物品作弊模块已加载");

    /*
    system.listenForEvent("minecraft:entity_acquired_item",data=>{
        let entity = data.data.entity;
        if (entity.__identifier__ == "minecraft:player") {
            let method = data.data.acquisition_method;
            let amount = data.data.acquired_amount;
            let itemStack = data.data.item_stack;
            let item = itemStack.item;
            let count = itemStack.count;
            let playerName = getName(entity);
            //server.log(`玩家${playerName} ${method} ${count}个${item}`);
            system.sendText(entity,`玩家${playerName} ${method} ${count}个${item}`);
        }
    });
*/

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
            //system.destroyEntity(player);
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
});

//使用工作台的时候无法捡起物品

system.handlePolicy(MinecraftPolicy.EntityPickItemUp,(data,def)=>{
    let player = data.entity;
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

});

    

    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"misbehavior:isplayer");
    system.listenForEvent("minecraft:piston_moved_block",data=>{
        let pPosition = data.data.piston_position;
        let bPosition = data.data.block_position;
        //let entities = system.getEntitiesFromQuery(entityQuery,pPosition.x-10,pPosition.y-10,pPosition.z-10,pPosition.x+10,pPosition.y+10,pPosition.z+10);
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
            if(px >= (pPosition.x-10) && px <= (pPosition.x+10) && py >= (pPosition.y-10) && py <= (pPosition.y+10) && pz >= (pPosition.z-10) && pz <= (pPosition.z+10)){
                //此人为嫌疑人
                let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
                let tickingArea = tickAreaCmp.data.ticking_area;
                let pushBlock = system.getBlock(tickingArea,bPosition.x,bPosition.y,bPosition.z).__identifier__;
                if(cannotPushContainerList.indexOf(pushBlock) != -1){
                    system.executeCommand(`fill ${bPosition.x} ${bPosition.y} ${bPosition.z} ${bPosition.x} ${bPosition.y} ${bPosition.z} air 0 replace`,data=>{});
                    system.sendText(player,`你想做什么？`);
                }
                else{

                }
            }
        }
    });
}