import { system } from "../system";
import {possibility,randomNum,getDimensionOfEntity,spawnParticleInWorld} from "../utils";
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
            let dim = getDimensionOfEntity(player);
            let px,py,pz;
            if(allLores.indexOf("低语")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                spawnParticleInWorld("enchant-normal",[px,py+0.6,pz],dim);
                spawnParticleInWorld("enchant-normal",[px+1,py+0.8,pz+1],dim);
                spawnParticleInWorld("enchant-normal",[px+0.5,py+1,pz-0.5],dim);
                spawnParticleInWorld("enchant-normal",[px-0.5,py+1,pz+0.5],dim);
                spawnParticleInWorld("enchant-normal",[px-1,py+0.8,pz-1],dim);
                spawnParticleInWorld("enchant-normal",[px,py+0.5,pz],dim);

                let div = 0.5;
                spawnParticleInWorld("minecraft:enchanting_table_particle",[px+div,py+1,pz+div],dim);
                spawnParticleInWorld("minecraft:enchanting_table_particle",[px-div,py+1,pz-div],dim);
                spawnParticleInWorld("minecraft:enchanting_table_particle",[px+div,py+1,pz-div],dim);
                spawnParticleInWorld("minecraft:enchanting_table_particle",[px-div,py+1,pz-div],dim);


            }
            if(allLores.indexOf("末影之心")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                let dif1 = 1,dif2 = 1;
                spawnParticleInWorld("ender",[px,py+1,pz],dim);
                spawnParticleInWorld("ender",[px+dif1,py+1,pz+dif1],dim);
                spawnParticleInWorld("ender",[px-dif1,py+1,pz-dif1],dim);
                spawnParticleInWorld("ender",[px+dif1,py+1,pz-dif1],dim);
                spawnParticleInWorld("ender",[px-dif1,py+1,pz-dif1],dim);

                spawnParticleInWorld("ender",[px,py+1,pz],dim);
                spawnParticleInWorld("ender",[px+dif2,py+0.6,pz+dif2],dim);
                spawnParticleInWorld("ender",[px-dif2,py+0.6,pz-dif2],dim);
                spawnParticleInWorld("ender",[px+dif2,py+0.6,pz-dif2],dim);
                spawnParticleInWorld("ender",[px-dif2,py+0.6,pz-dif2],dim);
            }
            if(allLores.indexOf("萤火虫")!=-1){
                if(possibility(0.25)){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                spawnParticleInWorld("totem-normal",[px,py+1,pz],dim);
            }
            }
            
            if(allLores.indexOf("村民之友")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                let rd = randomNum(-1,1);
                spawnParticleInWorld("villager-happy",[px,py,pz],dim);
                spawnParticleInWorld("villager-happy",[px,py+0.2,pz],dim);
                spawnParticleInWorld("villager-happy",[px,py+0.3,pz],dim);
                spawnParticleInWorld("villager-happy",[px,py+2,pz],dim);

                spawnParticleInWorld("hearth",[px-rd,py+2.2,pz+rd],dim);
                spawnParticleInWorld("hearth",[px+rd,py+2.2,pz-rd],dim);
                spawnParticleInWorld("hearth",[px-rd,py+2.2,pz-rd],dim);

                spawnParticleInWorld("hearth",[px+rd,py+1.2,pz-rd],dim);
                spawnParticleInWorld("hearth",[px-rd,py+1.2,pz-rd],dim);
                spawnParticleInWorld("hearth",[px+rd,py+1.2,pz+rd],dim);
            }
            if(allLores.indexOf("村民之敌")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                spawnParticleInWorld("villager-angry",[px,py+2.5,pz],dim);
                spawnParticleInWorld("lava_particle",[px,py+2,pz],dim);
                spawnParticleInWorld("lava_particle",[px,py+2.5,pz],dim);

            }
            if(allLores.indexOf("着火")!=-1){
                let comp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
                //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                spawnParticleInWorld("smoke",[px,py,pz],dim);
                spawnParticleInWorld("lava_particle",[px,py-0.1,pz],dim);
                spawnParticleInWorld("lava_particle",[px,py,pz],dim);
            }

            if(allLores.indexOf("屠龙勇士") != -1){
                let pComp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                let px,py,pz;
                px = pComp.data.x;
                py = pComp.data.y;
                pz = pComp.data.z;
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py,pz],dim);
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py+1.1,pz],dim);
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py+1.2,pz],dim);
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py+1.3,pz],dim);
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py+1.4,pz],dim);
                spawnParticleInWorld("minecraft:conduit_attack_emitter",[px,py+1.5,pz],dim);

                let div = Math.random();
                spawnParticleInWorld("minecraft:basic_portal_particle",[px,py+1.5,pz],dim);
                spawnParticleInWorld("minecraft:basic_portal_particle",[px+div,py+1.5,pz+div],dim);
                spawnParticleInWorld("minecraft:basic_portal_particle",[px-div,py+1.5,pz-div],dim);
                spawnParticleInWorld("minecraft:basic_portal_particle",[px+div,py+1.5,pz-div],dim);
                spawnParticleInWorld("minecraft:basic_portal_particle",[px-div,py+1.5,pz+div],dim);
                if(possibility(0.1)){
                    spawnParticleInWorld("minecraft:splash_spell_emitter",[px,py+0.25,pz],dim);
                }

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
