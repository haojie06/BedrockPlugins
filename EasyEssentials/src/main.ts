import { MySystem,system } from "./system";
import { db,DELETE_HOME_BY_NAME ,INSERT_HOME, INSERT_WARP,SELECT_WARP_BY_NAME,SELECT_ALL_WARP,DELETE_WARP_BY_NAME, SELECT_HOME_BY_OWNER,SELECT_HOME_BY_NAME } from "./database";

//死亡坐标map
var deathMap:{[key:string]:string} = {};
//消息类
class Request{
    source:string;
    target:string;
    request:string;
    time:number;
    life:number; //秒
    outTime:number;

    public constructor(request: string, source:string, target:string,life:number) {
        this.request = request;
        this.source = source;
        this.target = target;
        this.time = new Date().getTime();
        this.outTime = this.time + life * 1000; //过期时间
    }

}

//消息队列
var requestlist:Request[] = [];
// 初始化时调用
const showWarp = (entity)=>{
    //server.log(`数据库记录： ${entity.name}--${entity.position}--${entity.owner}`);
}
system.initialize = function () {
    server.log("EasyEssentials: plugin loaded");
    //添加自杀命令
    this.registerCommand("suicide",{
        description:"杀死你自己",
        permission:0,
        overloads:[{
            //添加的命令需要的参数
            parameters:[],
            //判断处理命令来源
            handler(original){
                //来源不是实体
                if (!original.entity) throw "Player required";
                const info = this.actorInfo(original.entity);
                this.invokeConsoleCommand("kill",`kill "${info.name}"`);
            }
        }as CommandOverload<MySystem, []>]
    });

    this.registerCommand("back",{
        description:"返回上次死亡地点",
        permission:0,
        overloads:[{
            parameters:[],
            handler(original){
                if (!original.entity) throw "Player required";
                const info = this.actorInfo(original.entity);
                if (info.dim !== 0) throw "Cannot cross-dimension teleport";
                if (deathMap[info.name] == undefined) throw "未记录死亡点";
                this.invokeConsoleCommand("ess","tp " + '"' + info.name + '"' + " " + deathMap[info.name]);
                deathMap[info.name] = undefined;
            }
        } as CommandOverload<MySystem, []> ]
    })

//设置传送点 op命令
    this.registerCommand("setwarp",{
        description:"设置传送点",
        permission:1,
        overloads:[{
            parameters:[{
                name:"name",
                type:"string"
            }],
        handler(original,[$name]){
            const entity = original.entity;
            if (!entity) throw "Designed for player usage";
            const info = this.actorInfo(entity);
            if (info.dim !== 0) throw "只能在主世界设置传送点";
            let comp = system.getComponent(entity,MinecraftComponent.Position);
            let $position:string = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
            let $owner:string = info.name;
            this.openModalForm(
                original.entity,JSON.stringify({
                    type:"modal",
                    title:"set warp",
                    content:`你将要设置名为${$name}的传送点(${$position})`,
                    button1: "Yes",
                    button2: "No"
                })
            )
            .then (sel =>{
                if (JSON.parse(sel) === true) {   
                    //先判断能否写入
                    //Array.from(db.query(SELECT_ALL_WARP, {})).map(showWarp);
                    const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
                    if(datas.length != 0) throw "已有同名传送点";
                    db.update(INSERT_WARP,{
                        $name,
                        $owner,
                        $position
                    });
                    this.invokeConsoleCommand("warp","say 已经成功创建传送点");
                }
            })
            .catch(server.log);
            }
        }as CommandOverload<MySystem, ["string"]> ]
    });

//删除传送点 op命令
this.registerCommand("delwarp",{
    description:"删除传送点",
    permission:1,
    overloads:[{
        parameters:[{
            name:"name",
            type:"string"
        }],
    handler(original,[$name]){
        const entity = original.entity;
        if (!entity) throw "Designed for player usage";
        //先判断能否删除
        const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
        if(datas.length == 0) throw "没有该传送点";
        let $position = datas[0].position;
        const info = this.actorInfo(entity);
        this.openModalForm(
            original.entity,JSON.stringify({
                type:"modal",
                title:"delete warp",
                content:`你将要删除名为${$name}的传送点(${$position})`,
                button1: "Yes",
                button2: "No"
            })
        )
        .then (sel =>{
            if (JSON.parse(sel) === true) {   
                db.update(DELETE_WARP_BY_NAME,{
                    $name
                });
                this.invokeConsoleCommand("warp","say 已经成功删除传送点");
            }
        })
        .catch(server.log);
        }
    }as CommandOverload<MySystem, ["string"]> ]
});

//传送至传送点
    this.registerCommand("warp",{
        description:"传送至传送点",
        permission:0,
        overloads:[{
            parameters:[{
                name:"name",
                type:"string"
            }],
        handler(original,[$name]){
            const entity = original.entity;
            if (!entity) throw "Designed for player usage";
            const info = this.actorInfo(entity);
            if (info.dim != 0) throw "只能在主世界传送";
            const datas = Array.from(db.query(SELECT_WARP_BY_NAME,{$name}));
            if (datas.length != 1) throw "无效的传送点";
            let position = datas[0].position;
            let owner = datas[0].owner;
            this.invokeConsoleCommand("warp",`tp "${info.name}" ${position}`);
            this.invokeConsoleCommand("warp",`tell "${info.name}" 已为你传送`);
            }
        }as CommandOverload<MySystem, ["string"]> ]
    });


    this.registerCommand("warps",{
        description:"显示所有传送点",
        permission:0,
        overloads:[{
            parameters:[],
        handler(original){
            const entity = original.entity;
            if (!entity) throw "Designed for player usage";
            const info = this.actorInfo(entity);
            if (info.dim != 0) throw "只能在主世界传送";
            const datas = Array.from(db.query(SELECT_ALL_WARP,{}));
            let show:string;
            for(var data of datas){
                show += `${data.name}:(${data.position} by ${data.owner})`;
            this.invokeConsoleCommand("warp",`tell "${info.name}" ${show}`)
            } 
            }
        }as CommandOverload<MySystem, []> ]
    });

    //玩家死亡时记录
    system.listenForEvent("minecraft:entity_death",onEntityDeath);

    //让玩家可以设置多个home
    this.registerCommand("sethome",{
        description:"在当前坐标设置家",
        permission:0,
        overloads:[{
            parameters:[{
                name:"home的名字",
                type:"string"}],
            handler(original,[$homeName]){
                if  (!original.entity) throw "只有玩家玩家可以设置home";
                const info = this.actorInfo(original.entity);
                if (info.dim != 0) throw "请勿在主世界之外设置家";
                //判断是否可以写入数据库 
                //先选出所有记录
                let $owner = info.name;
                var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                //在这里设置玩家家的上限 
                if(datas.length < 3){
                    //server.log("数量符合要求" + datas.length);
                    //判断是否有重名的home
                    for (let data of datas){
                        if (data.homeName == $homeName) {
                            throw "已经设置过同名的home";
                        }
                    }
                    let $position = getPositionofEntity(original.entity);
                    //可以执行添加
                    db.update(INSERT_HOME,{$homeName,$position,$owner});
                }else{
                    throw "设置的home数量超过上限";
                }
            }
        }as CommandOverload<MySystem, ["string"]>]
    });

        //让玩家可以设置多个home
        this.registerCommand("homelist",{
            description:"查看所有已设置的家",
            permission:0,
            overloads:[{
                parameters:[],
                handler(original,[]){
                    if  (!original.entity) throw "只有玩家玩家可以查看home";
                    const info = this.actorInfo(original.entity);
                    //先选出所有记录
                    let $owner = info.name;
                    var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
                    //在这里设置玩家家的上限 
                    if(datas.length == 0) throw "你还没有设置家哟";
                    let say = `§9§l下面为你已设置的家:§r\n`;
                        for (let index in datas){
                            say += `§a<${Number(index)+1}>.home:${datas[index].homeName} position: ${datas[index].position}\n`;
                    }
                    this.invokeConsoleCommand("home",`tell "${$owner}" ${say}`);
                }
            }as CommandOverload<MySystem, []>]
        });


    //删除已设置的home
    this.registerCommand("delhome",{
        description:"删除已经设置的家",
        permission:0,
        overloads:[{
            parameters:[{
                name:"home的名字",
                type:"string"}],
            handler(original,[$homeName]){
                if  (!original.entity) throw "只有玩家玩家可以删除home";
                const info = this.actorInfo(original.entity);
                //判断是否可以删除 
                //先选出所有记录
                let $owner = info.name;
                var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
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
                        this.invokeConsoleCommand("home",`tell "${$owner}" §a已删除${$homeName}`);
                    }
                    else{
                        this.invokeConsoleCommand("home",`tell "${$owner}" §c删除${$homeName}失败`);
                    }
                }else{
                    throw "home数量为0";
                }
            }
        }as CommandOverload<MySystem, ["string"]>]
    });


    //执行 /home传送
