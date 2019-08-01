import { system } from "./system";
import {db,DELETE_RESIDENT_BY_LAND_NAME,DELETE_LAND_BY_NAME_OWNER,SELECT_LAND_BY_OWNER,SELECT_RESIDENT_BY_NAME,SELECT_RESIDENT_BY_LAND,SELECT_LAND_BY_POS,INSERT_LAND,SELECT_LAND_BY_NAME,INSERT_RESIDENT,DELETE_RESIDENT_BY_LAND,DELETE_LAND_BY_NAME} from "./database"
import {getName,getDimensionOfEntity,getVecOfEntity,Vec,getMax,getMin} from "./utils"
let selectTool = "minecraft:wooden_hoe";
//玩家圈地最大的x，z
let MaxX = 32;
let MaxZ = 32;
let MaxY = 100;
//一个玩家最多有几块领地
let MaxLands = 2;
interface SelectPoint {
    sdim:string;
    sx:number;
    sy:number;
    sz:number;
    ex:number;
    ey:number;
    ez:number;
    size:number;
}
let pointMap = new Map();
let sp:SelectPoint = {
    sdim:'0',
    sx:0,
    sy:0,
    sz:0,
    ex:0,
    ey:0,
    ez:0,
    size:0
};

export function commandsReg() {
    //领地选择
    system.listenForEvent("minecraft:block_destruction_started",data=>{
        let player = data.data.player;
        const hand = system.getComponent<IHandContainerComponent>(player, MinecraftComponent.HandContainer);
        const item = hand.data[0];
        let itemName = item.__identifier__;
        if(itemName == selectTool){
            let playerName = getName(player);
            let blockPos = data.data.block_position;
            //选取两点后应在数据库中进行检查
            if(pointMap.has(playerName)){
            let sp = pointMap.get(playerName);
            if(sp.ex == 0){
                //第二个点还未选取的时候
                let dim = getDimensionOfEntity(player);
                if(dim != sp.sdim){
                    system.sendText (player,"无法创建领地，跨维度选取是不行滴");
                    pointMap.delete(playerName);
                }
                else{
                sp.ex = blockPos.x;
                sp.ey = blockPos.y;
                sp.ez = blockPos.z;
                let divX = Math.abs(sp.ex-sp.sx) + 1;
                let divY = Math.abs(sp.ey - sp.sy) + 1;
                let divZ = Math.abs(sp.ez - sp.sz) + 1;
                let size = divX * divY * divZ;
                sp.size = divX * divY * divZ;
                system.sendText(player,`你已经选取了(${sp.sx},${sp.sy},${sp.sz}) 至 (${sp.ex},${sp.ey},${sp.ez}) 体积为:${size}的区域`);
                }
            }else{
                //选取第三个点的时候删除之前的选区
                pointMap.delete(playerName);
                system.sendText(player,`删除之前的选区`);
            }
            }
            else{
                //第一次设点
                let dim = getDimensionOfEntity(player);
                let sp:SelectPoint = {
                    sdim:"",
                    sx:0,
                    sy:0,
                    sz:0,
                    ex:0,
                    ey:0,
                    ez:0,
                    size:0
                };
                sp.sdim = dim;
                sp.sx = blockPos.x;
                sp.sy = blockPos.y;
                sp.sz = blockPos.z;
                pointMap.set(playerName,sp);
                system.sendText(player,`你已选取领地第一点（${sp.sx},${sp.sy},${sp.sz})`);
            }
        }
    });
    //创建领地 （op）
    system.registerCommand("createland",{
        description: "创建领地",
        permission: 1,
        overloads:[
            {
                parameters: [
                {
                    name:"领地名",
                    type:"string"
                },
                {
                    name:"主人名",
                    type:"string"
                }
                    ],
                handler([landName,ownerName]){
                    if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
                    const entity = this.entity;
                    let dim = getDimensionOfEntity(entity);
                    if(pointMap.has(this.name)){
                        let sp = pointMap.get(this.name);
                        pointMap.delete(this.name);
                        let $px:number,$py:number,$pz:number;
                        $px = sp.sx;
                        $py = sp.sy;
                        $pz  = sp.sz;
                        let $sdim:string = sp.sdim;
                        let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                        if(datas.length == 0){
                        //判断一下是否可以圈地
                        $px = sp.ex;
                        $py = sp.ey;
                        $pz  = sp.ez;
                        let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                        if(datas.length == 0){
                            //两点都不在他人领地内
                            let $name = landName;
                            let datas = Array.from(db.query(SELECT_LAND_BY_NAME,{$name}));
                            if(datas.length != 0){
                                let data = datas[0];
                                return `已存在名为${data.name}的领地,拥有者${data.owner}`;
                            }
                            else{
                                let res = db.update(INSERT_LAND,{
                                    $name:landName,
                                    $creator:this.name,
                                    $owner:ownerName,
                                    $dim:$sdim,
                                    $sposition:`${sp.sx},${sp.sy},${sp.sz}`,
                                    $eposition:`${sp.ex},${sp.ey},${sp.ez}`,
                                    $minx:getMin(sp.sx,sp.ex),
                                    $miny:getMin(sp.sy,sp.ey),
                                    $minz:getMin(sp.sz,sp.ez),
                                    $maxx:getMax(sp.sx,sp.ex),
                                    $maxy:getMax(sp.sy,sp.ey),
                                    $maxz:getMax(sp.sz,sp.ez),
                                    $size:sp.size
                                });

                                db.update(INSERT_RESIDENT,{
                                    $landname:landName,
                                    $playername:ownerName,
                                    $permission:"owner",
                                    $extra:""
                                });

                                if(res == 0) throw "创建领地失败";
                                return `已在维度${dim}创建(${sp.sx},${sp.sy},${sp.sz}) 至 (${sp.ex},${sp.ey},${sp.ez}) 体积为:${sp.size}的领地\n领地名${landName} 主人:${ownerName}`;
                            }
                        }
                        else{
                            let data = datas[0];
                            return `领地第二点在${data.owner}的领地${data.name}(${data.sposition})~(${data.eposition})内`;
                        }
                        }
                        else{
                            let data = datas[0];
                            return `领地第一点在${data.owner}的领地${data.name}(${data.sposition})~(${data.eposition})内`;
                        }    
                    }
                    else{
                        return "无法创建领地";
                    }
                }
            } as CommandOverload<["string","string"]>
        ]
    });

    system.registerCommand("deleteland",{
        description: "删除领地",
        permission: 1,
        overloads:[{
            parameters:[{
                name:"领地名",
                type:"string",
                optional: true
            }],
            handler([$landname]){
                if ($landname == ""){
                    //直接删除脚底下的领地
                    let player = this.entity;
                    if(!player) throw "只有玩家可以使用";
                    let pComp = system.getComponent<IPositionComponent>(player,MinecraftComponent.Position);
                    let $px = Math.floor(pComp.data.x);
                    let $py = Math.floor(pComp.data.y);
                    let $pz = Math.floor(pComp.data.z);
                    let $sdim = getDimensionOfEntity(player);
                    let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                    if (datas.length == 0) {
                        return `脚底下未检测到领地`;
                    }
                    else{
                        let $name = datas[0].name;
                        let $landname = $name;
                        let res1 = db.update(DELETE_LAND_BY_NAME,{$name});
                        let res2 = db.update(DELETE_RESIDENT_BY_LAND,{$landname});
                        return `删除了${res1}个领地，${res2}个居民信息`;
                    }
                }
                else{
                    //指定名字删除
                    let $name = $landname;
                    let res1 = db.update(DELETE_LAND_BY_NAME,{$name});
                    let res2 = db.update(DELETE_RESIDENT_BY_LAND,{$landname});
                    return `删除了${res1}个领地，${res2}个居民信息`;
                }
            }
        }as CommandOverload<["string"]>]
    });


    system.registerCommand("queryland",{
        description: "查询领地",
        permission: 1,
        overloads:[{
            parameters:[{
                name:"land/player",
                type:"string"
            },
        {
            name:"name",
            type:"string"
        }],
            handler([kind,name]){
                if(kind == "land"){
                    //查询领地详细信息
                    let $name = name;
                    let $landname = name;
                    let datas = db.query(SELECT_LAND_BY_NAME,{$name});
                    if(datas.length != 0){
                        let residents = db.query(SELECT_RESIDENT_BY_LAND,{$landname});
                        let res = "";
                        for (let resident of residents){
                            res += `[${resident.permission}]${resident.playername} `;
                        }
                        return `以下为领地:${name}的信息:\n领地范围:(${datas[0].sposition})至(${datas[0].eposition}) 维度:${datas[0].dim} 领地主人:${datas[0].owner}\n居民:${res}`;
                    }
                    else{
                        return `未找到领地信息`;
                    }
                }
                else if (kind == "player"){
                    //查询玩家拥有的领地
                    let $playername = name;
                    let datas = db.query(SELECT_RESIDENT_BY_NAME,{$playername});
                    if(datas.length != 0){
                        let show="";
                        for(let data of datas){
                            show += `领地:${data.landname} 权限:${data.permission}\n`;
                        }
                        return show;
                    }
                    else{
                        return `未找到玩家信息`;
                    }
                }
                else{
                    return `无效参数`;
                }
            }
        }as CommandOverload<["string","string"]>]
    });


    system.registerCommand("landclaim",{
        description: "创建领地",
        permission: 0,
        overloads:[{
            parameters:[
            {
                name:"领地名",
                type:"string"
            }
        ]
        ,handler([name]){
            if (!this.entity || this.entity.__identifier__ != "minecraft:player") throw `Can only be used by player`;
            const entity = this.entity;
            let dim = getDimensionOfEntity(entity);
            let landName = name;
            let ownerName = this.name;

            if(pointMap.has(this.name)){
                let sp = pointMap.get(this.name);
                pointMap.delete(this.name);
                let $px:number,$py:number,$pz:number;
                $px = sp.sx;
                $py = sp.sy;
                $pz  = sp.sz;
                let $sdim:string = sp.sdim;

                //检查选区大小
                let xLength = Math.abs(sp.sx - sp.ex)+1;
                if(xLength > MaxX) return `x方向长度${xLength}超出范围${MaxX}，圈地失败`;

                let zLength = Math.abs(sp.sz - sp.ez)+1;
                if(zLength > MaxZ) return `z方向长度${zLength}超出范围${MaxZ}，圈地失败`;

                let yLength = Math.abs(sp.sy - sp.ey)+1;
                if(yLength > MaxY) return `y方向长度${yLength}超出范围${MaxY}，圈地失败`;
                //查看玩家领地数是否超过上限
                let $owner = this.name;
                let lands = Array.from(db.query(SELECT_LAND_BY_OWNER,{$owner}));
                if (lands.length >= MaxLands) return `你的领地数${lands.length}已达到上限${MaxLands}`;

                let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                if(datas.length == 0){
                //判断一下是否可以圈地
                $px = sp.ex;
                $py = sp.ey;
                $pz  = sp.ez;
                let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                if(datas.length == 0){
                    //两点都不在他人领地内
                    let $name = landName;
                    let datas = Array.from(db.query(SELECT_LAND_BY_NAME,{$name}));
                    if(datas.length != 0){
                        let data = datas[0];
                        return `已存在名为${data.name}的领地,拥有者${data.owner}`;
                    }
                    else{
                        let res = db.update(INSERT_LAND,{
                            $name:landName,
                            $creator:this.name,
                            $owner:ownerName,
                            $dim:$sdim,
                            $sposition:`${sp.sx},${sp.sy},${sp.sz}`,
                            $eposition:`${sp.ex},${sp.ey},${sp.ez}`,
                            $minx:getMin(sp.sx,sp.ex),
                            $miny:getMin(sp.sy,sp.ey),
                            $minz:getMin(sp.sz,sp.ez),
                            $maxx:getMax(sp.sx,sp.ex),
                            $maxy:getMax(sp.sy,sp.ey),
                            $maxz:getMax(sp.sz,sp.ez),
                            $size:sp.size
                        });

                        db.update(INSERT_RESIDENT,{
                            $landname:landName,
                            $playername:ownerName,
                            $permission:"owner",
                            $extra:""
                        });

                        if(res == 0) throw "创建领地失败";
                        return `已在维度${dim}创建(${sp.sx},${sp.sy},${sp.sz}) 至 (${sp.ex},${sp.ey},${sp.ez}) 体积为:${sp.size}的领地\n领地名${landName} 主人:${ownerName}`;
                    }
                }
                else{
                    let data = datas[0];
                    return `领地第二点在${data.owner}的领地${data.name}(${data.sposition})~(${data.eposition})内`;
                }
                }
                else{
                    let data = datas[0];
                    return `领地第一点在${data.owner}的领地${data.name}(${data.sposition})~(${data.eposition})内`;
                }    
            }
            else{
                return "无法创建领地";
            }
        }}as CommandOverload<["string"]>]
    });

    system.registerCommand("landremove",{
        description: "删除领地",
        permission: 0,
        overloads:[{
            parameters:[{
                name:"领地名",
                type:"string"
            }],
            handler([name]){
                let $name = name;
                let $owner = this.name;
                let result1 = db.update(DELETE_LAND_BY_NAME_OWNER,{$name,$owner});
                if(result1 != 0){
                    let $landname = name;
                    let result2 = db.update(DELETE_RESIDENT_BY_LAND,{$landname});
                    return `删除成功，删除了领地${$landname}以及${result2}个居民`;
                }
                else{
                    return `删除失败`;
                }
            }
        }as CommandOverload<["string"]>]
    });

    system.registerCommand("mylands",{
        description: "查看自己已有的领地",
        permission: 0,
        overloads:[{
            parameters:[],
            handler(){
                if(!this.entity) throw "只有玩家可以使用该命令";
                let $owner = this.name;
                let datas = Array.from(db.query(SELECT_LAND_BY_OWNER,{$owner}));
                if(datas.length != 0){
                let result = `你有${datas.length}个领地:\n`;
                for(let data of datas){
                    result += `领地:${data.name} 范围:(${data.sposition})至(${data.eposition})\n`;
                }
                return result;
            }
            else{
                return "你还没有领地";
            }
            }
        }as CommandOverload<[]>]
    });

    system.registerCommand("landtrust",{
        description: "添加居民",
        permission: 0,
        overloads:[{
            parameters:[{
                name:"玩家名",
                type:"string"
            }],
            handler([name]){
                    //玩家需要站在领地中
                    if (!this.entity) {
                        throw "只有玩家可以使用";
                    }
                    let pComp = system.getComponent<IPositionComponent>(this.entity,MinecraftComponent.Position);
                    let $px = Math.floor(pComp.data.x);
                    let $py = Math.floor(pComp.data.y);
                    let $pz = Math.floor(pComp.data.z);
                    let $sdim = getDimensionOfEntity(this.entity);
                    let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                    if (datas.length == 0) {
                        return `你需要站在你的领地中`;
                    }
                    else{
                        //未来添加领地操作员权限
                        let data = datas[0];
                        if (this.name == data.owner) {
                            let res = db.update(INSERT_RESIDENT,{
                                $landname:data.name,
                                $playername:name,
                                $permission:"member",
                                $extra:""
                            });
                            if(res != 0) {return `成功添加成员${name};`}
                            else{return `添加成员失败`} 
                        }
                        else{
                            return `只有领地主人才有权限添加成员噢`;
                        }
                    }
            }
        }as CommandOverload<["string"]>]
    });

    system.registerCommand("landdistrust",{
        description: "移除居民",
        permission: 0,
        overloads:[{
            parameters:[{
                name:"玩家名",
                type:"string"
            }],
            handler([name]){
                     //玩家需要站在领地中
                     if (!this.entity) {
                        throw "只有玩家可以使用";
                    }
                       let pComp = system.getComponent<IPositionComponent>(this.entity,MinecraftComponent.Position);
                       let $px = Math.floor(pComp.data.x);
                       let $py = Math.floor(pComp.data.y);
                       let $pz = Math.floor(pComp.data.z);
                       let $sdim = getDimensionOfEntity(this.entity);
                       let datas = Array.from(db.query(SELECT_LAND_BY_POS,{$px,$py,$pz,$sdim}));
                       if (datas.length == 0) {
                           return `你需要站在你的领地中`;
                       }
                       else{
                           //未来添加领地操作员权限
                           let data = datas[0];
                           if (this.name == data.owner) {
                               let res = db.update(DELETE_RESIDENT_BY_LAND_NAME,{
                                   $landname:data.name,
                                   $playername:name
                               });
                               if(res != 0) {return `成功移除成员${name};`}
                               else{return `移除成员失败`} 
                           }
                           else{
                               return `只有领地主人才有权限移除成员噢`;
                           }
                       }
            }
        }as CommandOverload<["string"]>]
    });



        system.registerCommand("queryland",{
        description: "查询领地",
        permission: 1,
        overloads:[{
            parameters:[{
                name:"land/player",
                type:"string"
            },
        {
            name:"name",
            type:"string"
        }],
            handler([kind,name]){
                if(kind == "land"){
                    //查询领地详细信息
                    let $name = name;
                    let $landname = name;
                    let datas = db.query(SELECT_LAND_BY_NAME,{$name});
                    if(datas.length != 0){
                        let residents = db.query(SELECT_RESIDENT_BY_LAND,{$landname});
                        let res = "";
                        for (let resident of residents){
                            res += `[${resident.permission}]${resident.playername} `;
                        }
                        return `以下为领地:${name}的信息:\n领地范围:(${datas[0].sposition})至(${datas[0].eposition}) 维度:${datas[0].dim} 领地主人:${datas[0].owner}\n居民:${res}`;
                    }
                    else{
                        return `未找到领地信息`;
                    }
                }
                else if (kind == "player"){
                    //查询玩家拥有的领地
                    let $playername = name;
                    let datas = db.query(SELECT_RESIDENT_BY_NAME,{$playername});
                    if(datas.length != 0){
                        let show="";
                        for(let data of datas){
                            show += `领地:${data.landname} 权限:${data.permission}\n`;
                        }
                        return show;
                    }
                    else{
                        return `未找到玩家信息`;
                    }
                }
                else{
                    return `无效参数`;
                }
            }
        }as CommandOverload<["string","string"]>]
    });

    system.registerCommand("mylands",{
        description: "查看自己已有的领地",
        permission: 0,
        overloads:[{
            parameters:[],
            handler(){
                if(!this.entity) throw "只有玩家可以使用该命令";
                let $owner = this.name;
                let datas = Array.from(db.query(SELECT_LAND_BY_OWNER,{$owner}));
                if(datas.length != 0){
                let result = `你有${datas.length}个领地:\n`;
                for(let data of datas){
                    result += `领地:${data.name} 范围:(${data.sposition})至(${data.eposition})\n`;
                }
                return result;
            }
            else{
                return "你还没有领地";
            }
            }
        }as CommandOverload<[]>]
    });

    system.registerCommand("editres",{
        description: "编辑领地的居民",
        permission: 1,
        overloads:[{
            parameters:[
                {
                    name:"行为add/remove",
                    type:"string"
                },
                {
                    name:"领地名",
                    type:"string"
                },
                {
                name:"玩家名",
                type:"string"
                }
            ],
            handler([action,$landname,$playername]){
                if(action == "add"){
                    let res = db.update(INSERT_RESIDENT,{
                        $landname,
                        $playername,
                        $permission:"member",
                        $extra:""
                    });
                    return "成功添加";
                }
                else if(action == "remove"){
                    let res = db.update(DELETE_RESIDENT_BY_LAND_NAME,{$landname,$playername});
                    if(res != 0){
                        return "成功移除";
                    }
                    else{
                        return "移除失败";
                    }
                }
                else{
                    return "无效参数";
                }
            }
        }as CommandOverload<["string","string","string"]>]
    });

}
