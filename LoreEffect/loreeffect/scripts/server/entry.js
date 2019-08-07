(function () {
  'use strict';

  const system = server.registerSystem(0, 0);

  function getName(entity) {
      return system.getComponent(entity, "minecraft:nameable" /* Nameable */).data.name;
  }
  function getDimensionOfEntity(entity) {
      let dimension;
      if (system.hasComponent(entity, "stone:dimension")) {
          let comp = system.getComponent(entity, "stone:dimension" /* Dimension */);
          dimension = String(comp.data);
      }
      else {
          dimension = "无法获得维度";
      }
      return dimension;
  }
  function randomNum(minNum, maxNum) {
      return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
  }
  function possibility(p) {
      if (Math.random() < p) {
          return true;
      }
      else {
          return false;
      }
  }
  function spawnParticleInWorld(name, vec, dim) {
      let eventData = system.createEventData("minecraft:spawn_particle_in_world");
      eventData.data.effect = name;
      eventData.data.position = vec;
      if (dim == "0") {
          eventData.data.dimension = "overworld";
      }
      else if (dim == "1") {
          eventData.data.dimension = "nether";
      }
      else if (dim == "2") {
          eventData.data.dimension = "the end";
      }
      system.broadcastEvent("minecraft:spawn_particle_in_world", eventData);
  }

  function attackReg() {
      server.log("LoreEffect 攻击特效已加载");
      system.listenForEvent("minecraft:player_attacked_entity", data => {
          let player = data.data.player;
          if (player) {
              let target = data.data.attacked_entity;
              if (target) {
                  let playerName = getName(player);
                  let dim = getDimensionOfEntity(player);
                  if (!system.hasComponent(player, "minecraft:hand_container" /* HandContainer */)) {
                      throw `Can only be used by entity that has hand container`;
                  }
                  else {
                      const handComp = system.getComponent(player, "minecraft:hand_container" /* HandContainer */);
                      let item = handComp.data[0];
                      let loreComp = system.getComponent(item, "stone:lore" /* Lore */);
                      let lore = String(loreComp.data);
                      //system.sendText(player,`${loreComp.data}`);
                      if (lore.indexOf("寒冰") != -1) {
                          let px, py, pz;
                          let comp = system.getComponent(target, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          let ry = randomNum(1, 2);
                          let div = Math.random();
                          spawnParticleInWorld("minecraft:water_wake_particle", [px + div, py + ry, pz + div], dim);
                          spawnParticleInWorld("minecraft:water_wake_particle", [px - div, py + ry, pz - div], dim);
                          spawnParticleInWorld("minecraft:water_wake_particle", [px + div, py + ry, pz - div], dim);
                      }
                      if (lore.indexOf("岩浆") != -1) {
                          let px, py, pz;
                          let comp = system.getComponent(target, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          let ry = randomNum(0, 3);
                          spawnParticleInWorld("lava_particle", [px, py + ry, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + ry / 2, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + ry / 3, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + ry, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + ry / 2, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + ry / 3, pz], dim);
                      }
                      if (lore.indexOf("音符") != -1) {
                          let px, py, pz;
                          let comp = system.getComponent(target, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          let ry = randomNum(0, 3);
                          spawnParticleInWorld("note", [px, py + ry, pz], dim);
                          spawnParticleInWorld("note", [px, py + ry / 2, pz], dim);
                          spawnParticleInWorld("note", [px, py + ry / 3, pz], dim);
                          spawnParticleInWorld("note", [px + ry / 2, py + ry, pz - ry / 2], dim);
                          spawnParticleInWorld("note", [px - ry / 2, py + ry / 2, pz + ry / 2], dim);
                          spawnParticleInWorld("note", [px + ry / 3, py + ry / 3, pz - ry / 2], dim);
                      }
                      if (lore.indexOf("末影") != -1) {
                          let px, py, pz;
                          if (system.hasComponent(target, "minecraft:position")) {
                              let comp = system.getComponent(target, "minecraft:position" /* Position */);
                              px = comp.data.x;
                              py = comp.data.y;
                              pz = comp.data.z;
                          }
                          let ry = randomNum(1, 2.5);
                          spawnParticleInWorld("ender", [px, px + ry, pz], dim);
                          spawnParticleInWorld("ender", [px, px + ry / 2, pz], dim);
                          spawnParticleInWorld("ender", [px, px + ry / 3, pz], dim);
                          spawnParticleInWorld("ender", [px, px + ry, pz], dim);
                          spawnParticleInWorld("ender", [px, px + ry / 2, pz], dim);
                          spawnParticleInWorld("ender", [px, px + ry / 3, pz], dim);
                      }
                      if (lore.indexOf("血") != -1) {
                          let pComp = system.getComponent(target, "minecraft:position" /* Position */);
                          let px, py, pz;
                          px = pComp.data.x;
                          py = pComp.data.y;
                          pz = pComp.data.z;
                          spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 1, pz], dim);
                          spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 0.5, pz], dim);
                          spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 1.2, pz], dim);
                          if (possibility(0.35)) {
                              spawnParticleInWorld("blood", [px, py + 1, pz], dim);
                          }
                      }
                      if (lore.indexOf("duang") != -1) {
                          if (possibility(0.3)) {
                              let pComp = system.getComponent(target, "minecraft:position" /* Position */);
                              let px, py, pz;
                              px = pComp.data.x;
                              py = pComp.data.y;
                              pz = pComp.data.z;
                              spawnParticleInWorld("minecraft:critical_hit_emitter", [px, py + 2.5, pz], dim);
                              system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ playsound random.anvil_land @a ${px} ${py} ${pz} 1 1`, data => { });
                          }
                      }
                      if (lore.indexOf("斩击") != -1) {
                          if (possibility(0.5)) {
                              let pComp = system.getComponent(target, "minecraft:position" /* Position */);
                              let px, py, pz;
                              px = pComp.data.x;
                              py = pComp.data.y;
                              pz = pComp.data.z;
                              spawnParticleInWorld("minecraft:dragon_destroy_block", [px, py + 2, pz], dim);
                              spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 1, pz], dim);
                              spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 0.5, pz], dim);
                              spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 1.2, pz], dim);
                              spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 0.2, pz], dim);
                              spawnParticleInWorld("minecraft:falling_dust_dragon_egg_particle", [px, py + 1.5, pz], dim);
                              system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ playsound item.trident.throw @a ${px} ${py} ${pz} 1 1`, data => { });
                          }
                      }
                      if (lore.indexOf("七夕") != -1) {
                          let pComp = system.getComponent(target, "minecraft:position" /* Position */);
                          let px, py, pz;
                          px = pComp.data.x;
                          py = pComp.data.y;
                          pz = pComp.data.z;
                          let ry = randomNum(0, 2);
                          spawnParticleInWorld("hearth", [px, py, pz], dim);
                          spawnParticleInWorld("hearth", [px, py + 1, pz], dim);
                          spawnParticleInWorld("hearth", [px, py + 2, pz], dim);
                          spawnParticleInWorld("hearth", [px + ry, py + 1, pz + ry], dim);
                          spawnParticleInWorld("hearth", [px - ry, py + 1, pz - ry], dim);
                          spawnParticleInWorld("hearth", [px + ry, py + 1, pz - ry], dim);
                      }
                  }
              }
          }
      });
  }

  let playerQuery;
  let tick = 0;
  function equReg() {
      system.registerComponent("loreeffect:isplayer", {});
      playerQuery = system.registerQuery();
      system.addFilterToQuery(playerQuery, "loreeffect:isplayer");
      system.listenForEvent("minecraft:entity_created" /* EntityCreated */, data => {
          let entity = data.data.entity;
          if (entity.__identifier__ == "minecraft:player") {
              system.createComponent(entity, "loreeffect:isplayer");
          }
      });
  }
  system.update = function () {
      //获取玩家的装备栏 20tick一次?
      tick++;
      if (tick == 20) {
          tick = 0;
          let players = system.getEntitiesFromQuery(playerQuery);
          //server.log(`目前有玩家${players.length}`)
          for (let player of players) {
              if (player) {
                  if (system.hasComponent(player, "minecraft:armor_container")) {
                      let playerArmor = system.getComponent(player, "minecraft:armor_container");
                      // Get the players helmet
                      let lores = [];
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
                      let px, py, pz;
                      if (allLores.indexOf("低语") != -1) {
                          let comp = system.getComponent(player, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          spawnParticleInWorld("enchant-normal", [px, py + 0.6, pz], dim);
                          spawnParticleInWorld("enchant-normal", [px + 1, py + 0.8, pz + 1], dim);
                          spawnParticleInWorld("enchant-normal", [px + 0.5, py + 1, pz - 0.5], dim);
                          spawnParticleInWorld("enchant-normal", [px - 0.5, py + 1, pz + 0.5], dim);
                          spawnParticleInWorld("enchant-normal", [px - 1, py + 0.8, pz - 1], dim);
                          spawnParticleInWorld("enchant-normal", [px, py + 0.5, pz], dim);
                          let div = 0.5;
                          spawnParticleInWorld("minecraft:enchanting_table_particle", [px + div, py + 1, pz + div], dim);
                          spawnParticleInWorld("minecraft:enchanting_table_particle", [px - div, py + 1, pz - div], dim);
                          spawnParticleInWorld("minecraft:enchanting_table_particle", [px + div, py + 1, pz - div], dim);
                          spawnParticleInWorld("minecraft:enchanting_table_particle", [px - div, py + 1, pz - div], dim);
                      }
                      if (allLores.indexOf("末影之心") != -1) {
                          let comp = system.getComponent(player, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          let dif1 = 1, dif2 = 1;
                          spawnParticleInWorld("ender", [px, py + 1, pz], dim);
                          spawnParticleInWorld("ender", [px + dif1, py + 1, pz + dif1], dim);
                          spawnParticleInWorld("ender", [px - dif1, py + 1, pz - dif1], dim);
                          spawnParticleInWorld("ender", [px + dif1, py + 1, pz - dif1], dim);
                          spawnParticleInWorld("ender", [px - dif1, py + 1, pz - dif1], dim);
                          spawnParticleInWorld("ender", [px, py + 1, pz], dim);
                          spawnParticleInWorld("ender", [px + dif2, py + 0.6, pz + dif2], dim);
                          spawnParticleInWorld("ender", [px - dif2, py + 0.6, pz - dif2], dim);
                          spawnParticleInWorld("ender", [px + dif2, py + 0.6, pz - dif2], dim);
                          spawnParticleInWorld("ender", [px - dif2, py + 0.6, pz - dif2], dim);
                      }
                      if (allLores.indexOf("萤火虫") != -1) {
                          if (possibility(0.25)) {
                              let comp = system.getComponent(player, "minecraft:position" /* Position */);
                              px = comp.data.x;
                              py = comp.data.y;
                              pz = comp.data.z;
                              spawnParticleInWorld("totem-normal", [px, py + 1, pz], dim);
                          }
                      }
                      if (allLores.indexOf("村民之友") != -1) {
                          let comp = system.getComponent(player, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          let rd = randomNum(-1, 1);
                          spawnParticleInWorld("villager-happy", [px, py, pz], dim);
                          spawnParticleInWorld("villager-happy", [px, py + 0.2, pz], dim);
                          spawnParticleInWorld("villager-happy", [px, py + 0.3, pz], dim);
                          spawnParticleInWorld("villager-happy", [px, py + 2, pz], dim);
                          spawnParticleInWorld("hearth", [px - rd, py + 2.2, pz + rd], dim);
                          spawnParticleInWorld("hearth", [px + rd, py + 2.2, pz - rd], dim);
                          spawnParticleInWorld("hearth", [px - rd, py + 2.2, pz - rd], dim);
                          spawnParticleInWorld("hearth", [px + rd, py + 1.2, pz - rd], dim);
                          spawnParticleInWorld("hearth", [px - rd, py + 1.2, pz - rd], dim);
                          spawnParticleInWorld("hearth", [px + rd, py + 1.2, pz + rd], dim);
                      }
                      if (allLores.indexOf("村民之敌") != -1) {
                          let comp = system.getComponent(player, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                          spawnParticleInWorld("villager-angry", [px, py + 2.5, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + 2, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py + 2.5, pz], dim);
                      }
                      if (allLores.indexOf("着火") != -1) {
                          let comp = system.getComponent(player, "minecraft:position" /* Position */);
                          px = comp.data.x;
                          py = comp.data.y;
                          pz = comp.data.z;
                          //system.executeCommand(`particle villager-happy ${px} ${py} ${pz}`,data=>{});
                          spawnParticleInWorld("smoke", [px, py, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py - 0.1, pz], dim);
                          spawnParticleInWorld("lava_particle", [px, py, pz], dim);
                      }
                      if (allLores.indexOf("屠龙勇士") != -1) {
                          let pComp = system.getComponent(player, "minecraft:position" /* Position */);
                          let px, py, pz;
                          px = pComp.data.x;
                          py = pComp.data.y;
                          pz = pComp.data.z;
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py, pz], dim);
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py + 1.1, pz], dim);
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py + 1.2, pz], dim);
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py + 1.3, pz], dim);
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py + 1.4, pz], dim);
                          spawnParticleInWorld("minecraft:conduit_attack_emitter", [px, py + 1.5, pz], dim);
                          let div = Math.random();
                          spawnParticleInWorld("minecraft:basic_portal_particle", [px, py + 1.5, pz], dim);
                          spawnParticleInWorld("minecraft:basic_portal_particle", [px + div, py + 1.5, pz + div], dim);
                          spawnParticleInWorld("minecraft:basic_portal_particle", [px - div, py + 1.5, pz - div], dim);
                          spawnParticleInWorld("minecraft:basic_portal_particle", [px + div, py + 1.5, pz - div], dim);
                          spawnParticleInWorld("minecraft:basic_portal_particle", [px - div, py + 1.5, pz + div], dim);
                          if (possibility(0.1)) {
                              spawnParticleInWorld("minecraft:splash_spell_emitter", [px, py + 0.25, pz], dim);
                          }
                      }
                      if (allLores.indexOf("花瓣") != -1) {
                          let pComp = system.getComponent(player, "minecraft:position" /* Position */);
                          let px, py, pz;
                          px = pComp.data.x;
                          py = pComp.data.y;
                          pz = pComp.data.z;
                          if (possibility(0.1)) {
                              spawnParticleInWorld("spiral-pink-1", [px, py - 3.5, pz], dim);
                          }
                      }
                  }
              }
          }
      }
  };
  function getArmorLore(armor) {
      if (system.hasComponent(armor, "stone:lore" /* Lore */)) {
          let loreComp = system.getComponent(armor, "stone:lore" /* Lore */);
          //server.log(`装备有lore组件armorlore${loreComp.data}`);
          let lore = String(loreComp.data);
          return lore;
      }
      else {
          //server.log("装备没有lore组件")
          return "";
      }
  }

  system.initialize = function () {
      server.log("LoreEffect Loaded");
      attackReg();
      equReg();
  };

}());
