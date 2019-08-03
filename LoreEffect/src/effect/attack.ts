import { spawnParticleInWorld,getDimensionOfEntity,possibility,getName,getPositionofEntity,randomNum,getPositionComp} from "../utils";
import {system} from "../system"
export function attackReg() {
    server.log("LoreEffect 攻击特效已加载");
    system.listenForEvent("minecraft:player_attacked_entity",data=>{
        let player:IEntity = data.data.player;
        let target = data.data.attacked_entity;
        let playerName = getName(player);
        let dim = getDimensionOfEntity(player);
        if (!system.hasComponent(player, MinecraftComponent.HandContainer)){
        throw `Can only be used by entity that has hand container`;
        }
        else{
        const handComp = system.getComponent(player, MinecraftComponent.HandContainer);
        let item = handComp.data[0];
        let loreComp = system.getComponent(item, MinecraftComponent.Lore);
        let lore = String(loreComp.data);
        //system.sendText(player,`${loreComp.data}`);
        if(lore.indexOf("寒冰") != -1){
            let px,py,pz;
            let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            px = comp.data.x;
            py = comp.data.y;
            pz = comp.data.z;
            let ry = randomNum(1,2);
            let div  = Math.random();
            spawnParticleInWorld("minecraft:water_wake_particle",[px+div,py+ry,pz+div],dim);
            spawnParticleInWorld("minecraft:water_wake_particle",[px-div,py+ry,pz-div],dim);
            spawnParticleInWorld("minecraft:water_wake_particle",[px+div,py+ry,pz-div],dim);
        }
        if(lore.indexOf("岩浆") != -1){
            let px,py,pz;
            let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            px = comp.data.x;
            py = comp.data.y;
            pz = comp.data.z;
            let ry = randomNum(0,3);
            spawnParticleInWorld("lava_particle",[px,py+ry,pz],dim);
            spawnParticleInWorld("lava_particle",[px,py+ry/2,pz],dim);
            spawnParticleInWorld("lava_particle",[px,py+ry/3,pz],dim);
            spawnParticleInWorld("lava_particle",[px,py+ry,pz],dim);
            spawnParticleInWorld("lava_particle",[px,py+ry/2,pz],dim);
            spawnParticleInWorld("lava_particle",[px,py+ry/3,pz],dim);

        }
        if(lore.indexOf("音符") != -1){
            let px,py,pz;
            let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            px = comp.data.x;
            py = comp.data.y;
            pz = comp.data.z;
            let ry = randomNum(0,3);
            spawnParticleInWorld("note",[px,py+ry,pz],dim);
            spawnParticleInWorld("note",[px,py+ry/2,pz],dim);
            spawnParticleInWorld("note",[px,py+ry/3,pz],dim);

            spawnParticleInWorld("note",[px+ry/2,py+ry,pz-ry/2],dim);
            spawnParticleInWorld("note",[px-ry/2,py+ry/2,pz+ry/2],dim);
            spawnParticleInWorld("note",[px+ry/3,py+ry/3,pz-ry/2],dim);

        }
        if(lore.indexOf("末影") != -1){
            let px,py,pz;
            if (system.hasComponent(target, "minecraft:position")) {
                let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
                px = comp.data.x;
                py = comp.data.y;
                pz = comp.data.z;
            }
            let ry = randomNum(1,2.5);
            spawnParticleInWorld("ender",[px,px+ry,pz],dim);
            spawnParticleInWorld("ender",[px,px+ry/2,pz],dim);
            spawnParticleInWorld("ender",[px,px+ry/3,pz],dim);
            spawnParticleInWorld("ender",[px,px+ry,pz],dim);
            spawnParticleInWorld("ender",[px,px+ry/2,pz],dim);
            spawnParticleInWorld("ender",[px,px+ry/3,pz],dim);

        }
        if(lore.indexOf("血") != -1){
            let pComp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            let px,py,pz;
            px = pComp.data.x;
            py = pComp.data.y;
            pz = pComp.data.z;
            spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+1,pz],dim);
            spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+0.5,pz],dim);
            spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+1.2,pz],dim);


            if(possibility(0.35)){
                spawnParticleInWorld("blood",[px,py+1,pz],dim);
            }
        }
        if(lore.indexOf("duang") != -1){
            if(possibility(0.3)){
            let pComp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            let px,py,pz;
            px = pComp.data.x;
            py = pComp.data.y;
            pz = pComp.data.z;
            spawnParticleInWorld("minecraft:critical_hit_emitter",[px,py+2.5,pz],dim);
            system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ playsound random.anvil_land @a ${px} ${py} ${pz} 1 1`,data=>{});
        }
    }
    if(lore.indexOf("斩击") != -1){
        if(possibility(0.5)){
        let pComp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
        let px,py,pz;
        px = pComp.data.x;
        py = pComp.data.y;
        pz = pComp.data.z;
        spawnParticleInWorld("minecraft:dragon_destroy_block",[px,py+2,pz],dim);
        spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+1,pz],dim);
        spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+0.5,pz],dim);
        spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+1.2,pz],dim);
        spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+0.2,pz],dim);
        spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle",[px,py+1.5,pz],dim);
        
        system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ playsound item.trident.throw @a ${px} ${py} ${pz} 1 1`,data=>{});
    }
}
        }
    });
}