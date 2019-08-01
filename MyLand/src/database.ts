function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
  //创建一个储存领地基本信息的表
  const CREATE_LAND_TABLE = fix`
  CREATE TABLE IF NOT EXISTS land(
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

  export const db = new SQLite3("ess.db");
  db.exec(CREATE_TABLE);
  db.exec(CREATE_HOME_TABLE);
  db.exec(CREATE_DEATH_TABLE);
  db.exec(CREATE_COMMAND_TABLE);