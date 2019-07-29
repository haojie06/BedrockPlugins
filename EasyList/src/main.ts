import {db,DELETE_BY_BIND_KIND,SELECT_BIND_INBLACKLIST_BYNAME,SELECT_ALLINBLACKLIST_BYNAME,SELECT_ALLINBLACKLIST_BYBIND,SELECT_ALLNAME_BYBIND,SELECT_WHITELIST_BIND_BYNAME,SELECT_WHITELIST_BY_BIND,SELECT_NAME_IN_LIST, DELETE_NAME_IN_LIST, SELECT_ALL_IN_LIST, INSERT_LIST} from "./database"
const system = server.registerSystem(0, 0);
let tick = 0,tick2 = 0;
let playerBanedNameList:string[] = [];
let playerNotInWhiteNamelist:string[] = [];
let playerEntityNotInWhitelist:IEntity[] = [];
let playerQuery;
system.initialize = function() {
    server.log("EasyList2.0 loaded 简易黑白名单");
    system.listenForEvent("minecraft:entity_created",onPlayerJoin);

    //注册自定义组件，用于标识玩家
    system.registerComponent("easylist:isplayer", {});
    playerQuery = system.registerQuery();
    system.addFilterToQuery(playerQuery,"easylist:isplayer");

    system.registerCommand("fkick",{
      description: "踢掉",
      permission: 1,
      overloads: [{
        parameters:[
          {
            type: "player",
            name: "target"
          }
        ],
        handler([target]){
          system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c服务器已踢出${getName(target[0])}"}]}`,data=>{});
          system.destroyEntity(target[0]);
          server.log(`服务器已踢出${getName(target[0])}`);
        }
      }as CommandOverload<["player"]>
      ]
    });


    system.registerCommand("fwhitelist", {
      description: "白名单",
      permission: 1,
      overloads: [
      {
          parameters: [
          {
              type: "string",
              name: "add/remove/list"
          },
          {
              type: "string",
              name: "target"
          },
          {
            type: "string",
            name: "qqnumber",
            optional: true
          },
          {
            type: "string",
            name: "message",
            optional: true
          }
          ],
          handler([action, target, bind, msg]) {
          if(action == "add"){
          let $name = target;
          let $bind = "未知qq";
          let $msg = "";
          let $kind = "whitelist";

          if(msg != "")
          {
            $msg = msg;
          }
          if(bind != ""){
            $bind = bind;
          }

          let datas;
          //先判断此人是否在黑名单内
          if($bind != "未知qq")
          {
          datas = Array.from(db.query(SELECT_ALLINBLACKLIST_BYBIND,{$bind}));
          if (datas.length != 0){
            server.log(`此人${$name}绑定号码${$bind}已在黑名单内，拒绝添加`);
            throw "此人绑定号码已在黑名单内，拒绝添加";
          }
          }
          //防止重复添加
          datas = Array.from(db.query(SELECT_WHITELIST_BIND_BYNAME,{$name}));
          if(datas.length != 0){
            server.log(`已经有人使用过这个名字了 ${datas[0].bind}`);
            throw `已经有人使用过这个名字了 ${datas[0].bind}`;
          }
          //可以进行添加
          db.update(INSERT_LIST,{
            $name,
            $kind,
            $bind,
            $msg
          });
        //添加白名单标签
        system.executeCommand(`tag @a[name="${$name}"] add whitelist`,data=>{});
        datas = Array.from(db.query(SELECT_WHITELIST_BY_BIND,{$bind}));
        if(datas.length != 0){
          //玩家这个qq已经注册过白名单了
          system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a已为${$name}添加白名单 绑定:${$bind} 备注:${$msg}"}]}`,data=>{});
          server.log(`已为${$name}添加白名单 绑定:${$bind} 备注:${$msg}`);
          let namelist;
          for(let index in datas){
            if(index == '0'){
              namelist = datas[index].name;
            }
            else{
            namelist = namelist + "," + datas[index].name;
            }
        }
          system.executeCommand(`tellraw @a {"rawtext":[{"text":"§e玩家已有账号：§r\n${namelist}"}]}`,data=>{});
          server.log(`玩家已有账号：§r\n${namelist}`);
          system.executeCommand(`title @a[name="${$name}"] clear`,data=>{});
          system.executeCommand(`title @a[name="${$name}"] title §3你已获得白名单`,data=>{});
        }
        else{
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a已为${$name}添加白名单 ${$msg}"}]}`,data=>{});
        server.log(`已为${$name}添加白名单 绑定:${$bind} 备注:${$msg}`);
      }
      }
      else if (action == "remove"){
        let $name = target;
        let $kind = "whitelist";
        db.update(DELETE_NAME_IN_LIST,{$name,$kind});
        playerNotInWhiteNamelist.push($name);
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a已移除${$name}的白名单 ${msg}"}]}`,data=>{});
        server.log(`已移除${$name}的白名单 ${msg}`);
      }
      else if (action == "list"){
        //查找该玩家添加的其他白名单
        let $name = target;
        let datas = Array.from(db.query(SELECT_WHITELIST_BIND_BYNAME,{$name}));
        let $bind = datas[0].bind;
        datas = Array.from(db.query(SELECT_ALLNAME_BYBIND,{$bind}));
        let message = "§a----------------§r\n";
        for(let index in datas){
            let data = datas[index];
            if(data.kind == "whitelist"){
              message = message + `${index}.§a[白名单]§r ${data.name}`;
            }
            else{
              message = message + `${index}.§c[黑名单]§r ${data.name}`;
            }
            message += "\n";
        }
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§eID:${target} 绑定账号:${$bind} 已有的账号有:§r\n${message}"}]}`,data=>{});
      }
        }
      } as CommandOverload<["string","string","string","string"]>
      ]
    });

    
    system.registerCommand("fban", {
    description: "封禁",
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
            name: "reason",
            optional: true
        }
        ],
        handler([target, reason]) {
        let $kind = "blacklist";
        let $name = target;
        let datas = Array.from(db.query(SELECT_WHITELIST_BIND_BYNAME,{$name}));
        if (datas.length == 0) throw "此人还没有添加过白名单";
        let $msg = reason;
        let $bind = datas[0].bind;
        let blacklistDatas = Array.from(db.query(SELECT_ALLINBLACKLIST_BYNAME,{$name}));
        playerBanedNameList.push($name);
        if (blacklistDatas.length != 0) throw "此人已被封禁";
        //添加至黑名单
        db.update(INSERT_LIST,{
            $name,
            $kind,
            $bind,
            $msg
        });

        //查询一下他是否有多个id,一起都封了
        playerBanedNameList.push(target);
        if($bind != "未知qq"){
        //记录了qq的时候可以把同一个qq的id都封了
        datas = Array.from(db.query(SELECT_WHITELIST_BY_BIND,{$bind}));
        let allmessage = `该账号还添加了${datas.length}个白名单,一并进行封禁:\n`;
        for(let index in datas){
        let data = datas[index];
        playerBanedNameList.push(String(data.name));
        allmessage += `${index}.${data.name}\n`;
        $name = String(data.name);
        $kind = "blacklist";
        db.update(INSERT_LIST,{
            $name,
            $kind,
            $bind,
            $msg
        });
        }

        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c已封禁${$name} reason:${$msg}\n${allmessage}"}]}`,data=>{});
        server.log(`已封禁${$name} reason:${$msg}\n${allmessage}`);
      }
        else{
        system.executeCommand(`tellraw @a {"rawtext":[{"text":"§c已封禁${$name} reason:${$msg}"}]}`,data=>{});
        server.log(`已封禁${$name} reason:${$msg}`);
      }
    }
    } as CommandOverload<["string", "message"]>
    ]
});


