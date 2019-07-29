const system = server.registerSystem(0, 0);
//掉落物白名单
let itemWhitelist:string[] = ["minecraft:diamond","minecraft:gold_ore","minecraft:iron_ore","minecraft:diamond_ore","minecraft:diamond_block","minecraft:enchanting_table","minecraft:emerald_ore","minecraft:emerald_block","minecraft:beacon","minecraft:iron_shovel","minecraft:iron_pickaxe","minecraft:iron_axe","minecraft:bow","minecraft:diamond","minecraft:iron_ingot","minecraft:gold_ingot","minecraft:iron_sword","minecraft:diamond_sword","minecraft:diamond_shovel","minecraft:diamond_pickaxe","minecraft:diamond_axe"];
//实体白名单
let entityBlacklist:string[] = ["minecraft:fireball","minecraft:arrow","fine:halfzombie","minecraft:bat","minecraft:blaze","minecraft:cave_spider","minecraft:creeper","minecraft:drowned","minecraft:enderman","minecraft:ghast","minecraft:husk","minecraft:magma_cube","minecraft:skeleton","minecraft:squid","minecraft:stray","minecraft:wither_skeleton","minecraft:zombie","minecraft:zombie_pigman"];
//堆叠生物白名单
let stackWhitelist:string[] = ["minecraft:xp_orb","minecraft:falling_block","minecraft:ravager","minecraft:pillager","minecraft:player","minecraft:armor_stand","minecraft:villager","minecraft:villager_v2","minecraft:villager_v2"];
let itemQuery,mobQuery,entityQuery,positionQuery;
let tick = 0;
let clearInterval = 10800; //清理间隔设置（这里是提醒的间隔） 上一次清理后间隔1200tick提醒，然后再等一分钟开始清理 一共两分钟
let second=0,minute=0,hour=0;
system.initialize = function () {
    server.log("LagRemover Loaded");

    itemQuery = system.registerQuery();
    mobQuery = system.registerQuery();
    entityQuery = system.registerQuery();
    positionQuery = system.registerQuery(MinecraftComponent.Position, "x", "y", "z");
    system.registerComponent("lagremover:isItem", {});
    system.registerComponent("lagremover:isMob", {});
    system.addFilterToQuery(itemQuery,"lagremover:isItem");
    system.addFilterToQuery(mobQuery,"lagremover:isMob");

    system.listenForEvent("minecraft:entity_created",onEntityCreate);

    system.registerCommand("lagstatus", {
        description: "查看当前卡顿情况",
        permission: 1,
        overloads: [{
            parameters:[],
            handler() {
                if(!this.entity) throw "只有玩家可以执行";
              let entities = system.getEntitiesFromQuery(itemQuery);
              //system.broadcastMessage(`§c服务器已运行${minute}分钟${second}秒\n§c当前待清除掉落物数量:${entities.length}`);
              system.sendText(this.entity,`§c服务器已运行${minute}分钟${second}秒\n§c当前待清除掉落物数量:${entities.length}`)
              server.log(`当前待清除掉落物数量:${entities.length}`);
              entities = system.getEntitiesFromQuery(mobQuery);
              //system.broadcastMessage(`§c当前待清除生物数量:${entities.length}`);
              system.sendText(this.entity,`§c当前待清除生物数量:${entities.length}`)
              server.log(`当前待清除生物数量:${entities.length}`);
              entities = system.getEntitiesFromQuery(entityQuery);
              //system.broadcastMessage(`§c当前实体总数量${entities.length} \ntick:${tick}`);
              system.sendText(this.entity,`§c当前实体总数量${entities.length} \ntick:${tick}`)
              server.log(`当前实体总数量${entities.length} tick:${tick}`);
          }
        } as CommandOverload<[]>
        ]
      });
}


