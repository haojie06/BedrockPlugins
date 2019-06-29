import { MySystem } from "./system";

var itemWhitelist:string[] = ["minecraft:diamond","minecraft:gold_ore","minecraft:iron_ore","minecraft:diamond_ore","minecraft:diamond_block","minecraft:enchanting_table","minecraft:emerald_ore","minecraft:emerald_block","minecraft:beacon","minecraft:iron_shovel","minecraft:iron_pickaxe","minecraft:iron_axe","minecraft:bow","minecraft:diamond","minecraft:iron_ingot","minecraft:gold_ingot","minecraft:iron_sword","minecraft:diamond_sword","minecraft:diamond_shovel","minecraft:diamond_pickaxe","minecraft:diamond_axe"];
//var entityWhitelist:string[] = ["minecraft:ocelot","minecraft:chicken","minecraft:wandering_trader","minecraft:snow_golem","minecraft:ender_dragon","minecraft:iron_golem","minecraft:mule","minecraft:iron_golem","minecraft:minecart","minecraft:elder_guardian","minecraft:slime","minecraft:ravager","minecraft:pillager","minecraft:player","minecraft:armor_stand","minecraft:villager","minecraft:villager_v2","minecraft:zombie_villager_v2","fine:oak_chair","fine:oak_desk","fine:oak_parkchair","minecraft:zombie_villager","minecraft:wither","minecraft:horse","minecraft:skeleton_horse","minecraft:zombie_horse","minecraft:pig","minecraft:sheep","minecraft:cow","minecraft:panda","minecraft:turtle","minecraft:parrot","minecraft:cat","minecraft:wolf","minecraft:donkey","jsa:jet1","jsa:jet2","jsa:jet3","jsa:jet4","jsa:jet5","jsa:jet6"]; 
var entityBlacklist:string[] = ["minecraft:bat","minecraft:blaze","minecraft:cave_spider","minecraft:creeper","minecraft:drowned","minecraft:enderman","minecraft:ghast","minecraft:husk","minecraft:magma_cube","minecraft:skeleton","minecraft:squid","minecraft:stray","minecraft:wither_skeleton","minecraft:zombie","minecraft:zombie_pigman"];
var stackWhitelist:string[] = ["minecraft:ravager","minecraft:pillager","minecraft:player","minecraft:armor_stand","minecraft:villager","minecraft:villager_v2","minecraft:villager_v2"];
var itemQuery,mobQuery,entityQuery,positionQuery;
var tick = 0;
var maxStackSize = 20; //当一定范围内堆积生物超过这个数的时候清理其中所有生物
var clearInterval = 10800; //清理间隔设置（这里是提醒的间隔） 上一次清理后间隔1200tick提醒，然后再等一分钟开始清理 一共两分钟
const system = server.registerSystem<MySystem>(0, 0);
system.initialize = function() {
  server.log("LagRemover v1.2 Loaded");
  //用于标识待清理掉落物实体/带清理生物实体
  system.registerComponent("lagremover:isItem", {});
  system.registerComponent("lagremover:isEntity", {});
  //定时清理掉落物/生物
  itemQuery = system.registerQuery();
  mobQuery = system.registerQuery();
  entityQuery = system.registerQuery();
  positionQuery = system.registerQuery(MinecraftComponent.Position, "x", "y", "z");
  system.addFilterToQuery(itemQuery,"lagremover:isItem");
  system.addFilterToQuery(mobQuery,"lagremover:isEntity");
  system.listenForEvent("minecraft:entity_created",onEntityCreate);

  this.registerCommand("lagstatus", {
    description: "查看当前卡顿情况",
    permission: 1,
    overloads: [{
        parameters:[],
        handler(origin) {
          let entities = system.getEntitiesFromQuery(itemQuery);
          system.broadcastMessage(`§c当前待清除掉落物数量:${entities.length}`);
          server.log(`当前待清除掉落物数量:${entities.length}`);
          entities = system.getEntitiesFromQuery(mobQuery);
          system.broadcastMessage(`§c当前待清除生物数量:${entities.length}`);
          server.log(`当前待清除生物数量:${entities.length}`);
          entities = system.getEntitiesFromQuery(entityQuery);
          system.broadcastMessage(`§c当前实体总数量${entities.length} \ntick:${tick}`);
          server.log(`当前实体总数量${entities.length} tick:${tick}`);
      }
    } as CommandOverload<MySystem, []>
    ]
  });
};

system.update = function() {
  //20tick = 1s
  tick++;
  if(tick == clearInterval){
    system.broadcastMessage(`§a§l一分钟后准备清理掉落物与生物，请做好准备`);
  }
  else if(tick == (clearInterval+600)){
    system.broadcastMessage(`§a§l30秒后准备清理掉落物与生物，请做好准备`);
  }
  else if(tick == (clearInterval+900)){
    system.broadcastMessage(`§a§l15秒后准备清理掉落物与生物，请做好准备`);
  }
  else if(tick == (clearInterval+1100)){
    system.broadcastMessage(`§c§l5秒后准备清理掉落物与生物`);
  }
  else if(tick == (clearInterval+1120)){
    system.broadcastMessage(`§c§l4秒后准备清理掉落物生物`);
  }
  else if(tick == (clearInterval+1140)){
    system.broadcastMessage(`§c§l3秒后准备清理掉落物生物`);
  }
  else if(tick == (clearInterval+1160)){
    system.broadcastMessage(`§c§l2秒后准备清理掉落物生物`);
  }
  else if(tick == (clearInterval+1180)){
    system.broadcastMessage(`§c§l1秒后准备清理掉落物生物`);
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
    system.broadcastMessage(`§a§l清道夫§r §c已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms`);
    server.log(`已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms`);
    tick = 0;
  }
  //if (tick == 12000){
    //
  //}
};

function onEntityCreate(data){
  let entity = data.entity;
  if(entity.__type__ == "item_entity"){
    if(itemWhitelist.indexOf(entity.__identifier__) == -1){
    system.createComponent(entity,"lagremover:isItem");
    }
  }
  else{
    let nameComp = system.getComponent(entity,MinecraftComponent.Nameable);
    if(entityBlacklist.indexOf(entity.__identifier__) != -1){
      system.createComponent(entity,"lagremover:isEntity");
      }
      else{
        //server.log(entity.__identifier__ + entityWhitelist.indexOf(entity.__identifier__) + "实体在白名单内");
      }
      if(stackWhitelist.indexOf(entity.__identifier__) == -1){
      //生物出生的时候检查周围是否出现堆叠
      let posComp = system.getComponent(entity,MinecraftComponent.Position);
      let x = Math.floor(posComp.data.x);
      let y = Math.floor(posComp.data.y);
      let z = Math.floor(posComp.data.z);
      let startTime = Date.now();
      let entities = system.getEntitiesFromQuery(positionQuery,x-5,y-5,z-5,x+5,y+5,z+5);
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
        for(let entity of sameEntities){
          //let nameComp = system.getComponent(entity,MinecraftComponent.Nameable);
          //if(nameComp.data.name == ""){
          system.destroyEntity(entity);
          //}
        }
        let endTime = Date.now() - startTime;
        system.broadcastMessage(`§a§l清道夫§r §c实体堆叠过多，触发清理 耗时${endTime}ms`);
        server.log(`实体堆叠过多，触发清理 耗时${endTime}ms`)
      }
    }
  }
}
