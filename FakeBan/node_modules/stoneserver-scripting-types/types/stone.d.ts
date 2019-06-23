/// <reference types="minecraft-scripting-types-server" />

type API_LEVEL = 1;

type BlockPos = [number, number, number];
type Vec3 = [number, number, number];
type Vec2 = [number, number];

interface CommandOrigin {
  name: string;
  blockPos: BlockPos;
  worldPos: Vec3;
  entity: IEntity;
  permissionLevel: 0 | 1 | 2 | 3 | 4;
}
type CommandTypes = {
  message: string;
  string: string;
  "soft-enum": string;
  int: number;
  block: object;
  float: number;
  bool: boolean;
  text: string;
  position: Vec3;
  selector: IEntity[];
  json: object;
  "player-selector": IEntity[];
};

type CommandArgument<K> = K extends keyof CommandTypes
  ? {
      name: string;
      type: K;
      optional?: true;
    } & (K extends "soft-enum" ? { enum: string } : {})
  : never;
type MappedArgsDefs<T extends Array<keyof CommandTypes>> = {
  readonly [K in keyof T]: CommandArgument<T[K]>
};
type MappedArgs<T extends Array<keyof CommandTypes>> = {
  readonly [K in keyof T]: T[K] extends keyof CommandTypes
    ? CommandTypes[T[K]]
    : never
};

interface CommandOverload<
  TSystem,
  TArgs extends Array<keyof CommandTypes> = Array<keyof CommandTypes>
> {
  parameters: MappedArgsDefs<TArgs>;
  handler: (
    this: TSystem,
    origin: CommandOrigin,
    args: MappedArgs<TArgs>
  ) => void;
}
type WorldInfo = {
  spawnPoint: [number, number, number];
};
type ActorInfoBase = {
  identifier: string;
  name: string;
  pos: [number, number, number];
  dim: number;
  variant: number;
  airSupply: [number, number];
  strength: [number, number];
  age: number;
  ride: IEntity | null;
  rideRoot: IEntity | null;
  target: IEntity | null;
  armors: [
    ItemInstance | null,
    ItemInstance | null,
    ItemInstance | null,
    ItemInstance | null
  ];
};
type PlayerInfo = ActorInfoBase & {
  identifier: "minecraft:player";
  permission: number;
  uuid: string;
  xuid: string;
  spawnPoint: [number, number, number];
  selectedItem: ItemInstance;
  sleepTimer: number;
  attackDamage: number;
  agent: IEntity | null;
};

type ActorInfo = ActorInfoBase | PlayerInfo;

interface ChatEventParameters {
  sender: IEntity;
  content: string;
}

interface CommandDefinition<TSystem> {
  description: string;
  permission: 0 | 1 | 2 | 3 | 4;
  overloads: CommandOverload<IStoneServerSystem<TSystem> & TSystem>[];
}

interface ItemInstance {
  name: string;
  custom_name: string;
  count: number;
}

interface BlockInfo {
  type: "compound";
  value: {
    name: string;
    states: {
      type: "compound";
      value: any;
    };
  };
}

type Checks =
  | "ability"
  | "destroy"
  | "build"
  | "use"
  | "use_block"
  | "use_on"
  | "interact"
  | "attack";

type CheckInfo<T extends Checks> = T extends "ability"
  ? {
      type: T;
      ability: string;
    }
  : T extends "destroy"
  ? {
      type: T;
      block: BlockInfo;
      blockpos: BlockPos;
    }
  : T extends "build"
  ? {
      type: T;
      blockpos: BlockPos;
    }
  : T extends "use"
  ? {
      type: T;
      item: ItemInstance;
    }
  : T extends "use_block"
  ? {
      type: T;
      block: BlockInfo;
      blockpos: BlockPos;
    }
  : T extends "use_on"
  ? {
      type: T;
      block: BlockInfo;
      item: ItemInstance;
      blockpos: BlockPos;
      position: Vec3;
    }
  : T extends "interact"
  ? {
      type: T;
      target: IEntity;
      blockpos: BlockPos;
    }
  : T extends "attack"
  ? {
      type: T;
      target: IEntity;
      blockpos: BlockPos;
    }
  : never;

type CheckInfoCallback<T extends Checks> = (
  player: IEntity,
  info: CheckInfo<T>,
  result: boolean
) => boolean | void;

