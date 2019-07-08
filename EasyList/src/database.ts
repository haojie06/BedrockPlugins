function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
  //创建一个储存warp坐标的表
  export const CREATE_TABLE = fix`
  CREATE TABLE IF NOT EXISTS list(
    id,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    msg TEXT
);`;

export const INSERT_LIST = fix`
  INSERT INTO list (
    name, kind, msg
  ) values (
    $name, $kind, $msg
);`;
//找出白/黑名单中是否有这个人
export const SELECT_NAME_IN_LIST = fix`SELECT name FROM list WHERE name=$name AND kind=$kind;`;
export const SELECT_MSG_BYNAME = fix``
export const DELETE_NAME_IN_LIST = fix`DELETE FROM list WHERE name=$name AND kind=$kind;`;

export const SELECT_ALL_IN_LIST =  fix`SELECT name FROM list WHERE kind=$kind;`;

export const SELECT_WHITELIST_BY_MSG = fix`SELECT name FROM list WHERE kind="whitelist" AND msg=$msg;`;
export const db = new SQLite3("list.db");
db.exec(CREATE_TABLE);