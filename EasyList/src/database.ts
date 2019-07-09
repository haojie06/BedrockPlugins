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
//从已有白名单里查询该id对应的qq
export const SELECT_WHITELIST_MSG_BYNAME = fix`SELECT msg FROM list WHERE name=$name AND kind="whitelist";`;
export const SELECT_ALLNAME_BYMSG = fix`SELECT name,kind FROM list WHERE msg=$msg;`;
export const SELECT_ALLINBLACKLIST_BYMSG = fix`SELECT * FROM list WHERE msg=$msg AND kind="blacklist";`;
export const SELECT_ALLINBLACKLIST_BYNAME = fix`SELECT * FROM list WHERE name=$name AND kind="blacklist";`;
export const DELETE_NAME_IN_LIST = fix`DELETE FROM list WHERE name=$name AND kind=$kind;`;
export const SELECT_ALL_IN_LIST =  fix`SELECT name FROM list WHERE kind=$kind;`;

export const SELECT_WHITELIST_BY_MSG = fix`SELECT name FROM list WHERE kind="whitelist" AND msg=$msg;`;
export const db = new SQLite3("list.db");
db.exec(CREATE_TABLE);