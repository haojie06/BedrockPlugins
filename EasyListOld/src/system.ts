export type MySystem = SystemType<PrivSystem>;

interface PrivSystem extends IStoneServerSystem<PrivSystem> {}

checkApiLevel(1);