this.registerCommand("home",{
    description:"传送至已设置的家",
    permission:0,
    overloads:[{
        parameters:[{
            name:"home的名字",
            type:"string",
            optional:true}],
        handler(original,[$homeName]){
            if  (!original.entity) throw "只有玩家玩家可以使用/home";
            const info = this.actorInfo(original.entity);
            if (info.dim != 0) throw "只有在主世界才能使用/home";
            //先选出所有记录
            let $owner = info.name;
            var datas = Array.from(db.query(SELECT_HOME_BY_OWNER,{$owner}));
            //在这里设置玩家家的上限 
            if(datas.length != 0){
                if ($homeName == ""){
                    this.invokeConsoleCommand("home",`tp "${$owner}" ${datas[0].position}`);
                    this.invokeConsoleCommand("home",`tell "${$owner}" 已传送至${datas[0].homeName}`)
                }
                else{
                //判断是否有重名的home
                for (let data of datas){
                    if (data.homeName == $homeName) {
                        //可以执行传送
                        this.invokeConsoleCommand("home",`tp "${$owner}" ${data.position}`);
                        this.invokeConsoleCommand("home",`tell "${$owner}" 已传送至${data.homeName}`)
                        }
                    }   
                }
            }else{
                throw "你还没有设置家哟~";
            }
        }
    }as CommandOverload<MySystem, ["string"]>]
});

