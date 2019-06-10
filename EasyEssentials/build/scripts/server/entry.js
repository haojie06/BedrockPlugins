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
        exports.db = new SQLite3("warp.db");
        exports.db.exec(exports.CREATE_TABLE);
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
        const showWarp = (entity) => {
            server.log(`数据库记录： ${entity.name}--${entity.position}--${entity.owner}`);
        };
        system_1.system.initialize = function () {
            server.log("ess plugin loaded");
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
                            this.invokeConsoleCommand("kill", "kill " + '"' + '"' + info.name + '"' + '"');
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
            system_1.system.listenForEvent("minecraft:entity_death", onEntityDeath);
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
        };
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
                position = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
            }
            else {
                position = "无法获得坐标";
            }
            return position;
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