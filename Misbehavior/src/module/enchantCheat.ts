import { system } from "../system";
let playerQuery;
export function enchantReg(){
    server.log("MisBehavior 附魔模块已加载");
    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"misbehavior:isplayer");
}
//update
export function enchantCheck(){
    let players =  system.getEntitiesFromQuery(playerQuery);
    for(let player of players){
        const handComp = system.getComponent(player, MinecraftComponent.HandContainer);
        let item = handComp.data[0];
        const extraData = system.getComponent(item,MinecraftComponent.ExtraData);
        
        server.log(JSON.stringify(extraData.data));
    }
}