system.update = function() {
    //20tick = 1s
    tick++;
    let mod = tick%20;
    if(mod == 0){
      second++;
    }
    if(second  == 60){
      minute++;
      second=0;
    }
    if(tick == clearInterval){
      //system.broadcastMessage(`§a§l一分钟后准备清理掉落物与生物，请做好准备`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a§l一分钟后准备清理掉落物与生物，请做好准备"}]}`,data=>{});
    }
    else if(tick == (clearInterval+600)){
      //system.broadcastMessage(`§a§l30秒后准备清理掉落物与生物，请做好准备`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a§l30秒后准备清理掉落物与生物，请做好准备"}]}`,data=>{});
    }
    else if(tick == (clearInterval+900)){
      //system.broadcastMessage(`§a§l15秒后准备清理掉落物与生物，请做好准备`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a§l15秒后准备清理掉落物与生物，请做好准备"}]}`,data=>{});

    }
    else if(tick == (clearInterval+1100)){
      //system.broadcastMessage(`§c§l5秒后准备清理掉落物与生物`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c§l5秒后准备清理掉落物与生物"}]}`,data=>{});
    }
    else if(tick == (clearInterval+1120)){
      //system.broadcastMessage(`§c§l4秒后准备清理掉落物生物`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c§l4秒后准备清理掉落物与生物"}]}`,data=>{});
    }
    else if(tick == (clearInterval+1140)){
      //system.broadcastMessage(`§c§l3秒后准备清理掉落物生物`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c§l3秒后准备清理掉落物与生物"}]}`,data=>{});
    }
    else if(tick == (clearInterval+1160)){
      //system.broadcastMessage(`§c§l2秒后准备清理掉落物生物`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c§l2秒后准备清理掉落物与生物"}]}`,data=>{});
    }
    else if(tick == (clearInterval+1180)){
      //system.broadcastMessage(`§c§l1秒后准备清理掉落物生物`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c§l1秒后准备清理掉落物与生物"}]}`,data=>{});
    }
    else if(tick == (clearInterval+1200)){
      let itemEntities = system.getEntitiesFromQuery(itemQuery);
      let mobEntities = system.getEntitiesFromQuery(mobQuery);
      let mobLength = mobEntities.length;
      let itemLength = itemEntities.length;
      let beginTime = Date.now();
      for (let entity of itemEntities){
        system.destroyEntity(entity);
      }
      for (let mob of mobEntities){
       // if(system.getComponent(mob,MinecraftComponent.Nameable).data.name == ""){
        system.destroyEntity(mob);
       // }
      }
      let endTime = Date.now();
      let useTime = endTime - beginTime;
      //system.(`§a§l清道夫§r §c已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms`);
      system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a§l清道夫§r §c已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms"}]}`,data=>{});
      server.log(`已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms`);
      tick = 0;
    }
  
  
    //if (tick == 12000){
      //
    //}
  };

function onEntityCreate(data){
    let entity = data.data.entity;
    if(entity.__type__ == "item_entity"){
        if(itemWhitelist.indexOf(entity.__identifier__) == -1){
        system.createComponent(entity,"lagremover:isItem");
        }
    }
    else{
      if(entityBlacklist.indexOf(entity.__identifier__) != -1){
        system.createComponent(entity,"lagremover:isMob");
        }
  
          //生物出生的时候是否检查周围出现堆叠
          /*
        if(stackWhitelist.indexOf(entity.__identifier__) == -1){
        let posComp = system.getComponent(entity,MinecraftComponent.Position);
        let x = Math.floor(posComp.data.x);
        let y = Math.floor(posComp.data.y);
        let z = Math.floor(posComp.data.z);
        let startTime = Date.now();
        let entities = system.getEntitiesFromQuery(positionQuery,x-10,y-5,z-10,x+10,y+5,z+10);
        if(entities == null){
          throw("无法获得周边实体信息");
        }
        let sameEntities = [];
        for(let enti of entities){
            if(enti.__identifier__ == entity.__identifier__){
              sameEntities.push(enti);
            }
        }
        //server.log(`生成${entity.__identifier__}周围有同种实体${sameEntities.length}个`); 周围出现超过15个同类实体时清理
        if (sameEntities.length >=maxStackSize) {
          let name = entity.__identifier__;
          let pos = system.getComponent(entity,MinecraftComponent.Position);
          let x = Math.floor(pos.data.x);
          let y = Math.floor(pos.data.y);
          let z = Math.floor(pos.data.z);
          let halfSize = maxStackSize / 2;
          for(let i=0;i<halfSize;i++){
            system.destroyEntity(entities[i]);
          }
          let endTime = Date.now() - startTime;
          system.broadcastMessage(`§a§l清道夫§r §c${name}堆叠过多，触发清理 耗时${endTime}ms 请不要大量堆积生物(>20)`);
          server.log(`实体${name}(${x},${y},${z})堆叠过多，触发清理 耗时${endTime}ms`);
        }
        }*/
    }
}
