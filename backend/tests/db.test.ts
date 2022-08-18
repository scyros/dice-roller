/* eslint-disable @typescript-eslint/no-throw-literal */
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import { createRoom, getRoom, joinRoom, leaveRoom } from "../db";
import { isValidRoom, isValidUser } from "../db/schemas";
import { UserWithConnectionId } from "../types";
import { isSuccess } from "../utils";
import { Error } from "../errors";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("DB", () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe("createRoom", () => {
    it("should create a new room", async () => {
      const user: UserWithConnectionId = { nickName: "awesome player", connectionId: "conn1" };
      const result = await createRoom(user);
      if (!isSuccess(result)) throw "should be successful";
      expect(result.result).toHaveProperty("id");
      expect(result.result).toHaveProperty("users", [user]);
    });

    it("should not create a new room", async () => {
      ddbMock.on(PutCommand).rejects();
      const user: UserWithConnectionId = { nickName: "awesome player", connectionId: "conn1" };
      const result = await createRoom(user);
      if (isSuccess(result)) throw "should be unsuccessful";
    });

    it("should not create a room already created", async () => {
      const user: UserWithConnectionId = { nickName: "awesome player", connectionId: "conn1" };
      ddbMock.on(PutCommand).rejects(new ConditionalCheckFailedException({ $metadata: {} }));
      const second = await createRoom(user);
      if (isSuccess(second)) throw "should be unsuccessful";
      expect(second.errors).toStrictEqual([Error.RoomAlreadyCreated]);
    });
  });

  describe("getRoom", () => {
    it("should retrieve a valid room", async () => {
      const roomId = "roomId";
      const users: UserWithConnectionId[] = [
        { nickName: "awesome player 1", connectionId: "conn1" },
        { nickName: "awesome player 2", connectionId: "conn2" },
        { nickName: "awesome player 3", connectionId: "conn3" },
      ];
      ddbMock.on(GetCommand).resolves({ Item: { id: roomId, users } });
      const result = await getRoom("roomId");
      if (!isSuccess(result)) throw result.errors;
      expect(result.result).toStrictEqual({ id: roomId, users });
    });

    it("should not retrieve a valid room", async () => {
      ddbMock.on(GetCommand).resolves({});
      const first = await getRoom("roomId");
      if (isSuccess(first)) throw "should raise error";
      expect(first.errors).toStrictEqual([Error.NoRoom]);

      ddbMock.on(GetCommand).rejects();
      const second = await getRoom("roomId");
      if (isSuccess(second)) throw "should raise error";
      expect(second.errors).toStrictEqual([Error.GetRoomError]);
    });
  });

  describe("joinRoom", () => {
    it("should join to a room", async () => {
      const roomId = "room1";
      const users: UserWithConnectionId[] = [{ nickName: "awesome player 1", connectionId: "conn1" }];
      const user: UserWithConnectionId = { nickName: "awesome player 2", connectionId: "conn2" };
      ddbMock.on(UpdateCommand).resolves({ Attributes: { id: roomId, users: [...users, user] } });
      const result = await joinRoom(roomId, user);
      if (!isSuccess(result)) throw "should be successful";
      expect(result.result).toStrictEqual({ id: roomId, users: [...users, user] });
    });

    it("should not join to a room", async () => {
      const roomId = "room1";
      const user: UserWithConnectionId = { nickName: "awesome player 2", connectionId: "conn2" };
      ddbMock.on(UpdateCommand).rejects();
      const result = await joinRoom(roomId, user);
      if (isSuccess(result)) throw "should be unsuccessful";
    });
  });

  describe("leaveRoom", () => {
    it("should leave room", async () => {
      const roomId = "room1";
      const users: UserWithConnectionId[] = [{ nickName: "awesome player 1", connectionId: "conn1" }];
      const user: UserWithConnectionId = { nickName: "awesome player 2", connectionId: "conn2" };

      ddbMock.on(GetCommand).resolves({ Item: { id: roomId, users: [...users, user] } });
      ddbMock.on(UpdateCommand).resolves({ Attributes: { id: roomId, users } });
      const first = await leaveRoom(roomId, [user.connectionId]);
      if (!isSuccess(first)) throw "should be successful";
      expect(first.result).toStrictEqual({ id: roomId, users });

      ddbMock.on(GetCommand).resolves({ Item: { id: roomId, users: [] } });
      const second = await leaveRoom(roomId, [user.connectionId]);
      if (!isSuccess(second)) throw "should be successful";
      expect(second.result).toStrictEqual({ id: roomId, users: [] });
    });

    it("should not leave room", async () => {
      const roomId = "room1";
      const user: UserWithConnectionId = { nickName: "awesome player 1", connectionId: "conn1" };

      ddbMock.on(GetCommand).resolves({});
      const first = await leaveRoom(roomId, [user.connectionId]);
      if (isSuccess(first)) throw "should be unsuccessful";
      expect(first.errors).toStrictEqual([Error.NoRoom]);

      ddbMock.on(GetCommand).resolves({ Item: { id: roomId, users: [user] } });
      ddbMock.on(UpdateCommand).rejects();
      const second = await leaveRoom(roomId, [user.connectionId]);
      if (isSuccess(second)) throw "should be unsuccessful";
      expect(second.errors).toStrictEqual([Error.LeaveRoomError]);
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
