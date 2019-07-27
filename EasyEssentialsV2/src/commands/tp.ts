//tpa等指令
import {getName,getPositionofEntity,getDimensionOfEntity} from "../utils";
import {db,GET_REQ,INSERT_COMMAND,DELETE_COMMAND_DENY,DELETE_COMMAND_ACEP,DELETE_OUTDATED_COMMAND } from "../database";
let system;
let tpOutTime = 60; //tpa的有效时间 /s
export function tpReg(sys) {
    system = sys;
    server.log("tp模块已加载");
    
    system.registerCommand("tpa",{
        description:"向玩家发送传送请求",
        permission:0,
        overloads:[{
            parameters:[
                {
                type: "player",
                name: "目标玩家"
                }],
            handler([arr]){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                if (arr.length != 1) throw `一次只能向一个玩家发送传送请求哦`;
                const sourceEntity = this.entity;
                const targetEntity = arr[0];
                //先删除数据库中过期的请求
                let $command = 'tpa';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });
                let $source = this.name;
                let $target = getName(targetEntity);
                let $timestamp = new Date().getTime();
                db.update(INSERT_COMMAND,{
                    $command,
                    $source,
                    $target,
                    $timestamp
                });
                system.executeCommand(`tellraw @a[name="${$source}"] {"rawtext":[{"text":"§a已向玩家${$target}发送传送请求"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${$target}"] {"rawtext":[{"text":"§a玩家${$source}想要传送到你这里,输入/tpac接收传送,/tpad拒绝传送,有效期${tpOutTime}秒"}]}`,data=>{});
            }
        }as CommandOverload<["player"]>]
    });

    system.registerCommand("tpah",{
        description:"向玩家发送传送邀请",
        permission:0,
        overloads:[{
            parameters:[
                {
                type: "player",
                name: "目标玩家"
                }],
            handler([arr]){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                if (arr.length != 1) throw `一次只能向一个玩家发送传送邀请哦`;
                const sourceEntity = this.entity;
                const targetEntity = arr[0];
                //先删除数据库中过期的请求
                let $command = 'tpah';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });
                let $source = this.name;
                let $target = getName(targetEntity);
                let $timestamp = new Date().getTime();
                db.update(INSERT_COMMAND,{
                    $command,
                    $source,
                    $target,
                    $timestamp
                });
                system.executeCommand(`tellraw @a[name="${$source}"] {"rawtext":[{"text":"§a已向玩家${$target}发送传送邀请"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${$target}"] {"rawtext":[{"text":"§a玩家${$source}邀请你传送到ta那里,输入/tpahc接收邀请,/tpahd拒绝邀请,有效期${tpOutTime}秒"}]}`,data=>{});
            }
        }as CommandOverload<["player"]>]
    });


    system.registerCommand("tpac",{
        description:"接受玩家的传送请求",
        permission:0,
        overloads:[{
            parameters:[],
            handler(){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                const sourceEntity = this.entity;
                //先删除数据库中过期的请求
                let $command = 'tpa';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });

                let $target = this.name;
                let datas = Array.from(db.query(GET_REQ,{
                    $command,
                    $target
                }));
                if (datas.length == 0) throw "还没有人向你发起传送请求哦";
                //只传送最早的那个请求
                let data = datas[0];
                system.executeCommand(`tellraw @a[name="${data.source}"] {"rawtext":[{"text":"§a玩家${$target}接受了你的传送请求"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${$target}"] {"rawtext":[{"text":"§a接受了${data.source}的传送请求"}]}`,data=>{});
                system.executeCommand(`tp @a[name="${data.source}"] @a[name="${$target}"]`,data=>{});
                let $source = data.source;
                delNum = db.update(DELETE_COMMAND_DENY,{
                    $command,
                    $source,
                    $target
                });
            }
        }as CommandOverload<[]>]
    });

    system.registerCommand("tpad",{
        description:"拒绝玩家的传送请求",
        permission:0,
        overloads:[{
            parameters:[],
            handler(){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                const sourceEntity = this.entity;
                //先删除数据库中过期的请求
                let $command = 'tpa';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });

                let $target = this.name;
                let datas = Array.from(db.query(GET_REQ,{
                    $command,
                    $target
                }));
                if (datas.length == 0) throw "还没有人向你发起传送请求哦";
                //只拒绝最早的那个请求
                let data = datas[0];
                system.executeCommand(`tellraw @a[name="${data.source}"] {"rawtext":[{"text":"§c玩家${$target}拒绝了你的传送请求"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${$target}"] {"rawtext":[{"text":"§a拒绝了${data.source}的传送请求"}]}`,data=>{});
                let $source = data.source;
                delNum = db.update(DELETE_COMMAND_DENY,{
                    $command,
                    $source,
                    $target
                });
            }
        }as CommandOverload<[]>]
    });
    

    system.registerCommand("tpahc",{
        description:"接受玩家的传送邀请",
        permission:0,
        overloads:[{
            parameters:[],
            handler(){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                const sourceEntity = this.entity;
                //先删除数据库中过期的请求
                let $command = 'tpah';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });

                let $target = this.name;
                let datas = Array.from(db.query(GET_REQ,{
                    $command,
                    $target
                }));
                if (datas.length == 0) throw "还没有人向你发起传送邀请哦";
                //只传送最早的那个请求
                let data = datas[0];
                system.executeCommand(`tellraw @a[name="${data.source}"] {"rawtext":[{"text":"§a玩家${$target}接受了你的传送邀请"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${$target}"] {"rawtext":[{"text":"§a接受了${data.source}的传送邀请"}]}`,data=>{});
                system.executeCommand(`tp @a[name="${data.target}"] @a[name="${data.source}"]`,data=>{});
                //传送后删除
                let $source = data.source;
                delNum = db.update(DELETE_COMMAND_DENY,{
                    $command,
                    $source,
                    $target
                });
            }
        }as CommandOverload<[]>]
    });

    system.registerCommand("tpahd",{
        description:"拒绝玩家的传送请求",
        permission:0,
        overloads:[{
            parameters:[],
            handler(){
                if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `玩家专用命令`;
                const sourceEntity = this.entity;
                //先删除数据库中过期的请求
                let $command = 'tpah';
                let date = new Date();
                let $endTime = date.getTime() - tpOutTime * 1000;
                let delNum = db.update(DELETE_OUTDATED_COMMAND,{
                    $command,
                    $endTime
                });

                let $target = this.name;
                let datas = Array.from(db.query(GET_REQ,{
                    $command,
                    $target
                }));
                if (datas.length == 0) throw "还没有人向你发起传送邀请哦";
                //只拒绝最早的那个请求
                let data = datas[0];
                system.executeCommand(`tellraw @a[name="${data.source}"] {"rawtext":[{"text":"§c玩家${$target}拒绝了你的传送邀请"}]}`,data=>{});
                system.executeCommand(`tellraw @a[name="${data.target}"] {"rawtext":[{"text":"§a拒绝了${data.source}的传送邀请"}]}`,data=>{});
                let $source = data.source;
                delNum = db.update(DELETE_COMMAND_DENY,{
                    $command,
                    $source,
                    $target
                });
            }
        }as CommandOverload<[]>]
    });
}