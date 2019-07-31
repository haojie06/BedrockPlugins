import { possibility,getName,getPositionofEntity,randomNum,getPositionComp} from "../utils";
import {system} from "../system"
export function attackReg() {
    server.log("LoreEffect 攻击特效已加载");
    system.listenForEvent("minecraft:player_attacked_entity",data=>{
        let player:IEntity = data.data.player;
        let target = data.data.attacked_entity;
        let playerName = getName(player);
        if (!system.hasComponent(player, MinecraftComponent.HandContainer)){
        throw `Can only be used by entity that has hand container`;
        }
        else{
        const handComp = system.getComponent(player, MinecraftComponent.HandContainer);
        let item = handComp.data[0];
        let loreComp = system.getComponent(item, MinecraftComponent.Lore);
        let lore = String(loreComp.data);
        //system.sendText(player,`${loreComp.data}`);
        if(lore.indexOf("冰霜") != -1){
            system.sendText(player,`检测到冰霜标签`);
            system.executeCommand(`effect ${player} slowness 10 1 false`,data=>{system.sendText(player,JSON.stringify(data));});
        }
        if(lore.indexOf("岩浆") != -1){
            let px,py,pz;
            if (system.hasComponent(target, "minecraft:position")) {
                let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
            }
            let ry = randomNum(0,3);
            system.executeCommand(`particle lava_particle ${px} ${py+ry} ${pz}`,data=>{});
            system.executeCommand(`particle lava_particle ${px} ${py+ry/2} ${pz}`,data=>{});
            system.executeCommand(`particle lava_particle ${px} ${py+ry/3} ${pz}`,data=>{});
            system.executeCommand(`particle lava_particle ${px} ${py+ry} ${pz}`,data=>{});
            system.executeCommand(`particle lava_particle ${px} ${py+ry/2} ${pz}`,data=>{});
            system.executeCommand(`particle lava_particle ${px} ${py+ry/3} ${pz}`,data=>{});
        }
        if(lore.indexOf("音符") != -1){
            let px,py,pz;
            if (system.hasComponent(target, "minecraft:position")) {
                let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
            }
            let ry = randomNum(0,3);
            system.executeCommand(`particle note ${px} ${py+ry} ${pz}`,data=>{});
            system.executeCommand(`particle note ${px} ${py+ry/2} ${pz}`,data=>{});
            system.executeCommand(`particle note ${px} ${py+ry/3} ${pz}`,data=>{});
            system.executeCommand(`particle note ${px + ry/2} ${py+ry} ${pz - ry/2}`,data=>{});
            system.executeCommand(`particle note ${px - ry/2} ${py+ry/2} ${pz + ry/2}`,data=>{});
            system.executeCommand(`particle note ${px + ry/3} ${py+ry/3} ${pz - ry/3}`,data=>{});
        }
        if(lore.indexOf("末影") != -1){
            let px,py,pz;
            if (system.hasComponent(target, "minecraft:position")) {
                let comp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
                px = Math.floor(comp.data.x);
                py = Math.floor(comp.data.y);
                pz = Math.floor(comp.data.z);
            }
            let ry = randomNum(1,2.5);
            system.executeCommand(`particle ender ${px} ${py+ry} ${pz}`,data=>{});
            system.executeCommand(`particle ender ${px} ${py+ry/2} ${pz}`,data=>{});
            system.executeCommand(`particle ender ${px} ${py+ry/3} ${pz}`,data=>{});
            system.executeCommand(`particle ender ${px} ${py+ry} ${pz}`,data=>{});
            system.executeCommand(`particle ender ${px} ${py+ry/2} ${pz}`,data=>{});
            system.executeCommand(`particle ender ${px} ${py+ry/3} ${pz}`,data=>{});
            //system.executeCommand(`particle hearth ${px+1} ${py+3} ${pz+1}`,data=>{});
            //system.executeCommand(`particle hearth ${px+1} ${py+3} ${pz-1}`,data=>{});
            //system.executeCommand(`particle hearth ${px-1} ${py+3} ${pz-1}`,data=>{});
            //system.executeCommand(`particle hearth ${px-1} ${py+3} ${pz+1}`,data=>{});
        }
        if(lore.indexOf("血") != -1){
            if(possibility(0.35)){
            let pComp = system.getComponent<IPositionComponent>(target,MinecraftComponent.Position);
            let px,py,pz;
            px = Math.floor(pComp.data.x);
            py = Math.floor(pComp.data.y);
            pz = Math.floor(pComp.data.z);
            system.executeCommand(`particle blood ${px} ${py+1} ${pz}`,data=>{});
            }
        }
        }
    });
}