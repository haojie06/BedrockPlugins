(function () {
    'use strict';

    const system = server.registerSystem(0, 0);
    let playerKicked = [];
    let kickTick = 0;
    function kickTickReset() {
        kickTick = 0;
    }
    function kickTickAdd() {
        kickTick++;
        if (kickTick >= 60) {
            kickTick = 0;
            return true;
        }
        else {
            return false;
        }
    }

    let destroyCountMap = new Map();
    let destroyCountTimeStamp = 0;
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
    function checkAdmin(entity) {
        let ifAdmin = false;
        let extra = system.getComponent(entity, "stone:extra_data" /* ExtraData */).data;
        if (extra.value.abilities.value.op.value == "1") {
            ifAdmin = true;
        }
        else {
            ifAdmin = false;
        }
        return ifAdmin;
    }
    function getTime() {
        let date = new Date();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours() + 8; //GMT+8
        let minute = date.getMinutes();
        let second = date.getSeconds();
        return `${month}/${day}/${hour}-${minute}-${second}`;
    }
    function checkMayFly(entity) {
        try {
            let extradata = system.getComponent(entity, "stone:extra_data" /* ExtraData */).data;
            let mayfly = Number(extradata.value.abilities.value.mayfly.value);
            if (mayfly == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    function getDesTimeStamp() {
        return destroyCountTimeStamp;
    }
    function setDesTimeStamp(timestamp) {
        destroyCountTimeStamp = timestamp;
    }

    function fix(arr) {
        return arr
            .join("")
            .replace(/\(\n\s+/g, "(")
            .replace(/\n\s+\)/g, ")")
            .replace(/\s+/g, " ");
    }
    //创建记录不当行为的数据表
    const CREATE_MISB_TABLE = fix `
CREATE TABLE IF NOT EXISTS misb(
  id,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  behavior TEXT NOT NULL,
  description TEXT NOT NULL,
  extra TEXT NOT NULL,
  dim TEXT NOT NULL,
  timestamp INT NOT NULL
);`;
    //
    const CTEATE_ALERTS_TABLE = fix `
CREATE TABLE IF NOT EXISTS alerts(
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  alert TEXT NOT NULL,
  description TEXT NOT NULL,
  extra TEXT NOT NULL
);`;
    const INSERT_ALERTS = fix `
INSERT INTO alerts (
  time, name, alert, description, extra
) values (
  $time, $name, $alert, $description, $extra
);`;
    //添加记录
    const INSERT_MISB = fix `
INSERT INTO misb (
  time, name, position, behavior,description, extra, dim, timestamp
) values (
  $time, $name, $position, $behavior, $description, $extra, $dim, $timestamp
);`;
    const QUERY_ALL_MISB = fix `
SELECT * from misb;
`;
    const QUERY_ALL_ALERTS = fix `
SELECT * from alerts;
`;
    const QUERY_MISB_BYNAME = fix `
SELECT * from misb WHERE name=$name;
`;
    const DELETE_MISB_LOG = fix `DELETE FROM from misb WHERE 1=1;`;
    const DELETE_MISB_AUTOCHECK_LOG = fix `DELETE FROM misb WHERE extra="自动检测";`;
    const DELETE_ALERT_AUTOCHECK_LOG = fix `DELETE FROM alerts WHERE extra="自动检测";`;
    var db = new SQLite3("misbehavior.db");
    db.exec(CREATE_MISB_TABLE);
    db.exec(CTEATE_ALERTS_TABLE);
    function misbDB($name, $behavior, $description, $extra) {
        let date = new Date();
        db.update(INSERT_MISB, {
            $time: getTime(),
            $position: "",
            $name,
            $behavior,
            $description,
            $extra,
            $dim: "0",
            $timestamp: date.getTime()
        });
    }
    function alertDB($name, $alert, $description, $extra) {
        db.update(INSERT_ALERTS, {
            $time: getTime(),
            $name,
            $alert,
            $description,
            $extra
        });
    }

    let enchMap = new Map();
    let levelMap = new Map();
    enchMap.set("0", "protection");
    enchMap.set("1", "fire_aspect");
    enchMap.set("2", "feather_falling");
    enchMap.set("3", "blast_protection");
    enchMap.set("4", "projectile_protection");
    enchMap.set("5", "thorns");
    enchMap.set("6", "respiration");
    enchMap.set("7", "depth_strider");
    enchMap.set("8", "aqua_affinity");
    enchMap.set("9", "sharpness");
    enchMap.set("10", "smite");
    enchMap.set("11", "bane_of_arthropods");
    enchMap.set("12", "knockback");
    enchMap.set("13", "fire_aspect");
    enchMap.set("14", "looting");
    enchMap.set("15", "efficiency");
    enchMap.set("16", "silk_touch");
    enchMap.set("17", "unbreaking");
    enchMap.set("18", "fortune");
    enchMap.set("19", "power");
    enchMap.set("20", "punch");
    enchMap.set("21", "flame");
    enchMap.set("22", "infinity");
    enchMap.set("23", "luck_of_the_sea");
    enchMap.set("24", "lure");
    enchMap.set("25", "frost_walker");
    enchMap.set("26", "mending");
    enchMap.set("27", "");
    enchMap.set("28", "");
    enchMap.set("29", "impaling");
    enchMap.set("30", "riptide");
    enchMap.set("31", "loyalty");
    enchMap.set("32", "channeling");
    levelMap.set("0", 4);
    levelMap.set("1", 4);
    levelMap.set("2", 4);
    levelMap.set("3", 4);
    levelMap.set("4", 4);
    levelMap.set("5", 3);
    levelMap.set("6", 3);
    levelMap.set("7", 3);
    levelMap.set("8", 1);
    levelMap.set("9", 5);
    levelMap.set("10", 5);
    levelMap.set("11", 5);
    levelMap.set("12", 2);
    levelMap.set("13", 2);
    levelMap.set("14", 3);
    levelMap.set("15", 5);
    levelMap.set("16", 1);
    levelMap.set("17", 3);
    levelMap.set("18", 3);
    levelMap.set("19", 5);
    levelMap.set("20", 2);
    levelMap.set("21", 1);
    levelMap.set("22", 1);
    levelMap.set("23", 3);
    levelMap.set("24", 3);
    levelMap.set("25", 2);
    levelMap.set("26", 1);
    levelMap.set("27", 1);
    levelMap.set("28", 1);
    levelMap.set("29", 5);
    levelMap.set("30", 3);
    levelMap.set("31", 3);
    levelMap.set("32", 1);
    levelMap.set("33", 1);
    levelMap.set("34", 4);
    levelMap.set("35", 3);

    let playerQuery;
    let cannotPushContainerList = ["minecraft:smoker", "minecraft:barrel", "minecraft:blast_furnace", "minecraft:grindstone", "minecraft:crafting_table", "minecraft:dropper", "minecraft:hopper", "minecraft:trapped_chest", "minecraft:lit_furnace", "minecraft:furnace", "minecraft:chest", "minecraft:dispenser"];
    let unusualBlockList = ["minecraft:spawn_egg", "minecraft:invisibleBedrock", "minecraft:invisiblebedrock", "minecraft:bedrock", "minecraft:mob_spawner", "minecraft:end_portal_frame", "minecraft:barrier", "minecraft:command_block"];
    //熊孩子喜欢刷的物品列表 (正常游戏很难获得一组的物品)
    let alertItemList = ["minecraft:nether_star", "minecraft:sticky_piston", "minecraft:piston", "minecraft:fire", "minecraft:diamond_block", "minecraft:enchanting_table", "minecraft:brewing_stand", "minecraft:dragon_egg", "minecraft:emerald_block", "minecraft:ender_chest", "minecraft:beacon", "minecraft:slime", "minecraft:experience_bottle", "minecraft:skull", "minecraft:end_crystal"];
    //危险度超过这个数会封禁玩家
    let kickLine = 5, banLine = 15;
    //正常等级临界值  超出这个等级会被踢出
    let normalLv = 250;
    function ItemModuleReg() {
        server.log("防物品作弊模块已加载");
        let date = new Date();
        system.listenForEvent("minecraft:entity_death", data => {
            let entity = data.data.entity;
            try {
                if (entity) {
                    if (entity.__identifier__ == "minecraft:player") {
                        //背包检查
                        invCheck(entity);
                    }
                }
            }
            catch (error) {
            }
        });
        //阻止普通玩家放置不应该放置的东西（基岩/刷怪箱...）
        system.listenForEvent("minecraft:player_placed_block", data => {
            let player = data.data.player;
            if (!checkAdmin(player)) {
                let bPosition = data.data.block_position;
                let playerName = getName(player);
                //不是op才需要进行判断
                let tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
                let tickingArea = tickAreaCmp.data.ticking_area;
                let placeBlock = system.getBlock(tickingArea, bPosition.x, bPosition.y, bPosition.z).__identifier__;
                if (unusualBlockList.indexOf(placeBlock) != -1) {
                    //放置了不该有的方块
                    system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ fill ${bPosition.x} ${bPosition.y} ${bPosition.z} ${bPosition.x} ${bPosition.y} ${bPosition.z} air 0 replace`, data => { });
                    system.sendText(player, `你哪来的方块？`);
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c大家小心,${playerName}放置了${placeBlock}"}]}`, data => { });
                    playerKicked.push(player);
                    kickTickReset();
                    server.log(`${playerName}异常放置${placeBlock}`);
                    db.update(INSERT_MISB, {
                        $time: getTime(),
                        $name: playerName,
                        $position: `${bPosition.x} ${bPosition.y} ${bPosition.z}`,
                        $behavior: `放置异常物品`,
                        $description: placeBlock,
                        $extra: "",
                        $dim: getDimensionOfEntity(player),
                        $timestamp: date.getTime()
                    });
                    //依赖EasyList
                    let datas = db.query(QUERY_MISB_BYNAME, { $name: playerName });
                    if (datas.length > 3) {
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`, data => { });
                        system.executeCommand(`fban ${playerName} misbehaviour-place`, data => { });
                    }
                }
            }
        });
        system.listenForEvent("minecraft:entity_carried_item_changed", data => {
            try {
                let entity = data.data.entity;
                if (entity) {
                    let item = data.data.carried_item;
                    if (entity.__identifier__ == "minecraft:player") {
                        if (!checkAdmin(entity)) {
                            if (unusualBlockList.indexOf(item.__identifier__) != -1) {
                                let playerName = getName(entity);
                                system.sendText(entity, `你持有违禁品`);
                                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}不知道从哪里拿出了违禁品:${item.__identifier__}"}]}`, data => { });
                                system.executeCommand(`clear @a[name="${playerName}"] ${item.__identifier__.split(":")[1]} 0 1000`, data => { });
                                playerKicked.push(entity);
                                kickTickReset();
                                server.log(`${playerName}持有违禁品${item.__identifier__}`);
                                db.update(INSERT_MISB, {
                                    $time: getTime(),
                                    $name: playerName,
                                    $position: "",
                                    $behavior: `持有违禁品`,
                                    $description: `${item.__identifier__}`,
                                    $extra: "",
                                    $dim: getDimensionOfEntity(entity),
                                    $timestamp: date.getTime()
                                });
                                //依赖EasyList
                                let datas = db.query(QUERY_MISB_BYNAME, { $name: playerName });
                                if (datas.length > 3) {
                                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`, data => { });
                                    system.executeCommand(`fban ${playerName} misbehaviour-have`, data => { });
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                server.log("出现错误");
            }
        });
        //防刷
        system.listenForEvent("minecraft:block_interacted_with", data => {
            let player = data.data.player;
            try {
                let bPosition = data.data.block_position;
                let tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
                let tickingArea = tickAreaCmp.data.ticking_area;
                let interactBlock = system.getBlock(tickingArea, bPosition.x, bPosition.y, bPosition.z).__identifier__;
                if (interactBlock == "minecraft:crafting_table") {
                    let comp = system.getComponent(player, "misbehavior:useCraftTable");
                    comp.data.ifUse = true;
                    system.applyComponentChanges(player, comp);
                    system.sendText(player, "打开工作台后进入无法拾取的状态，请右键（手机点击）其他方块解除状态");
                }
                else {
                    let comp = system.getComponent(player, "misbehavior:useCraftTable");
                    if (comp.data.ifUse == true) {
                        system.sendText(player, `解除无法拾取物品的状态`);
                        comp.data.ifUse = false;
                        comp.data.ifShow = false;
                        system.applyComponentChanges(player, comp);
                    }
                }
            }
            catch (error) {
            }
        });
        //使用工作台的时候无法捡起物品
        system.handlePolicy("stone:entity_pick_item_up" /* EntityPickItemUp */, (data, def) => {
            let player = data.entity;
            try {
                if (player.__identifier__ == "minecraft:player") {
                    let comp = system.getComponent(player, "misbehavior:useCraftTable");
                    if (comp.data.ifUse == true) {
                        if (comp.data.ifShow == false) {
                            system.sendText(player, `请右键任意方块解除无法拾取的状态`);
                            comp.data.ifShow = true;
                            system.applyComponentChanges(player, comp);
                        }
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
            catch (error) {
                return true;
            }
        });
        system.handlePolicy("stone:entity_pick_item_up" /* EntityPickItemUp */, (data, def) => {
            let player = data.entity;
            try {
                if (player.__identifier__ == "minecraft:player") {
                    let extradata = system.getComponent(player, "stone:extra_data" /* ExtraData */).data;
                    //server.log(extradata.toString());
                    //system.sendText(player,);
                    //UI容器中必须九个都为空才能拾取
                    let uiEmptyContainerCount = 0;
                    for (let i = 0; i < 9; i++) {
                        let cName = extradata.value.UntrackedInteractionUIContainer.value[i].value.Name.value;
                        if (cName == "") {
                            uiEmptyContainerCount++;
                        }
                    }
                    if (uiEmptyContainerCount == 9) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            catch (error) {
                return true;
            }
        });
        playerQuery = system.registerQuery();
        system.addFilterToQuery(playerQuery, "misbehavior:isplayer");
        system.listenForEvent("minecraft:piston_moved_block", data => {
            try {
                let pPosition = data.data.piston_position;
                let bPosition = data.data.block_position;
                let players = system.getEntitiesFromQuery(playerQuery);
                let suspect;
                //首先利用
                for (let player of players) {
                    let px, py, pz;
                    let comp = system.getComponent(player, "minecraft:position" /* Position */);
                    px = comp.data.x;
                    py = comp.data.y;
                    pz = comp.data.z;
                    //server.log(`共找到${players.length}个在线玩家`);
                    if (px >= (pPosition.x - 10) && px <= (pPosition.x + 10) && py >= (pPosition.y - 10) && py <= (pPosition.y + 10) && pz >= (pPosition.z - 10) && pz <= (pPosition.z + 10) && !checkAdmin(player)) {
                        //此人为嫌疑人
                        let tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
                        let tickingArea = tickAreaCmp.data.ticking_area;
                        let playerName = getName(player);
                        let pushBlock = system.getBlock(tickingArea, bPosition.x, bPosition.y, bPosition.z).__identifier__;
                        if (cannotPushContainerList.indexOf(pushBlock) != -1) {
                            system.executeCommand(`execute @a[name="${playerName}"] ~ ~ ~ fill ${bPosition.x} ${bPosition.y} ${bPosition.z} ${bPosition.x} ${bPosition.y} ${bPosition.z} air 0 replace`, data => { });
                            system.sendText(player, `你想做什么？`);
                            server.log(`玩家${playerName}有刷物品嫌疑`);
                            db.update(INSERT_MISB, {
                                $time: getTime(),
                                $name: playerName,
                                $position: `${bPosition.x} ${bPosition.y} ${bPosition.z}`,
                                $behavior: `刷物品嫌疑`,
                                $description: `推动容器${pushBlock}`,
                                $extra: "",
                                $dim: getDimensionOfEntity(player),
                                $timestamp: date.getTime()
                            });
                            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}有刷物品的嫌疑"}]}`, data => { });
                            let datas = db.query(QUERY_MISB_BYNAME, { $name: playerName });
                            if (datas.length > 3) {
                                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`, data => { });
                                system.executeCommand(`fban ${playerName} misbehaviour-push`, data => { });
                            }
                        }
                        else {
                        }
                    }
                }
            }
            catch (error) {
            }
        });
        //查询命令
        system.registerCommand("misblog", {
            description: "查看不当行为记录",
            permission: 1,
            overloads: [{
                    parameters: [],
                    handler([]) {
                        let datas = Array.from(db.query(QUERY_ALL_MISB, {}));
                        let show = "";
                        for (let index in datas) {
                            let data = datas[index];
                            show += `§a<${index}>${data.time} ${data.name} ${data.behavior} ${data.description}\n`;
                        }
                        return show;
                    }
                }
            ]
        });
        system.registerCommand("alertlog", {
            description: "查看异常警告记录",
            permission: 1,
            overloads: [{
                    parameters: [],
                    handler([]) {
                        let datas = Array.from(db.query(QUERY_ALL_ALERTS, {}));
                        let show = "";
                        for (let index in datas) {
                            let data = datas[index];
                            show += `§a<${index}>${data.time} ${data.name} ${data.alert} ${data.description}\n`;
                        }
                        return show;
                    }
                }
            ]
        });
        system.registerCommand("autocheckclear", {
            description: "清空自动检测记录",
            permission: 1,
            overloads: [{
                    parameters: [],
                    handler([]) {
                        let res = db.update(DELETE_MISB_AUTOCHECK_LOG, {});
                        return `删除${res}条自动检测记录`;
                    }
                }
            ]
        });
        system.registerCommand("alertlogclear", {
            description: "清空自动检测记录（异常检测）",
            permission: 1,
            overloads: [{
                    parameters: [],
                    handler([]) {
                        let res = db.update(DELETE_ALERT_AUTOCHECK_LOG, {});
                        return `删除${res}条自动检测记录`;
                    }
                }
            ]
        });
        system.registerCommand("invcheck", {
            description: "检查背包",
            permission: 0,
            overloads: [{
                    parameters: [{
                            name: "玩家",
                            type: "player"
                        }],
                    handler([player]) {
                        let date = new Date();
                        let stime = date.getTime();
                        for (let p of player) {
                            let res = invCheck(p);
                        }
                        let etime = new Date().getTime();
                        return `检查了${player.length}个玩家 耗时${etime - stime}ms`;
                    }
                }]
        });
    }
    //背包自动检查 检查异常物品/异常附魔
    function invCheck(entity) {
        if (checkAdmin(entity)) {
            return `该玩家有免检查权限`;
        }
        let extradata = system.getComponent(entity, "stone:extra_data" /* ExtraData */).data;
        //严重性计数
        let count = 0;
        //附魔不可超过的等级
        let maxLevel = 5;
        let playerName = getName(entity);
        let level = Number(extradata.value.PlayerLevel.value);
        //玩家等级异常
        if (level > normalLv) {
            //出现异常等级的附魔 进行处理并记录到数据库中
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被检测到等级异常 lv:${level}"}]}`, data => { });
            //记录异常
            misbDB(playerName, "异常等级", `${level}级`, "自动检测");
            system.destroyEntity(entity);
        }
        //装备栏检查
        for (let i = 0; i < 4; i++) {
            let armorName = extradata.value.Armor.value[i].value.Name.value;
            if (armorName == undefined || armorName == "") {
                continue;
            }
            let enchantNum;
            try {
                enchantNum = extradata.value.Armor.value[i].value.tag.value.ench.value.length;
            }
            catch (err) {
                enchantNum = 0;
            }
            if (enchantNum != 0) {
                for (let j = 0; j < enchantNum; j++) {
                    let enchId = String(extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.id.value);
                    let enchLv = extradata.value.Armor.value[i].value.tag.value.ench.value[j].value.lvl.value;
                    let enchName = enchMap.get(enchId);
                    if (enchLv > maxLevel) {
                        //出现异常等级的附魔 进行处理并记录到数据库中
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${armorName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`, data => { });
                        //记录异常
                        misbDB(playerName, "异常附魔", `物品:${armorName} 附魔${enchName}:${enchLv}级 [装备栏]`, "自动检测");
                        count++;
                    }
                }
            }
        }
        //物品栏检查
        for (let i = 0; i < 36; i++) {
            let invName = extradata.value.Inventory.value[i].value.Name.value;
            if (invName == undefined || invName == "") {
                continue;
            }
            let invCount = Number(extradata.value.Inventory.value[i].value.Count.value);
            //检查物品是否违禁品
            if (unusualBlockList.indexOf(invName) != -1) {
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被检测到持有违禁品:${invName} 数量:${invCount}"}]}`, data => { });
                //记录异常
                misbDB(playerName, "违禁品", `物品:${invName}数量:${invCount} [物品栏]`, "自动检测");
                count++;
            }
            //检测玩家是否持有异常数量的物品
            if (alertItemList.indexOf(invName) != -1 && invCount > 63) {
                alertDB(playerName, "异常数量物品", `物品:${invName}数量:${invCount} [物品栏]`, "自动检测");
                server.log(`检测到${playerName}拥有异常数量物品 物品:${invName}数量:${invCount} [物品栏]`);
            }
            let enchantNum;
            try {
                enchantNum = extradata.value.Inventory.value[i].value.tag.value.ench.value.length;
            }
            catch (err) {
                enchantNum = 0;
            }
            if (enchantNum != 0) {
                for (let j = 0; j < enchantNum; j++) {
                    let enchId = String(extradata.value.Inventory.value[i].value.tag.value.ench.value[j].value.id.value);
                    let enchLv = extradata.value.Inventory.value[i].value.tag.value.ench.value[j].value.lvl.value;
                    let enchName = enchMap.get(enchId);
                    if (enchLv > maxLevel) {
                        //出现异常等级的附魔 进行处理并记录到数据库中
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${invName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`, data => { });
                        //记录异常
                        misbDB(playerName, "异常附魔", `物品:${invName} 附魔${enchName}:${enchLv}级 [物品栏]`, "自动检测");
                        count++;
                    }
                }
            }
        }
        //末影箱检查
        for (let i = 0; i < 27; i++) {
            let invName = extradata.value.EnderChestInventory.value[i].value.Name.value;
            if (invName == undefined || invName == "") {
                continue;
            }
            let invCount = Number(extradata.value.EnderChestInventory.value[i].value.Count.value);
            if (unusualBlockList.indexOf(invName) != -1) {
                system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的末影箱被检测出包含违禁品:${invName} 数量:${invCount}"}]}`, data => { });
                //记录异常
                misbDB(playerName, "违禁品", `物品:${invName}数量:${invCount} [末影箱]`, "自动检测");
                count++;
            }
            if (alertItemList.indexOf(invName) != -1 && invCount > 63) {
                alertDB(playerName, "异常数量物品", `物品:${invName}数量:${invCount} [末影箱]`, "自动检测");
                server.log(`检测到${playerName}拥有异常数量物品 物品:${invName}数量:${invCount} [末影箱]`);
            }
            let enchantNum;
            try {
                enchantNum = extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value.length;
            }
            catch (err) {
                enchantNum = 0;
            }
            if (enchantNum != 0) {
                for (let j = 0; j < enchantNum; j++) {
                    let enchId = String(extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value[j].value.id.value);
                    let enchLv = extradata.value.EnderChestInventory.value[i].value.tag.value.ench.value[j].value.lvl.value;
                    let enchName = enchMap.get(enchId);
                    if (enchLv > maxLevel) {
                        //出现异常等级的附魔 进行处理并记录到数据库中
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的${invName}被检测到异常附魔:${enchName} lv:${enchLv}"}]}`, data => { });
                        //记录异常
                        misbDB(playerName, "异常附魔", `物品:${invName} 附魔${enchName}:${enchLv}级 [末影箱]`, "自动检测");
                        count++;
                    }
                }
            }
        }
        //system.sendText(entity,`完成检查 危险度:${count}`);
        if (count > banLine) {
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的危险度${count}超过上限${kickLine} 踢出"}]}`, data => { });
            server.log(`${playerName}的危险度${count}超过上限${banLine} 封禁`);
            system.executeCommand(`fban ${playerName} misbehaviour-autocheck`, data => { });
        }
        else if (count > kickLine) {
            system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}的危险度${count}超过上限${kickLine} 踢出"}]}`, data => { });
            server.log(`${playerName}的危险度${count}超过上限${kickLine} 踢出`);
            system.executeCommand(`clear @a[name="${playerName}"]`, data => { });
            system.destroyEntity(entity);
        }
        return `检查完成 危险度${count}`;
    }

    let destroyStatusMap = new Map();
    function destroyReg() {
        server.log("MisBehavior 防破坏作弊模块已加载");
        system.listenForEvent("minecraft:block_destruction_started", data => {
            try {
                let player = data.data.player;
                let bPosition = data.data.block_position;
                let playerName = getName(player);
                /*
                let ds:DestroyStatus = {
                    startTime:date.getTime(),
                    bx:bPosition.x,
                    by:bPosition.y,
                    bz:bPosition.z
                };
                */
                destroyStatusMap.set(playerName, "start");
            }
            catch (error) {
                server.log("MISBEHAVIOR:防破坏作弊模块出错");
            }
        });
        system.listenForEvent("minecraft:block_destruction_stopped", data => {
            try {
                let player = data.data.player;
                let playerName = getName(player);
                let progress = data.data.destruction_progress;
                let bPosition = data.data.block_position;
                destroyStatusMap.delete(playerName);
            }
            catch (error) {
                server.log("MISBEHAVIOR:防破坏作弊模块出错");
            }
        });
        system.listenForEvent("minecraft:player_destroyed_block", data => {
            try {
                let player = data.data.player;
                let bPosition = data.data.block_position;
                let blockName = data.data.block_identifier;
                let playerName = getName(player);
                //添加破坏计数器
                //system.sendText(player,`方块破坏 ${bPosition.x} ${bPosition.y} ${bPosition.z}`);
                if (destroyCountMap.has(playerName)) {
                    let count = destroyCountMap.get(playerName);
                    destroyCountMap.set(playerName, count + 1);
                }
                else {
                    destroyCountMap.set(playerName, 1);
                }
                if (!destroyStatusMap.has(playerName)) {
                    system.sendText(player, `检测到异常`);
                    misbDB(playerName, "瞬间破坏", `检测到伪创造瞬间破坏作弊`, "自动检测");
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c自动检测：高度怀疑${playerName}使用了伪创造瞬间破坏,踢出"}]}`, data => { });
                    server.log(`自动检测：高度怀疑${playerName}使用了伪创造瞬间破坏,踢出`);
                    system.destroyEntity(player);
                    //依赖EasyList
                    let datas = db.query(QUERY_MISB_BYNAME, { $name: playerName });
                    if (datas.length > 3) {
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${playerName}被记录的异常行为超过3次，予以封禁"}]}`, data => { });
                        system.executeCommand(`fban ${playerName} misbehaviour-autoban`, data => { });
                    }
                }
                else {
                }
            }
            catch (error) {
            }
        });
    }

    let flyStatusMap = new Map();
    let misbFlyCountMap = new Map();
    //目前飞行判断方法 两次检测中玩家周围都是空气 且坐标不发生改变
    function flyCheatReg() {
        server.log("反飞行作弊模块已加载");
        system.registerCommand("flycheck", {
            description: "检查异常飞行",
            permission: 1,
            overloads: [{
                    parameters: [{
                            name: "player",
                            type: "player"
                        }],
                    handler([players]) {
                        try {
                            let sTime = new Date().getTime();
                            for (let player of players) {
                                //获得玩家周围的方块
                                if (player) {
                                    if (checkAdmin(player)) {
                                        continue;
                                    }
                                    let tickAreaCmp = system.getComponent(player, "minecraft:tick_world" /* TickWorld */);
                                    let tickingArea = tickAreaCmp.data.ticking_area;
                                    let posCmp = system.getComponent(player, "minecraft:position" /* Position */);
                                    let x = Math.floor(posCmp.data.x);
                                    let y = Math.floor(posCmp.data.y);
                                    let z = Math.floor(posCmp.data.z);
                                    //let curBlock = system.getBlock(tickingArea,x,y+i,z).__identifier__;
                                    //脚底下9个方块全部是air
                                    let temp = system.getBlock(tickingArea, x, y - 1, z).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x + 1, y - 1, z + 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x - 1, y - 1, z - 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x + 1, y - 1, z - 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x - 1, y - 1, z + 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x, y - 1, z + 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x, y - 1, z - 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x + 1, y - 1, z).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x - 1, y - 1, z).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    //排除挂在梯子上的情况。。
                                    temp = system.getBlock(tickingArea, x - 1, y, z).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x + 1, y, z).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x, y, z - 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    temp = system.getBlock(tickingArea, x, y, z + 1).__identifier__;
                                    if (temp != "minecraft:air") {
                                        continue;
                                    }
                                    //system.sendText(player,`疑似飞行`);
                                    let playerName = getName(player);
                                    //查看是否上一次也是这里
                                    if (flyStatusMap.has(playerName)) {
                                        let fs = flyStatusMap.get(playerName);
                                        //空中停留判定为飞行（也许可以优化一下这个判断？）  改成小范围停留也算了
                                        if (x > fs.px - 2 && x < fs.px + 2 && y == fs.py && z > fs.pz - 2 && z < fs.pz + 2) {
                                            if (!checkMayFly(player)) {
                                                //system.sendText(player,`判定为异常飞行`);
                                                misbDB(playerName, "飞行作弊", `检测到飞行作弊`, "自动检测");
                                                if (misbFlyCountMap.has(playerName)) {
                                                    let count = misbFlyCountMap.get(playerName);
                                                    if (count > 2) {
                                                        //踢出玩家
                                                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c自动检测：检测到${playerName}违反引力作用,踢出"}]}`, data => { });
                                                        server.log(`自动检测：检测到${playerName}飞行作弊,踢出`);
                                                        system.destroyEntity(player);
                                                        misbFlyCountMap.delete(playerName);
                                                    }
                                                    else {
                                                        //仅仅是把玩家拉回地面 (最多向下100)
                                                        misbFlyCountMap.set(playerName, count + 1);
                                                        for (let i = 1; i < 100; i++) {
                                                            let block = system.getBlock(tickingArea, x, y - i, z).__identifier__;
                                                            if (block != "minecraft:air") {
                                                                system.executeCommand(`tp @a[name="${playerName}"] ${x} ${y - i + 1} ${z}`, data => { });
                                                                system.sendText(player, `你受到地心引力作用`);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    misbFlyCountMap.set(playerName, 0);
                                                }
                                            }
                                            else {
                                                system.sendText(player, `你有飞行权限`, 5);
                                            }
                                        }
                                        else {
                                            //删除记录重新记录
                                            flyStatusMap.delete(playerName);
                                        }
                                    }
                                    else {
                                        let fs = {
                                            px: x,
                                            py: y,
                                            pz: z
                                        };
                                        flyStatusMap.set(playerName, fs);
                                    }
                                }
                            }
                            let eTime = new Date().getTime();
                            //server.log(`飞行检测耗时${eTime - sTime}ms`)
                        }
                        catch (error) {
                        }
                    }
                }
            ]
        });
    }

    let tick = 0;
    let tick2 = 0;
    let tick3 = 0;
    system.initialize = function () {
        server.log("Misbehavior loaded");
        system.registerComponent("misbehavior:isplayer", {});
        //这个组件记录玩家是否打开了工作台（打开工作台的时候将无法捡起物品,防刷）
        system.registerComponent("misbehavior:useCraftTable", {
            ifUse: false,
            ifShow: false
        });
        system.listenForEvent("minecraft:entity_created" /* EntityCreated */, data => {
            let entity = data.data.entity;
            try {
                if (entity) {
                    if (entity.__identifier__ == "minecraft:player") {
                        system.createComponent(entity, "misbehavior:isplayer");
                        system.createComponent(entity, "misbehavior:useCraftTable");
                    }
                }
            }
            catch (error) {
            }
        });
        ItemModuleReg();
        destroyReg();
        flyCheatReg();
    };
    system.update = function () {
        tick++;
        tick2++;
        tick3++;
        if (tick > 1200) {
            tick = 0;
            //system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c进行背包检查"}]}`,data=>{});
            system.executeCommand(`invcheck @a`, data => { });
        }
        if (tick2 > 20) {
            tick2 = 0;
            system.executeCommand(`flycheck @a`, data => { });
        }
        if (tick3 > 200) {
            tick3 = 0;
            //防止异常破坏速度
            for (let key of destroyCountMap.keys()) {
                let count = 0;
                let useTime = 0;
                let destroyCountTimeStamp = getDesTimeStamp();
                if (destroyCountTimeStamp != 0) {
                    let nowTimeStamp = new Date().getTime();
                    useTime = (nowTimeStamp - destroyCountTimeStamp) / 1000;
                    count = Number(destroyCountMap.get(key) / useTime);
                }
                else {
                    count = Number(destroyCountMap.get(key) / 10);
                }
                setDesTimeStamp(new Date().getTime());
                //system.executeCommand(`tellraw @a[name="${key}"] {"rawtext":[{"text":"200tick中总共破坏了${destroyCountMap.get(key)}个方块 平均每秒你破坏了${count}个方块 200tick耗时${useTime}s"}]}`,data=>{});
                if (count > 12 && count != Infinity) {
                    //异常的破坏速度
                    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c检测到${key}的破坏速度异常,平均每秒破坏了${count}个方块"}]}`, data => { });
                    server.log(`检测到${key}的破坏速度异常,平均每秒破坏了${count}个方块`);
                    //依赖EasyList
                    system.executeCommand(`fkick @a[name="${key}"]`, data => { });
                    misbDB(key, "破坏速度作弊", `平均每秒破坏${count}个方块`, "自动检测");
                    let datas = db.query(QUERY_MISB_BYNAME, { $name: key });
                    /*
                    if (datas.length > 3){
                        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c${key}被记录的异常行为超过3次，予以封禁"}]}`,data=>{});
                        system.executeCommand(`fban ${key} misbehaviour-autoban`,data=>{});
                    }
                    */
                }
                destroyCountMap.delete(key);
            }
        }
        if (kickTickAdd()) {
            for (let index in playerKicked) {
                system.destroyEntity(playerKicked[index]);
                playerKicked.splice(Number(index), 1);
            }
        }
    };

}());
