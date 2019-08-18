import {getName,checkAdmin,getTime,getDimensionOfEntity} from "./utils";

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

//
const CTEATE_ALERTS_TABLE = fix`
CREATE TABLE IF NOT EXISTS alerts(
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  alert TEXT NOT NULL,
  description TEXT NOT NULL,
  extra TEXT NOT NULL
);`;

export const INSERT_ALERTS = fix`
INSERT INTO alerts (
  time, name, alert, description, extra
) values (
  $time, $name, $alert, $description, $extra
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

export const QUERY_ALL_ALERTS = fix`
SELECT * from alerts;
`;

export const QUERY_MISB_BYNAME = fix`
SELECT * from misb WHERE name=$name;
`;
export const DELETE_MISB_LOG = fix`DELETE FROM from misb WHERE 1=1;`;
export const DELETE_MISB_AUTOCHECK_LOG = fix`DELETE FROM misb WHERE extra="自动检测";`;
export const DELETE_ALERT_AUTOCHECK_LOG = fix`DELETE FROM alerts WHERE extra="自动检测";`;

export var db = new SQLite3("misbehavior.db");
db.exec(CREATE_MISB_TABLE);
db.exec(CTEATE_ALERTS_TABLE);

export function misbDB($name,$behavior,$description,$extra){
  let date = new Date();
  db.update(INSERT_MISB,{
      $time:getTime(),
      $position:"",
      $name,
      $behavior,
      $description,
      $extra,
      $dim:"0",
      $timestamp:date.getTime()
  });
}

export function alertDB($name,$alert,$description,$extra){
  let date = new Date();
  db.update(INSERT_ALERTS,{
      $time:getTime(),
      $name,
      $alert,
      $description,
      $extra
  });
}