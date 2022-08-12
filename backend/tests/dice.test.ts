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
    const t = () => buildRoll("hello world!");
    expect(t).toThrow("invalid roll");
  });

  it("should do roll", () => {
    const roll = buildRoll("2d10+2");
    const result = doRoll(roll);
    expect(result).toHaveProperty("diceResults");
    expect(result).toHaveProperty("modifier", 2);
    expect(result).toHaveProperty("total");
    expect(result.diceResults).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThanOrEqual(4);
  });
});
