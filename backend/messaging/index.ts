import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

import { leaveRoom as leaveRoomDB } from "../db";
import { Action, AWSEvent, OperationResult, UnreachableUsers } from "../types";
import { isSuccess } from "../utils";

async function sendMsg(
  client: ApiGatewayManagementApiClient,
  connectionId: string,
  data: Uint8Array
): Promise<boolean> {
  try {
    await client.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: data,
      })
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function sendMsgs(
  client: ApiGatewayManagementApiClient,
  connectionIds: string[],
  data: Uint8Array
): Promise<string[]> {
  const results = await Promise.all(connectionIds.map((connectionId) => sendMsg(client, connectionId, data)));
  const badIdxs = results.map((ok, idx) => (ok ? -1 : idx)).filter((idx) => idx >= 0);
  const bads = badIdxs.map((idx) => connectionIds[idx]);

  return bads;
}

/**
 * Deliver a message to connectionIds.
 * @param config
 * @returns An array containing the connectionIds that failed to deliver the message.
 */
export async function sendMessage<MessageType = string>({
  event,
  connectionIds,
  data,
}: {
  event: AWSEvent;
  connectionIds: string[];
  data: OperationResult<MessageType>;
}): Promise<string[]> {
  const {
    requestContext: { domainName, stage },
  } = event;
  const client = new ApiGatewayManagementApiClient({
    region: process.env.AWS_REGION,
    endpoint: `${domainName}/${stage}`,
  });
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));

  return sendMsgs(client, connectionIds, encodedData);
}

async function leaveRoom({
  event,
  roomId,
  connectionIds,
}: {
  event: AWSEvent;
  roomId: string;
  connectionIds: string[];
}): Promise<string[]> {
  const result = await leaveRoomDB(roomId, connectionIds);
  if (!isSuccess(result)) {
    result.errors.map(console.error);
    return [];
  }

  const { result: room } = result;
  return sendMessage({
    event,
    connectionIds,
    data: {
      action: Action.LeaveRoom,
      success: true,
      result: room,
    },
  });
}

async function kickOutUnreachableConnIds({
  event,
  roomId,
  connectionIds,
}: {
  event: AWSEvent;
  roomId: string;
  connectionIds: string[];
}): Promise<void> {
  let connIds = connectionIds.slice();
  while (connIds.length > 0) {
    connIds = await leaveRoom({ event, roomId, connectionIds: connIds });
  }
}

export async function sendMessageAndKickoutUnreachables<T>({
  event,
  roomId,
  connectionIds,
  message,
  success,
  action,
}: UnreachableUsers & {
  message: T;
  success: true;
  action: Action;
}): Promise<void> {
  const connIdsToRemove = await sendMessage<T>({
    event,
    connectionIds,
    data: {
      action,
      success,
      result: message,
    },
  });
  await kickOutUnreachableConnIds({ event, roomId, connectionIds: connIdsToRemove });
}
