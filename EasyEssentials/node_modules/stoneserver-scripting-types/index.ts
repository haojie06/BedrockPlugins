export function isPlayerInfo(info: ActorInfo): info is PlayerInfo {
  return info.name === "minecraft:player";
}
