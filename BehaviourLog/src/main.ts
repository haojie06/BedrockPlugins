/* 
create by haojie06 2019/6/10
用于记录玩家在游戏中的行为 （超简化版coi..）
更新 支持1.12
*/
import { db,addRecord,readRecord, delRecord, closeDB } from "./database";
import { getTime,stringToInt,transNum,checkIfContainer} from "./utils";

const system = server.registerSystem(0, 0);
system.initialize = function() {
  server.log("日志系统v2.0 loaded https://github.com/haojie06/BedrockPlugins/tree/master/BehaviourLog");
  //方块破坏记录
  system.listenForEvent("minecraft:player_destroyed_block", (data) => {
    let player = data.data.player;
    let playerName = getName(player);
    let dim = getDimensionOfEntity(player);
    let playerPos = getPosCmp(player);
    let blockName = data.data.block_identifier.split(":")[1];
    let bPostion = data.data.block_position;

    let pX = transNum(playerPos.x);
    let pY = transNum(playerPos.y);
    let pZ = transNum(playerPos.z);

    let bX = transNum(bPostion.x);
    let bY = transNum(bPostion.y);
    let bZ = transNum(bPostion.z);

    let time = getTime();
    //system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 破坏 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
    addRecord(time, playerName, pX, pY, pZ, "break", blockName, bX, bY, bZ, dim);
  });

  //使用物品/
  system.listenForEvent("minecraft:entity_use_item",(data)=>{
    let entity = data.data.entity;
    if (entity.__identifier__ == "minecraft:player") {
      let method = data.data.use_member;
      let playerName = getName(entity);
      let itemStacks = data.data.item_stack;
      let dim = getDimensionOfEntity(entity);
      let playerPos = getPosCmp(entity);

      let pX = transNum(playerPos.x);
      let pY = transNum(playerPos.y);
      let pZ = transNum(playerPos.z);
      let time = getTime();
      let itemName = itemStacks.item.split(":")[1];
      //放置方块的记录由下一个方法实现 这里目前主要记录倒演讲
      if(method != "place"){
        //system.sendText(entity,`${time} ${playerName}(${pX},${pY},${pZ}) ${method} ${itemStacks.item} dim:${dim}`);
        addRecord(time, playerName, pX, pY, pZ, "use", itemName, pX, pY, pZ, dim);        
      }
    }
  });
//容器交互
  system.listenForEvent("minecraft:block_interacted_with",(data)=>{
    let player = data.data.player;
    let bPostion = data.data.block_position;
    let playerName = getName(player);
    let dim = getDimensionOfEntity(player);
    let playerPos = getPosCmp(player);
    let bX = transNum(bPostion.x);
    let bY = transNum(bPostion.y);
    let bZ = transNum(bPostion.z);

    let pX = transNum(playerPos.x);
    let pY = transNum(playerPos.y);
    let pZ = transNum(playerPos.z);

    let time = getTime();
    //获得方块
    let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
    let tickingArea = tickAreaCmp.data.ticking_area;
    let block = system.getBlock(tickingArea,bX,bY,bZ);
    let blockName = block.__identifier__;
    if(checkIfContainer(blockName)){
    blockName = blockName.split(":")[1];
    system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 容器交互 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
    addRecord(time, playerName, pX, pY, pZ, "open", blockName, bX, bY, bZ, dim);  
    }
  });

  //放置方块记录
  system.listenForEvent("minecraft:player_placed_block",(data)=>{
    let player = data.data.player;
    let bPostion = data.data.block_position;
    let playerName = getName(player);
    let dim = getDimensionOfEntity(player);
    let playerPos = getPosCmp(player);
    let bX = transNum(bPostion.x);
    let bY = transNum(bPostion.y);
    let bZ = transNum(bPostion.z);

    let pX = transNum(playerPos.x);
    let pY = transNum(playerPos.y);
    let pZ = transNum(playerPos.z);

    let time = getTime();
    //获得方块
    let tickAreaCmp = system.getComponent<ITickWorldComponent>(player,MinecraftComponent.TickWorld);
    let tickingArea = tickAreaCmp.data.ticking_area;
    let block = system.getBlock(tickingArea,bX,bY,bZ);
    let blockName = block.__identifier__.split(":")[1];
    //system.sendText(player,`${time} ${playerName}(${pX},${pY},${pZ}) 放置 ${blockName}(${bX},${bY},${bZ}) dim:${dim}`);
    addRecord(time, playerName, pX, pY, pZ, "place", blockName, bX, bY, bZ, dim);  
  });

  //添加查询命令
// /logs x y z x y z 可选：行为
// /logsof playerName 暂时不可用softenum
//system.registerSoftEnum("action_enum", ["all","break","place","open","use"]);

system.registerCommand("logs", {
  description: "读取行为日志",
  permission: 1,
  overloads: [
    {
      parameters: [{
        name:"start",
        type:"position"
      },
      {
        name:"end",
        type:"position"
      },
      {//可选的行为名称 （破坏 放置 打开 使用）
        name:"行为名",
        type:"string",
        optional:true
      },
      {
        name:"几小时内",
        type:"int",
        optional:true
      },
      {
        name:"玩家名",
        type:"string",
        optional:true
      }
    ],
      handler([start,end,action,hour,player]) {
        if (!this.entity) throw "Player required";
        let entity = this.entity;
        let sX = transNum(start.x);
        let sY = transNum(start.y);
        let sZ = transNum(start.z);

        let eX = transNum(end.x);
        let eY = transNum(end.y);
        let eZ = transNum(end.z);

        
        let dim = getDimensionOfEntity(entity);
        let records:string[];
        if (hour < 0 ){
          hour = 0;
        }
        if(action == ""){
          //server.log(`全局查找 ${sX} ${sY} ${sZ}`);
          records = readRecord(sX,sY,sZ,eX,eY,eZ,dim,"all",hour,player);
        }
        else{
          //server.log("特定行为查找" + action);
          records = readRecord(sX,sY,sZ,eX,eY,eZ,dim,action,hour,player);
        }
        let say:string = `§a§l日志系统2.0 by haojie06 以下为查找到的记录：§r\n`;
        if (hour == 0){
          say += `§b所有时间 `;
        }
        else{
          say += `§b${hour}小时内 `;
        }

        if (player == ""){
          say += `§6所有玩家的`;
        }
        else{
          say += `§6玩家${player}的§r`;
        }

        if (action == "break"){
          say += `§c破坏行为记录§r:\n`;
        }
        else if (action == "place"){
          say += `§9放置行为记录§r:\n`;
        }
        else if (action == "open"){
          say += `§e开箱行为记录§r:\n`;
        }
        else if (action == "use"){
          say += `§3使用行为记录§r:\n`;
        }
        else{
          say += `§a所有行为的记录§r:\n`;
        }

        for(let line of records){
          say = say + line + "\n";
        }
        
        system.sendText(entity,`${say}`);
      }
    } as CommandOverload<["position","position","string","int","string"]>
  ]
});

system.registerCommand("dellogs",{
  description:"删除几天以前的所有日志",
  permission:1,
  overloads:[{
    parameters:[{
      name:"几天以前",
      type:"int"
    }],
    handler([day]){
      if(!this.entity) throw "只有玩家可以执行该命令";
      let delNum = delRecord(day);
      system.sendText(this.entity,`§a已删除${day}天前共计:${delNum}条记录`);
    }
  } as CommandOverload<["int"]>
]
});
};

system.shutdown = function() {
  //在此处进行结束工作
  closeDB();
  server.log("日志系统已卸载");
};

function getName(entity: IEntity) {
  return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
}

function getPosCmp(entity: IEntity){
  return system.getComponent<IPositionComponent>(entity,MinecraftComponent.Position).data;
}

function getDimensionOfEntity(entity: IEntity){
  let dimension;
  if (system.hasComponent(entity, "stone:dimension")) {
    let comp = system.getComponent(entity,MinecraftComponent.Dimension);
    dimension = comp.data;
}
  else{
    dimension = "无法获得维度";
  }
  return String(dimension);
}
