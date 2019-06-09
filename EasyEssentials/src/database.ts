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

  export const db = new SQLite3("warp.db");
  db.exec(CREATE_TABLE);