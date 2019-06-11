function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
  //创建一个储存warp坐标的表
  export const CREATE_TABLE = fix`
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

  export const DELETE_WARP_BY_NAME = fix`DELETE FROM warp WHERE name=$name;`;


  //创建一个储存home信息的表
  export const CREATE_HOME_TABLE = fix`
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

  export const db = new SQLite3("ess.db");
  db.exec(CREATE_TABLE);
  db.exec(CREATE_HOME_TABLE);