this.registerCommand("spawn",{
    description:"返回主城",
    permission:0,
    overloads:[{
        parameters:[],
        handler(original){
            if (!original.entity) throw "需要是玩家";
            const info = this.actorInfo(original.entity);
            if (info.dim !== 0) throw "无法跨维度传送";
            const world = this.worldInfo();
            const [x, y, z] = world.spawnPoint;
            if (y === 32767) throw "无法找到世界出生点，请/setworldpoint";
            this.invokeConsoleCommand("§a§lspawn",`tp "${info.name}" ${x} ${y} ${z}`);
            this.invokeConsoleCommand("§a§lspawn",`tell "${info.name}" 已传送至主城`);
        }
    }]
})

//tpa系列（由于ui版的tpa出现了传送失败的情况，这里暂时先使用命令版）
this.registerCommand("tpa", {
    description: "请求传送到ta人那",
    permission: 0,
    overloads: [
    {
        parameters: [
        {
            type: "player-selector",
            name: "target"
        },
        {
            type: "message",
            name: "message",
            optional: true
        }
        ],
        handler(origin, [players, msg]) {
        if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
        )
            throw "玩家才可tpa";
        if (players.length !== 1)
            throw `一次只能tpa一个人哟`;
        const info = this.actorInfo(origin.entity) as PlayerInfo;
        if (!info) throw `Cannot found actor info`;
        const target = players[0];
        const targetinfo = this.actorInfo(target) as PlayerInfo;
        if (targetinfo.dim != info.dim) throw "无法在不同维度之间tpa";
        this.invokeConsoleCommand("§ateleport",`tell "${info.name}" §a已发送请求`);
        this.invokeConsoleCommand("§ateleport",`tell "${targetinfo.name}" §b${info.name} 想要传送到你这里：${msg}，1分钟内有效，输入/tpac接受 /tpad 拒绝`);
          //向消息队列增加消息
        let req = new Request("tpa",info.name,targetinfo.name,60);
        addToRequestList(req);
        }
    } as CommandOverload<MySystem, ["player-selector", "message"]>
    ]
});


this.registerCommand("tpahere", {
    description: "邀请他人传送到你的位置",
    permission: 0,
    overloads: [
    {
        parameters: [
        {
            type: "player-selector",
            name: "target"
        },
        {
            type: "message",
            name: "message",
            optional: true
        }
        ],
        handler(origin, [players, msg]) {
        if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
        )
            throw "玩家才可tpa";
        if (players.length !== 1)
            throw `一次只能tpa一个人哟`;
        const info = this.actorInfo(origin.entity) as PlayerInfo;
        if (!info) throw `Cannot found actor info`;
        const target = players[0];
        const targetinfo = this.actorInfo(target) as PlayerInfo;
        if (targetinfo.dim != info.dim) throw "无法在不同维度之间tpahere";
        this.invokeConsoleCommand("§ateleport",`tell "${info.name}" §a已发送邀请`);
        this.invokeConsoleCommand("§ateleport",`tell "${targetinfo.name}" §b${info.name} 邀请你传送到ta那：${msg}，1分钟内有效，输入/tpac接受 /tpad 拒绝`);
        //向消息队列增加消息
        let req = new Request("tpahere",info.name,targetinfo.name,60);
        addToRequestList(req);
        }
    } as CommandOverload<MySystem, ["player-selector", "message"]>
    ]
});

//接受与拒绝

