(function () {
  'use strict';

  var system;
  function utilsReg(sys) {
      system = sys;
  }
  function getName(entity) {
      return system.getComponent(entity, "minecraft:nameable" /* Nameable */).data.name;
  }
  function getPositionofEntity(entity) {
      var position;
      if (system.hasComponent(entity, "minecraft:position")) {
          var comp = system.getComponent(entity, "minecraft:position" /* Position */);
          position = transNum(comp.data.x) + " " + transNum(comp.data.y) + " " + transNum(comp.data.z);
      }
      else {
          position = "无法获得坐标";
      }
      return position;
  }
  function getDimensionOfEntity(entity) {
      var dimension;
      if (system.hasComponent(entity, "stone:dimension")) {
          var comp = system.getComponent(entity, "stone:dimension" /* Dimension */);
          dimension = comp.data;
      }
      else {
          dimension = "无法获得维度";
      }
      return dimension;
  }
  function transNum(num) {
      if (num >= 0) {
          num = Math.floor(num);
      }
      else {
          num = Math.floor(num);
      }
      return num;
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __makeTemplateObject(cooked, raw) {
      if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
      return cooked;
  }

  function fix(arr) {
      return arr
          .join("")
          .replace(/\(\n\s+/g, "(")
          .replace(/\n\s+\)/g, ")")
          .replace(/\s+/g, " ");
  }
  //创建一个储存warp坐标的表
  var CREATE_TABLE = fix(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  CREATE TABLE IF NOT EXISTS warp(\n    id,\n    name TEXT NOT NULL UNIQUE,\n    position TEXT NOT NULL,\n    owner TEXT NOT NULL\n  );"], ["\n  CREATE TABLE IF NOT EXISTS warp(\n    id,\n    name TEXT NOT NULL UNIQUE,\n    position TEXT NOT NULL,\n    owner TEXT NOT NULL\n  );"])));
  var INSERT_WARP = fix(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  INSERT INTO warp (\n    name, owner, position\n  ) values (\n    $name, $owner, $position\n  );"], ["\n  INSERT INTO warp (\n    name, owner, position\n  ) values (\n    $name, $owner, $position\n  );"])));
  var SELECT_WARP_BY_NAME = fix(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT * FROM warp WHERE name=$name;"], ["SELECT * FROM warp WHERE name=$name;"])));
  var SELECT_ALL_WARP = fix(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT * FROM warp;"], ["SELECT * FROM warp;"])));
  var SELECT_ALL_JAIL = fix(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT * FROM jails;"], ["SELECT * FROM jails;"])));
  var DELETE_WARP_BY_NAME = fix(templateObject_6 || (templateObject_6 = __makeTemplateObject(["DELETE FROM warp WHERE name=$name;"], ["DELETE FROM warp WHERE name=$name;"])));
  //---------------------------------------------------------------------------------
  //创建一个储存home信息的表
  var CREATE_HOME_TABLE = fix(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  CREATE TABLE IF NOT EXISTS homes(\n    id,\n    homeName TEXT NOT NULL,\n    position TEXT NOT NULL,\n    owner TEXT NOT NULL\n  );"], ["\n  CREATE TABLE IF NOT EXISTS homes(\n    id,\n    homeName TEXT NOT NULL,\n    position TEXT NOT NULL,\n    owner TEXT NOT NULL\n  );"])));
  //查找一个owner的所有home
  var SELECT_HOME_BY_OWNER = fix(templateObject_8 || (templateObject_8 = __makeTemplateObject(["SELECT * FROM homes WHERE owner=$owner;"], ["SELECT * FROM homes WHERE owner=$owner;"])));
  //根据owner和home名字查找  !注意 一个owner之下不要出现重名的home
  var SELECT_HOME_BY_NAME = fix(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT * FROM homes WHERE owner=$owner AND homeName=$homeName;"], ["SELECT * FROM homes WHERE owner=$owner AND homeName=$homeName;"])));
  //添加home记录
  var INSERT_HOME = fix(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n  INSERT INTO homes (\n    homeName, position, owner\n  ) values (\n    $homeName, $position, $owner\n  );"], ["\n  INSERT INTO homes (\n    homeName, position, owner\n  ) values (\n    $homeName, $position, $owner\n  );"])));
  //删除一个home
  var DELETE_HOME_BY_NAME = fix(templateObject_11 || (templateObject_11 = __makeTemplateObject(["DELETE FROM homes WHERE homeName=$homeName AND owner=$owner;"], ["DELETE FROM homes WHERE homeName=$homeName AND owner=$owner;"])));
  //----------------------------------------
  //创建一个记录死亡点的表
  var CREATE_DEATH_TABLE = fix(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\nCREATE TABLE IF NOT EXISTS death(\n  id,\n  player TEXT NOT NULL UNIQUE,\n  position TEXT NOT NULL\n);"], ["\nCREATE TABLE IF NOT EXISTS death(\n  id,\n  player TEXT NOT NULL UNIQUE,\n  position TEXT NOT NULL\n);"])));
  //添加死亡记录
  var INSERT_DEATH = fix(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n  INSERT INTO death (\n    player, position\n  ) values (\n    $player, $position\n  );"], ["\n  INSERT INTO death (\n    player, position\n  ) values (\n    $player, $position\n  );"])));
  //删除死亡记录 （添加前或者传送后）
  var DELETE_DEATH = fix(templateObject_14 || (templateObject_14 = __makeTemplateObject(["DELETE FROM death WHERE player=$player;"], ["DELETE FROM death WHERE player=$player;"])));
  //获得死亡记录
  var SELECT_DEATH = fix(templateObject_15 || (templateObject_15 = __makeTemplateObject(["SELECT * FROM death WHERE player=$player;"], ["SELECT * FROM death WHERE player=$player;"])));
  //------------------------------------------
  //双人有时限命令 例如/tpa等
  var CREATE_COMMAND_TABLE = fix(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\nCREATE TABLE IF NOT EXISTS command(\n  id,\n  command TEXT NOT NULL,\n  source TEXT NOT NULL,\n  target TEXT NOT NULL,\n  timestamp BIGINT NOT NULL,\n  message TEXT\n);"], ["\nCREATE TABLE IF NOT EXISTS command(\n  id,\n  command TEXT NOT NULL,\n  source TEXT NOT NULL,\n  target TEXT NOT NULL,\n  timestamp BIGINT NOT NULL,\n  message TEXT\n);"])));
  var INSERT_COMMAND = fix(templateObject_17 || (templateObject_17 = __makeTemplateObject(["\nINSERT INTO command (\n  command, source, target, timestamp\n) values (\n  $command, $source, $target, $timestamp\n);\n"], ["\nINSERT INTO command (\n  command, source, target, timestamp\n) values (\n  $command, $source, $target, $timestamp\n);\n"])));
  //拒绝后删除请求
  var DELETE_COMMAND_DENY = fix(templateObject_18 || (templateObject_18 = __makeTemplateObject(["\nDELETE FROM command WHERE command=$command AND source=$source AND target=$target;\n"], ["\nDELETE FROM command WHERE command=$command AND source=$source AND target=$target;\n"])));
  //同意后删除请求
  var DELETE_COMMAND_ACEP = fix(templateObject_19 || (templateObject_19 = __makeTemplateObject(["\nDELETE FROM command WHERE command=$command AND source=$source AND target=$target;\n"], ["\nDELETE FROM command WHERE command=$command AND source=$source AND target=$target;\n"])));
  //删除过期请求
  var DELETE_OUTDATED_COMMAND = fix(templateObject_20 || (templateObject_20 = __makeTemplateObject(["DELETE FROM command WHERE timestamp<$endTime AND command=$command;"], ["DELETE FROM command WHERE timestamp<$endTime AND command=$command;"])));
  //查询命令请求
  var GET_REQ = fix(templateObject_21 || (templateObject_21 = __makeTemplateObject(["SELECT * FROM command WHERE command=$command AND target=$target;"], ["SELECT * FROM command WHERE command=$command AND target=$target;"])));
  //------------------------------------------
  var db = new SQLite3("ess.db");
  db.exec(CREATE_TABLE);
  db.exec(CREATE_HOME_TABLE);
  db.exec(CREATE_DEATH_TABLE);
  db.exec(CREATE_COMMAND_TABLE);
  var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21;

  //玩家的back 返回死亡地点
  var system$1;
  function backReg(sys) {
      system$1 = sys;
      server.log("back模块已加载");
      system$1.listenForEvent("minecraft:entity_death", onEntityDeath);
      system$1.registerCommand("back", {
          description: "返回死亡地点",
          permission: 0,
          overloads: [
              {
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "Can only be used by player";
                      var entity = this.entity;
                      if (getDimensionOfEntity(entity) != 0)
                          throw "目前只支持主世界使用/back";
                      var $player = this.name;
                      var data = Array.from(db.query(SELECT_DEATH, { $player: $player }));
                      if (data.length == 0)
                          throw "你还没有记录的死亡点哦";
                      var position = data[0].position;
                      var pos = getPositionofEntity(entity);
                      system$1.executeCommand("playsound mob.endermen.portal @a " + pos + " 1 0.8", function (data) { });
                      system$1.executeCommand("tp @a[name=\"" + $player + "\"] " + position, function (data) { });
                      system$1.executeCommand("playsound mob.endermen.portal @a " + position + " 1 0.8", function (data) { });
                      db.update(DELETE_DEATH, { $player: $player });
                      return "\u00A7e\u5DF2\u4F20\u9001\u81F3\u4E0A\u4E00\u6B7B\u4EA1\u70B9";
                  }
              }
          ]
      });
  }
  function onEntityDeath(eventData) {
      var entity = eventData.data.entity;
      //如果死亡的实体是玩家
      if (entity.__identifier__ == "minecraft:player") {
          //拥有坐标组件
          if (system$1.hasComponent(entity, "minecraft:position" /* Position */)) {
              var $position = getPositionofEntity(entity);
              var $player = getName(entity);
              var result = db.update(DELETE_DEATH, { $player: $player });
              db.update(INSERT_DEATH, {
                  $player: $player,
                  $position: $position
              });
              server.log("\u73A9\u5BB6" + $player + "\u7684\u6B7B\u4EA1\u70B9" + $position + "\u5DF2\u7ECF\u8BB0\u5F55");
              //system.executeCommand(`tell @a[name=${$player}] §a死了?不用担心，输入/back返回死亡点`,data=>{});
              if (getDimensionOfEntity(entity) == 0) {
                  system$1.sendText(entity, "§a死了?不用担心，输入/back返回死亡点");
                  //system.executeCommand(`tellraw @a[name=${$player}] {"rawtext":[{"text":"§a死了?不用担心，输入/back返回死亡点"}]}`,data=>{});
              }
              else {
                  system$1.sendText(entity, "\u00A7c\u4F60\u6B7B\u5728\u4E3B\u4E16\u754C\u4E4B\u5916\u4E86\uFF0C\u65E0\u6CD5/back\u4E86 position:(" + $position + ")");
                  //system.executeCommand(`tellraw @a[name=${$player}] {"rawtext":[{"text":"§c你死在主世界之外了，无法/back了 position:(${$position})"}]}`,data=>{});
              }
          }
      }
  }

  //warp 设置传送点系列
  var system$2;
  function warpReg(sys) {
      system$2 = sys;
      server.log("warp模块已加载");
      //设置传送点 op命令
      system$2.registerCommand("setwarp", {
          description: "设置传送点",
          permission: 1,
          overloads: [{
                  parameters: [{
                          name: "name",
                          type: "string"
                      }],
                  handler: function (_a) {
                      var $name = _a[0];
                      var entity = this.entity;
                      if (!entity)
                          throw "Designed for player usage";
                      if (getDimensionOfEntity(entity) != 0)
                          throw "目前只支持在主世界设置传送点";
                      var comp = system$2.getComponent(entity, "minecraft:position" /* Position */);
                      var $position = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
                      var $owner = getName(entity);
                      //先判断能否写入
                      var datas = Array.from(db.query(SELECT_WARP_BY_NAME, { $name: $name }));
                      if (datas.length != 0)
                          throw "已有同名传送点";
                      db.update(INSERT_WARP, {
                          $name: $name,
                          $owner: $owner,
                          $position: $position
                      });
                      return "\u00A7a\u5DF2\u521B\u5EFA\u4F20\u9001\u70B9" + $name + " (" + $position + ")";
                  }
              }]
      });
      //删除传送点 op命令
      system$2.registerCommand("delwarp", {
          description: "删除传送点",
          permission: 1,
          overloads: [{
                  parameters: [{
                          name: "name",
                          type: "string"
                      }],
                  handler: function (_a) {
                      var $name = _a[0];
                      var entity = this.entity;
                      if (!entity)
                          throw "Designed for player usage";
                      //先判断能否删除
                      var datas = Array.from(db.query(SELECT_WARP_BY_NAME, { $name: $name }));
                      if (datas.length == 0)
                          throw "没有该传送点";
                      var $position = datas[0].position;
                      var name = getName(entity);
                      db.update(DELETE_WARP_BY_NAME, {
                          $name: $name
                      });
                      system$2.executeCommand("tellraw @a[name=\"" + name + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u5DF2\u5220\u9664\u4F20\u9001\u70B9" + $name + " (" + name + ")\"}]}", function (data) { });
                  }
              }]
      });
      //传送至传送点
      system$2.registerCommand("warp", {
          description: "传送至传送点",
          permission: 0,
          overloads: [{
                  parameters: [{
                          name: "name",
                          type: "string"
                      }],
                  handler: function (_a) {
                      var $name = _a[0];
                      var entity = this.entity;
                      if (!entity)
                          throw "Designed for player usage";
                      if (getDimensionOfEntity(entity) != 0)
                          throw "目前只支持主世界使用";
                      var datas = Array.from(db.query(SELECT_WARP_BY_NAME, { $name: $name }));
                      if (datas.length != 1)
                          throw "无效的传送点";
                      var position = datas[0].position;
                      var owner = datas[0].owner;
                      var name = getName(entity);
                      system$2.executeCommand("playsound mob.endermen.portal @a " + position + " 1 0.8", function (data) { });
                      system$2.executeCommand("tp @a[name=\"" + name + "\"] " + position, function (data) { });
                      system$2.executeCommand("playsound mob.endermen.portal @a " + position + " 1 0.8", function (data) { });
                      return "§a已为你传送";
                  }
              }]
      });
      system$2.registerCommand("warps", {
          description: "显示所有传送点",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      var entity = this.entity;
                      if (!entity)
                          throw "Designed for player usage";
                      var datas = Array.from(db.query(SELECT_ALL_WARP, {}));
                      var show = "";
                      for (var index in datas) {
                          var data = datas[index];
                          show += "\u00A7e<" + index + ">.\u00A7r\u00A7a" + data.name + ":(" + data.position + ")  \u00A73\u521B\u5EFA\u8005:" + data.owner + "\u00A7r\n";
                      }
                      var name = getName(entity);
                      return show;
                  }
              }
          ]
      });
  }

  //warp 设置家系列
  var system$3;
  var maxhome = 3; //最多设置多少个家
  function homeReg(sys) {
      system$3 = sys;
      //让玩家可以设置多个home
      server.log("home模块已加载");
      system$3.registerCommand("sethome", {
          description: "在当前坐标设置家",
          permission: 0,
          overloads: [{
                  parameters: [{
                          name: "home的名字",
                          type: "string"
                      }],
                  handler: function (_a) {
                      var $homeName = _a[0];
                      if (!this.entity)
                          throw "只有玩家玩家可以设置home";
                      var entity = this.entity;
                      if (getDimensionOfEntity(entity) != 0)
                          throw "目前只支持主世界设置家";
                      //判断是否可以写入数据库 
                      //先选出所有记录
                      var $owner = this.name;
                      var datas = Array.from(db.query(SELECT_HOME_BY_OWNER, { $owner: $owner }));
                      //在这里设置玩家家的上限 
                      if (datas.length < maxhome) {
                          //server.log("数量符合要求" + datas.length);
                          //判断是否有重名的home
                          for (var _i = 0, datas_1 = datas; _i < datas_1.length; _i++) {
                              var data = datas_1[_i];
                              if (data.homeName == $homeName) {
                                  throw "已经设置过同名的home";
                              }
                          }
                          var $position = getPositionofEntity(entity);
                          //可以执行添加
                          db.update(INSERT_HOME, { $homeName: $homeName, $position: $position, $owner: $owner });
                          //this.invokeConsoleCommand("home",`tell "${$owner}" 已为你设置名为${$homeName}的家`);
                          return "\u00A7a\u5DF2\u4E3A\u4F60\u8BBE\u7F6E\u540D\u4E3A" + $homeName + "\u7684\u5BB6";
                      }
                      else {
                          throw "设置的home数量超过上限";
                      }
                  }
              }]
      });
      //让玩家可以设置多个home
      system$3.registerCommand("homes", {
          description: "查看所有已设置的家",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function (_a) {
                      if (!this.entity)
                          throw "只有玩家玩家可以查看home";
                      var entity = this.entity;
                      //先选出所有记录
                      var $owner = this.name;
                      var datas = Array.from(db.query(SELECT_HOME_BY_OWNER, { $owner: $owner }));
                      //在这里设置玩家家的上限 
                      if (datas.length == 0)
                          throw "你还没有设置家哟";
                      var say = "\u00A79\u00A7l\u4E0B\u9762\u4E3A\u4F60\u5DF2\u8BBE\u7F6E\u7684\u5BB6:\u00A7r\n";
                      for (var index in datas) {
                          say += "\u00A7a<" + (Number(index) + 1) + ">.home:" + datas[index].homeName + " position: " + datas[index].position + "\n";
                      }
                      return say;
                  }
              }]
      });
      //删除已设置的home
      system$3.registerCommand("delhome", {
          description: "删除已经设置的家",
          permission: 0,
          overloads: [{
                  parameters: [{
                          name: "home的名字",
                          type: "string"
                      }],
                  handler: function (_a) {
                      var $homeName = _a[0];
                      if (!this.entity)
                          throw "只有玩家玩家可以删除home";
                      var entity = this.entity;
                      //判断是否可以删除 
                      var $owner = this.name;
                      var datas = Array.from(db.query(SELECT_HOME_BY_OWNER, { $owner: $owner }));
                      //在这里设置玩家家的上限 
                      if (datas.length != 0) {
                          //记录是否删除
                          var flag = false;
                          //判断是否有重名的home
                          for (var _i = 0, datas_2 = datas; _i < datas_2.length; _i++) {
                              var data = datas_2[_i];
                              if (data.homeName == $homeName) {
                                  //可以执行删除
                                  db.update(DELETE_HOME_BY_NAME, { $homeName: $homeName, $owner: $owner });
                                  flag = true;
                              }
                          }
                          if (flag) {
                              return "\u5DF2\u5220\u9664" + $homeName;
                          }
                          else {
                              return "\u00A7c\u5220\u9664" + $homeName + "\u5931\u8D25";
                          }
                      }
                      else {
                          throw "home数量为0";
                      }
                  }
              }]
      });
      system$3.registerCommand("home", {
          description: "传送至已设置的家",
          permission: 0,
          overloads: [{
                  parameters: [{
                          name: "home的名字",
                          type: "string",
                          optional: true
                      }],
                  handler: function (_a) {
                      var $homeName = _a[0];
                      if (!this.entity)
                          throw "只有玩家玩家可以使用/home";
                      var entity = this.entity;
                      if (getDimensionOfEntity(entity) != 0)
                          throw "目前只支持主世界回家";
                      //先选出所有记录
                      var $owner = this.name;
                      var datas = Array.from(db.query(SELECT_HOME_BY_OWNER, { $owner: $owner }));
                      //在这里设置玩家家的上限 
                      if (datas.length != 0) {
                          if ($homeName == "") {
                              system$3.executeCommand("tp @a[name=\"" + $owner + "\"] " + datas[0].position, function (data) { });
                              system$3.executeCommand("playsound mob.endermen.portal @a " + datas[0].position + " 1 1", function (data) { });
                              return "\u00A7a\u5DF2\u4F20\u9001\u81F3" + datas[0].homeName;
                          }
                          else {
                              //判断是否有重名的home
                              var flag = false;
                              for (var _i = 0, datas_3 = datas; _i < datas_3.length; _i++) {
                                  var data = datas_3[_i];
                                  if (data.homeName == $homeName) {
                                      //可以执行传送
                                      system$3.executeCommand("tp @a[name=\"" + $owner + "\"] " + data.position, function (data) { });
                                      system$3.executeCommand("playsound mob.endermen.portal @a " + data.position + " 1 1", function (data) { });
                                      flag = true;
                                      return "\u00A7a\u5DF2\u4F20\u9001\u81F3" + data.homeName;
                                  }
                              }
                              if (flag == false)
                                  return "未找到该home";
                          }
                      }
                      else {
                          throw "你还没有设置家哟~";
                      }
                  }
              }]
      });
  }

  //tpa等指令
  var system$4;
  var tpOutTime = 60; //tpa的有效时间 /s
  function tpReg(sys) {
      system$4 = sys;
      server.log("tp模块已加载");
      system$4.registerCommand("tpa", {
          description: "向玩家发送传送请求",
          permission: 0,
          overloads: [{
                  parameters: [
                      {
                          type: "player",
                          name: "目标玩家"
                      }
                  ],
                  handler: function (_a) {
                      var arr = _a[0];
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      if (arr.length != 1)
                          throw "\u4E00\u6B21\u53EA\u80FD\u5411\u4E00\u4E2A\u73A9\u5BB6\u53D1\u9001\u4F20\u9001\u8BF7\u6C42\u54E6";
                      var sourceEntity = this.entity;
                      var targetEntity = arr[0];
                      //先删除数据库中过期的请求
                      var $command = 'tpa';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $source = this.name;
                      var $target = getName(targetEntity);
                      var $timestamp = new Date().getTime();
                      db.update(INSERT_COMMAND, {
                          $command: $command,
                          $source: $source,
                          $target: $target,
                          $timestamp: $timestamp
                      });
                      system$4.executeCommand("tellraw @a[name=\"" + $source + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u5DF2\u5411\u73A9\u5BB6" + $target + "\u53D1\u9001\u4F20\u9001\u8BF7\u6C42\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + $target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u73A9\u5BB6" + $source + "\u60F3\u8981\u4F20\u9001\u5230\u4F60\u8FD9\u91CC,\u8F93\u5165/tpac\u63A5\u53D7\u4F20\u9001,/tpad\u62D2\u7EDD\u4F20\u9001,\u6709\u6548\u671F" + tpOutTime + "\u79D2\"}]}", function (data) { });
                  }
              }]
      });
      system$4.registerCommand("tpah", {
          description: "向玩家发送传送邀请",
          permission: 0,
          overloads: [{
                  parameters: [
                      {
                          type: "player",
                          name: "目标玩家"
                      }
                  ],
                  handler: function (_a) {
                      var arr = _a[0];
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      if (arr.length != 1)
                          throw "\u4E00\u6B21\u53EA\u80FD\u5411\u4E00\u4E2A\u73A9\u5BB6\u53D1\u9001\u4F20\u9001\u9080\u8BF7\u54E6";
                      var sourceEntity = this.entity;
                      var targetEntity = arr[0];
                      //先删除数据库中过期的请求
                      var $command = 'tpah';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $source = this.name;
                      var $target = getName(targetEntity);
                      var $timestamp = new Date().getTime();
                      db.update(INSERT_COMMAND, {
                          $command: $command,
                          $source: $source,
                          $target: $target,
                          $timestamp: $timestamp
                      });
                      system$4.executeCommand("tellraw @a[name=\"" + $source + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u5DF2\u5411\u73A9\u5BB6" + $target + "\u53D1\u9001\u4F20\u9001\u9080\u8BF7\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + $target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u73A9\u5BB6" + $source + "\u9080\u8BF7\u4F60\u4F20\u9001\u5230ta\u90A3\u91CC,\u8F93\u5165/tpahc\u63A5\u53D7\u9080\u8BF7,/tpahd\u62D2\u7EDD\u9080\u8BF7,\u6709\u6548\u671F" + tpOutTime + "\u79D2\"}]}", function (data) { });
                  }
              }]
      });
      system$4.registerCommand("tpac", {
          description: "接受玩家的传送请求",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      var sourceEntity = this.entity;
                      //先删除数据库中过期的请求
                      var $command = 'tpa';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $target = this.name;
                      var datas = Array.from(db.query(GET_REQ, {
                          $command: $command,
                          $target: $target
                      }));
                      if (datas.length == 0)
                          throw "还没有人向你发起传送请求哦";
                      //只传送最早的那个请求
                      var data = datas[0];
                      var pos = getPositionofEntity(this.entity);
                      system$4.executeCommand("playsound mob.endermen.portal @a " + pos + " 1 1", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + data.source + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u73A9\u5BB6" + $target + "\u63A5\u53D7\u4E86\u4F60\u7684\u4F20\u9001\u8BF7\u6C42\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + $target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u63A5\u53D7\u4E86" + data.source + "\u7684\u4F20\u9001\u8BF7\u6C42\"}]}", function (data) { });
                      system$4.executeCommand("tp @a[name=\"" + data.source + "\"] @a[name=\"" + $target + "\"]", function (data) { });
                      pos = getPositionofEntity(this.entity);
                      system$4.executeCommand("playsound mob.endermen.portal @a " + pos + " 1 1", function (data) { });
                      var $source = data.source;
                      delNum = db.update(DELETE_COMMAND_DENY, {
                          $command: $command,
                          $source: $source,
                          $target: $target
                      });
                  }
              }]
      });
      system$4.registerCommand("tpad", {
          description: "拒绝玩家的传送请求",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      var sourceEntity = this.entity;
                      //先删除数据库中过期的请求
                      var $command = 'tpa';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $target = this.name;
                      var datas = Array.from(db.query(GET_REQ, {
                          $command: $command,
                          $target: $target
                      }));
                      if (datas.length == 0)
                          throw "还没有人向你发起传送请求哦";
                      //只拒绝最早的那个请求
                      var data = datas[0];
                      system$4.executeCommand("tellraw @a[name=\"" + data.source + "\"] {\"rawtext\":[{\"text\":\"\u00A7c\u73A9\u5BB6" + $target + "\u62D2\u7EDD\u4E86\u4F60\u7684\u4F20\u9001\u8BF7\u6C42\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + $target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u62D2\u7EDD\u4E86" + data.source + "\u7684\u4F20\u9001\u8BF7\u6C42\"}]}", function (data) { });
                      var $source = data.source;
                      delNum = db.update(DELETE_COMMAND_DENY, {
                          $command: $command,
                          $source: $source,
                          $target: $target
                      });
                  }
              }]
      });
      system$4.registerCommand("tpahc", {
          description: "接受玩家的传送邀请",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      var sourceEntity = this.entity;
                      //先删除数据库中过期的请求
                      var $command = 'tpah';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $target = this.name;
                      var datas = Array.from(db.query(GET_REQ, {
                          $command: $command,
                          $target: $target
                      }));
                      if (datas.length == 0)
                          throw "还没有人向你发起传送邀请哦";
                      //只传送最早的那个请求
                      var data = datas[0];
                      var pos = getPositionofEntity(this.entity);
                      system$4.executeCommand("playsound mob.endermen.portal @a " + pos + " 1 0.8", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + data.source + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u73A9\u5BB6" + $target + "\u63A5\u53D7\u4E86\u4F60\u7684\u4F20\u9001\u9080\u8BF7\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + $target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u63A5\u53D7\u4E86" + data.source + "\u7684\u4F20\u9001\u9080\u8BF7\"}]}", function (data) { });
                      system$4.executeCommand("tp @a[name=\"" + data.target + "\"] @a[name=\"" + data.source + "\"]", function (data) { });
                      pos = getPositionofEntity(this.entity);
                      system$4.executeCommand("playsound mob.endermen.portal @a " + pos + " 1 1", function (data) { });
                      //传送后删除
                      var $source = data.source;
                      delNum = db.update(DELETE_COMMAND_DENY, {
                          $command: $command,
                          $source: $source,
                          $target: $target
                      });
                  }
              }]
      });
      system$4.registerCommand("tpahd", {
          description: "拒绝玩家的传送请求",
          permission: 0,
          overloads: [{
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      var sourceEntity = this.entity;
                      //先删除数据库中过期的请求
                      var $command = 'tpah';
                      var date = new Date();
                      var $endTime = date.getTime() - tpOutTime * 1000;
                      var delNum = db.update(DELETE_OUTDATED_COMMAND, {
                          $command: $command,
                          $endTime: $endTime
                      });
                      var $target = this.name;
                      var datas = Array.from(db.query(GET_REQ, {
                          $command: $command,
                          $target: $target
                      }));
                      if (datas.length == 0)
                          throw "还没有人向你发起传送邀请哦";
                      //只拒绝最早的那个请求
                      var data = datas[0];
                      system$4.executeCommand("tellraw @a[name=\"" + data.source + "\"] {\"rawtext\":[{\"text\":\"\u00A7c\u73A9\u5BB6" + $target + "\u62D2\u7EDD\u4E86\u4F60\u7684\u4F20\u9001\u9080\u8BF7\"}]}", function (data) { });
                      system$4.executeCommand("tellraw @a[name=\"" + data.target + "\"] {\"rawtext\":[{\"text\":\"\u00A7a\u62D2\u7EDD\u4E86" + data.source + "\u7684\u4F20\u9001\u9080\u8BF7\"}]}", function (data) { });
                      var $source = data.source;
                      delNum = db.update(DELETE_COMMAND_DENY, {
                          $command: $command,
                          $source: $source,
                          $target: $target
                      });
                  }
              }]
      });
  }

  var system$5 = server.registerSystem(0, 0);

  //简易创世神
  var selectTool = "minecraft:wooden_axe";
  var pointMap = new Map();
  function buildToolsReg() {
      //system = sys;
      //选点
      system$5.listenForEvent("minecraft:block_interacted_with", function (data) {
          var player = data.data.player;
          if (player) {
              var hand = system$5.getComponent(player, "minecraft:hand_container" /* HandContainer */);
              var item = hand.data[0];
              var itemName = item.__identifier__;
              if (itemName == selectTool) {
                  var playerName = getName(player);
                  var blockPos = data.data.block_position;
                  //选取两点后应在数据库中进行检查
                  if (pointMap.has(playerName)) {
                      var sp = pointMap.get(playerName);
                      //之前选过领地的点
                      if (sp.ex == 0 && sp.ey == 0) {
                          //第二个点还未选取的时候
                          var dim = getDimensionOfEntity(player);
                          if (dim != sp.sdim) {
                              system$5.sendText(player, "无法建立选区，跨维度选取是不行滴");
                              pointMap.delete(playerName);
                          }
                          sp.ex = blockPos.x;
                          sp.ey = blockPos.y;
                          sp.ez = blockPos.z;
                          var divX = Math.abs(sp.ex - sp.sx) + 1;
                          var divY = Math.abs(sp.ey - sp.sy) + 1;
                          var divZ = Math.abs(sp.ez - sp.sz) + 1;
                          var size = divX * divY * divZ;
                          sp.size = divX * divY * divZ;
                          system$5.sendText(player, "\u5EFA\u7B51\u5DE5:\u4F60\u5DF2\u7ECF\u9009\u53D6\u4E86(" + sp.sx + "," + sp.sy + "," + sp.sz + ") \u81F3 (" + sp.ex + "," + sp.ey + "," + sp.ez + ") \u4F53\u79EF\u4E3A:" + size + "\u7684\u533A\u57DF\n\u8F93\u5165\u00A7e/bfill\u00A7r\u586B\u5145\u65B9\u5757");
                      }
                      else {
                          //选取第三个点的时候删除之前的选区
                          pointMap.delete(playerName);
                          system$5.sendText(player, "\u5220\u9664\u4E4B\u524D\u7684\u9009\u533A");
                      }
                  }
                  else {
                      //第一次设点
                      var dim = getDimensionOfEntity(player);
                      var sp = {
                          sdim: "",
                          sx: 0,
                          sy: 0,
                          sz: 0,
                          ex: 0,
                          ey: 0,
                          ez: 0,
                          size: 0
                      };
                      sp.sdim = dim;
                      sp.sx = blockPos.x;
                      //暂时y方向全部计入领地
                      sp.sy = blockPos.y;
                      sp.sz = blockPos.z;
                      pointMap.set(playerName, sp);
                      system$5.sendText(player, "\u5EFA\u7B51\u5DE5: \u4F60\u5DF2\u9009\u53D6\u7B2C\u4E00\u70B9\uFF08" + sp.sx + "," + sp.sy + "," + sp.sz + ")");
                  }
              }
          }
      });
      system$5.registerCommand("bfill", {
          description: "填充工具",
          permission: 1,
          overloads: [{
                  parameters: [
                      {
                          type: "block",
                          name: "方块"
                      },
                      {
                          type: "int",
                          name: "数据值"
                      },
                      {
                          type: "string",
                          name: "模式",
                          optional: true
                      }
                  ],
                  handler: function (_a) {
                      var block = _a[0], data = _a[1], mode = _a[2];
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u73A9\u5BB6\u4E13\u7528\u547D\u4EE4";
                      var playerName = getName(this.entity);
                      if (!pointMap.has(playerName))
                          throw "你还没有选点哦,使用木斧选点";
                      var sp = pointMap.get(playerName);
                      if (sp.size == 0)
                          throw "你只选了一个点";
                      block = block.split(":")[1];
                      if (mode == "") {
                          system$5.executeCommand("execute @a[name=\"" + playerName + "\"] ~~~ fill " + sp.sx + " " + sp.sy + " " + sp.sz + " " + sp.ex + " " + sp.ey + " " + sp.ez + " " + block + " " + data, function (data) { });
                      }
                      else {
                          system$5.executeCommand("execute @a[name=\"" + playerName + "\"] ~~~ fill " + sp.sx + " " + sp.sy + " " + sp.sz + " " + sp.ex + " " + sp.ey + " " + sp.ez + " " + block + " " + data + " " + mode, function (data) { });
                      }
                      pointMap.delete(playerName);
                      system$5.sendText(this.entity, "\u6210\u529F\u6267\u884Cbfill");
                  }
              }]
      });
  }

  //一些小指令
  var system$6;
  var testBlockNum = 50; //使用top指令的时候向上检测的方块数量
  function toolReg(sys) {
      system$6 = sys;
      server.log("tools模块加载");
      system$6.registerCommand("suicide", {
          description: "自杀",
          permission: 0,
          overloads: [
              {
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "Can only be used by player";
                      system$6.executeCommand("execute @a[name=\"" + this.name + "\"] ~ ~ ~ me \u81EA\u6740\u4E86", function (data) { });
                      system$6.executeCommand("kill @a[name=\"" + this.name + "\"]", function (data) { });
                  }
              }
          ]
      });
      system$6.registerCommand("stepping", {
          description: "在脚底下生成垫脚石",
          permission: 1,
          overloads: [
              {
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "Can only be used by player";
                      system$6.executeCommand("execute @a[name=\"" + this.name + "\"] ~ ~ ~ fill ~ ~-1 ~ ~ ~-1 ~ dirt 0 replace", function (data) { });
                  }
              }
          ]
      });
      system$6.registerCommand("top", {
          description: "上升至顶部",
          permission: 1,
          overloads: [
              {
                  parameters: [],
                  handler: function () {
                      if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                          throw "\u53EA\u6709\u73A9\u5BB6\u53EF\u4EE5\u4F7F\u7528";
                      var tickAreaCmp = system$6.getComponent(this.entity, "minecraft:tick_world" /* TickWorld */);
                      var tickingArea = tickAreaCmp.data.ticking_area;
                      var posCmp = system$6.getComponent(this.entity, "minecraft:position" /* Position */);
                      var x = Math.floor(parseInt(posCmp.data.x));
                      var y = Math.floor(parseInt(posCmp.data.y)) + 1;
                      var z = Math.floor(parseInt(posCmp.data.z));
                      system$6.sendText(this.entity, "\u5F53\u524D\u5750\u6807(" + x + "," + y + "," + z + ")");
                      for (var i = 1; i < testBlockNum; i++) {
                          var curBlock = system$6.getBlock(tickingArea, x, y + i, z).__identifier__;
                          var nextBlock = system$6.getBlock(tickingArea, x, y + i + 1, z).__identifier__;
                          if (curBlock != "minecraft:air" && nextBlock == "minecraft:air") {
                              system$6.sendText(this.entity, "\u5DF2\u627E\u5230\u843D\u811A\u70B9" + x + " " + (y + i + 1) + " " + z);
                              system$6.executeCommand("tp @a[name=\"" + this.name + "\"] " + x + " " + (y + i + 1) + " " + z, function (data) { });
                              system$6.executeCommand("playsound mob.endermen.portal @a " + x + " " + (y + i + 1) + " " + z + " 1 1.2", function (data) { });
                              i = testBlockNum + 1;
                          }
                          if (i == testBlockNum - 1) {
                              throw "\u5411\u4E0A" + testBlockNum + "\u683C\u672A\u627E\u5230\u53EF\u843D\u811A\u7684\u5730\u65B9";
                          }
                      }
                  }
              }
          ]
      });
      //示例代码 setlore
      system$6.registerCommand("vanish", {
          description: "隐形",
          permission: 1,
          overloads: [
              {
                  parameters: [
                      {
                          type: "string",
                          name: "on/off"
                      }
                  ],
                  handler: function (_a) {
                      var str = _a[0];
                      if (!this.entity)
                          throw "\u53EA\u6709\u5B9E\u4F53\u53EF\u4EE5\u4F7F\u7528";
                      if (str == "on") {
                          system$6.executeCommand("effect @a[name=\"" + this.name + "\"] invisibility 1000000 1 true", function (data) { });
                          return "开启隐形";
                      }
                      else {
                          system$6.executeCommand("effect @a[name=\"" + this.name + "\"] clear", function (data) { });
                          return "关闭隐形";
                      }
                  }
              }
          ]
      });
      system$6.registerCommand("shock", {
          description: "雷劈",
          permission: 1,
          overloads: [
              {
                  parameters: [
                      {
                          type: "player",
                          name: "玩家"
                      }
                  ],
                  handler: function (_a) {
                      var players = _a[0];
                      for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
                          var player = players_1[_i];
                          var name = getName(player);
                          system$6.executeCommand("execute @a[name=\"" + name + "\"] ~ ~ ~ summon lightning_bolt ~ ~ ~", function (data) { });
                          system$6.executeCommand("execute @a[name=\"" + name + "\"] ~ ~ ~ me \u00A7b\u88AB\u96F7\u5288\u4E86\u00A7r", function (data) { });
                      }
                  }
              }
          ]
      });
      //示例代码 setlore
      system$6.registerCommand("setlore", {
          description: "为当前物品设置lore标签",
          permission: 1,
          overloads: [
              {
                  parameters: [
                      {
                          type: "string",
                          name: "lore"
                      }
                  ],
                  handler: function (_a) {
                      var str = _a[0];
                      if (!this.entity || !system$6.hasComponent(this.entity, "minecraft:hand_container" /* HandContainer */))
                          throw "\u53EA\u6709\u624B\u4E0A\u80FD\u62FF\u7269\u54C1\u7684\u5B9E\u4F53\u53EF\u4EE5\u4F7F\u7528";
                      var hand = system$6.getComponent(this.entity, "minecraft:hand_container" /* HandContainer */);
                      var item = hand.data[0];
                      var old = system$6.getComponent(item, "stone:lore" /* Lore */);
                      old.data = [str];
                      system$6.applyComponentChanges(item, old);
                      return "成功设置";
                  }
              }
          ]
      });
  }

  system$5.initialize = function () {
      server.log("EasyEssentials 2.0 created by haojie06 loaded");
      system$5.listenForEvent("minecraft:entity_created", onPlayerCreated);
      utilsReg(system$5);
      backReg(system$5);
      warpReg(system$5);
      homeReg(system$5);
      tpReg(system$5);
      toolReg(system$5);
      buildToolsReg();
  };
  function onPlayerCreated(data) {
      var entity = data.data.entity;
      if (!entity)
          throw "not entity";
      if (entity.__identifier__ == "minecraft:player") {
          server.log("玩家加入游戏");
          //let ecmp = system.getComponent(entity,MinecraftComponent.ExtraData);
          //server.log(ecmp.data.value.Variant.toString());
          //let name = getName(entity);
          //let out = ecmp.data.toString();
          //system.executeCommand(`tell @a[name=${name}] §e服务器已使用EasyEssentials 2.0`,(data)=>{});
      }
  }

}());