system.registerCommand("funban", {
  description: "解封",
  permission: 1,
  overloads: [
  {
      parameters: [
      {
          type: "string",
          name: "target"
      }
      ],
      handler([target]) {
      let $kind = "blacklist";
      let $name = target;
      //先找出要解封的这个人绑定的QQ
      let datas = Array.from(db.query(SELECT_BIND_INBLACKLIST_BYNAME,{$name}));
      if(datas.length == 0) throw "此人未被封禁";
      let $bind = datas[0].bind;
      //
      if ($bind != "未知QQ"){
        //移除该QQ的所有黑名单
        db.update(DELETE_BY_BIND_KIND,{
          $bind,
          $kind
        });
      }
    system.executeCommand(`tellraw @a {"rawtext":[{"text":"§a已解封${$name}"}]}`,data=>{});
    server.log(`已解封${$name}`);
  }
  } as CommandOverload<["string"]>
]});
};

//每tick一次 0.05s 每秒检测一下玩家是否在白名单内
system.update = function(){
  tick++;
  if(tick == 20){
    tick = 0;
    //获得所有不在白名单中的玩家实体 似乎是有bug
    let entities = system.getEntitiesFromQuery(playerQuery);
    //server.log("执行白名单处理 目前未在名单中实体数量:" + entities.length);
    for(let entity of entities){
      let name = getName(entity);
      //玩家在封禁待处理名单中的话
      if(playerBanedNameList.indexOf(name) != -1){
        system.executeCommand(`title @a[name="${name}"] title §e你已被服务器封禁`,data=>{});
        server.log(`玩家${name}已被封禁，踢出`);
        let re = system.destroyEntity(entity);
        if(re == true){
        playerBanedNameList.splice(playerBanedNameList.indexOf(name),1);
      }
      }
      else if (playerNotInWhiteNamelist.indexOf(name) != -1){
        system.executeCommand(`title @a[name="${name}"] title §e你还没有白名单噢，请在群里获得`,data=>{});
        server.log(`玩家${name}没有白名单，踢出`);
        let re = system.destroyEntity(entity);
        if(re == true){
        playerNotInWhiteNamelist.splice(playerNotInWhiteNamelist.indexOf(name),1);
      }
    }
  }
}
}


function onPlayerJoin(data){
    let entity = data.data.entity;
    if (!entity) throw "not entity";
    if (entity.__identifier__ == "minecraft:player") {
    server.log(`玩家${getName(entity)}加入游戏`);
    system.createComponent(entity,"easylist:isplayer");
    //先检查黑名单 后检检查白名单
    let $name = getName(entity);
    let $kind = "blacklist";
    let datas;
    try {
    datas = Array.from(db.query(SELECT_NAME_IN_LIST,{$name,$kind}));
    }catch(err){
        server.log("出现错误");
    }
    if(datas.length != 0){
        server.log("玩家在黑名单内");
        playerBanedNameList.push($name);
    }
    else{
      server.log("玩家不在黑名单内");
      //接着检测白名单
      $kind = "whitelist";
      datas = Array.from(db.query(SELECT_NAME_IN_LIST,{$name,$kind}));
    if(datas.length > 0){
        server.log("玩家在白名单内" + $name);
        //system.executeCommand(`title @a[name="${$name}"] §e你拥有白名单，游戏愉快`,data=>{server.log(JSON.stringify(data));});
    
    }
    else{
        server.log("玩家不在白名单内");
        playerNotInWhiteNamelist.push($name);
    }
}
    }
}

function getName(entity: IEntity) {
    return system.getComponent<INameableComponent>(entity, MinecraftComponent.Nameable).data.name;
}

