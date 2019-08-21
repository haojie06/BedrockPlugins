(function () {
  'use strict';

  var system = server.registerSystem(0, 0);
  //掉落物白名单
  var itemWhitelist = ["minecraft:diamond", "minecraft:gold_ore", "minecraft:iron_ore", "minecraft:diamond_ore", "minecraft:diamond_block", "minecraft:enchanting_table", "minecraft:emerald_ore", "minecraft:emerald_block", "minecraft:beacon", "minecraft:iron_shovel", "minecraft:iron_pickaxe", "minecraft:iron_axe", "minecraft:bow", "minecraft:diamond", "minecraft:iron_ingot", "minecraft:gold_ingot", "minecraft:iron_sword", "minecraft:diamond_sword", "minecraft:diamond_shovel", "minecraft:diamond_pickaxe", "minecraft:diamond_axe"];
  //需要清理的实体
  /*
  let entityBlacklist:string[] = [
  "minecraft:ravager","minecraft:zombie_villager","minecraft:evoker","minecraft:zombie_villager_v2","minecraft:phantom","minecraft:vex","minecraft:vindicator",
  "minecraft:cat","minecraft:wolf","minecraft:silverfish","minecraft:polar_bear","minecraft:pufferfish",
  "minecraft:rabbit","minecraft:mule","minecraft:llama","minecraft:horse",
  "minecraft:guardian","minecraft:tropical_fish","minecraft:tropicalfish","minecraft:donkey","minecraft:cod",
  "minecraft:slime","minecraft:skeleton_horse",
  ,"minecraft:squid","minecraft:dolphin","minecraft:chicken","minecraft:cow","minecraft:salmon",
  "minecraft:sheep","minecraft:pig","minecraft:spider","minecraft:turtle","fine:halfzombie","minecraft:bat","minecraft:blaze",
  "minecraft:cave_spider","minecraft:creeper","minecraft:drowned","minecraft:enderman"
  ,"minecraft:ghast","minecraft:husk","minecraft:magma_cube","minecraft:skeleton","minecraft:squid","minecraft:panda"
  ,"minecraft:stray","minecraft:wither_skeleton","minecraft:zombie","minecraft:zombie_pigman","minecraft:ocelot","minecraft:mooshroom"];
  */
  //实体清理白名单,里面的生物即使不命名也不会被自动清理 (排除非生物以及少数生物)
  var entityWhitelist = ["minecraft:elder_guardian", "minecraft:villager_v2", "minecraft:villager", "minecraft:ender_dragon", "minecraft:ravager", "minecraft:wither"];
  //堆叠生物白名单
  //let stackWhitelist:string[] = ["minecraft:xp_orb","minecraft:falling_block","minecraft:ravager","minecraft:pillager","minecraft:player","minecraft:armor_stand","minecraft:villager","minecraft:villager_v2","minecraft:villager_v2"];
  //需要清理的非生物实体
  var noNameEntityBlackList = ["minecraft:snowball", "minecraft:splash_potion", "minecraft:xp_bottle", "minecraft:wither_skull", "minecraft:egg", "minecraft:xp_orb", "minecraft:fireball", "minecraft:small_fireball", "minecraft:arrow"];
  //类似于盔甲架一类的实体
  var placeableEntityList = ["minecraft:tnt", "minecraft:armor_stand", "minecraft:boat", "minecraft:chest_minecart", "minecraft:end_crystal", "minecraft:furnace_minecart", "minecraft:hopper_minecart", "minecraft:item_frame", "minecraft:minecar", "minecraft:painting", "minecraft:tnt_minecart"];
  var itemQuery, mobQuery, entityQuery, positionQuery, noNameEntityQuery, placeableEntityQuery;
  var notClearMobNum = 0, clearMobNum = 0;
  //模拟距离
  var tick = 0;
  var clearInterval = 10800; //清理间隔设置（这里是提醒的间隔） 上一次清理后间隔1200tick提醒，然后再等一分钟开始清理 一共两分钟
  //let clearInterval = 300;
  var second = 0, minute = 0;
  system.initialize = function () {
      server.log("LagRemover Loaded");
      placeableEntityQuery = system.registerQuery();
      itemQuery = system.registerQuery();
      mobQuery = system.registerQuery();
      entityQuery = system.registerQuery();
      noNameEntityQuery = system.registerQuery();
      positionQuery = system.registerQuery("minecraft:position" /* Position */, "x", "y", "z");
      system.registerComponent("lagremover:isEntity", {});
      system.registerComponent("lagremover:placeableEntity", {});
      system.registerComponent("lagremover:isItem", {});
      system.registerComponent("lagremover:isMob", {});
      system.registerComponent("lagremover:noNameEntity", {});
      system.addFilterToQuery(placeableEntityQuery, "lagremover:placeableEntity");
      system.addFilterToQuery(itemQuery, "lagremover:isItem");
      system.addFilterToQuery(entityQuery, "lagremover:isEntity");
      system.addFilterToQuery(mobQuery, "lagremover:isMob");
      system.addFilterToQuery(mobQuery, "minecraft:nameable");
      system.addFilterToQuery(noNameEntityQuery, "lagremover:noNameEntity");
      system.listenForEvent("minecraft:entity_created", onEntityCreate);
      system.registerCommand("lagstatus", {
          description: "查看当前卡顿情况",
          permission: 1,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      //if(!this.entity) throw "只有玩家可以执行";
                      var entities = system.getEntitiesFromQuery(itemQuery);
                      var show = "";
                      show += "\u00A7e\u670D\u52A1\u5668\u5DF2\u8FD0\u884C" + minute + "\u5206\u949F" + second + "\u79D2\n\u00A7c\u5F53\u524D\u5F85\u6E05\u9664\u6389\u843D\u7269\u6570\u91CF:" + entities.length + "\n";
                      server.log("\u5F53\u524D\u5F85\u6E05\u9664\u6389\u843D\u7269\u6570\u91CF:" + entities.length);
                      entities = system.getEntitiesFromQuery(mobQuery);
                      var noNameEntities = system.getEntitiesFromQuery(noNameEntityQuery);
                      var placeableEntities = system.getEntitiesFromQuery(placeableEntityQuery);
                      show += "\u00A7c\u5F53\u524D\u5F85\u6E05\u9664\u6709AI\u751F\u7269\u5B9E\u4F53\u6570\u91CF:" + entities.length + " \u65E0AI\u751F\u7269\u5B9E\u4F53\u6570\u91CF " + noNameEntities.length + "\n";
                      server.log("\u5F53\u524D\u5F85\u6E05\u9664\u751F\u7269\u6570\u91CF:" + (entities.length + noNameEntities.length));
                      entities = system.getEntitiesFromQuery(entityQuery);
                      show += "\u00A7c\u5F53\u524D\u5B9E\u4F53\u603B\u6570\u91CF" + entities.length + " \u4E0D\u4F1A\u88AB\u6E05\u7406\u7684\u653E\u7F6E\u7C7B\u5B9E\u4F53\u6570\u91CF " + placeableEntities.length + "\ntick:" + tick + " \u8DDD\u79BB\u6E05\u7406:tick:" + (clearInterval + 1200 - tick);
                      server.log("\u5F53\u524D\u5B9E\u4F53\u603B\u6570\u91CF" + entities.length + " tick:" + tick + "\n\u8DDD\u79BB\u6E05\u7406:tick:" + (clearInterval + 1200 - tick));
                      return show;
                  }
              }
          ]
      });
      system.registerCommand("clearlag", {
          description: "提前清除所有需要清理的生物",
          permission: 1,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      var beginTime = Date.now();
                      var mobs = system.getEntitiesFromQuery(mobQuery);
                      for (var _i = 0, mobs_1 = mobs; _i < mobs_1.length; _i++) {
                          var mob = mobs_1[_i];
                          // if(system.getComponent(mob,MinecraftComponent.Nameable).data.name == ""){
                          var nameCmp = system.getComponent(mob, "minecraft:nameable");
                          if (nameCmp.data.name != "") {
                              notClearMobNum++;
                          }
                          else {
                              system.destroyEntity(mob);
                              clearMobNum++;
                          }
                      }
                      var endTime = Date.now();
                      var useTime = endTime - beginTime;
                      var show = "\u00A7e\u7BA1\u7406\u5458\u53EC\u5524\u6E05\u9053\u592B\u6E05\u7406\u4E86" + clearMobNum + "\u4E2A\u5F85\u6E05\u7406\u751F\u7269,\u6709" + notClearMobNum + "\u4E2A\u547D\u540D\u751F\u7269\u672A\u88AB\u6E05\u7406,\u8017\u65F6" + useTime + "ms";
                      server.log(show);
                      system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7e\u7BA1\u7406\u5458\u53EC\u5524\u6E05\u9053\u592B\u6E05\u7406\u4E86" + clearMobNum + "\u4E2A\u5F85\u6E05\u7406\u751F\u7269,\u6709" + notClearMobNum + "\u4E2A\u547D\u540D\u751F\u7269\u672A\u88AB\u6E05\u7406,\u8017\u65F6" + useTime + "ms\"}]}", function (data) { });
                      notClearMobNum = 0;
                      clearMobNum = 0;
                      return "已清理";
                  }
              }
          ]
      });
  };
  system.update = function () {
      //20tick = 1s
      tick++;
      var mod = tick % 20;
      if (mod == 0) {
          second++;
      }
      if (second == 60) {
          minute++;
          second = 0;
      }
      if (tick == clearInterval / 2) {
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7a\u00A7l\u670D\u52A1\u5668\u5F00\u542F\u4E86\u5B9A\u65F6\u6E05\u7406,\u5927\u591A\u6570\u672A\u547D\u540D\u751F\u7269\u53CA\u591A\u6570\u6389\u843D\u7269\u90FD\u4F1A\u88AB\u6E05\u7406\uFF0C\u8BF7\u683C\u5916\u6CE8\u610F\uFF01\"}]}", function (data) { });
      }
      if (tick == clearInterval) {
          //system.broadcastMessage(`§a§l一分钟后准备清理掉落物与生物，请做好准备`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7a\u00A7l\u4E00\u5206\u949F\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\uFF0C\u8BF7\u505A\u597D\u51C6\u5907\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 600)) {
          //system.broadcastMessage(`§a§l30秒后准备清理掉落物与生物，请做好准备`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7a\u00A7l30\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\uFF0C\u8BF7\u505A\u597D\u51C6\u5907\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 900)) {
          //system.broadcastMessage(`§a§l15秒后准备清理掉落物与生物，请做好准备`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7a\u00A7l15\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\uFF0C\u8BF7\u505A\u597D\u51C6\u5907\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1100)) {
          //system.broadcastMessage(`§c§l5秒后准备清理掉落物与生物`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7c\u00A7l5\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1120)) {
          //system.broadcastMessage(`§c§l4秒后准备清理掉落物生物`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7c\u00A7l4\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1140)) {
          //system.broadcastMessage(`§c§l3秒后准备清理掉落物生物`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7c\u00A7l3\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1160)) {
          //system.broadcastMessage(`§c§l2秒后准备清理掉落物生物`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7c\u00A7l2\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1180)) {
          //system.broadcastMessage(`§c§l1秒后准备清理掉落物生物`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7c\u00A7l1\u79D2\u540E\u51C6\u5907\u6E05\u7406\u6389\u843D\u7269\u4E0E\u751F\u7269\"}]}", function (data) { });
      }
      else if (tick == (clearInterval + 1200)) {
          var itemEntities = system.getEntitiesFromQuery(itemQuery);
          var mobEntities = system.getEntitiesFromQuery(mobQuery);
          var noNameEntities = system.getEntitiesFromQuery(noNameEntityQuery);
          var mobLength = mobEntities.length;
          var itemLength = itemEntities.length;
          var beginTime = Date.now();
          for (var _i = 0, itemEntities_1 = itemEntities; _i < itemEntities_1.length; _i++) {
              var entity = itemEntities_1[_i];
              system.destroyEntity(entity);
          }
          for (var _a = 0, mobEntities_1 = mobEntities; _a < mobEntities_1.length; _a++) {
              var mob = mobEntities_1[_a];
              // if(system.getComponent(mob,MinecraftComponent.Nameable).data.name == ""){
              var nameCmp = system.getComponent(mob, "minecraft:nameable");
              if (nameCmp.data.name != "") {
                  notClearMobNum++;
              }
              else {
                  system.destroyEntity(mob);
                  clearMobNum++;
              }
          }
          for (var _b = 0, noNameEntities_1 = noNameEntities; _b < noNameEntities_1.length; _b++) {
              var noNameE = noNameEntities_1[_b];
              system.destroyEntity(noNameE);
              clearMobNum++;
          }
          var endTime = Date.now();
          var useTime = endTime - beginTime;
          //system.(`§a§l清道夫§r §c已经清理${itemLength}个掉落物 ${mobLength}个生物,共耗时${useTime}ms`);
          system.executeCommand("tellraw @a {\"rawtext\":[{\"text\":\"\u00A7a\u00A7l\u6E05\u9053\u592B\u00A7r \u00A7c\u5DF2\u7ECF\u6E05\u7406\n" + itemLength + "\u4E2A\u6389\u843D\u7269 " + clearMobNum + "\u4E2A\u751F\u7269(\u6709" + notClearMobNum + "\u4E2A\u547D\u540D\u751F\u7269\u907F\u514D\u88AB\u6E05\u7406),\u5171\u8017\u65F6" + useTime + "ms\"}]}", function (data) { });
          server.log("\u5DF2\u7ECF\u6E05\u7406" + itemLength + "\u4E2A\u6389\u843D\u7269 " + clearMobNum + "\u4E2A\u751F\u7269,\u5171\u8017\u65F6" + useTime + "ms");
          notClearMobNum = 0;
          clearMobNum = 0;
          tick = 0;
      }
  };
  function onEntityCreate(data) {
      var entity = data.data.entity;
      try {
          if (entity) {
              if (entity.__type__ == "item_entity") {
                  if (itemWhitelist.indexOf(entity.__identifier__) == -1) {
                      system.createComponent(entity, "lagremover:isItem");
                  }
              }
              else {
                  //在生物清理的白名单之外
                  if (entityWhitelist.indexOf(entity.__identifier__) == -1) {
                      //system.createComponent(entity,"lagremover:isMob");
                      //是无名字组件的生物实体（火球一类）
                      if (noNameEntityBlackList.indexOf(entity.__identifier__) != -1) {
                          system.createComponent(entity, "lagremover:noNameEntity");
                      }
                      else if (placeableEntityList.indexOf(entity.__identifier__) != -1) {
                          //在可放置实体列表中（不清理）
                          system.createComponent(entity, "lagremover:placeableEntity");
                      }
                      else {
                          //剩下的就是需要清理的生物
                          if (system.hasComponent(entity, "minecraft:nameable" /* Nameable */)) {
                              var identifier = entity.__identifier__;
                              if (identifier == "minecraft:cod" || identifier == "minecraft:pufferfish" || identifier == "minecraft:squid" || identifier == "minecraft:tropicalfish" || identifier == "minecraft:salmon") {
                                  var rand = Math.random();
                                  //如果需要减少某种生物的生成
                                  if (rand < 0.7) {
                                      var comp = system.getComponent(entity, "minecraft:position" /* Position */);
                                      comp.data.y = -15;
                                      system.applyComponentChanges(entity, comp);
                                  }
                              }
                              else if (identifier == "minecraft:zombie_pigman" || identifier == "minecraft:drowned") {
                                  var rand = Math.random();
                                  //如果需要减少某种生物的生成
                                  if (rand < 0.4) {
                                      var comp = system.getComponent(entity, "minecraft:position" /* Position */);
                                      comp.data.y = -15;
                                      system.applyComponentChanges(entity, comp);
                                  }
                              }
                              else {
                                  system.createComponent(entity, "lagremover:isMob");
                              }
                          }
                      }
                  }
              }
              system.createComponent(entity, "lagremover:isEntity");
          }
      }
      catch (error) {
      }
  }

}());
