function fix(arr: TemplateStringsArray) {
    return arr
      .join("")
      .replace(/\(\n\s+/g, "(")
      .replace(/\n\s+\)/g, ")")
      .replace(/\s+/g, " ");
  }
//创建记录不当行为的数据表
const CREATE_MISB_TABLE = fix`
CREATE TABLE IF NOT EXISTS misb(
  id,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  behavior TEXT NOT NULL,
  description TEXT NOT NULL,
  extra TEXT NOT NULL,
  dim TEXT NOT NULL,
  timestamp INT NOT NULL
);`;

//添加记录
export const INSERT_MISB = fix`
INSERT INTO misb (
  time, name, position, behavior,description, extra, dim, timestamp
) values (
  $time, $name, $position, $behavior, $description, $extra, $dim, $timestamp
);`;

export const QUERY_ALL_MISB = fix`
SELECT * from misb;
`;

export const QUERY_MISB_BYNAME = fix`
SELECT * from misb WHERE name=$name;
`;
export var db = new SQLite3("misbehavior.db");
db.exec(CREATE_MISB_TABLE);