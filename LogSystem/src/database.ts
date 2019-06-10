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
    desc TEXT
  );`;

  //添加记录
  export const INSERT_LOG = fix`
  INSERT INTO log (
    time, name, playerX, playerY, playerZ, action, target, targetX, targetY, targetZ, dim, desc
  ) values (
    $time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc
  );`;
//获得一个玩家的所有行为
  export const SELECT_LOG_BY_NAME = fix`SELECT * FROM log WHERE name=$name;`;
//获得所有的日志
  export const SELECT_ALL_LOG = fix`SELECT * FROM log;`;

  //export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;

//获得一个范围内（x y z）的所有记录
 export const SELECT_ALL_IN_ZONE = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim`;
 export const SELECT_IN_ZONE_BYACTION = fix`SELECT * FROM log WHERE targetX >= $minX AND targetY >= $minY AND targetZ >= $minZ AND targetX <= $maxX AND targetY <= $maxY AND targetZ <= $maxZ AND dim = $dim AND action = $action`;

export const db = new SQLite3("logs.db");
db.exec(CREATE_TABLE);

//向数据库中添加记录
export function addRecord($time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc=""):void{
    db.update(INSERT_LOG,{$time, $name, $pX, $pY, $pZ, $action, $target, $tX, $tY, $tZ, $dim, $desc});
}

export function readRecord($sX, $sY, $sZ, $eX, $eY, $eZ, $dim, $action="all"){
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
    
    for(let data of datas){
        var line;
        switch (data.action) {
            case "break":
                line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §c破坏了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度${data.dim}`;
                break;
            case "place":
                line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §a放置了§f ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度${data.dim}`;
                break;
                case "open":
                line = `${length + 1}:${data.time} ${data.name}(${data.playerX},${data.playerY},${data.playerZ}) §9打开了§ ${data.target}(${data.targetX},${data.targetY},${data.targetZ}) 维度${data.dim}`;
                break;
            default:
                break;
        }
        length = result.push(line);
    }

    return result;

}