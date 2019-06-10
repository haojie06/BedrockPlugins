export type MySystem = SystemType<PrivSystem>;

interface PrivSystem extends IStoneServerSystem<PrivSystem> {}

checkApiLevel(1);

export const system = server.registerSystem<MySystem>(0, 0);