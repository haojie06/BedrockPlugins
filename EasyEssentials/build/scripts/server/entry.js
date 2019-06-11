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
        function fix(arr) {
            return arr
                .join("")
                .replace(/\(\n\s+/g, "(")
                .replace(/\n\s+\)/g, ")")
                .replace(/\s+/g, " ");
        }
        //创建一个储存warp坐标的表
        exports.CREATE_TABLE = fix `
      CREATE TABLE IF NOT EXISTS warp(
        id,
        name TEXT NOT NULL UNIQUE,
        position TEXT NOT NULL,
        owner TEXT NOT NULL
      );`;
        exports.INSERT_WARP = fix `
      INSERT INTO warp (
        name, owner, position
      ) values (
        $name, $owner, $position
      );`;
        exports.SELECT_WARP_BY_NAME = fix `SELECT * FROM warp WHERE name=$name;`;
        exports.SELECT_ALL_WARP = fix `SELECT * FROM warp;`;
        exports.DELETE_WARP_BY_NAME = fix `DELETE FROM warp WHERE name=$name;`;
        //创建一个储存home信息的表
        exports.CREATE_HOME_TABLE = fix `
      CREATE TABLE IF NOT EXISTS homes(
        id,
        homeName TEXT NOT NULL,
        position TEXT NOT NULL,
        owner TEXT NOT NULL
      );`;
        //查找一个owner的所有home
        exports.SELECT_HOME_BY_OWNER = fix `SELECT * FROM homes WHERE owner=$owner;`;
        //根据owner和home名字查找  !注意 一个owner之下不要出现重名的home
        exports.SELECT_HOME_BY_NAME = fix `SELECT * FROM homes WHERE owner=$owner AND homeName=$homeName;`;
        //添加home记录
        exports.INSERT_HOME = fix `
      INSERT INTO homes (
        homeName, position, owner
      ) values (
        $homeName, $position, $owner
      );`;
        //删除一个home
        exports.DELETE_HOME_BY_NAME = fix `DELETE FROM homes WHERE homeName=$homeName AND owner=$owner;`;
        exports.db = new SQLite3("ess.db");
        exports.db.exec(exports.CREATE_TABLE);
        exports.db.exec(exports.CREATE_HOME_TABLE);
    });
    define("system", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        checkApiLevel(1);
        exports.system = server.registerSystem(0, 0);
    });
    define("main", ["require", "exports", "system", "database"], function (require, exports, system_1, database_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        //死亡坐标map
        var deathMap = {};
        // 初始化时调用
        const showWarp = (entity) => {
            server.log(`数据库记录： ${entity.name}--${entity.position}--${entity.owner}`);
        };
        system_1.system.initialize = function () {
            server.log("EasyEssentials: plugin loaded");
            //添加自杀命令
            this.registerCommand("suicide", {
                description: "杀死你自己",
                permission: 0,
                overloads: [{
                        //添加的命令需要的参数
                        parameters: [],
                        //判断处理命令来源
                        handler(original) {
                            //来源不是实体
                            if (!original.entity)
                                throw "Player required";
                            const info = this.actorInfo(original.entity);
                            this.invokeConsoleCommand("kill", `kill "${info.name}"`);
                        }
                    }]
            });
            this.registerCommand("back", {
                description: "返回上次死亡地点",
                permission: 0,
                overloads: [{
                        parameters: [],
                        handler(original) {
                            if (!original.entity)
                                throw "Player required";
                            const info = this.actorInfo(original.entity);
                            if (info.dim !== 0)
                                throw "Cannot cross-dimension teleport";
                            if (deathMap[info.name] == undefined)
                                throw "未记录死亡点";
                            //打开确认ui
                            this.openModalForm(original.entity, JSON.stringify({
                                type: "modal",
                                title: "back Menu",
                                content: `你打算返回上一个死亡地点吗(${deathMap[info.name]})`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    this.invokeConsoleCommand("ess", "tp " + '"' + info.name + '"' + " " + deathMap[info.name]);
                                    deathMap[info.name] = undefined;
                                }
                            })
                                .catch(server.log);
                        }
                    }]
            });
            //设置传送点 op命令
            this.registerCommand("setwarp", {
                description: "设置传送点",
                permission: 1,
                overloads: [{
                        parameters: [{
                                name: "name",
                                type: "string"
                            }],
                        handler(original, [$name]) {
                            const entity = original.entity;
                            if (!entity)
                                throw "Designed for player usage";
                            const info = this.actorInfo(entity);
                            if (info.dim !== 0)
                                throw "只能在主世界设置传送点";
                            let comp = system_1.system.getComponent(entity, "minecraft:position" /* Position */);
                            let $position = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
                            let $owner = info.name;
                            this.openModalForm(original.entity, JSON.stringify({
                                type: "modal",
                                title: "set warp",
                                content: `你将要设置名为${$name}的传送点(${$position})`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    //先判断能否写入
                                    //Array.from(db.query(SELECT_ALL_WARP, {})).map(showWarp);
                                    const datas = Array.from(database_1.db.query(database_1.SELECT_WARP_BY_NAME, { $name }));
                                    if (datas.length != 0)
                                        throw "已有同名传送点";
                                    database_1.db.update(database_1.INSERT_WARP, {
                                        $name,
                                        $owner,
                                        $position
                                    });
                                    this.invokeConsoleCommand("warp", "say 已经成功创建传送点");
                                }
                            })
                                .catch(server.log);
                        }
                    }]
            });
            //删除传送点 op命令
            this.registerCommand("delwarp", {
                description: "删除传送点",
                permission: 1,
                overloads: [{
                        parameters: [{
                                name: "name",
                                type: "string"
                            }],
                        handler(original, [$name]) {
                            const entity = original.entity;
                            if (!entity)
                                throw "Designed for player usage";
                            //先判断能否删除
                            const datas = Array.from(database_1.db.query(database_1.SELECT_WARP_BY_NAME, { $name }));
                            if (datas.length == 0)
                                throw "没有该传送点";
                            let $position = datas[0].position;
                            const info = this.actorInfo(entity);
                            this.openModalForm(original.entity, JSON.stringify({
                                type: "modal",
                                title: "delete warp",
                                content: `你将要删除名为${$name}的传送点(${$position})`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    database_1.db.update(database_1.DELETE_WARP_BY_NAME, {
                                        $name
                                    });
                                    this.invokeConsoleCommand("warp", "say 已经成功删除传送点");
                                }
                            })
                                .catch(server.log);
                        }
                    }]
            });
            //传送至传送点
            this.registerCommand("warp", {
                description: "传送至传送点",
                permission: 0,
                overloads: [{
                        parameters: [{
                                name: "name",
                                type: "string"
                            }],
                        handler(original, [$name]) {
                            const entity = original.entity;
                            if (!entity)
                                throw "Designed for player usage";
                            const info = this.actorInfo(entity);
                            if (info.dim != 0)
                                throw "只能在主世界传送";
                            const datas = Array.from(database_1.db.query(database_1.SELECT_WARP_BY_NAME, { $name }));
                            if (datas.length != 1)
                                throw "无效的传送点";
                            let position = datas[0].position;
                            let owner = datas[0].owner;
                            this.openModalForm(original.entity, JSON.stringify({
                                type: "modal",
                                title: "warp",
                                content: `你将要传送至名为${$name}的传送点(${position})`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    this.invokeConsoleCommand("warp", `tp "${info.name}" ${position}`);
                                    this.invokeConsoleCommand("warp", `tell "${info.name}" 已为你传送`);
                                }
                            })
                                .catch(server.log);
                        }
                    }]
            });
            this.registerCommand("warps", {
                description: "显示所有传送点",
                permission: 0,
                overloads: [{
                        parameters: [],
                        handler(original) {
                            const entity = original.entity;
                            if (!entity)
                                throw "Designed for player usage";
                            const info = this.actorInfo(entity);
                            if (info.dim != 0)
                                throw "只能在主世界传送";
                            const datas = Array.from(database_1.db.query(database_1.SELECT_ALL_WARP, {}));
                            let show;
                            for (var data of datas) {
                                show += `${data.name}:(${data.position} by ${data.owner})`;
                                this.invokeConsoleCommand("warp", `tell "${info.name}" ${show}`);
                            }
                        }
                    }]
            });
            //玩家死亡时记录
            system_1.system.listenForEvent("minecraft:entity_death", onEntityDeath);
            //让玩家可以设置多个home
            this.registerCommand("sethome", {
                description: "在当前坐标设置家",
                permission: 0,
                overloads: [{
                        parameters: [{
                                name: "home的名字",
                                type: "string"
                            }],
                        handler(original, [$homeName]) {
                            if (!original.entity)
                                throw "只有玩家玩家可以设置home";
                            const info = this.actorInfo(original.entity);
                            if (info.dim != 0)
                                throw "请勿在主世界之外设置家";
                            //判断是否可以写入数据库 
                            //先选出所有记录
                            let $owner = info.name;
                            var datas = Array.from(database_1.db.query(database_1.SELECT_HOME_BY_OWNER, { $owner }));
                            //在这里设置玩家家的上限 
                            if (datas.length < 3) {
                                server.log("数量符合要求" + datas.length);
                                //判断是否有重名的home
                                for (let data of datas) {
                                    if (data.homeName == $homeName) {
                                        throw "已经设置过同名的home";
                                    }
                                }
                                let $position = getPositionofEntity(original.entity);
                                //可以执行添加
                                database_1.db.update(database_1.INSERT_HOME, { $homeName, $position, $owner });
                            }
                            else {
                                throw "设置的home数量超过上限";
                            }
                        }
                    }]
            });
            //让玩家可以设置多个home
            this.registerCommand("homelist", {
                description: "查看所有已设置的家",
                permission: 0,
                overloads: [{
                        parameters: [],
                        handler(original, []) {
                            if (!original.entity)
                                throw "只有玩家玩家可以查看home";
                            const info = this.actorInfo(original.entity);
                            //先选出所有记录
                            let $owner = info.name;
                            var datas = Array.from(database_1.db.query(database_1.SELECT_HOME_BY_OWNER, { $owner }));
                            //在这里设置玩家家的上限 
                            if (datas.length == 0)
                                throw "你还没有设置家哟";
                            let say = `§9§l下面为你已设置的家:§r\n`;
                            server.log(datas.length);
                            for (let index in datas) {
                                say += `§a<${Number(index) + 1}>.home:${datas[index].homeName} position: ${datas[index].position}\n`;
                            }
                            this.invokeConsoleCommand("home", `tell "${$owner}" ${say}`);
                        }
                    }]
            });
            //删除已设置的home
            this.registerCommand("delhome", {
                description: "删除已经设置的家",
                permission: 0,
                overloads: [{
                        parameters: [{
                                name: "home的名字",
                                type: "string"
                            }],
                        handler(original, [$homeName]) {
                            if (!original.entity)
                                throw "只有玩家玩家可以删除home";
                            const info = this.actorInfo(original.entity);
                            //判断是否可以删除 
                            //先选出所有记录
                            let $owner = info.name;
                            var datas = Array.from(database_1.db.query(database_1.SELECT_HOME_BY_OWNER, { $owner }));
                            //在这里设置玩家家的上限 
                            if (datas.length != 0) {
                                //记录是否删除
                                let flag = false;
                                //判断是否有重名的home
                                for (let data of datas) {
                                    if (data.homeName == $homeName) {
                                        //可以执行删除
                                        database_1.db.update(database_1.DELETE_HOME_BY_NAME, { $homeName, $owner });
                                        flag = true;
                                    }
                                }
                                if (flag) {
                                    this.invokeConsoleCommand("home", `tell "${$owner}" §a已删除${$homeName}`);
                                }
                                else {
                                    this.invokeConsoleCommand("home", `tell "${$owner}" §c删除${$homeName}失败`);
                                }
                            }
                            else {
                                throw "home数量为0";
                            }
                        }
                    }]
            });
            //尾巴
            //执行 /home传送
            this.registerCommand("home", {
                description: "传送至已设置的家",
                permission: 0,
                overloads: [{
                        parameters: [{
                                name: "home的名字",
                                type: "string",
                                optional: true
                            }],
                        handler(original, [$homeName]) {
                            if (!original.entity)
                                throw "只有玩家玩家可以使用/home";
                            const info = this.actorInfo(original.entity);
                            if (info.dim != 0)
                                throw "只有在主世界才能使用/home";
                            //先选出所有记录
                            let $owner = info.name;
                            var datas = Array.from(database_1.db.query(database_1.SELECT_HOME_BY_OWNER, { $owner }));
                            //在这里设置玩家家的上限 
                            if (datas.length != 0) {
                                if ($homeName == "") {
                                    server.log("未带参数");
                                    this.invokeConsoleCommand("home", `tp "${$owner}" ${datas[0].position}`);
                                    this.invokeConsoleCommand("home", `tell "${$owner}" 已传送至${datas[0].homeName}`);
                                }
                                else {
                                    //判断是否有重名的home
                                    for (let data of datas) {
                                        if (data.homeName == $homeName) {
                                            //可以执行传送
                                            this.invokeConsoleCommand("home", `tp "${$owner}" ${data.position}`);
                                            this.invokeConsoleCommand("home", `tell "${$owner}" 已传送至${data.homeName}`);
                                        }
                                    }
                                }
                            }
                            else {
                                throw "你还没有设置家哟~";
                            }
                        }
                    }]
            });
        };
        function onEntityDeath(eventData) {
            let entity = eventData.entity;
            //如果死亡的实体是玩家
            if (entity.__identifier__ == "minecraft:player") {
                //拥有坐标组件
                if (system_1.system.hasComponent(entity, "minecraft:position")) {
                    let position = getPositionofEntity(entity);
                    let name = getNameofEntity(entity);
                    server.log(name + " " + position);
                    deathMap[name] = position;
                }
            }
        }
        function getNameofEntity(entity) {
            let name;
            if (system_1.system.hasComponent(entity, "minecraft:nameable")) {
                let comp = system_1.system.getComponent(entity, "minecraft:nameable" /* Nameable */);
                name = comp.data.name;
            }
            else {
                name = "无法获得实体名字";
            }
            return name;
        }
        function getPositionofEntity(entity) {
            let position;
            if (system_1.system.hasComponent(entity, "minecraft:position")) {
                let comp = system_1.system.getComponent(entity, "minecraft:position" /* Position */);
                let px, py, pz;
                position = transNum(comp.data.x) + " " + transNum(comp.data.y) + " " + transNum(comp.data.z);
            }
            else {
                position = "无法获得坐标";
            }
            return position;
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