import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Errors } from "../errors";

import { OperationResult, Room, User } from "../types";
import { isSuccess } from "../utils";

const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
const dbbDoc = DynamoDBDocumentClient.from(ddb);

/**
 * Create a room
 * @param user User that creates the room
 * @returns The room created
 */
export async function createRoom(user: User & { connectionId: string }): Promise<OperationResult<Room>> {
  const room: Room = {
    id: uuidv4(),
    users: [user],
  };

  try {
    await dbbDoc.send(
      new PutCommand({
        TableName: process.env.MATCHES_TABLE,
        Item: room,
        ConditionExpression: "attribute_not_exists(id)",
      })
    );

    return { success: true, result: room };
  } catch (e) {
    let errors = [`${e}`];
    if (e instanceof ConditionalCheckFailedException) {
      errors = [Errors.RoomAlreadyCreated];
    }
    return { success: false, errors };
  }
}

/**
 * Join to a given room
 * @param roomId Room id of the room to join to
 * @param user User that is trying to join
 * @returns The room with all its users
 */
export async function joinRoom(roomId: string, user: User & { connectionId: string }): Promise<OperationResult<Room>> {
  try {
    const { Attributes: room } = await ddb.send(
      new UpdateCommand({
        TableName: process.env.MATCHES_TABLE,
        Key: { id: roomId },
        UpdateExpression: "SET #users = list_append(#users, :user)",
        ExpressionAttributeNames: { "#users": "users" },
        ExpressionAttributeValues: { ":user": [user] },
        ReturnValues: "ALL_NEW",
      })
    );

    return { success: true, result: room as Room };
  } catch (e) {
    return { success: false, errors: [Errors.JoinRoomError] };
  }
}

/**
 * Retrieve a room from DB
 * @param roomId The id of the room to be retrieved
 * @returns The room
 */
export async function getRoom(roomId: string): Promise<OperationResult<Room>> {
  try {
    const { Item: room } = await ddb.send(
      new GetCommand({
        TableName: process.env.MATCHES_TABLE,
        Key: { id: roomId },
      })
    );

    return { success: true, result: room as Room };
  } catch (e) {
    return { success: false, errors: [Errors.NoRoom] };
  }
}

/**
 * Find indexes of the leaving users
 * @param users All users of one room
 * @param connectionIds Users that are leaving the room
 * @returns Indexes of the leaving users
 */
export function findPositionsForConnectionIds(users: { connectionId: string }[] = [], connectionIds: string[] = []) {
  return users
    .reduce<number[]>(
      (acc, { connectionId }, idx) => [...acc, connectionIds.some((cId) => connectionId === cId) ? idx : -1],
      []
    )
    .filter((idx) => idx >= 0);
}

/**
 * Leave room
 * @param roomId The id of the room the users are leaving from
 * @param connectionIds The connection ids of the leaving users
 * @returns The new room without leaving users
 */
export async function leaveRoom(roomId: string, connectionIds: string[]): Promise<OperationResult<Room>> {
  const result = await getRoom(roomId);
  if (!isSuccess(result)) {
    return { success: false, errors: result.errors };
  }

  const {
    result: { users },
  } = result;
  const idxs = findPositionsForConnectionIds(users, connectionIds);

  if (!idxs.length) return { success: true, result: result.result };

  try {
    const { Attributes: room } = await ddb.send(
      new UpdateCommand({
        TableName: process.env.MATCHES_TABLE,
        Key: { id: roomId },
        UpdateExpression: `REMOVE ${idxs.map((idx) => `users[${idx}]`).join(", ")}]`,
        ReturnValues: "ALL_NEW",
      })
    );
    return { success: true, result: room as Room };
  } catch (e) {
    return { success: false, errors: [Errors.LeaveRoomError] };
  }
}
