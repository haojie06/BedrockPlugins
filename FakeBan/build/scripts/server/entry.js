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
      CREATE TABLE IF NOT EXISTS list(
        id,
        name TEXT NOT NULL,
        kind TEXT NOT NULL,
        msg TEXT
    );`;
        exports.INSERT_LIST = fix `
      INSERT INTO list (
        name, kind, msg
      ) values (
        $name, $kind, $msg
    );`;
        //找出白/黑名单中是否有这个人
        exports.SELECT_NAME_IN_LIST = fix `SELECT name FROM list WHERE name=$name AND kind=$kind;`;
        exports.DELETE_NAME_IN_LIST = fix `DELETE FROM list WHERE name=$name AND kind=$kind;`;
        exports.SELECT_ALL_IN_LIST = fix `SELECT name FROM list WHERE kind=$kind;`;
        exports.db = new SQLite3("list.db");
        exports.db.exec(exports.CREATE_TABLE);
    });
    define("system", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        checkApiLevel(1);
    });
    define("main", ["require", "exports", "database"], function (require, exports, database_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        const system = server.registerSystem(0, 0);
        var tick = 0, tick2 = 0;
        var playerBanedInfoList = [];
        var playerNotInWhitelist = [];
        var playerQuery;
        system.initialize = function () {
            server.log("虚假的白/黑名单 loaded");
            system.listenForEvent("minecraft:entity_created", onPlayerJoin);
            this.registerSoftEnum("whitelist_enum", ["add", "remove"]);
            //注册自定义组件，用于标识玩家
            system.registerComponent("fakeban:isplayer", {});
            playerQuery = system.registerQuery();
            system.addFilterToQuery(playerQuery, "fakeban:isplayer");
            this.registerCommand("fban", {
                description: "虚假的封禁",
                permission: 1,
                overloads: [
                    {
                        parameters: [
                            {
                                type: "string",
                                name: "target"
                            },
                            {
                                type: "message",
                                name: "message",
                                optional: true
                            }
                        ],
                        handler(origin, [target, msg]) {
                            let $kind = "blacklist";
                            let $name = target;
                            let $msg = "封禁";
                            if (msg != "") {
                                $msg = msg;
                            }
                            database_1.db.update(database_1.INSERT_LIST, {
                                $name,
                                $kind,
                                $msg
                            });
                            playerBanedInfoList.push($name);
                            //system.invokeConsoleCommand("§3ban",`say 已将${$name}封禁 ${$msg}`);
                            //server.log(`已封禁${$name} ${$msg}`);
                            system.broadcastMessage(`§c已封禁${$name}  ${$msg}`);
                        }
                    }
                ]
            });
            this.registerCommand("funban", {
                description: "虚假的解封",
                permission: 1,
                overloads: [
                    {
                        parameters: [
                            {
                                type: "string",
                                name: "target"
                            }
                        ],
                        handler(origin, [target]) {
                            let $kind = "blacklist";
                            let $name = target;
                            database_1.db.update(database_1.DELETE_NAME_IN_LIST, {
                                $name,
                                $kind
                            });
                            let index = playerBanedInfoList.indexOf($name);
                            if (index >= 0) {
                                playerBanedInfoList.splice(index, 1);
                            }
                            //system.invokeConsoleCommand("§3ban",`say 已将${$name}解封`);
                            //server.log(`解封${$name}`);
                            system.broadcastMessage(`§a已解封${$name}`);
                        }
                    }
                ]
            });
            this.registerCommand("fwhitelist", {
                description: "白名单",
                permission: 1,
                overloads: [
                    {
                        parameters: [
                            {
                                type: "soft-enum",
                                name: "action",
                                enum: "whitelist_enum"
                            },
                            {
                                type: "string",
                                name: "target"
                            },
                            {
                                type: "message",
                                name: "message",
                                optional: true
                            }
                        ],
                        handler(origin, [action, target, msg]) {
                            if (action == "add") {
                                let $name = target;
                                let $msg = "未知qq";
                                let $kind = "whitelist";
                                if (msg != "") {
                                    $msg = msg;
                                }
                                database_1.db.update(database_1.INSERT_LIST, {
                                    $name,
                                    $kind,
                                    $msg
                                });
                                playerNotInWhitelist.splice(playerNotInWhitelist.indexOf(target), 1);
                                //system.invokeConsoleCommand("§3whitelist",`say 已为${$name}添加白名单 ${$msg}`);
                                //server.log(`已为${$name}添加白名单 ${$msg}`);
                                //system.invokeConsoleCommand("whitelist",`title ${$name} title §3你已经获得白名单了，玩得愉快`);
                                system.broadcastMessage(`§a已为${$name}添加白名单 ${$msg}`);
                            }
                            else if (action == "remove") {
                                let $name = target;
                                let $kind = "whitelist";
                                database_1.db.update(database_1.DELETE_NAME_IN_LIST, { $name, $kind });
                                playerNotInWhitelist.push($name);
                                //system.invokeConsoleCommand("§3whitelist",`say 已移除${$name}的白名单 ${msg}`);
                                //server.log(`已移除${$name}的白名单 ${msg}`);
                                system.broadcastMessage(`§a已为${$name}添加白名单 ${msg}`);
                            }
                        }
                    }
                ]
            });
        };
        //每tick一次 0.05s
        system.update = function () {
            tick++;
            tick2++;
            if (tick >= 20) {
                //1s
                tick = 0;
                let entities = system.getEntitiesFromQuery(playerQuery);
                //server.log(`当前玩家数:${entities.length} 名单长度:${playerBanedInfoList.length}`);
                for (let enti of entities) {
                    let info = system.actorInfo(enti);
                    //找到了名字对应的实体
                    if (playerBanedInfoList.indexOf(info.name) >= 0) {
                        try {
                            system.invokeConsoleCommand("ban", `clear ${info.name}`);
                            system.invokeConsoleCommand("ban", `effect ${info.name} slow_falling 100 10 false`);
                            system.invokeConsoleCommand("ban", `effect ${info.name} blindness 1000 10 false`);
                            let component = system.getComponent(enti, "minecraft:position" /* Position */);
                            //修改组件
                            component.data.x = 0;
                            component.data.y = 250;
                            component.data.z = 0;
                            system.applyComponentChanges(enti, component);
                            system.invokeConsoleCommand("ban", `title ${info.name} title §4你已被封禁`);
                        }
                        catch (err) {
                            server.log("实体已不存在");
                        }
                    }
                    else if (playerNotInWhitelist.indexOf(info.name) >= 0) {
                        try {
                            const world = system.worldInfo();
                            const [x, y, z] = world.spawnPoint;
                            let component = system.getComponent(enti, "minecraft:position" /* Position */);
                            //修改组件
                            component.data.x = x;
                            component.data.y = y;
                            component.data.z = z;
                            system.applyComponentChanges(enti, component);
                            system.invokeConsoleCommand("whitelist", `title ${info.name} title §3你还没有获得白名单哦，在qq群内获得`);
                        }
                        catch (err) {
                            server.log("实体已不存在");
                        }
                    }
                }
            }
            if (tick2 >= 1200) {
                tick2 = 0;
                //检查list中的玩家是否还在线
                let entities = system.getEntitiesFromQuery(playerQuery);
                let curNameList = [];
                for (let enti of entities) {
                    let info = system.actorInfo(enti);
                    curNameList.push(info.name);
                }
                for (let index in playerBanedInfoList) {
                    if (curNameList.indexOf(playerBanedInfoList[index]) < 0) {
                        server.log(`${playerBanedInfoList[index]}已经离线，清除`);
                        playerBanedInfoList.splice(Number(index), 1);
                    }
                }
                for (let index in playerNotInWhitelist) {
                    if (curNameList.indexOf(playerNotInWhitelist[index]) < 0) {
                        server.log(`${playerNotInWhitelist[index]}已经离线，清除`);
                        playerNotInWhitelist.splice(Number(index), 1);
                    }
                }
            }
        };
        function onPlayerJoin(data) {
            let entity = data.entity;
            if (!entity)
                throw "not entity";
            if (entity.__identifier__ == "minecraft:player") {
                let info = system.actorInfo(data.entity);
                server.log(`玩家${info.name}加入游戏`);
                //给玩家加上标识组件
                system.createComponent(entity, "fakeban:isplayer");
                //先检查黑名单 后检检查白名单
                let $name = info.name;
                let $kind = "blacklist";
                let datas;
                try {
                    datas = Array.from(database_1.db.query(database_1.SELECT_NAME_IN_LIST, { $name, $kind }));
                }
                catch (err) {
                    server.log("出现错误");
                }
                if (datas.length != 0) {
                    server.log("玩家在黑名单内");
                    playerBanedInfoList.push(info.name);
                }
                else {
                    server.log("玩家不在黑名单内");
                    //接着检测白名单
                    $kind = "whitelist";
                    datas = Array.from(database_1.db.query(database_1.SELECT_NAME_IN_LIST, { $name, $kind }));
                    if (datas.length > 0) {
                        server.log("玩家在白名单内");
                        //welcome
                        system.invokeConsoleCommand("ban", `title ${info.name} title §e你拥有白名单，游戏愉快`);
                        //playerBanedInfoList.push(info.name);
                    }
                    else {
                        server.log("玩家不在白名单内");
                        playerNotInWhitelist.push($name);
                    }
                }
            }
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