this.registerCommand("tpac", {
    description: "同意他人的传送请求",
    permission: 0,
    overloads: [
    {
        parameters: [],
        handler(origin, []) {
        if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
        )
            throw "玩家才可tpa";
        const info = this.actorInfo(origin.entity) as PlayerInfo;
        if (!info) throw `Cannot found actor info`;
        //向消息队列取出消息
        let req = getFromRequestList(info.name,"tpac");
        if (req == undefined){
            throw "没有人向你发送请求";
        }
        //server.log(`tpac-------request${req.request} size:${requestlist.length}`);
        let source = info.name;
        if(req.request == "tpa"){
            //接受tpa
            this.invokeConsoleCommand("tpa",`tp "${req.source}" "${source}"`);
            this.invokeConsoleCommand("tpa",`tell "${source}" §a接受请求`);
            this.invokeConsoleCommand("tpa",`tell "${req.source}" §a${source}接受了你的请求`);
        }
        else if(req.request == "tpahere"){
            this.invokeConsoleCommand("tpa",`tp "${source}" "${req.source}"`);
            this.invokeConsoleCommand("tpa",`tell "${req.source}" §a${source}接受了你的邀请`);
            this.invokeConsoleCommand("tpa",`tell "${source}" §a接受请求`);
        }
    }
} as CommandOverload<MySystem, []>
    ]
});


this.registerCommand("tpad", {
    description: "拒绝他人的传送请求",
    permission: 0,
    overloads: [
    {
        parameters: [],
        handler(origin, []) {
        if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
        )
            throw "玩家才可tpa";
        const info = this.actorInfo(origin.entity) as PlayerInfo;
        if (!info) throw `Cannot found actor info`;
        //向消息队列取出消息
        let req = getFromRequestList(info.name,"tpad");
        if (req == undefined){
            throw "没有人向你发送请求";
        }
        //server.log(`tpad-------request${req.request} size:${requestlist.length}`);
        let source = info.name;
        if(req.request == "tpa"){
            //接受tpa
            this.invokeConsoleCommand("tpa",`tell "${req.source}" §c${source}拒绝了你的请求`);
            this.invokeConsoleCommand("tpa",`tell "${source}" §a拒绝请求`);
        }
        else if(req.request == "tpahere"){
            this.invokeConsoleCommand("tpa",`tell "${req.source}" §c${source}拒绝了你的邀请`);
            this.invokeConsoleCommand("tpa",`tell "${source}" §a拒绝邀请`);
        }
    }
} as CommandOverload<MySystem, []>
    ]
});

//尾巴
};





function onEntityDeath(eventData){
    let entity = eventData.entity;
    //如果死亡的实体是玩家
    if(entity.__identifier__ == "minecraft:player"){
        //拥有坐标组件
        if (system.hasComponent(entity, "minecraft:position")) {
            let position:string = getPositionofEntity(entity);
            let name:string = getNameofEntity(entity);
            deathMap[name] = position;
        }
    }
}


function getNameofEntity(entity: IEntity){
    let name;
    if (system.hasComponent(entity, "minecraft:nameable")) {
        let comp = system.getComponent(entity,MinecraftComponent.Nameable);
        name = comp.data.name;
    }
    else{
        name = "无法获得实体名字";
    }
    return name;
}


function getPositionofEntity(entity: IEntity){
    let position;
    if (system.hasComponent(entity, "minecraft:position")) {
        let comp = system.getComponent(entity,MinecraftComponent.Position);
        let px,py,pz;
        position = transNum(comp.data.x) + " " + transNum(comp.data.y) + " " + transNum(comp.data.z);
    }
    else{
        position = "无法获得坐标";
    }
    return position;
}

function transNum(num:number):number{
    if (num >= 0){
        num = Math.floor(num);
    }
    else{
        num = Math.floor(num);
    }
    return num;
}

//向消息队列添加消息
function addToRequestList(request:Request):void{
    let length = requestlist.push(request);
}
//从消息队列寻找符合条件的消息并删掉已经不符合条件的
function getFromRequestList(source:string,request:string):Request{
    var result = undefined;
    //server.log(`requestlistsize ${requestlist.length}`);
    for (const key in requestlist) {
        var req = requestlist[key];
        if(checkIfOut(req) == true){
            //过期了删掉
            requestlist.splice(Number(key),1);
        }else if(result == undefined){
            server.log(`req.target= + ${req.target}`);
            if(request == "tpac" && req.target == source){
                result = req;
                //执行完了删掉
                requestlist.splice(Number(key),1);
            }
            else if(request == "tpad" && req.target == source){
                result = req;
                //执行完了删掉
                requestlist.splice(Number(key),1);
            }
        }
    }
    return result;
}

    //检查消息是否过期了
    function checkIfOut(req:Request):boolean{
        let now = new Date().getTime();
        //server.log(now + "------" + req.outTime);
        if (now >= req.outTime){
            //server.log("发现过期");
            return true;
        }
        else{
            return false;
        }
    }
