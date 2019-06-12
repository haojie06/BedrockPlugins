//关于数据库的文件
function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
  //创建一个储存行为日志的表
  //记录格式 id,时间,玩家名,玩家坐标，行为，行为对象，对象坐标
  export const CREATE_TABLE = fix`
  CREATE TABLE IF NOT EXISTS log(
    id,
    time TEXT NOT NULL,
    name TEXT NOT NULL,
    playerX INT NOT NULL,
    playerY INT NOT NULL,
    playerZ INT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    targetX INT NOT NULL,
    targetY INT NOT NULL,
    targetZ INT NOT NULL,
    dim TEXT NOT NULL,
    desc TEXT,
    timestamp INT NOT NULL
  );`;

  //添加记录
  export const INSERT_LOG = fix`
  INSERT INTO log (
    time, name, playerX, playerY, playerZ, action, target, targetX, targetY, targetZ, dim, desc, timestamp
  ) values (
    $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp
  );`;
//获得一个玩家的所有行为
  export const SELECT_LOG_BY_NAME = fix`SELECT * FROM log WHERE name=$name;`;
//获得所有的日志
  export const SELECT_ALL_LOG = fix`SELECT * FROM log;`;

  //export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;
  export const DELETE_LOG_BY_DAY = fix`DELETE FROM log WHERE timestamp<$timestamp;`;

//获得一个范围内（x y z）的所有记录
 export const SELECT_ALL_IN_ZONE = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim`;
 export const SELECT_IN_ZONE_BYACTION = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action`;
//新增一个约束条件 几小时之内
 export const SELECT_ALL_IN_ZONE_AFTERTIME = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline`;
 export const SELECT_IN_ZONE_BYACTION_AFTERTIME = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline`;

 export const SELECT_ALL_IN_ZONE_AFTERTIME_PNAME = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND timestamp > $timeline AND name=$player`;
 export const SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action AND timestamp > $timeline AND name=$player`;

export const db = new SQLite3("logs.db");
db.exec(CREATE_TABLE);

//向数据库中添加记录
export function addRecord($time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc=""):void{
    let $timestamp = new Date().getTime();
    db.update(INSERT_LOG,{$time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc, $timestamp});
}

//删除几天以前的日志
export function delRecord(day:number):number{
  let $timestamp = new Date().getTime() - day * 24 * 60 * 60 * 1000;
  let delNum =  db.update(DELETE_LOG_BY_DAY,{$timestamp});
  return delNum;
}

export function readRecord($sX, $sY, $sZ, $eX, $eY, $eZ, $dim, $action="all", $hour=0,$player=""){
    let $minX = Math.min($sX,$eX);
    let $minY = Math.min($sY,$eY);
    let $minZ = Math.min($sZ,$eZ);
    let $maxX = Math.max($sX,$eX);
    let $maxY = Math.max($sY,$eY);
    let $maxZ = Math.max($sZ,$eZ);

    let result = new Array();
    let datas;

    let selects = ["break","place","open"];
    if(selects.indexOf($action) == -1){
        //无效action使用默认all
        $action = "all";
    }
    var length = 0;
    if ($hour == 0){
    if($action == "all"){
        //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
          let logs = db.query(SELECT_ALL_IN_ZONE,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim})
          datas = Array.from(logs);
    }
    else{
        //读出范围内特定行为的所有记录
        let logs = db.query(SELECT_IN_ZONE_BYACTION,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action});
        datas = Array.from(logs);
    }
  }
  else{
    //读取几个小时前
    if ($hour <= 0) throw "hour 需要为正数";
    let now:number = new Date().getTime();
    var $timeline = now - $hour * 60 * 60 * 1000;
    if($action == "all"){
      var logs;
      //读出范围内所有的记录 !!!注意 外面为minX 里面的变量也要同名
      if($player==""){
      logs = db.query(SELECT_ALL_IN_ZONE_AFTERTIME,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $timeline});
      }
      else{
      logs = db.query(SELECT_ALL_IN_ZONE_AFTERTIME_PNAME,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $timeline, $player});
      }
      datas = Array.from(logs);
  }
  else{
      //读出范围内特定行为的所有记录
      var logs;
      if ($player == "") {
      logs = db.query(SELECT_IN_ZONE_BYACTION_AFTERTIME,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action, $timeline});
      }
      else{
      logs = db.query(SELECT_IN_ZONE_BYACTION_AFTERTIME_PNAME,{$minX, $minY, $minZ, $maxX, $maxY, $maxZ, $dim, $action, $timeline, $player});
      }
      datas = Array.from(logs);
    }
  }
    for(let data of datas){
        var line;
        switch (data.action) {
            case "break":
                line = `<${length + 1}>:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §c破坏了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                break;
            case "place":
                line = `<${length + 1}>:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §a放置了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                break;
                case "open":
                line = `<${length + 1}>:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §9打开了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度:${dimTran(data.dim)}`;
                break;
            default:
                break;
        }
        length = result.push(line);
    }

    return result;
  }
//转换维度名字
  function dimTran(dim):string{
    let result:string = "§f未知";
    switch (Number(dim)) {
      case 0:
        result = "§2主世界§f";
        break;
      case 1:
        result = "§4下界§f";
        break;
      case 2:
        result = "§5末地§f";
      break;
    default:
      break;
    }
    return result;
  }
