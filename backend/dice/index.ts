import { Roll, RollResult } from "../types";

const DICE_ROLL_REGEX =
  /^(?<count>\d+)d(?<faces>[2|3|4|6|8|10|12|20|100]+)(((?<operation>[+|-]){1})(?<modifier>\d)+)?$/i;

export function isValidRawRoll(roll: unknown): boolean {
  if (typeof roll !== "string") return false;

  return DICE_ROLL_REGEX.test(roll);
}

export function buildRoll(roll: string): Roll {
  if (!isValidRawRoll(roll)) throw new Error("invalid roll");
  const { count, faces, operation, modifier } =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    DICE_ROLL_REGEX.exec(roll)!.groups!;
  const op = operation as "+" | "-";

  return {
    count: Number(count),
    faces: Number(faces),
    operation: op,
    modifier: isNaN(Number(modifier)) ? undefined : Number(modifier),
  };
}

const OPERATIONS = {
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
};

export function doRoll({ count, faces, operation: op, modifier = 0 }: Roll): RollResult {
  const operation = op ? OPERATIONS[op] : null;
  const diceResults = Array.from(new Array(count)).map(() => Math.ceil(Math.random() * faces));
  const subtotal = diceResults.reduce((sum, result) => sum + result, 0);
  const total = operation ? operation(subtotal, modifier) : subtotal;

  return { diceResults, modifier, total };
}
