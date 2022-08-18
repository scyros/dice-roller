import { buildRoll, doRoll } from "../dice";

describe("dice", () => {
  it("should roll properly", () => {
    let roll = buildRoll("2d10+2");
    expect(roll).toHaveProperty("count", 2);
    expect(roll).toHaveProperty("faces", 10);
    expect(roll).toHaveProperty("operation", "+");
    expect(roll).toHaveProperty("modifier", 2);

    roll = buildRoll("3d6");
    expect(roll).toHaveProperty("count", 3);
    expect(roll).toHaveProperty("faces", 6);
    expect(roll.operation).toBeUndefined();
    expect(roll.modifier).toBeUndefined();
  });

  it("should throw an error when roll is invalid", () => {
    const t1 = () => buildRoll("hello world!");
    expect(t1).toThrow("invalid roll");
    const t2 = () => buildRoll(1 as unknown as string);
    expect(t2).toThrow("invalid roll");
  });

  it("should do roll", () => {
    const roll1 = buildRoll("2d10-2");
    const result1 = doRoll(roll1);
    expect(result1).toHaveProperty("diceResults");
    expect(result1).toHaveProperty("modifier", 2);
    expect(result1).toHaveProperty("total");
    expect(result1.diceResults).toBeInstanceOf(Array);
    expect(result1.total).toBeGreaterThanOrEqual(0);
    expect(result1.total).toBeLessThanOrEqual(18);

    const roll2 = buildRoll("3d6+2");
    const result2 = doRoll(roll2);
    expect(result2).toHaveProperty("diceResults");
    expect(result2).toHaveProperty("modifier", 2);
    expect(result2).toHaveProperty("total");
    expect(result2.diceResults).toBeInstanceOf(Array);
    expect(result2.total).toBeGreaterThanOrEqual(5);
    expect(result2.total).toBeLessThanOrEqual(20);

    const roll3 = buildRoll("4d4");
    const result3 = doRoll(roll3);
    expect(result3).toHaveProperty("diceResults");
    expect(result3).toHaveProperty("modifier", 0);
    expect(result3).toHaveProperty("total");
    expect(result3.diceResults).toBeInstanceOf(Array);
    expect(result3.total).toBeGreaterThanOrEqual(4);
    expect(result3.total).toBeLessThanOrEqual(16);
  });
});
