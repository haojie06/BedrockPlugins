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
    creator TEXT NOT NULL,
    owner TEXT NOT NULL,
    dim TEXT NOT NULL,
    sposition TEXT NOT NULL,
    eposition TEXT NOT NULL,
    minx INT NOT NULL,
    miny INT NOT NULL,
    minz INT NOT NULL,
    maxx INT NOT NULL,
    maxy INT NOT NULL,
    maxz INT NOT NULL,
    size INT NOT NULL,
    flags TEXT DEFAULT '',
    extra TEXT
  );`;
//创建一个储存领地居民的表
  const CREATE_RESIDENT_TABLE = fix`
  CREATE TABLE IF NOT EXISTS resident(
    id,
    landname TEXT NOT NULL,
    playername TEXT NOT NULL,
    permission TEXT NOT NULL,
    extra TEXT
  );
`;
const CREATE_ZONE_TABLE = fix`
CREATE TABLE IF NOT EXISTS zone(
  id,
  landname TEXT NOT NULL,
  zonename TEXT NOT NULL,
  creator TEXT NOT NULL,
  owner TEXT NOT NULL,
  sposition TEXT NOT NULL,
  eposition TEXT NOT NULL,
  minx INT NOT NULL,
  miny INT NOT NULL,
  minz INT NOT NULL,
  maxx INT NOT NULL,
  maxy INT NOT NULL,
  maxz INT NOT NULL,
  size INT NOT NULL,
  trust TEXT NOT NULL,
  extra TEXT DEFAULT ''
  );
`;
  export const INSERT_ZONE = fix`
  INSERT INTO zone (
    landname, zonename, creator, owner, sposition, eposition, minx, miny, minz, maxx, maxy, maxz, size, trust
  ) values(
    $landname, $zonename, $creator, $owner, $sposition, $eposition, $minx, $miny, $minz, $maxx, $maxy, $maxz, $size, $trust
  );
  `;

  export const INSERT_LAND = fix`
  INSERT INTO land (
    name, creator, owner, dim, sposition, eposition, minx, miny, minz, maxx, maxy, maxz, size, flags
  ) values (
    $name, $creator, $owner, $dim, $sposition, $eposition, $minx, $miny, $minz, $maxx, $maxy, $maxz, $size, $flags
  );`;

  export const INSERT_RESIDENT = fix`
  INSERT INTO resident (
      landname, playername, permission, extra
  ) values (
      $landname, $playername, $permission, $extra
  );
  `;


    export const UPDATE_LAND_FLAGS = fix`UPDATE land SET flags=$flags WHERE name=$name;`;
    export const UPDATE_ZONE_TRUST = fix`UPDATE zone SET trust=$trust WHERE landname=$landname AND zonename=$zonename;`;
    export const SELECT_LAND_BY_POS = fix`SELECT * FROM land WHERE $px>=minx AND $px<=maxx AND $py>=miny AND $py<=maxy AND $pz>=minz AND $pz<=maxz AND $sdim=dim;`;
    export const SELECT_LAND_BY_NAME = fix`SELECT * FROM land WHERE name=$name;`;
    export const SELECT_LAND_BY_OWNER = fix`SELECT * FROM land WHERE $owner=owner;`;
    export const SELECT_LAND_BY_OWNER_CREATOR = fix`SELECT * FROM land WHERE $owner=owner AND $creator=creator;`;
    export const SELECT_RESIDENT_BY_LAND_AND_NAME = fix`SELECT * FROM resident WHERE $landname=landname AND $playername=playername;`;
    export const SELECT_RESIDENT_BY_LAND = fix`SELECT * FROM resident WHERE $landname=landname;`;
    export const SELECT_RESIDENT_BY_NAME = fix`SELECT * FROM resident WHERE $playername=playername;`;
        //export const SELECT_LAND_BY_POS = fix`SELECT * FROM land WHERE minx=$px;`;
    export const SELECT_ZONE_BY_LANDANDZONE = fix`SELECT * FROM zone WHERE $landname=landname AND $zonename=zonename;`;
    export const SELECT_ZONE_BY_POSANDLAND = fix`SELECT * FROM zone WHERE $px>=minx AND $px<=maxx AND $py>=miny AND $py<=maxy AND $pz>=minz AND $pz<=maxz AND $landname=landname;`;
    export const SELECT_ZONE_BY_LAND = fix`SELECT * FROM zone WHERE $landname=landname;`;
    export const DELETE_RESIDENT_BY_LAND = fix`DELETE FROM resident WHERE landname=$landname;`;
    export const DELETE_RESIDENT_BY_LAND_NAME = fix`DELETE FROM resident WHERE landname=$landname AND playername=$playername;`;
    export const DELETE_LAND_BY_NAME = fix`DELETE FROM land WHERE name=$name;`;
    export const DELETE_LAND_BY_NAME_OWNER = fix`DELETE FROM land WHERE name=$name AND owner=$owner;`;
    export const DELETE_ZONE_BY_LAND = fix`DELETE FROM zone WHERE landname=$landname;`;

    export const DELETE_ZONE_BY_LANDANDZONE = fix`DELETE FROM zone WHERE landname=$landname AND zonename=$zonename;`;
//---------------------------------------------------------------------------------

  export const db = new SQLite3("myland.db");
  db.exec(CREATE_LAND_TABLE);
  db.exec(CREATE_RESIDENT_TABLE);
  db.exec(CREATE_ZONE_TABLE);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = NORMAL");
  