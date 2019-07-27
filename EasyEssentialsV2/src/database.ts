function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
  //创建一个储存warp坐标的表
  const CREATE_TABLE = fix`
  CREATE TABLE IF NOT EXISTS warp(
    id,
    name TEXT NOT NULL UNIQUE,
    position TEXT NOT NULL,
    owner TEXT NOT NULL
  );`;

  export const INSERT_WARP = fix`
  INSERT INTO warp (
    name, owner, position
  ) values (
    $name, $owner, $position
  );`;

  export const SELECT_WARP_BY_NAME = fix`SELECT * FROM warp WHERE name=$name;`;

  export const SELECT_ALL_WARP = fix`SELECT * FROM warp;`;
  export const SELECT_ALL_JAIL = fix`SELECT * FROM jails;`;

export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;
//---------------------------------------------------------------------------------
  //创建一个储存home信息的表
  const CREATE_HOME_TABLE = fix`
  CREATE TABLE IF NOT EXISTS homes(
    id,
    homeName TEXT NOT NULL,
    position TEXT NOT NULL,
    owner TEXT NOT NULL
  );`;

  //查找一个owner的所有home
  export const SELECT_HOME_BY_OWNER = fix`SELECT * FROM homes WHERE owner=$owner;`;

  //根据owner和home名字查找  !注意 一个owner之下不要出现重名的home
  export const SELECT_HOME_BY_NAME = fix`SELECT * FROM homes WHERE owner=$owner AND homeName=$homeName;`;

  //添加home记录
  export const INSERT_HOME  = fix`
  INSERT INTO homes (
    homeName, position, owner
  ) values (
    $homeName, $position, $owner
  );`;


  //删除一个home
  export const DELETE_HOME_BY_NAME = fix`DELETE FROM homes WHERE homeName=$homeName AND owner=$owner;`;
//----------------------------------------
//创建一个记录死亡点的表
const CREATE_DEATH_TABLE = fix`
CREATE TABLE IF NOT EXISTS death(
  id,
  player TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL
);`;

  //添加死亡记录
  export const INSERT_DEATH  = fix`
  INSERT INTO death (
    player, position
  ) values (
    $player, $position
  );`;
  //删除死亡记录 （添加前或者传送后）
  export const DELETE_DEATH = fix`DELETE FROM death WHERE player=$player;`;
  //获得死亡记录
  export const SELECT_DEATH = fix`SELECT * FROM death WHERE player=$player;`;
//------------------------------------------
//双人有时限命令 例如/tpa等
const CREATE_COMMAND_TABLE = fix`
CREATE TABLE IF NOT EXISTS command(
  id,
  command TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  message TEXT
);`;

export const INSERT_COMMAND = fix`
INSERT INTO command (
  command, source, target, timestamp
) values (
  $command, $source, $target, $timestamp
);
`;
//拒绝后删除请求
export const DELETE_COMMAND_DENY = fix`
DELETE FROM command WHERE command=$command AND source=$source AND target=$target;
`;
//同意后删除请求
export const DELETE_COMMAND_ACEP = fix`
DELETE FROM command WHERE command=$command AND source=$source AND target=$target;
`;
//删除过期请求
export const DELETE_OUTDATED_COMMAND = fix`DELETE FROM command WHERE timestamp<$endTime AND command=$command;`;
//查询命令请求
export const GET_REQ = fix`SELECT * FROM command WHERE command=$command AND target=$target;`;
//------------------------------------------
  export const db = new SQLite3("ess.db");
  db.exec(CREATE_TABLE);
  db.exec(CREATE_HOME_TABLE);
  db.exec(CREATE_DEATH_TABLE);
  db.exec(CREATE_COMMAND_TABLE);