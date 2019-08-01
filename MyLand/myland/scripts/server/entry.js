(function () {
    'use strict';

    var system = server.registerSystem(0, 0);

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
    //创建一个储存领地基本信息的表
    var CREATE_LAND_TABLE = fix(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  CREATE TABLE IF NOT EXISTS land(\n    id,\n    name TEXT NOT NULL UNIQUE,\n    creator TEXT NOT NULL,\n    owner TEXT NOT NULL,\n    dim TEXT NOT NULL,\n    sposition TEXT NOT NULL,\n    eposition TEXT NOT NULL,\n    minx INT NOT NULL,\n    miny INT NOT NULL,\n    minz INT NOT NULL,\n    maxx INT NOT NULL,\n    maxy INT NOT NULL,\n    maxz INT NOT NULL,\n    size INT NOT NULL,\n    flags TEXT,\n    extra TEXT\n  );"], ["\n  CREATE TABLE IF NOT EXISTS land(\n    id,\n    name TEXT NOT NULL UNIQUE,\n    creator TEXT NOT NULL,\n    owner TEXT NOT NULL,\n    dim TEXT NOT NULL,\n    sposition TEXT NOT NULL,\n    eposition TEXT NOT NULL,\n    minx INT NOT NULL,\n    miny INT NOT NULL,\n    minz INT NOT NULL,\n    maxx INT NOT NULL,\n    maxy INT NOT NULL,\n    maxz INT NOT NULL,\n    size INT NOT NULL,\n    flags TEXT,\n    extra TEXT\n  );"])));
    //创建一个储存领地居民的表
    var CREATE_RESIDENT_TABLE = fix(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  CREATE TABLE IF NOT EXISTS resident(\n    id,\n    landname TEXT NOT NULL,\n    playername TEXT NOT NULL,\n    permission TEXT NOT NULL,\n    extra TEXT\n  );\n"], ["\n  CREATE TABLE IF NOT EXISTS resident(\n    id,\n    landname TEXT NOT NULL,\n    playername TEXT NOT NULL,\n    permission TEXT NOT NULL,\n    extra TEXT\n  );\n"])));
    var INSERT_LAND = fix(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  INSERT INTO land (\n    name, creator, owner, dim, sposition, eposition, minx, miny, minz, maxx, maxy, maxz, size\n  ) values (\n    $name, $creator, $owner, $dim, $sposition, $eposition, $minx, $miny, $minz, $maxx, $maxy, $maxz, $size\n  );"], ["\n  INSERT INTO land (\n    name, creator, owner, dim, sposition, eposition, minx, miny, minz, maxx, maxy, maxz, size\n  ) values (\n    $name, $creator, $owner, $dim, $sposition, $eposition, $minx, $miny, $minz, $maxx, $maxy, $maxz, $size\n  );"])));
    var INSERT_RESIDENT = fix(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  INSERT INTO resident (\n      landname, playername, permission, extra\n  ) values (\n      $landname, $playername, $permission, $extra\n  );\n  "], ["\n  INSERT INTO resident (\n      landname, playername, permission, extra\n  ) values (\n      $landname, $playername, $permission, $extra\n  );\n  "])));
    var SELECT_LAND_BY_POS = fix(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT * FROM land WHERE $px>=minx AND $px<=maxx AND $py>=miny AND $py<=maxy AND $pz>=minz AND $pz<=maxz AND $sdim=dim;"], ["SELECT * FROM land WHERE $px>=minx AND $px<=maxx AND $py>=miny AND $py<=maxy AND $pz>=minz AND $pz<=maxz AND $sdim=dim;"])));
    var SELECT_LAND_BY_NAME = fix(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SELECT * FROM land WHERE name=$name;"], ["SELECT * FROM land WHERE name=$name;"])));
    var SELECT_LAND_BY_OWNER = fix(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT * FROM land WHERE $owner=owner;"], ["SELECT * FROM land WHERE $owner=owner;"])));
    var SELECT_RESIDENT_BY_LAND_AND_NAME = fix(templateObject_8 || (templateObject_8 = __makeTemplateObject(["SELECT * FROM resident WHERE $landname=landname AND $playername=playername;"], ["SELECT * FROM resident WHERE $landname=landname AND $playername=playername;"])));
    var SELECT_RESIDENT_BY_LAND = fix(templateObject_9 || (templateObject_9 = __makeTemplateObject(["SELECT * FROM resident WHERE $landname=landname;"], ["SELECT * FROM resident WHERE $landname=landname;"])));
    var SELECT_RESIDENT_BY_NAME = fix(templateObject_10 || (templateObject_10 = __makeTemplateObject(["SELECT * FROM resident WHERE $playername=playername;"], ["SELECT * FROM resident WHERE $playername=playername;"])));
    //export const SELECT_LAND_BY_POS = fix`SELECT * FROM land WHERE minx=$px;`;
    var DELETE_RESIDENT_BY_LAND = fix(templateObject_11 || (templateObject_11 = __makeTemplateObject(["DELETE FROM resident WHERE landname=$landname;"], ["DELETE FROM resident WHERE landname=$landname;"])));
    var DELETE_RESIDENT_BY_LAND_NAME = fix(templateObject_12 || (templateObject_12 = __makeTemplateObject(["DELETE FROM resident WHERE landname=$landname AND playername=$playername;"], ["DELETE FROM resident WHERE landname=$landname AND playername=$playername;"])));
    var DELETE_LAND_BY_NAME = fix(templateObject_13 || (templateObject_13 = __makeTemplateObject(["DELETE FROM land WHERE name=$name;"], ["DELETE FROM land WHERE name=$name;"])));
    var DELETE_LAND_BY_NAME_OWNER = fix(templateObject_14 || (templateObject_14 = __makeTemplateObject(["DELETE FROM land WHERE name=$name AND owner=$owner;"], ["DELETE FROM land WHERE name=$name AND owner=$owner;"])));
    //---------------------------------------------------------------------------------
    var db = new SQLite3("myland.db");
    db.exec(CREATE_LAND_TABLE);
    db.exec(CREATE_RESIDENT_TABLE);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA synchronous = NORMAL");
    var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14;

    function getName(entity) {
        return system.getComponent(entity, "minecraft:nameable" /* Nameable */).data.name;
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
    function getMax(a, b) {
        if (a > b) {
            return a;
        }
        else {
            return b;
        }
    }
    function getMin(a, b) {
        if (a < b) {
            return a;
        }
        else {
            return b;
        }
    }
    //利用tag来给予op破坏权限
    function checkAdmin(entity) {
        var ifAdmin = false;
        var extra = system.getComponent(entity, "stone:extra_data" /* ExtraData */).data;
        if (extra.value.abilities.value.op.value == "1") {
            ifAdmin = true;
        }
        else {
            ifAdmin = false;
        }
        return ifAdmin;
    }

    var selectTool = "minecraft:wooden_hoe";
    //玩家圈地最大的x，z
    var MaxX = 32;
    var MaxZ = 32;
    var MaxY = 100;
    //一个玩家最多有几块领地
    var MaxLands = 2;
    var pointMap = new Map();
    function commandsReg() {
        //领地选择
        system.listenForEvent("minecraft:block_destruction_started", function (data) {
            var player = data.data.player;
            var hand = system.getComponent(player, "minecraft:hand_container" /* HandContainer */);
            var item = hand.data[0];
            var itemName = item.__identifier__;
            if (itemName == selectTool) {
                var playerName = getName(player);
                var blockPos = data.data.block_position;
                //选取两点后应在数据库中进行检查
                if (pointMap.has(playerName)) {
                    var sp_1 = pointMap.get(playerName);
                    if (sp_1.ex == 0) {
                        //第二个点还未选取的时候
                        var dim = getDimensionOfEntity(player);
                        if (dim != sp_1.sdim) {
                            system.sendText(player, "无法创建领地，跨维度选取是不行滴");
                            pointMap.delete(playerName);
                        }
                        else {
                            sp_1.ex = blockPos.x;
                            sp_1.ey = blockPos.y;
                            sp_1.ez = blockPos.z;
                            var divX = Math.abs(sp_1.ex - sp_1.sx) + 1;
                            var divY = Math.abs(sp_1.ey - sp_1.sy) + 1;
                            var divZ = Math.abs(sp_1.ez - sp_1.sz) + 1;
                            var size = divX * divY * divZ;
                            sp_1.size = divX * divY * divZ;
                            system.sendText(player, "\u4F60\u5DF2\u7ECF\u9009\u53D6\u4E86(" + sp_1.sx + "," + sp_1.sy + "," + sp_1.sz + ") \u81F3 (" + sp_1.ex + "," + sp_1.ey + "," + sp_1.ez + ") \u4F53\u79EF\u4E3A:" + size + "\u7684\u533A\u57DF");
                        }
                    }
                    else {
                        //选取第三个点的时候删除之前的选区
                        pointMap.delete(playerName);
                        system.sendText(player, "\u5220\u9664\u4E4B\u524D\u7684\u9009\u533A");
                    }
                }
                else {
                    //第一次设点
                    var dim = getDimensionOfEntity(player);
                    var sp_2 = {
                        sdim: "",
                        sx: 0,
                        sy: 0,
                        sz: 0,
                        ex: 0,
                        ey: 0,
                        ez: 0,
                        size: 0
                    };
                    sp_2.sdim = dim;
                    sp_2.sx = blockPos.x;
                    sp_2.sy = blockPos.y;
                    sp_2.sz = blockPos.z;
                    pointMap.set(playerName, sp_2);
                    system.sendText(player, "\u4F60\u5DF2\u9009\u53D6\u9886\u5730\u7B2C\u4E00\u70B9\uFF08" + sp_2.sx + "," + sp_2.sy + "," + sp_2.sz + ")");
                }
            }
        });
        //创建领地 （op）
        system.registerCommand("createland", {
            description: "创建领地",
            permission: 1,
            overloads: [
                {
                    parameters: [
                        {
                            name: "领地名",
                            type: "string"
                        },
                        {
                            name: "主人名",
                            type: "string"
                        }
                    ],
                    handler: function (_a) {
                        var landName = _a[0], ownerName = _a[1];
                        if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                            throw "Can only be used by player";
                        var entity = this.entity;
                        var dim = getDimensionOfEntity(entity);
                        if (pointMap.has(this.name)) {
                            var sp_3 = pointMap.get(this.name);
                            pointMap.delete(this.name);
                            var $px = void 0, $py = void 0, $pz = void 0;
                            $px = sp_3.sx;
                            $py = sp_3.sy;
                            $pz = sp_3.sz;
                            var $sdim = sp_3.sdim;
                            var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                            if (datas.length == 0) {
                                //判断一下是否可以圈地
                                $px = sp_3.ex;
                                $py = sp_3.ey;
                                $pz = sp_3.ez;
                                var datas_1 = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                                if (datas_1.length == 0) {
                                    //两点都不在他人领地内
                                    var $name = landName;
                                    var datas_2 = Array.from(db.query(SELECT_LAND_BY_NAME, { $name: $name }));
                                    if (datas_2.length != 0) {
                                        var data = datas_2[0];
                                        return "\u5DF2\u5B58\u5728\u540D\u4E3A" + data.name + "\u7684\u9886\u5730,\u62E5\u6709\u8005" + data.owner;
                                    }
                                    else {
                                        var res = db.update(INSERT_LAND, {
                                            $name: landName,
                                            $creator: this.name,
                                            $owner: ownerName,
                                            $dim: $sdim,
                                            $sposition: sp_3.sx + "," + sp_3.sy + "," + sp_3.sz,
                                            $eposition: sp_3.ex + "," + sp_3.ey + "," + sp_3.ez,
                                            $minx: getMin(sp_3.sx, sp_3.ex),
                                            $miny: getMin(sp_3.sy, sp_3.ey),
                                            $minz: getMin(sp_3.sz, sp_3.ez),
                                            $maxx: getMax(sp_3.sx, sp_3.ex),
                                            $maxy: getMax(sp_3.sy, sp_3.ey),
                                            $maxz: getMax(sp_3.sz, sp_3.ez),
                                            $size: sp_3.size
                                        });
                                        db.update(INSERT_RESIDENT, {
                                            $landname: landName,
                                            $playername: ownerName,
                                            $permission: "owner",
                                            $extra: ""
                                        });
                                        if (res == 0)
                                            throw "创建领地失败";
                                        return "\u5DF2\u5728\u7EF4\u5EA6" + dim + "\u521B\u5EFA(" + sp_3.sx + "," + sp_3.sy + "," + sp_3.sz + ") \u81F3 (" + sp_3.ex + "," + sp_3.ey + "," + sp_3.ez + ") \u4F53\u79EF\u4E3A:" + sp_3.size + "\u7684\u9886\u5730\n\u9886\u5730\u540D" + landName + " \u4E3B\u4EBA:" + ownerName;
                                    }
                                }
                                else {
                                    var data = datas_1[0];
                                    return "\u9886\u5730\u7B2C\u4E8C\u70B9\u5728" + data.owner + "\u7684\u9886\u5730" + data.name + "(" + data.sposition + ")~(" + data.eposition + ")\u5185";
                                }
                            }
                            else {
                                var data = datas[0];
                                return "\u9886\u5730\u7B2C\u4E00\u70B9\u5728" + data.owner + "\u7684\u9886\u5730" + data.name + "(" + data.sposition + ")~(" + data.eposition + ")\u5185";
                            }
                        }
                        else {
                            return "无法创建领地";
                        }
                    }
                }
            ]
        });
        system.registerCommand("deleteland", {
            description: "删除领地",
            permission: 1,
            overloads: [{
                    parameters: [{
                            name: "领地名",
                            type: "string",
                            optional: true
                        }],
                    handler: function (_a) {
                        var $landname = _a[0];
                        if ($landname == "") {
                            //直接删除脚底下的领地
                            var player = this.entity;
                            if (!player)
                                throw "只有玩家可以使用";
                            var pComp = system.getComponent(player, "minecraft:position" /* Position */);
                            var $px = Math.floor(pComp.data.x);
                            var $py = Math.floor(pComp.data.y);
                            var $pz = Math.floor(pComp.data.z);
                            var $sdim = getDimensionOfEntity(player);
                            var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                            if (datas.length == 0) {
                                return "\u811A\u5E95\u4E0B\u672A\u68C0\u6D4B\u5230\u9886\u5730";
                            }
                            else {
                                var $name = datas[0].name;
                                var $landname_1 = $name;
                                var res1 = db.update(DELETE_LAND_BY_NAME, { $name: $name });
                                var res2 = db.update(DELETE_RESIDENT_BY_LAND, { $landname: $landname_1 });
                                return "\u5220\u9664\u4E86" + res1 + "\u4E2A\u9886\u5730\uFF0C" + res2 + "\u4E2A\u5C45\u6C11\u4FE1\u606F";
                            }
                        }
                        else {
                            //指定名字删除
                            var $name = $landname;
                            var res1 = db.update(DELETE_LAND_BY_NAME, { $name: $name });
                            var res2 = db.update(DELETE_RESIDENT_BY_LAND, { $landname: $landname });
                            return "\u5220\u9664\u4E86" + res1 + "\u4E2A\u9886\u5730\uFF0C" + res2 + "\u4E2A\u5C45\u6C11\u4FE1\u606F";
                        }
                    }
                }]
        });
        system.registerCommand("landclaim", {
            description: "创建领地",
            permission: 0,
            overloads: [{
                    parameters: [
                        {
                            name: "领地名",
                            type: "string"
                        }
                    ],
                    handler: function (_a) {
                        var name = _a[0];
                        if (!this.entity || this.entity.__identifier__ != "minecraft:player")
                            throw "Can only be used by player";
                        var entity = this.entity;
                        var dim = getDimensionOfEntity(entity);
                        var landName = name;
                        var ownerName = this.name;
                        if (pointMap.has(this.name)) {
                            var sp_4 = pointMap.get(this.name);
                            pointMap.delete(this.name);
                            var $px = void 0, $py = void 0, $pz = void 0;
                            $px = sp_4.sx;
                            $py = sp_4.sy;
                            $pz = sp_4.sz;
                            var $sdim = sp_4.sdim;
                            //检查选区大小
                            var xLength = Math.abs(sp_4.sx - sp_4.ex) + 1;
                            if (xLength > MaxX)
                                return "x\u65B9\u5411\u957F\u5EA6" + xLength + "\u8D85\u51FA\u8303\u56F4" + MaxX + "\uFF0C\u5708\u5730\u5931\u8D25";
                            var zLength = Math.abs(sp_4.sz - sp_4.ez) + 1;
                            if (zLength > MaxZ)
                                return "z\u65B9\u5411\u957F\u5EA6" + zLength + "\u8D85\u51FA\u8303\u56F4" + MaxZ + "\uFF0C\u5708\u5730\u5931\u8D25";
                            var yLength = Math.abs(sp_4.sy - sp_4.ey) + 1;
                            if (yLength > MaxY)
                                return "y\u65B9\u5411\u957F\u5EA6" + yLength + "\u8D85\u51FA\u8303\u56F4" + MaxY + "\uFF0C\u5708\u5730\u5931\u8D25";
                            //查看玩家领地数是否超过上限
                            var $owner = this.name;
                            var lands = Array.from(db.query(SELECT_LAND_BY_OWNER, { $owner: $owner }));
                            if (lands.length >= MaxLands)
                                return "\u4F60\u7684\u9886\u5730\u6570" + lands.length + "\u5DF2\u8FBE\u5230\u4E0A\u9650" + MaxLands;
                            var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                            if (datas.length == 0) {
                                //判断一下是否可以圈地
                                $px = sp_4.ex;
                                $py = sp_4.ey;
                                $pz = sp_4.ez;
                                var datas_3 = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                                if (datas_3.length == 0) {
                                    //两点都不在他人领地内
                                    var $name = landName;
                                    var datas_4 = Array.from(db.query(SELECT_LAND_BY_NAME, { $name: $name }));
                                    if (datas_4.length != 0) {
                                        var data = datas_4[0];
                                        return "\u5DF2\u5B58\u5728\u540D\u4E3A" + data.name + "\u7684\u9886\u5730,\u62E5\u6709\u8005" + data.owner;
                                    }
                                    else {
                                        var res = db.update(INSERT_LAND, {
                                            $name: landName,
                                            $creator: this.name,
                                            $owner: ownerName,
                                            $dim: $sdim,
                                            $sposition: sp_4.sx + "," + sp_4.sy + "," + sp_4.sz,
                                            $eposition: sp_4.ex + "," + sp_4.ey + "," + sp_4.ez,
                                            $minx: getMin(sp_4.sx, sp_4.ex),
                                            $miny: getMin(sp_4.sy, sp_4.ey),
                                            $minz: getMin(sp_4.sz, sp_4.ez),
                                            $maxx: getMax(sp_4.sx, sp_4.ex),
                                            $maxy: getMax(sp_4.sy, sp_4.ey),
                                            $maxz: getMax(sp_4.sz, sp_4.ez),
                                            $size: sp_4.size
                                        });
                                        db.update(INSERT_RESIDENT, {
                                            $landname: landName,
                                            $playername: ownerName,
                                            $permission: "owner",
                                            $extra: ""
                                        });
                                        if (res == 0)
                                            throw "创建领地失败";
                                        return "\u5DF2\u5728\u7EF4\u5EA6" + dim + "\u521B\u5EFA(" + sp_4.sx + "," + sp_4.sy + "," + sp_4.sz + ") \u81F3 (" + sp_4.ex + "," + sp_4.ey + "," + sp_4.ez + ") \u4F53\u79EF\u4E3A:" + sp_4.size + "\u7684\u9886\u5730\n\u9886\u5730\u540D" + landName + " \u4E3B\u4EBA:" + ownerName;
                                    }
                                }
                                else {
                                    var data = datas_3[0];
                                    return "\u9886\u5730\u7B2C\u4E8C\u70B9\u5728" + data.owner + "\u7684\u9886\u5730" + data.name + "(" + data.sposition + ")~(" + data.eposition + ")\u5185";
                                }
                            }
                            else {
                                var data = datas[0];
                                return "\u9886\u5730\u7B2C\u4E00\u70B9\u5728" + data.owner + "\u7684\u9886\u5730" + data.name + "(" + data.sposition + ")~(" + data.eposition + ")\u5185";
                            }
                        }
                        else {
                            return "无法创建领地";
                        }
                    }
                }]
        });
        system.registerCommand("landremove", {
            description: "删除领地",
            permission: 0,
            overloads: [{
                    parameters: [{
                            name: "领地名",
                            type: "string"
                        }],
                    handler: function (_a) {
                        var name = _a[0];
                        var $name = name;
                        var $owner = this.name;
                        var result1 = db.update(DELETE_LAND_BY_NAME_OWNER, { $name: $name, $owner: $owner });
                        if (result1 != 0) {
                            var $landname = name;
                            var result2 = db.update(DELETE_RESIDENT_BY_LAND, { $landname: $landname });
                            return "\u5220\u9664\u6210\u529F\uFF0C\u5220\u9664\u4E86\u9886\u5730" + $landname + "\u4EE5\u53CA" + result2 + "\u4E2A\u5C45\u6C11";
                        }
                        else {
                            return "\u5220\u9664\u5931\u8D25";
                        }
                    }
                }]
        });
        system.registerCommand("landtrust", {
            description: "添加居民",
            permission: 0,
            overloads: [{
                    parameters: [{
                            name: "玩家名",
                            type: "string"
                        }],
                    handler: function (_a) {
                        var name = _a[0];
                        //玩家需要站在领地中
                        if (!this.entity) {
                            throw "只有玩家可以使用";
                        }
                        var pComp = system.getComponent(this.entity, "minecraft:position" /* Position */);
                        var $px = Math.floor(pComp.data.x);
                        var $py = Math.floor(pComp.data.y);
                        var $pz = Math.floor(pComp.data.z);
                        var $sdim = getDimensionOfEntity(this.entity);
                        var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                        if (datas.length == 0) {
                            return "\u4F60\u9700\u8981\u7AD9\u5728\u4F60\u7684\u9886\u5730\u4E2D";
                        }
                        else {
                            //未来添加领地操作员权限
                            var data = datas[0];
                            if (this.name == data.owner) {
                                var res = db.update(INSERT_RESIDENT, {
                                    $landname: data.name,
                                    $playername: name,
                                    $permission: "member",
                                    $extra: ""
                                });
                                if (res != 0) {
                                    return "\u6210\u529F\u6DFB\u52A0\u6210\u5458" + name + ";";
                                }
                                else {
                                    return "\u6DFB\u52A0\u6210\u5458\u5931\u8D25";
                                }
                            }
                            else {
                                return "\u53EA\u6709\u9886\u5730\u4E3B\u4EBA\u624D\u6709\u6743\u9650\u6DFB\u52A0\u6210\u5458\u5662";
                            }
                        }
                    }
                }]
        });
        system.registerCommand("landdistrust", {
            description: "移除居民",
            permission: 0,
            overloads: [{
                    parameters: [{
                            name: "玩家名",
                            type: "string"
                        }],
                    handler: function (_a) {
                        var name = _a[0];
                        //玩家需要站在领地中
                        if (!this.entity) {
                            throw "只有玩家可以使用";
                        }
                        var pComp = system.getComponent(this.entity, "minecraft:position" /* Position */);
                        var $px = Math.floor(pComp.data.x);
                        var $py = Math.floor(pComp.data.y);
                        var $pz = Math.floor(pComp.data.z);
                        var $sdim = getDimensionOfEntity(this.entity);
                        var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                        if (datas.length == 0) {
                            return "\u4F60\u9700\u8981\u7AD9\u5728\u4F60\u7684\u9886\u5730\u4E2D";
                        }
                        else {
                            //未来添加领地操作员权限
                            var data = datas[0];
                            if (this.name == data.owner) {
                                var res = db.update(DELETE_RESIDENT_BY_LAND_NAME, {
                                    $landname: data.name,
                                    $playername: name
                                });
                                if (res != 0) {
                                    return "\u6210\u529F\u79FB\u9664\u6210\u5458" + name + ";";
                                }
                                else {
                                    return "\u79FB\u9664\u6210\u5458\u5931\u8D25";
                                }
                            }
                            else {
                                return "\u53EA\u6709\u9886\u5730\u4E3B\u4EBA\u624D\u6709\u6743\u9650\u79FB\u9664\u6210\u5458\u5662";
                            }
                        }
                    }
                }]
        });
        system.registerCommand("queryland", {
            description: "查询领地",
            permission: 1,
            overloads: [{
                    parameters: [{
                            name: "land/player",
                            type: "string"
                        },
                        {
                            name: "name",
                            type: "string"
                        }],
                    handler: function (_a) {
                        var kind = _a[0], name = _a[1];
                        if (kind == "land") {
                            //查询领地详细信息
                            var $name = name;
                            var $landname = name;
                            var datas = db.query(SELECT_LAND_BY_NAME, { $name: $name });
                            if (datas.length != 0) {
                                var residents = db.query(SELECT_RESIDENT_BY_LAND, { $landname: $landname });
                                var res = "";
                                for (var _i = 0, residents_1 = residents; _i < residents_1.length; _i++) {
                                    var resident = residents_1[_i];
                                    res += "[" + resident.permission + "]" + resident.playername + " ";
                                }
                                return "\u4EE5\u4E0B\u4E3A\u9886\u5730:" + name + "\u7684\u4FE1\u606F:\n\u9886\u5730\u8303\u56F4:(" + datas[0].sposition + ")\u81F3(" + datas[0].eposition + ") \u7EF4\u5EA6:" + datas[0].dim + " \u9886\u5730\u4E3B\u4EBA:" + datas[0].owner + "\n\u5C45\u6C11:" + res;
                            }
                            else {
                                return "\u672A\u627E\u5230\u9886\u5730\u4FE1\u606F";
                            }
                        }
                        else if (kind == "player") {
                            //查询玩家拥有的领地
                            var $playername = name;
                            var datas = db.query(SELECT_RESIDENT_BY_NAME, { $playername: $playername });
                            if (datas.length != 0) {
                                var show = "";
                                for (var _b = 0, datas_5 = datas; _b < datas_5.length; _b++) {
                                    var data = datas_5[_b];
                                    show += "\u9886\u5730:" + data.landname + " \u6743\u9650:" + data.permission + "\n";
                                }
                                return show;
                            }
                            else {
                                return "\u672A\u627E\u5230\u73A9\u5BB6\u4FE1\u606F";
                            }
                        }
                        else {
                            return "\u65E0\u6548\u53C2\u6570";
                        }
                    }
                }]
        });
        system.registerCommand("mylands", {
            description: "查看自己已有的领地",
            permission: 0,
            overloads: [{
                    parameters: [],
                    handler: function () {
                        if (!this.entity)
                            throw "只有玩家可以使用该命令";
                        var $owner = this.name;
                        var datas = Array.from(db.query(SELECT_LAND_BY_OWNER, { $owner: $owner }));
                        if (datas.length != 0) {
                            var result = "\u4F60\u6709" + datas.length + "\u4E2A\u9886\u5730:\n";
                            for (var _i = 0, datas_6 = datas; _i < datas_6.length; _i++) {
                                var data = datas_6[_i];
                                result += "\u9886\u5730:" + data.name + " \u8303\u56F4:(" + data.sposition + ")\u81F3(" + data.eposition + ")\n";
                            }
                            return result;
                        }
                        else {
                            return "你还没有领地";
                        }
                    }
                }]
        });
        system.registerCommand("editres", {
            description: "编辑领地的居民",
            permission: 1,
            overloads: [{
                    parameters: [
                        {
                            name: "行为add/remove",
                            type: "string"
                        },
                        {
                            name: "领地名",
                            type: "string"
                        },
                        {
                            name: "玩家名",
                            type: "string"
                        }
                    ],
                    handler: function (_a) {
                        var action = _a[0], $landname = _a[1], $playername = _a[2];
                        if (action == "add") {
                            var res = db.update(INSERT_RESIDENT, {
                                $landname: $landname,
                                $playername: $playername,
                                $permission: "member",
                                $extra: ""
                            });
                            return "成功添加";
                        }
                        else if (action == "remove") {
                            var res = db.update(DELETE_RESIDENT_BY_LAND_NAME, { $landname: $landname, $playername: $playername });
                            if (res != 0) {
                                return "成功移除";
                            }
                            else {
                                return "移除失败";
                            }
                        }
                        else {
                            return "无效参数";
                        }
                    }
                }]
        });
    }

    //领地保护模块
    //移动提醒/限制
    function moveCheck(player) {
        //let pVec:Vec = getVecOfEntity(player);
        var pComp = system.getComponent(player, "minecraft:position" /* Position */);
        var $px = Math.floor(pComp.data.x);
        var $py = Math.floor(pComp.data.y);
        var $pz = Math.floor(pComp.data.z);
        var $sdim = getDimensionOfEntity(player);
        var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
        if (datas.length != 0) {
            //server.log(`检测到玩家在领地内`);
            var data = datas[0];
            system.sendText(player, "\u00A7e\u4F60\u5DF2\u6765\u5230" + data.owner + "\u7684\u9886\u5730:" + data.name + " (" + data.sposition + ")\u81F3(" + data.eposition + ")", 5);
        }
    }
    //方块破坏拦截
    function breakCheck() {
        system.handlePolicy("stone:player_destroy_block" /* PlayerDestroyBlock */, function (data, def) {
            var block = data.block;
            var bPosition = block.block_position;
            var $px = bPosition.x;
            var $py = bPosition.y;
            var $pz = bPosition.z;
            //先判断方块是否在领地内
            var player = data.player;
            if (checkAdmin(player) == false) {
                var $sdim = getDimensionOfEntity(player);
                var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                if (datas.length != 0) {
                    //再检查该玩家是否有这个领地的权限
                    var $landname = datas[0].name;
                    var $playername = getName(player);
                    var residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME, { $landname: $landname, $playername: $playername });
                    if (residents.length == 0) {
                        //未找到该玩家有此领地的破坏权限
                        system.sendText(player, "\u4F60\u6CA1\u6709\u6743\u9650\u7834\u574F(" + bPosition.x + "," + bPosition.y + "," + bPosition.z + ")\u5904\u7684\u65B9\u5757\n\u6240\u5C5E\u9886\u5730" + datas[0].name + " \u4E3B\u4EBA:" + datas[0].owner);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        });
    }
    function interactCheck() {
        system.handlePolicy("stone:player_use_item_on" /* PlayerUseItemOn */, function (data, def) {
            var player = data.player;
            var playerPos = data.pos;
            var block = data.block;
            if (checkAdmin(player) == false) {
                var bPosition = block.block_position;
                var $px = bPosition.x;
                var $py = bPosition.y;
                var $pz = bPosition.z;
                //先判断方块是否在领地内
                var $sdim = getDimensionOfEntity(player);
                var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                if (datas.length != 0) {
                    var $landname = datas[0].name;
                    var $playername = getName(player);
                    var residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME, { $landname: $landname, $playername: $playername });
                    if (residents.length == 0) {
                        //未找到该玩家有此领地的破坏权限
                        system.sendText(player, "\u4F60\u6CA1\u6709\u6743\u9650\u4E0E(" + bPosition.x + "," + bPosition.y + "," + bPosition.z + ")\u5904\u7684\u65B9\u5757\u4EA4\u4E92\n\u6240\u5C5E\u9886\u5730" + datas[0].name + " \u4E3B\u4EBA:" + datas[0].owner);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                return true;
            }
        });
    }
    function attackCheck() {
        system.handlePolicy("stone:player_attack_entity" /* PlayerAttackEntity */, function (data, def) {
            var player = data.player;
            var target = data.target;
            var pComp = system.getComponent(target, "minecraft:position" /* Position */);
            var $px = Math.floor(pComp.data.x);
            var $py = Math.floor(pComp.data.y);
            var $pz = Math.floor(pComp.data.z);
            var $playername = getName(player);
            if (checkAdmin(player) == false) {
                //先判断方块是否在领地内
                var $sdim = getDimensionOfEntity(player);
                var datas = Array.from(db.query(SELECT_LAND_BY_POS, { $px: $px, $py: $py, $pz: $pz, $sdim: $sdim }));
                if (datas.length != 0) {
                    var $landname = datas[0].name;
                    var residents = db.query(SELECT_RESIDENT_BY_LAND_AND_NAME, { $landname: $landname, $playername: $playername });
                    if (residents.length == 0) {
                        //未找到该玩家有此领地的破坏权限
                        system.sendText(player, "\u4F60\u6CA1\u6709\u6743\u9650\u653B\u51FB(" + $px + "," + $py + "," + $pz + ")\u5904\u7684\u5B9E\u4F53\n\u6240\u5C5E\u9886\u5730" + datas[0].name + " \u4E3B\u4EBA:" + datas[0].owner);
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                return true;
            }
        });
    }

    var playerQuery;
    var tick = 0;
    system.initialize = function () {
        server.log("Myland Loaded");
        commandsReg();
        breakCheck();
        interactCheck();
        attackCheck();
        system.registerComponent("myland:isplayer", {});
        system.listenForEvent("minecraft:entity_created" /* EntityCreated */, function (data) {
            var entity = data.data.entity;
            if (entity.__identifier__ == "minecraft:player") {
                system.createComponent(entity, "myland:isplayer");
            }
        });
        playerQuery = system.registerQuery();
        system.addFilterToQuery(playerQuery, "myland:isplayer");
    };
    system.update = function () {
        tick++;
        if (tick == 20) {
            tick = 0;
            var players = system.getEntitiesFromQuery(playerQuery);
            for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
                var player = players_1[_i];
                moveCheck(player);
            }
        }
    };

}());
