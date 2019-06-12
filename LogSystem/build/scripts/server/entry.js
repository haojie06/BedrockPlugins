(() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    define("database", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
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
        exports.CREATE_TABLE = fix `
      CREATE TABLE IF NOT EXISTS log(
        id,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        playerX INT NOT NULL,
        playerY INT NOT NULL,
        playerZ INT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        targetX INT NOT NULL,
        targetY INT NOT NULL,
        targetZ INT NOT NULL,
        dim TEXT NOT NULL,
        desc TEXT,
        timestamp INT NOT NULL
      );`;
        //添加记录
        exports.INSERT_LOG = fix `
      INSERT INTO log (
        time, name, playerX, playerY, playerZ, action, target, targetX, targetY, targetZ, dim, desc, timestamp
      ) values (
        $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp
      );`;
        //获得一个玩家的所有行为
        exports.SELECT_LOG_BY_NAME = fix `SELECT * FROM log WHERE name=$name;`;
        //获得所有的日志
        exports.SELECT_ALL_LOG = fix `SELECT * FROM log;`;
        //export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;
        //获得一个范围内（x y z）的所有记录
        exports.SELECT_ALL_IN_ZONE = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim`;
        exports.SELECT_IN_ZONE_BYACTION = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action`;
        //新增一个约束条件 几小时之内
        exports.SELECT_ALL_IN_ZONE_AFTERTIME = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline`;
        exports.SELECT_IN_ZONE_BYACTION_AFTERTIME = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline`;
        exports.SELECT_ALL_IN_ZONE_AFTERTIME_PNAME = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline AND name=$player`;
        exports.SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME = fix `SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline AND name=$player`;
        exports.db = new SQLite3("logs.db");
        exports.db.exec(exports.CREATE_TABLE);
        //向数据库中添加记录
        function addRecord($time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc = "") {
            let $timestamp = new Date().getTime();
            exports.db.update(exports.INSERT_LOG, { $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp });
        }
        exports.addRecord = addRecord;
        function readRecord($sX, $sY, $sZ, $eX, $eY, $eZ, $dim, $action = "all", $hour = 0, $player = "") {
            let $minX = Math.min($sX, $eX);
            let $minY = Math.min($sY, $eY);
            let $minZ = Math.min($sZ, $eZ);
            let $maxX = Math.max($sX, $eX);
            let $maxY = Math.max($sY, $eY);
            let $maxZ = Math.max($sZ, $eZ);
            let result = new Array();
            let datas;
            let selects = ["break", "place", "open"];
            if (selects.indexOf($action) == -1) {
                //无效action使用默认all
                $action = "all";
            }
            var length = 0;
            if ($hour == 0) {
                if ($action == "all") {
                    //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
                    let logs = exports.db.query(exports.SELECT_ALL_IN_ZONE, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim });
                    datas = Array.from(logs);
                }
                else {
                    //读出范围内特定行为的所有记录
                    let logs = exports.db.query(exports.SELECT_IN_ZONE_BYACTION, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action });
                    datas = Array.from(logs);
                }
            }
            else {
                //读取几个小时前
                if ($hour <= 0)
                    throw "hour 需要为正数";
                let now = new Date().getTime();
                var $timeline = now - $hour * 60 * 60 * 1000;
                if ($action == "all") {
                    var logs;
                    //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
                    if ($player == "") {
                        logs = exports.db.query(exports.SELECT_ALL_IN_ZONE_AFTERTIME, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $timeline });
                    }
                    else {
                        logs = exports.db.query(exports.SELECT_ALL_IN_ZONE_AFTERTIME_PNAME, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $timeline, $player });
                    }
                    datas = Array.from(logs);
                }
                else {
                    //读出范围内特定行为的所有记录
                    var logs;
                    if ($player == "") {
                        logs = exports.db.query(exports.SELECT_IN_ZONE_BYACTION_AFTERTIME, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action, $timeline });
                    }
                    else {
                        logs = exports.db.query(exports.SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME, { $minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action, $timeline, $player });
                    }
                    datas = Array.from(logs);
                }
            }
            for (let data of datas) {
                var line;
                switch (data.action) {
                    case "break":
                        line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §c破坏了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                        break;
                    case "place":
                        line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §a放置了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                        break;
                    case "open":
                        line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §9打开了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                        break;
                    default:
                        break;
                }
                length = result.push(line);
            }
            return result;
        }
        exports.readRecord = readRecord;
        //转换维度名字
        function dimTran(dim) {
            let result = "§f未知";
            switch (dim) {
                case "0.0":
                    result = "§2主世界§f";
                case "1.0":
                    result = "§4下界§f";
                case "2.0":
                    result = "§5末地§f";
                    break;
                default:
                    break;
            }
            return result;
        }
    });
    define("system", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        checkApiLevel(1);
        exports.system = server.registerSystem(0, 0);
    });
    define("utils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function getTime() {
            let date = new Date();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hour = date.getHours() + 8; //GMT+8
            let minute = date.getMinutes();
            let second = date.getSeconds();
            return `${month}/${day}/${hour}-${minute}-${second}`;
        }
        exports.getTime = getTime;
        //检查一个名字对应的物品是不是方块
        function checkIfBlock(blockName) {
            let blocks = ["minecraft:stone", "minecraft:stone", "minecraft:grass", "minecraft:dirt", "minecraft:cobblestone", "minecraft:planks", "minecraft:sapling", "minecraft:bedrock", "minecraft:flowing_water", "minecraft:water", "minecraft:flowing_lava", "minecraft:lava", "minecraft:sand", "minecraft:gravel", "minecraft:gold_ore", "minecraft:iron_ore", "minecraft:iron_coal", "minecraft:log", "minecraft:leaves", "minecraft:sponge", "minecraft:glass", "minecraft:lapis_ore", "minecraft:lapis_block", "minecraft:dispenser", "minecraft:sandstone", "minecraft:noteblock", "minecraft:bed", "minecraft:golden_rail", "minecraft:detector_rail", "minecraft:sticky_piston", "minecraft:web", "minecraft:piston", "minecraft:wool", "minecraft:gold_block", "minecraft:iron_block", "minecraft:stone_slab", "minecraft:brick_block", "minecraft:tnt", "minecraft:bookshelf", "minecraft:mossy_cobblestone", "minecraft:obsidian", "minecraft:chest", "minecraft:oak_stairs", "minecraft:diamond_ore", "minecraft:diamond_block", "minecraft:crafting_table", "minecraft:furnace"];
            if (blocks.indexOf(blockName) == -1) {
                return false;
            }
            else {
                return true;
            }
        }
        exports.checkIfBlock = checkIfBlock;
        //检查一个名字对应的物品是不是容器
        function checkIfContainer(blockName) {
            let blocks = ["minecraft:trapped_chest", "minecraft:chest", "minecraft:hopper", "minecraft:furnace", "minecraft:lit_furnace"];
            if (blocks.indexOf(blockName) == -1) {
                return false;
            }
            else {
                return true;
            }
        }
        exports.checkIfContainer = checkIfContainer;
        function stringToInt(st) {
            return Number(st.toFixed(0));
        }
        exports.stringToInt = stringToInt;
        //转换小数
        function transNum(n) {
            if (n >= 0) {
                return Math.floor(n);
            }
            else {
                return Math.ceil(n);
            }
        }
        exports.transNum = transNum;
    });
    define("main", ["require", "exports", "system", "database", "utils"], function (require, exports, system_1, database_1, utils_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        system_1.system.initialize = function () {
            server.log("日志系统v1.2 https://github.com/haojie06/BedrockPlugins");
            //检测记录破坏方块
            this.checkDestroy((player, info) => {
                let playerInfo = this.actorInfo(player);
                let blockInfo = info.block;
                let blockPos = info.blockpos;
                let dim = playerInfo.dim;
                let playerName = playerInfo.name;
                let blockName = blockInfo.value.name;
                let pX = utils_1.transNum(playerInfo.pos[0]);
                let pY = utils_1.transNum(playerInfo.pos[1]);
                let pZ = utils_1.transNum(playerInfo.pos[2]);
                let bX = utils_1.transNum(blockPos[0]);
                let bY = utils_1.transNum(blockPos[1]);
                let bZ = utils_1.transNum(blockPos[2]);
                let time = utils_1.getTime();
                //server.log(`${time} ${playerName}(${pX},${pY},${pZ}) 破坏 ${blockName}(${bX},${bY},${bZ}) `);
                database_1.addRecord(time, playerName, pX, pY, pZ, "break", blockName, bX, bY, bZ, dim);
            });
            /*
              this.checkBuild((player,info)=>{
                let playerInfo = this.actorInfo(player);
                  let blockPos = info.blockpos;
            
                  let playerName = playerInfo.name;
                  let pX = playerInfo.pos[0].toFixed(0);
                  let pY = playerInfo.pos[1].toFixed(0);
                  let pZ = playerInfo.pos[2].toFixed(0);
            
                  let bX = blockPos[0].toFixed(0);
                  let bY = blockPos[1].toFixed(0);
                  let bZ = blockPos[2].toFixed(0);
            
                  let time = getTime();
                  server.log(`${time} ${playerName}(${pX},${pY},${pZ}) build 方块(${bX},${bY},${bZ}) `);
              });
            */
            //手中有物品 右键方块时调用
            /*
              this.checkUse((player,info)=>{
                  let playerInfo = this.actorInfo(player);
                  let item:ItemInstance = info.item;
                  let playerName = playerInfo.name;
                  let itemName = item.name;
                  let itemNum = item.count;
                  let pX = playerInfo.pos[0].toFixed(0);
                  let pY = playerInfo.pos[1].toFixed(0);
                  let pZ = playerInfo.pos[2].toFixed(0);
            
                  let bX = blockPos[0].toFixed(0);
                  let bY = blockPos[1].toFixed(0);
                  let bZ = blockPos[2].toFixed(0);
            
                  let time = getTime();
                  server.log(`${time} ${playerName}(${pX},${pY},${pZ}) useItem ${itemName}`);
              });
            */
            //放置方块记录 1.12之后需要升级
            this.checkUseOn((player, info, result) => {
                if (result == true) {
                    try {
                        let time = utils_1.getTime();
                        let playerInfo = this.actorInfo(player);
                        let dim = playerInfo.dim;
                        let item = info.item;
                        let playerName = playerInfo.name;
                        let itemName = "minecraft:" + item.name;
                        let itemNum = item.count;
                        let pX = utils_1.transNum(playerInfo.pos[0]);
                        let pY = utils_1.transNum(playerInfo.pos[1]);
                        let pZ = utils_1.transNum(playerInfo.pos[2]);
                        let vec3 = info.position;
                        if (itemName != null) {
                            if (utils_1.checkIfBlock(itemName) == true) {
                                //server.log(`${time} ${playerName}(${pX},${pY},${pZ}) 放置 ${itemName}(${transNum(Number(vec3[0]))},${transNum(Number(vec3[1]))},${transNum(Number(vec3[2]))})`);
                                database_1.addRecord(time, playerName, pX, pY, pZ, "place", itemName, utils_1.transNum(Number(vec3[0])), utils_1.transNum(Number(vec3[1])), utils_1.transNum(Number(vec3[2])), dim);
                            }
                            else {
                            }
                        }
                    }
                    catch (error) {
                    }
                }
            });
            //检测打开容器 未来升级
            this.checkUseBlock((player, info) => {
                let time = utils_1.getTime();
                let playerInfo = this.actorInfo(player);
                let dim = playerInfo.dim;
                let block = info.block;
                let blockPos = info.blockpos;
                let playerName = playerInfo.name;
                let pX = utils_1.transNum(playerInfo.pos[0]);
                let pY = utils_1.transNum(playerInfo.pos[1]);
                let pZ = utils_1.transNum(playerInfo.pos[2]);
                let blockName = block.value.name;
                let bX = utils_1.transNum(blockPos[0]);
                let bY = utils_1.transNum(blockPos[1]);
                let bZ = utils_1.transNum(blockPos[2]);
                if (utils_1.checkIfContainer(blockName)) {
                    //server.log(`${time} ${playerName} dim:${dim}(${pX},${pY},${pZ}) 打开容器 ${blockName}(${bX},${bY},${bZ})`);
                    database_1.addRecord(time, playerName, pX, pY, pZ, "open", blockName, bX, bY, bZ, dim);
                }
            });
            //添加查询命令
            // /logs x y z x y z 可选：行为
            // /logsof playerName
            this.registerCommand("logs", {
                description: "读取日志",
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
                        handler(origin, [start, end, action, hour, player]) {
                            if (!origin.entity)
                                throw "Player required";
                            const info = this.actorInfo(origin.entity);
                            let sX = utils_1.transNum(start[0]);
                            let sY = utils_1.transNum(start[1]);
                            let sZ = utils_1.transNum(start[2]);
                            let eX = utils_1.transNum(end[0]);
                            let eY = utils_1.transNum(end[1]);
                            let eZ = utils_1.transNum(end[2]);
                            let dim = info.dim;
                            let records;
                            if (hour < 0) {
                                hour = 0;
                            }
                            if (action == "") {
                                //server.log(`全局查找 ${sX} ${sY} ${sZ}`);
                                records = database_1.readRecord(sX, sY, sZ, eX, eY, eZ, dim, "all", hour, player);
                            }
                            else {
                                //server.log("特定行为查找" + action);
                                records = database_1.readRecord(sX, sY, sZ, eX, eY, eZ, dim, action, hour, player);
                            }
                            let say = `§a§l日志系统1.1 by haojie06 以下为查找到的记录：§f\n`;
                            if (hour == 0) {
                                say += `§b所有时间 `;
                            }
                            else {
                                say += `§b${hour}小时内 `;
                            }
                            if (player == "") {
                                say += `§6所有玩家的`;
                            }
                            else {
                                say += `§6玩家${player}的§f`;
                            }
                            if (action == "break") {
                                say += `§c破坏行为记录§f:\n`;
                            }
                            else if (action == "place") {
                                say += `§9放置行为记录§f:\n`;
                            }
                            else if (action == "open") {
                                say += `§e开箱行为记录§f:\n`;
                            }
                            else {
                                say += `§a所有行为的记录:\n`;
                            }
                            for (let line of records) {
                                say = say + line + "\n";
                            }
                            //server.log(say);
                            this.invokeConsoleCommand("§aLogSystem", `tell ${info.name} ${say}`);
                        }
                    }
                ]
            });
        };
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve("main");
    }
})();