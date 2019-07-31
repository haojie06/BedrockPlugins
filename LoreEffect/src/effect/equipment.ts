import { system } from "../system";
import {possibility,randomNum} from "../utils";
let playerQuery;
let tick = 0;

export function equReg(){
    system.registerComponent("loreeffect:isplayer", {});
    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"loreeffect:isplayer");
    system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated,data=>{
        let entity = data.data.entity;
        if (entity.__identifier__ == "minecraft:player") {
        system.createComponent(entity,"loreeffect:isplayer");
    }});
};


system.update = function(){
    //获取玩家的装备栏 20tick一次?
    tick++;
    if(tick == 20){
        tick = 0;
        let players = system.getEntitiesFromQuery(playerQuery);
        //server.log(`目前有玩家${players.length}`)
        for (let player of players){
            if(system.hasComponent(player,"minecraft:armor_container")){
            let playerArmor = system.getComponent(player, "minecraft:armor_container");
            // Get the players helmet
            
            let lores:string[] = [];
            let playerHelmet = playerArmor.data[0];
            let playerChestplate = playerArmor.data[1];
            let playerLeggings = playerArmor.data[2];
            let playerBoots = playerArmor.data[3];
            //let lore = getArmorLore(playerHelmet);
            //let loreComp = system.getComponent(playerHelmet, MinecraftComponent.Lore);
            lores.push(getArmorLore(playerHelmet));
            lores.push(getArmorLore(playerChestplate));
            lores.push(getArmorLore(playerLeggings));
            lores.push(getArmorLore(playerBoots));
            let allLores = String(lores);
            //system.sendText(player,`your armor lores:\n${allLores}`);
            let px,py,pz;
            if(allLores.indexOf("低语")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                system.executeCommand(`particle enchant-normal ${px} ${py+0.6} ${pz}`,data=>{});
                system.executeCommand(`particle enchant-normal ${px+1} ${py+0.8} ${pz+1}`,data=>{});
                //system.executeCommand(`particle enchant-normal ${px+0.5} ${py+1} ${pz-0.5}`,data=>{});
                //system.executeCommand(`particle enchant-normal ${px-0.5} ${py+1} ${pz+0.5}`,data=>{});
                system.executeCommand(`particle enchant-normal ${px-1} ${py+0.8} ${pz-1}`,data=>{});
                //system.executeCommand(`particle enchant-normal ${px} ${py+0.5} ${pz}`,data=>{});
            }
            if(allLores.indexOf("末影之心")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                let dif1 = 1,dif2 = 1;
                system.executeCommand(`particle ender ${px} ${py+1} ${pz}`,data=>{});
                system.executeCommand(`particle ender ${px+dif1} ${py+1} ${pz+dif1}`,data=>{});
                system.executeCommand(`particle ender ${px-dif1} ${py+1} ${pz-dif1}`,data=>{});
                system.executeCommand(`particle ender ${px+dif1} ${py+1} ${pz-dif1}`,data=>{});
                system.executeCommand(`particle ender ${px-dif1} ${py+1} ${pz-dif1}`,data=>{});

                system.executeCommand(`particle ender ${px} ${py+1} ${pz}`,data=>{});
                system.executeCommand(`particle ender ${px+dif2} ${py+0.6} ${pz+dif2}`,data=>{});
                system.executeCommand(`particle ender ${px-dif2} ${py+0.6} ${pz-dif2}`,data=>{});
                system.executeCommand(`particle ender ${px+dif2} ${py+0.6} ${pz-dif2}`,data=>{});
                system.executeCommand(`particle ender ${px-dif2} ${py+0.6} ${pz-dif2}`,data=>{});
            }
            if(allLores.indexOf("萤火虫")!=-1){
                if(possibility(0.2)){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                system.executeCommand(`particle totem-normal ${px} ${py+1} ${pz}`,data=>{});
            }
            }
            
            if(allLores.indexOf("村民之友")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                let rd = randomNum(-1,1);
                system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                system.executeCommand(`particle villager-happy ${px} ${py+0.2} ${pz}`,data=>{});
                system.executeCommand(`particle villager-happy ${px} ${py+0.3} ${pz}`,data=>{});
                system.executeCommand(`particle villager-happy ${px} ${py+2} ${pz}`,data=>{});
                system.executeCommand(`particle  hearth ${px - rd} ${py+2.2} ${pz + rd}`,data=>{});
                system.executeCommand(`particle  hearth ${px + rd} ${py+2.2} ${pz - rd}`,data=>{});
                system.executeCommand(`particle  hearth ${px - rd} ${py+1.2} ${pz - rd}`,data=>{});
                system.executeCommand(`particle  hearth ${px + rd} ${py+1.2} ${pz + rd}`,data=>{});

            }
            if(allLores.indexOf("村民之敌")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                system.executeCommand(`particle villager-angry ${px} ${py+2.5} ${pz}`,data=>{});
                system.executeCommand(`particle lava_particle ${px} ${py+2} ${pz}`,data=>{});
                system.executeCommand(`particle lava_particle ${px} ${py+2.5} ${pz}`,data=>{});
            }
            if(allLores.indexOf("着火")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
                //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                system.executeCommand(`particle smoke ${px} ${py} ${pz}`,data=>{});
                system.executeCommand(`particle lava_particle ${px} ${py-0.1} ${pz}`,data=>{});
                system.executeCommand(`particle lava_particle ${px} ${py} ${pz}`,data=>{});
            }
            
        }
        else{
            //server.log(`玩家没有装备栏？`);
        }
    }

    }
};




function getArmorLore(armor){
    if(system.hasComponent(armor, MinecraftComponent.Lore)){
    let loreComp = system.getComponent(armor, MinecraftComponent.Lore);
    //server.log(`装备有lore组件armorlore${loreComp.data}`);
    let lore = String(loreComp.data);
    return lore;
    }
    else{
        //server.log("装备没有lore组件")
        return "";
    }
}