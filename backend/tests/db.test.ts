import { findPositionsForConnectionIds } from "../db";
import { isValidRoom, isValidUser } from "../db/schemas";

describe("DB", () => {
  describe("findPositionsForConnectionIds", () => {
    it("should find indexes for shared connections ids", () => {
      const users = [
        { connectionId: "conn1" },
        { connectionId: "conn2" },
        { connectionId: "conn3" },
        { connectionId: "conn4" },
      ];
      const connectionIds = ["conn2", "conn4"];
      const result = findPositionsForConnectionIds(users, connectionIds);
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([1, 3]));
    });
  });

  describe("schemas", () => {
    describe("user", () => {
      it("should validate correctly", () => {
        expect(isValidUser({ nickName: "Dani" })).toBeTruthy();
        expect(isValidUser(1)).toBeFalsy();
      });
    });

    describe("room", () => {
      it("should validate correctly", () => {
        expect(isValidRoom({ id: "roomId" })).toBeTruthy();
        expect(isValidRoom(1)).toBeFalsy();
      });
    });
  });
});
