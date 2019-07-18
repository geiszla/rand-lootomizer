interface ILootCondition {
  condition: string;
}

interface ILootFunctionCount {
  min: number;
  max: number;
  type: string;
}

interface ILootFunction {
  function: string;
  count?: ILootFunctionCount;
  conditions?: ILootCondition[];
}

interface ILootEntry {
  type: string;
  name: string;
  weight?: number;
  functions?: ILootFunction[];
  condition?: ILootCondition[];
  children?: ILootEntry[];
  expand?: boolean;
  quality?: number;

}

interface ILootPool {
  rolls: number | { min: number, max: number };
  bonus_rolls: number | { min: number, max: number };
  entries: ILootEntry[];
  conditions: ILootCondition[];
}

interface ILootItem {
  type: string;
  pools: ILootPool[];
}
