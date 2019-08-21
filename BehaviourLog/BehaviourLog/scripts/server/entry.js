(function () {
    'use strict';

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

    //关于数据库的文件
    function fix(arr) {
        return arr
            .join("")
            .replace(/\(\n\s+/g, "(")
            .replace(/\n\s+\)/g, ")")
            .replace(/\s+/g, " ");
    }
    //创建一个储存行为日志的表
    //记录格式 id,时间,玩家名,玩家坐标，行为，行为对象，对象坐标
    var CREATE_TABLE = fix(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  CREATE TABLE IF NOT EXISTS log(\n    id,\n    time TEXT NOT NULL,\n    name TEXT NOT NULL,\n    playerX INT NOT NULL,\n    playerY INT NOT NULL,\n    playerZ INT NOT NULL,\n    action TEXT NOT NULL,\n    target TEXT NOT NULL,\n    targetX INT NOT NULL,\n    targetY INT NOT NULL,\n    targetZ INT NOT NULL,\n    dim TEXT NOT NULL,\n    desc TEXT,\n    timestamp INT NOT NULL\n  );"], ["\n  CREATE TABLE IF NOT EXISTS log(\n    id,\n    time TEXT NOT NULL,\n    name TEXT NOT NULL,\n    playerX INT NOT NULL,\n    playerY INT NOT NULL,\n    playerZ INT NOT NULL,\n    action TEXT NOT NULL,\n    target TEXT NOT NULL,\n    targetX INT NOT NULL,\n    targetY INT NOT NULL,\n    targetZ INT NOT NULL,\n    dim TEXT NOT NULL,\n    desc TEXT,\n    timestamp INT NOT NULL\n  );"])));
    //添加记录
    var INSERT_LOG = fix(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  INSERT INTO log (\n    time, name, playerX, playerY, playerZ, action, target, targetX, targetY, targetZ, dim, desc, timestamp\n  ) values (\n    $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp\n  );"], ["\n  INSERT INTO log (\n    time, name, playerX, playerY, playerZ, action, target, targetX, targetY, targetZ, dim, desc, timestamp\n  ) values (\n    $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp\n  );"])));
    //获得一个玩家的所有行为
    var SELECT_LOG_BY_NAME = fix(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT * FROM log WHERE name=$name;"], ["SELECT * FROM log WHERE name=$name;"])));
    //获得几天内一个玩家一定范围内的所有行为(破坏/放置)
    //export const SELECT_LOG_BY_NAME_DAY_POS = fix`SELECT * FROM log WHERE name=$name AND timestamp > $timestamp AND dim=$dim AND targetX > $minx AND targetX < $maxx AND targetY > $miny AND targetY < $maxy AND targetZ > $minz AND targetZ < $maxz AND action=$action;`;
    var SELECT_LOG_BY_NAME_DAY_POS = fix(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minx AND targetY >= $miny AND targetZ >= $minz AND targetX <= $maxx AND targetY <= $maxy AND targetZ <= $maxz AND dim = $dim AND timestamp > $timestamp AND name=$name AND action=$action;"], ["SELECT * FROM log WHERE targetX >= $minx AND targetY >= $miny AND targetZ >= $minz AND targetX <= $maxx AND targetY <= $maxy AND targetZ <= $maxz AND dim = $dim AND timestamp > $timestamp AND name=$name AND action=$action;"])));
    //获得所有的日志
    var SELECT_ALL_LOG = fix(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT * FROM log;"], ["SELECT * FROM log;"])));
    //export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;
    var DELETE_LOG_BY_DAY = fix(templateObject_6 || (templateObject_6 = __makeTemplateObject(["DELETE FROM log WHERE timestamp<$timestamp;"], ["DELETE FROM log WHERE timestamp<$timestamp;"])));
    //获得一个范围内（x y z）的所有记录
    var SELECT_ALL_IN_ZONE = fix(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim"])));
    var SELECT_IN_ZONE_BYACTION = fix(templateObject_8 || (templateObject_8 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action"])));
    //新增一个约束条件 几小时之内
    var SELECT_ALL_IN_ZONE_AFTERTIME = fix(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline"])));
    var SELECT_IN_ZONE_BYACTION_AFTERTIME = fix(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline"])));
    var SELECT_ALL_IN_ZONE_AFTERTIME_PNAME = fix(templateObject_11 || (templateObject_11 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline AND name=$player"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline AND name=$player"])));
    var SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME = fix(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline AND name=$player"], ["SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline AND name=$player"])));
    var db = new SQLite3("behaviourLogs.db");
    db.exec(CREATE_TABLE);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA synchronous = NORMAL");
    //向数据库中添加记录
    function addRecord($time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc) {
        if ($desc === void 0) { $desc = ""; }
        var $timestamp = new Date().getTime();
        db.update(INSERT_LOG, { $time: $time, $name: $name, $pX: $pX, $pY: $pY, $pZ: $pZ, $action: $action, $target: $target, $tX: $tX, $tY: $tY, $tZ: $tZ, $dim: $dim, $desc: $desc, $timestamp: $timestamp });
    }
    //删除几天以前的日志
    function delRecord(day) {
        var $timestamp = new Date().getTime() - day * 24 * 60 * 60 * 1000;
        var delNum = db.update(DELETE_LOG_BY_DAY, { $timestamp: $timestamp });
        return delNum;
    }
    function closeDB() {
        db = null;
    }
    function readPlayerRecord($sX, $sY, $sZ, $eX, $eY, $eZ, $dim, $action, day, $player) {
        var $minX = Math.min($sX, $eX);
        var $minY = Math.min($sY, $eY);
        var $minZ = Math.min($sZ, $eZ);
        var $maxX = Math.max($sX, $eX);
        var $maxY = Math.max($sY, $eY);
        var $maxZ = Math.max($sZ, $eZ);
        var $timeline = new Date().getTime() - day * 24 * 60 * 60 * 1000;
        var logs = db.query(SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $action: $action, $timeline: $timeline, $player: $player });
        var datas = Array.from(logs);
        return datas;
    }
    function readRecord($sX, $sY, $sZ, $eX, $eY, $eZ, $dim, $action, $hour, $player) {
        if ($action === void 0) { $action = "all"; }
        if ($hour === void 0) { $hour = 0; }
        if ($player === void 0) { $player = ""; }
        var $minX = Math.min($sX, $eX);
        var $minY = Math.min($sY, $eY);
        var $minZ = Math.min($sZ, $eZ);
        var $maxX = Math.max($sX, $eX);
        var $maxY = Math.max($sY, $eY);
        var $maxZ = Math.max($sZ, $eZ);
        var result = new Array();
        var datas;
        var selects = ["break", "place", "open", "use"];
        if (selects.indexOf($action) == -1) {
            //无效action使用默认all
            $action = "all";
        }
        var length = 0;
        if ($hour == 0) {
            if ($action == "all") {
                //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
                var logs_1 = db.query(SELECT_ALL_IN_ZONE, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim });
                datas = Array.from(logs_1);
            }
            else {
                //读出范围内特定行为的所有记录
                var logs_2 = db.query(SELECT_IN_ZONE_BYACTION, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $action: $action });
                datas = Array.from(logs_2);
            }
        }
        else {
            //读取几个小时前
            if ($hour <= 0)
                throw "hour 需要为正数";
            var now = new Date().getTime();
            var $timeline = now - $hour * 60 * 60 * 1000;
            if ($action == "all") {
                var logs;
                //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
                if ($player == "") {
                    logs = db.query(SELECT_ALL_IN_ZONE_AFTERTIME, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $timeline: $timeline });
                }
                else {
                    logs = db.query(SELECT_ALL_IN_ZONE_AFTERTIME_PNAME, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $timeline: $timeline, $player: $player });
                }
                datas = Array.from(logs);
            }
            else {
                //读出范围内特定行为的所有记录
                var logs;
                if ($player == "") {
                    logs = db.query(SELECT_IN_ZONE_BYACTION_AFTERTIME, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $action: $action, $timeline: $timeline });
                }
                else {
                    logs = db.query(SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME, { $minX: $minX, $minY: $minY, $minZ: $minZ, $maxX: $maxX, $maxY: $maxY, $maxZ: $maxZ, $dim: $dim, $action: $action, $timeline: $timeline, $player: $player });
                }
                datas = Array.from(logs);
            }
        }
        for (var _i = 0, datas_1 = datas; _i < datas_1.length; _i++) {
            var data = datas_1[_i];
            var line;
            switch (data.action) {
                case "break":
                    line = "<" + (length + 1) + ">:" + data.time + " " + data.name + "(" + data.playerX + "," + data.playerY + "," + data.playerZ + ") \u00A7c\u7834\u574F\u4E86\u00A7r " + data.target + "(" + data.targetX + "," + data.targetY + "," + data.targetZ + ") \u7EF4\u5EA6:" + dimTran(data.dim);
                    break;
                case "place":
                    line = "<" + (length + 1) + ">:" + data.time + " " + data.name + "(" + data.playerX + "," + data.playerY + "," + data.playerZ + ") \u00A7a\u653E\u7F6E\u4E86\u00A7r " + data.target + "(" + data.targetX + "," + data.targetY + "," + data.targetZ + ") \u7EF4\u5EA6:" + dimTran(data.dim);
                    break;
                case "open":
                    line = "<" + (length + 1) + ">:" + data.time + " " + data.name + "(" + data.playerX + "," + data.playerY + "," + data.playerZ + ") \u00A79\u6253\u5F00\u4E86\u00A7r " + data.target + "(" + data.targetX + "," + data.targetY + "," + data.targetZ + ") \u7EF4\u5EA6:" + dimTran(data.dim);
                    break;
                case "use":
                    line = "<" + (length + 1) + ">:" + data.time + " " + data.name + "(" + data.playerX + "," + data.playerY + "," + data.playerZ + ") \u00A7e\u4F7F\u7528\u4E86\u00A7r " + data.target + "(" + data.targetX + "," + data.targetY + "," + data.targetZ + ") \u7EF4\u5EA6:" + dimTran(data.dim);
                    break;
                default:
                    break;
            }
            length = result.push(line);
        }
        return result;
    }
    //转换维度名字
    function dimTran(dim) {
        var result = "§r未知";
        switch (Number(dim)) {
            case 0:
                result = "§2主世界§r";
                break;
            case 1:
                result = "§4下界§r";
                break;
            case 2:
                result = "§5末地§r";
                break;
            default:
                break;
        }
        return result;
    }
    var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12;

    function getTime() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours() + 8; //GMT+8
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return month + "/" + day + "/" + hour + "-" + minute + "-" + second;
    }
    //检查一个名字对应的物品是不是容器
    function checkIfContainer(blockName) {
        var blocks = ["minecraft:smoker", "minecraft:blast_furnace", "minecraft:dispenser", "minecraft:dropper", "minecraft:shulker_box", "minecraft:black_shulker", "minecraft:black_shulker_box", "minecraft:red_shulker_box", "minecraft:green_shulker_box", "minecraft:brown_shulker_box", "minecraft:blue_shulker_box", "minecraft:purple_shulker_box", "minecraft:cyan_shulker_box", "minecraft:silver_shulker_box", "minecraft:gray_shulker_box", "minecraft:pink_shulker_box", "minecraft:lime_shulker_box", "minecraft:yellow_shulker_box", "minecraft:light_blue_shulker_box", "minecraft:white_shulker_box", "minecraft:orange_shulker_box", "minecraft:magenta_shulker_box", "minecraft:trapped_chest", "minecraft:chest", "minecraft:hopper", "minecraft:furnace", "minecraft:lit_furnace"];
        if (blocks.indexOf(blockName) == -1) {
            return false;
        }
        else {
            return true;
        }
    }
    //转换小数
    function transNum(n) {
        if (n >= 0) {
            return Math.floor(n);
        }
        else {
            return Math.ceil(n);
        }
    }

    /*
    create by haojie06 2019/6/10
    用于记录玩家在游戏中的行为 （超简化版coi..）
    更新 支持1.12
    */
    var system = server.registerSystem(0, 0);
    system.initialize = function () {
        server.log("日志系统v2.0 loaded https://github.com/haojie06/BedrockPlugins/tree/master/BehaviourLog");
        //方块破坏记录
        system.listenForEvent("minecraft:player_destroyed_block", function (data) {
            var player = data.data.player;
            var playerName = getName(player);
            var dim = getDimensionOfEntity(player);
            var playerPos = getPosCmp(player);
            var blockName = data.data.block_identifier.split(":")[1];
            var bPostion = data.data.block_position;
            var pX = transNum(playerPos.x);
            var pY = transNum(playerPos.y);
            var pZ = transNum(playerPos.z);
            var bX = transNum(bPostion.x);
            var bY = transNum(bPostion.y);
            var bZ = transNum(bPostion.z);
            var time = getTime();
            //system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 破坏 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
            addRecord(time, playerName, pX, pY, pZ, "break", blockName, bX, bY, bZ, dim);
        });
        //使用物品/
        system.listenForEvent("minecraft:entity_use_item", function (data) {
            var entity = data.data.entity;
            if (entity.__identifier__ == "minecraft:player") {
                var method = data.data.use_member;
                var playerName = getName(entity);
                var itemStacks = data.data.item_stack;
                var dim = getDimensionOfEntity(entity);
                var playerPos = getPosCmp(entity);
                var pX = transNum(playerPos.x);
                var pY = transNum(playerPos.y);
                var pZ = transNum(playerPos.z);
                var time = getTime();
                var itemName = itemStacks.item.split(":")[1];
                //放置方块的记录由下一个方法实现 这里目前主要记录倒演讲
                if (method != "place") {
                    //system.sendText(entity,`${time} ${playerName}(${pX},${pY},${pZ}) ${method} ${itemStacks.item} dim:${dim}`);
                    addRecord(time, playerName, pX, pY, pZ, "use", itemName, pX, pY, pZ, dim);
                }
            }
        });
        //容器交互
        system.listenForEvent("minecraft:block_interacted_with", function (data) {
            var player = data.data.player;
            var bPostion = data.data.block_position;
            var playerName = getName(player);
            var dim = getDimensionOfEntity(player);
            var playerPos = getPosCmp(player);
            var bX = transNum(bPostion.x);
            var bY = transNum(bPostion.y);
            var bZ = transNum(bPostion.z);
            var pX = transNum(playerPos.x);
            var pY = transNum(playerPos.y);
            var pZ = transNum(playerPos.z);
            var time = getTime();
            //获得方块
            var tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
            var tickingArea = tickAreaCmp.data.ticking_area;
            var block = system.getBlock(tickingArea, bX, bY, bZ);
            var blockName = block.__identifier__;
            if (checkIfContainer(blockName)) {
                blockName = blockName.split(":")[1];
                //system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 容器交互 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
                addRecord(time, playerName, pX, pY, pZ, "open", blockName, bX, bY, bZ, dim);
            }
        });
        //放置方块记录
        system.listenForEvent("minecraft:player_placed_block", function (data) {
            var player = data.data.player;
            var bPostion = data.data.block_position;
            var playerName = getName(player);
            var dim = getDimensionOfEntity(player);
            var playerPos = getPosCmp(player);
            var bX = transNum(bPostion.x);
            var bY = transNum(bPostion.y);
            var bZ = transNum(bPostion.z);
            var pX = transNum(playerPos.x);
            var pY = transNum(playerPos.y);
            var pZ = transNum(playerPos.z);
            var time = getTime();
            //获得方块
            var tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
            var tickingArea = tickAreaCmp.data.ticking_area;
            var block = system.getBlock(tickingArea, bX, bY, bZ);
            var blockName = block.__identifier__.split(":")[1];
            //system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 放置 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
            addRecord(time, playerName, pX, pY, pZ, "place", blockName, bX, bY, bZ, dim);
        });
        //添加查询命令
        // /logs x y z x y z 可选：行为
        // /logsof playerName 暂时不可用softenum
        //system.registerSoftEnum("action_enum", ["all","break","place","open","use"]);
        system.registerCommand("logs", {
            description: "读取行为日志",
            permission: 1,
            overloads: [
                {
                    parameters: [{
                            name: "start",
                            type: "position"
                        },
                        {
                            name: "end",
                            type: "position"
                        },
                        {
                            name: "行为名",
                            type: "string",
                            optional: true
                        },
                        {
                            name: "几小时内",
                            type: "int",
                            optional: true
                        },
                        {
                            name: "玩家名",
                            type: "string",
                            optional: true
                        }
                    ],
                    handler: function (_a) {
                        var start = _a[0], end = _a[1], action = _a[2], hour = _a[3], player = _a[4];
                        if (!this.entity)
                            throw "Player required";
                        var entity = this.entity;
                        var sX = transNum(start.x);
                        var sY = transNum(start.y);
                        var sZ = transNum(start.z);
                        var eX = transNum(end.x);
                        var eY = transNum(end.y);
                        var eZ = transNum(end.z);
                        var dim = getDimensionOfEntity(entity);
                        var records;
                        if (hour < 0) {
                            hour = 0;
                        }
                        if (action == "") {
                            //server.log(`全局查找 ${sX} ${sY} ${sZ}`);
                            records = readRecord(sX, sY, sZ, eX, eY, eZ, dim, "all", hour, player);
                        }
                        else {
                            //server.log("特定行为查找" + action);
                            records = readRecord(sX, sY, sZ, eX, eY, eZ, dim, action, hour, player);
                        }
                        var say = "\u00A7a\u00A7l\u65E5\u5FD7\u7CFB\u7EDF2.0 by haojie06 \u4EE5\u4E0B\u4E3A\u67E5\u627E\u5230\u7684\u8BB0\u5F55\uFF1A\u00A7r\n";
                        if (hour == 0) {
                            say += "\u00A7b\u6240\u6709\u65F6\u95F4 ";
                        }
                        else {
                            say += "\u00A7b" + hour + "\u5C0F\u65F6\u5185 ";
                        }
                        if (player == "") {
                            say += "\u00A76\u6240\u6709\u73A9\u5BB6\u7684";
                        }
                        else {
                            say += "\u00A76\u73A9\u5BB6" + player + "\u7684\u00A7r";
                        }
                        if (action == "break") {
                            say += "\u00A7c\u7834\u574F\u884C\u4E3A\u8BB0\u5F55\u00A7r:\n";
                        }
                        else if (action == "place") {
                            say += "\u00A79\u653E\u7F6E\u884C\u4E3A\u8BB0\u5F55\u00A7r:\n";
                        }
                        else if (action == "open") {
                            say += "\u00A7e\u5F00\u7BB1\u884C\u4E3A\u8BB0\u5F55\u00A7r:\n";
                        }
                        else if (action == "use") {
                            say += "\u00A73\u4F7F\u7528\u884C\u4E3A\u8BB0\u5F55\u00A7r:\n";
                        }
                        else {
                            say += "\u00A7a\u6240\u6709\u884C\u4E3A\u7684\u8BB0\u5F55\u00A7r:\n";
                        }
                        for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
                            var line = records_1[_i];
                            say = say + line + "\n";
                        }
                        system.sendText(entity, "" + say);
                    }
                }
            ]
        });
        system.registerCommand("dellogs", {
            description: "删除几天以前的所有日志",
            permission: 1,
            overloads: [{
                    parameters: [{
                            name: "几天以前",
                            type: "int"
                        }],
                    handler: function (_a) {
                        var day = _a[0];
                        if (!this.entity)
                            throw "只有玩家可以执行该命令";
                        var delNum = delRecord(day);
                        system.sendText(this.entity, "\u00A7a\u5DF2\u5220\u9664" + day + "\u5929\u524D\u5171\u8BA1:" + delNum + "\u6761\u8BB0\u5F55");
                    }
                }
            ]
        });
        system.registerCommand("bhundo", {
            description: "撤销几天以内玩家的操作",
            permission: 1,
            overloads: [{
                    parameters: [{
                            name: "几天以内",
                            type: "int"
                        },
                        {
                            name: "玩家名字",
                            type: "string"
                        },
                        {
                            name: "起点",
                            type: "position"
                        },
                        {
                            name: "终点",
                            type: "position"
                        }],
                    handler: function (_a) {
                        var day = _a[0], $player = _a[1], sp = _a[2], ep = _a[3];
                        if (!this.entity)
                            throw "只有玩家可以执行该命令";
                        //时间戳大于一个数值的进行撤销
                        var $dim = getDimensionOfEntity(this.entity);
                        system.sendText(this.entity, "\u00A7a\u67E5\u8BE2" + $player + "\u7684\u8BB0\u5F55 \u7EF4\u5EA6" + $dim);
                        //选择所有破坏记录
                        var breakDatas = readPlayerRecord(sp.x, sp.y, sp.z, ep.x, ep.y, ep.z, $dim, "break", day, $player);
                        var placeDatas = readPlayerRecord(sp.x, sp.y, sp.z, ep.x, ep.y, ep.z, $dim, "place", day, $player);
                        system.sendText(this.entity, "\u00A7a\u67E5\u8BE2\u5230" + day + "\u5929\u4EE5\u5185\u73A9\u5BB6" + $player + "\u7684\u7834\u574F\u8BB0\u5F55:" + breakDatas.length + "\u6761 \u653E\u7F6E\u8BB0\u5F55:" + placeDatas.length + "\u6761");
                        //开始尝试修复
                        system.sendText(this.entity, "\u00A7a\u00A7l\u5F00\u59CB\u5C1D\u8BD5\u4FEE\u590D");
                        for (var _i = 0, placeDatas_1 = placeDatas; _i < placeDatas_1.length; _i++) {
                            var data = placeDatas_1[_i];
                            system.executeCommand("execute @a[name=\"" + this.name + "\"] ~ ~ ~ fill " + data.targetX + " " + data.targetY + " " + data.targetZ + " " + data.targetX + " " + data.targetY + " " + data.targetZ + " air 0 replace", function (data) { });
                        }
                        for (var _b = 0, breakDatas_1 = breakDatas; _b < breakDatas_1.length; _b++) {
                            var data = breakDatas_1[_b];
                            system.executeCommand("execute @a[name=\"" + this.name + "\"] ~ ~ ~ fill " + data.targetX + " " + data.targetY + " " + data.targetZ + " " + data.targetX + " " + data.targetY + " " + data.targetZ + " " + data.target + " 0 replace", function (data) { });
                        }
                        system.sendText(this.entity, "\u00A7a\u00A7l\u5DF2\u6267\u884C\u4FEE\u590D");
                    }
                }
            ]
        });
    };
    system.shutdown = function () {
        //在此处进行结束工作
        closeDB();
        server.log("日志系统已卸载");
    };
    function getName(entity) {
        return system.getComponent(entity, "minecraft:nameable" /* Nameable */).data.name;
    }
    function getPosCmp(entity) {
        return system.getComponent(entity, "minecraft:position" /* Position */).data;
    }
    function getDimensionOfEntity(entity) {
        var dimension;
        if (system.hasComponent(entity, "stone:dimension")) {
            var comp = system.getComponent(entity, "stone:dimension" /* Dimension */);
            dimension = String(comp.data);
        }
        else {
            dimension = "无法获得维度";
        }
        return String(dimension);
    }

}());
