//warp 设置家系列
import {getName,getPositionofEntity,getDimensionOfEntity} from "../utils";
import {db,SELECT_HOME_BY_OWNER,SELECT_HOME_BY_NAME,INSERT_HOME,DELETE_HOME_BY_NAME} from "../database";
let system;
let maxhome = 3; //最多设置多少个家
export function homeReg(sys) {
    system = sys;
    //让玩家可以设置多个home
    server.log("home模块已加载");

    system.registerCommand("sethome",{
        description:"在当前坐标设置家",
        permission:0,
        overloads:[{
            parameters:[{
                name:"home的名字",
                type:"string"}],
            handler([$homeName]){
                if  (!this.entity) throw "只有玩家玩家可以设置home";
                let entity = this.entity;
                if (getDimensionOfEntity(entity) != 0) throw "目前只支持主世界设置家";
                //判断是否可以写入数据库 
                //先选出所有记录
                let $owner = this.name;
                var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                //在这里设置玩家家的上限 
                if(datas.length < maxhome){
                    //server.log("数量符合要求" + datas.length);
                    //判断是否有重名的home
                    for (let data of datas){
                        if (data.homeName == $homeName) {
                            throw "已经设置过同名的home";
                        }
                    }
                    let $position = getPositionofEntity(entity);
                    //可以执行添加
                    db.update(INSERT_HOME,{$homeName,$position,$owner});
                    //this.invokeConsoleCommand("home",`tell "${$owner}" 已为你设置名为${$homeName}的家`);
                    system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"§a已为你设置名为${$homeName}的家"}]}`,data=>{});
                }else{
                    throw "设置的home数量超过上限";
                }
            }
        }as CommandOverload<["string"]>]
    });

    //让玩家可以设置多个home
    system.registerCommand("homes",{
        description:"查看所有已设置的家",
        permission:0,
        overloads:[{
            parameters:[],
            handler([]){
                if  (!this.entity) throw "只有玩家玩家可以查看home";
                const entity = this.entity;
                //先选出所有记录
                let $owner = this.name;
                var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                //在这里设置玩家家的上限 
                if(datas.length == 0) throw "你还没有设置家哟";
                let say = `§9§l下面为你已设置的家:§r\n`;
                    for (let index in datas){
                        say += `§a<${Number(index)+1}>.home:${datas[index].homeName} position: ${datas[index].position}\n`;
                }
                system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"${say}"}]}`,data=>{});
            }
        }as CommandOverload<[]>]
    });

    //删除已设置的home
    system.registerCommand("delhome",{
        description:"删除已经设置的家",
        permission:0,
        overloads:[{
            parameters:[{
                name:"home的名字",
                type:"string"}],
            handler([$homeName]){
                if  (!this.entity) throw "只有玩家玩家可以删除home";
                const entity = this.entity;
                //判断是否可以删除 
                let $owner = this.name;
                let datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                //在这里设置玩家家的上限 
                if(datas.length != 0){
                    //记录是否删除
                    let flag = false;
                    //判断是否有重名的home
                    for (let data of datas){
                        if (data.homeName == $homeName) {
                            //可以执行删除
                            db.update(DELETE_HOME_BY_NAME,{$homeName,$owner});
                            flag = true;
                        }
                    }
                    if (flag){
                        system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"已删除${$homeName}"}]}`,data=>{});
                    }
                    else{
                        system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"§c删除${$homeName}失败"}]}`,data=>{});
                    }
                }else{
                    throw "home数量为0";
                }
            }
        }as CommandOverload<["string"]>]
    });

    system.registerCommand("home",{
        description:"传送至已设置的家",
        permission:0,
        overloads:[{
            parameters:[{
                name:"home的名字",
                type:"string",
                optional:true}],
            handler([$homeName]){
                if  (!this.entity) throw "只有玩家玩家可以使用/home";
                const entity = this.entity;
                if (getDimensionOfEntity(entity) != 0) throw "目前只支持主世界回家";
                //先选出所有记录
                let $owner = this.name;
                var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                //在这里设置玩家家的上限 
                if(datas.length != 0){
                    if ($homeName == ""){
                        system.executeCommand(`tp @a[name="${$owner}"] ${datas[0].position}`,data=>{});
                        system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"§a已传送至${datas[0].homeName}"}]}`,data=>{});
                    }
                    else{
                    //判断是否有重名的home
                    let flag = false;
                    for (let data of datas){
                        if (data.homeName == $homeName) {
                            //可以执行传送
                            system.executeCommand(`tp @a[name="${$owner}"] ${data.position}`,data=>{});
                            system.executeCommand(`tellraw @a[name="${$owner}"] {"rawtext":[{"text":"§a已传送至${data.homeName}"}]}`,data=>{});
                            flag = true;
                        }
                        }
                        if(flag == false) throw "未找到该home";  
                    }
                }else{
                    throw "你还没有设置家哟~";
                }
            }
        }as CommandOverload<["string"]>]
    });
}