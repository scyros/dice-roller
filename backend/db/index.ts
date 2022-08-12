import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { OperationResult, Room, User } from "../types";

const ddb = new DynamoDBClient({ region: process.env.AWS_REGION });
const dbbDoc = DynamoDBDocumentClient.from(ddb);

export async function createRoom(
  user: User & { connectionId: string }
): Promise<OperationResult<Room>> {
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
    let error = `${e}`;
    if (e instanceof ConditionalCheckFailedException) {
      error = "room already created";
    }
    return { success: false, error };
  }
}

export async function joinRoom(
  roomId: string,
  user: User & { connectionId: string }
): Promise<OperationResult<Room>> {
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
    return { success: false, error: `${e}` };
  }
}

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
    return { success: false, error: `${e}` };
  }
}

export function findPositionsForConnectionIds(
  users: { connectionId: string }[],
  connectionIds: string[]
) {
  return users
    .reduce<number[]>(
      (acc, { connectionId }, idx) => [
        ...acc,
        connectionIds.some((cId) => connectionId === cId) ? idx : -1,
      ],
      []
    )
    .filter((idx) => idx >= 0);
}

export async function leaveRoom(
  roomId: string,
  connectionIds: string[]
): Promise<OperationResult<Room>> {
  const {
    error: getRoomError,
    result: getRoomResult,
    success: getRoomSuccess,
  } = await getRoom(roomId);
  if (!getRoomSuccess) return { success: false, error: getRoomError };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { users } = getRoomResult!;
  const idxs = findPositionsForConnectionIds(users, connectionIds);

  if (!idxs.length) return { success: true, result: getRoomResult };

  try {
    const { Attributes: room } = await ddb.send(
      new UpdateCommand({
        TableName: process.env.MATCHES_TABLE,
        Key: { id: roomId },
        UpdateExpression: `REMOVE ${idxs
          .map((idx) => `users[${idx}]`)
          .join(", ")}]`,
        ReturnValues: "ALL_NEW",
      })
    );
    return { success: true, result: room as Room };
  } catch (e) {
    return { success: false, error: `${e}` };
  }
}
