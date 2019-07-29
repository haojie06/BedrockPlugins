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
    bind TEXT NOT NULL,
    msg TEXT
);`;

export const INSERT_LIST = fix`
  INSERT INTO list (
    name, kind, bind, msg
  ) values (
    $name, $kind, $bind, $msg
);`;

//找出白/黑名单中是否有这个人
export const SELECT_NAME_IN_LIST = fix`SELECT name FROM list WHERE name=$name AND kind=$kind;`;

//从已有白名单里查询该id所绑定的号码（例如QQ
export const SELECT_WHITELIST_BIND_BYNAME = fix`SELECT * FROM list WHERE name=$name AND kind="whitelist";`;
export const SELECT_ALLNAME_BYBIND = fix`SELECT * FROM list WHERE bind=$bind;`;
export const SELECT_ALLINBLACKLIST_BYBIND = fix`SELECT * FROM list WHERE bind=$bind AND kind="blacklist";`;
export const SELECT_ALLINBLACKLIST_BYNAME = fix`SELECT * FROM list WHERE name=$name AND kind="blacklist";`;
export const SELECT_BIND_INBLACKLIST_BYNAME = fix`SELECT * FROM list WHERE name=$name AND kind="blacklist";`;
export const DELETE_NAME_IN_LIST = fix`DELETE FROM list WHERE name=$name AND kind=$kind;`;
export const DELETE_BY_BIND_KIND = fix`DELETE FROM list WHERE bind=$bind AND kind=$kind;`;
export const SELECT_ALL_IN_LIST =  fix`SELECT name FROM list WHERE kind=$kind;`;

export const SELECT_WHITELIST_BY_BIND = fix`SELECT name FROM list WHERE kind="whitelist" AND bind=$bind;`;
export const db = new SQLite3("elist.db");
db.exec(CREATE_TABLE);