/* 
create by haojie06 2019/6/10
用于记录玩家在游戏中的行为 （超简化版coi..）
*/
import { MySystem,system } from "./system";
import { db,addRecord,readRecord, delRecord } from "./database";
import { getTime,checkIfBlock,stringToInt,checkIfContainer,transNum } from "./utils";
system.initialize = function() {
  server.log("日志系统v1.2.1 https://github.com/haojie06/BedrockPlugins");
  //检测记录破坏方块
  this.checkDestroy((player,info)=>{
      //system.log("破坏" + JSON.stringify(player));
      let playerInfo = this.actorInfo(player);
      let blockInfo = info.block;
      let blockPos = info.blockpos;
      let dim = playerInfo.dim;
      let playerName = playerInfo.name;
      let blockName = blockInfo.value.name;
      let pX = transNum(playerInfo.pos[0]);
      let pY = transNum(playerInfo.pos[1]);
      let pZ = transNum(playerInfo.pos[2]);

      let bX = transNum(blockPos[0]);
      let bY = transNum(blockPos[1]);
      let bZ = transNum(blockPos[2]);

      let time = getTime();
      //server.log(`${time} ${playerName}(${pX},${pY},${pZ}) 破坏 ${blockName}(${bX},${bY},${bZ}) `);
      addRecord(time, playerName, pX, pY, pZ, "break", blockName, bX, bY, bZ, dim);
    });


//放置方块记录 1.12之后需要升级
  this.checkUseOn((player,info,result)=>{
      if (result == true) {
        try {
          let time = getTime();
          let playerInfo = this.actorInfo(player);
          let dim = playerInfo.dim;
          let item:ItemInstance = info.item;
          let playerName = playerInfo.name;
          let itemName = "minecraft:" + item.name;
          let itemNum = item.count;
          let pX = transNum(playerInfo.pos[0]);
          let pY = transNum(playerInfo.pos[1]);
          let pZ = transNum(playerInfo.pos[2]);
          let vec3:Vec3 = info.position;
          if(itemName != null){
            if(checkIfBlock(itemName) == true){
          //server.log(`${time} ${playerName}(${pX},${pY},${pZ}) 放置 ${itemName}(${transNum(Number(vec3[0]))},${transNum(Number(vec3[1]))},${transNum(Number(vec3[2]))})`);
          addRecord(time, playerName, pX, pY, pZ, "place", itemName, transNum(Number(vec3[0])), transNum(Number(vec3[1])), transNum(Number(vec3[2])), dim);  
        }else{
          }
        }
        } catch (error) {
        }
    }
  });

  //检测打开容器 未来升级
  this.checkUseBlock((player,info)=>{
          let time = getTime();
          let playerInfo = this.actorInfo(player);
          let dim = playerInfo.dim;
          let block = info.block;
          let blockPos = info.blockpos;
          let playerName = playerInfo.name;
          let pX = transNum(playerInfo.pos[0]);
          let pY = transNum(playerInfo.pos[1]);
          let pZ = transNum(playerInfo.pos[2]);
          let blockName = block.value.name;
          let bX = transNum(blockPos[0]);
          let bY = transNum(blockPos[1]);
          let bZ = transNum(blockPos[2]);
          if(checkIfContainer(blockName)){
            //server.log(`${time} ${playerName} dim:${dim}(${pX},${pY},${pZ}) 打开容器 ${blockName}(${bX},${bY},${bZ})`);
            addRecord(time, playerName, pX, pY, pZ, "open", blockName, bX, bY, bZ, dim);
          }
  })
//添加查询命令
// /logs x y z x y z 可选：行为
// /logsof playerName
this.registerSoftEnum("action_enum", ["all","break", "place","open"]);

this.registerCommand("logs", {
  description: "读取日志",
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
      {//可选的行为名称 （破坏 放置 打开）
        name:"行为名",
        type:"soft-enum",
        enum:"action_enum",
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
      handler(origin,[start,end,action,hour,player]) {
        if (!origin.entity) throw "Player required";
        const info = this.actorInfo(origin.entity);
        let sX = transNum(start[0]);
        let sY = transNum(start[1]);
        let sZ = transNum(start[2]);

        let eX = transNum(end[0]);
        let eY = transNum(end[1]);
        let eZ = transNum(end[2]);

        let dim = info.dim;
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
        let say:string = `§a§l日志系统1.2 by haojie06 以下为查找到的记录：§f\n`;
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
          say += `§6玩家${player}的§f`;
        }

        if (action == "break"){
          say += `§c破坏行为记录§f:\n`;
        }
        else if (action == "place"){
          say += `§9放置行为记录§f:\n`;
        }
        else if (action == "open"){
          say += `§e开箱行为记录§f:\n`;
        }
        else{
          say += `§a所有行为的记录§f:\n`;
        }

        for(let line of records){
          say = say + line + "\n";
        }

        
        //server.log(say);
        this.invokeConsoleCommand("§aLogSystem",`tell "${info.name}" ${say}`);
      }
    } as CommandOverload<MySystem, ["position","position","soft-enum","int","string"]>
  ]
});

this.registerCommand("dellogs",{
  description:"删除几天以前的所有日志",
  permission:1,
  overloads:[{
    parameters:[{
      name:"几天以前",
      type:"int"
    }],
    handler(origin,[day]){
      if(!origin.entity) throw "只有玩家可以执行该命令";
      const info = this.actorInfo(origin.entity);
      let delNum = delRecord(day);
      this.invokeConsoleCommand("§aLogSystem",`tell "${info.name}" §a已删除${day}天前共计:${delNum}条记录`);
    }
  } as CommandOverload<MySystem, ["int"]>
]
})

};

system.shutdown = function() {
  //在此处进行结束工作
  server.log("日志系统已卸载");
};