type SystemType<TSystem = {}> = IStoneServerSystem<TSystem> & TSystem;

interface IStoneServerSystem<TSystem>
  extends IServerSystem<IStoneServerSystem<TSystem> & TSystem> {
  /**
   * Print somthing to server log
   * @param object objects to be printed
   */
  log(...object: any[]): void;

  /** Broadcast a message (ExtAPI test), should same as broadcastEvent("minecraft:display_chat_event", message)  */
  broadcastMessage(message: string): void;

  /**
   * Execute command as current command origin
   * @param command Command string (includes the slash)
   * @returns command execution result
   */
  invokeCommand(command: string): void;

  /**
   * Execute command as entity
   * @param entity the origin entity
   * @param command Command string (includes the slash)
   * @returns command execution result
   */
  invokeCommand(entity: IEntity, command: string): string;

  /**
   * Execute command as console
   * @param name console name
   * @param command Command string (includes the slash)
   * @returns command execution result
   */
  invokeConsoleCommand(name: string, command: string): string;

  /**
   * Execute command as entity (bypass the permission check)
   * @param entity the origin entity
   * @param command Command string (includes the slash)
   * @returns command execution result
   */
  invokePrivilegedCommand(entity: IEntity, command: string): string;

  /**
   * Register a global command
   * @param name command name
   * @param desc command description
   * @param level command permission level
   * @param overloads command overloads
   */
  registerCommand(name: string, overloads: CommandDefinition<TSystem>): void;

  /**
   * Register a soft enum
   * @param name soft enum name
   * @param values soft enum values
   */
  registerSoftEnum(name: string, values: string[]): void;

  /**
   * Update a soft enum
   * @param name soft enum name
   * @param values soft enum values
   */
  updateSoftEnum(name: string, values: string[]): void;

  /**
   * Transfer player to host:port (/transferserver)
   * @param player target player
   * @param host target server hostname
   * @param port target server port
   */
  transferPlayer(player: IEntity, host: string, port: number): void;

  /**
   * Change actor dimension
   * @param actor target actor
   * @param dim target dimension
   */
  changeDimension(actor: IEntity, dim: number): void;

  /**
   * Open a modal form for specify player
   * @param player target player
   * @param form form json string
   */
  openModalForm(player: IEntity, form: string): Promise<string>;

  /**
   * Query actor info
   * @param actor target actor
   */
  actorInfo(actor: IEntity): ActorInfo;

  /**
   * Query world info
   */
  worldInfo(): WorldInfo;

  /**
   * mute the chat so that you can provide a alternative chat handler
   * @param flag unmute chat if false
   */
  muteChat(flag?: false): void;

  /**
   * Broadcast event to external program
   * @param name event name
   * @param data event data
   */
  broadcastExternalEvent(name: string, data: string): void;

  checkAbility(callback: CheckInfoCallback<"ability">): void;
  checkDestroy(callback: CheckInfoCallback<"destroy">): void;
  checkBuild(callback: CheckInfoCallback<"build">): void;
  checkUse(callback: CheckInfoCallback<"use">): void;
  checkUseBlock(callback: CheckInfoCallback<"use_block">): void;
  checkUseOn(callback: CheckInfoCallback<"use_on">): void;
  checkInteract(callback: CheckInfoCallback<"interact">): void;
  checkAttack(callback: CheckInfoCallback<"attack">): void;
}

interface IVanillaServerSystemBase {
  /**
   * This event is triggered whenever a player send chat message.
   */
  listenForEvent(
    eventIdentifier: "stoneserver:chat_received",
    params: ChatEventParameters
  ): boolean | null;
}

interface IServer {
  /**
   * Print somthing to server log
   * @param object objects to be printed
   */
  log(...object: any[]): void;
}

type SQLite3Param =
  | {
      [index: string]: any;
    }
  | Array<any>;

declare class SQLite3 {
  constructor(path: string);
  readonly valid: boolean;
  close(): void;
  exec(
    sql: string,
    callback?: (line: { [index: string]: string }) => void
  ): number;
  query(sql: string, params: SQLite3Param): Iterable<{ [index: string]: any }>;
  update(sql: string, params: SQLite3Param): number;
}

declare function checkApiLevel(level: API_LEVEL): void;
