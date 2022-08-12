import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

import { joinRoom } from "../db";
import { kickOutUnreachableConnIds, sendMessage } from "../messaging";
import { User } from "../types";
import { buildRoomFromBody, buildUserFromBody } from "../utils";

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = buildUserFromBody(body);
  const room = buildRoomFromBody(body);
  if (!user || !room) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: "JOIN_ROOM",
        success: false,
        error: "invalid user or room",
      },
    });
    return;
  }

  const {
    error: joinError,
    result: joinResult,
    success: joinSuccess,
  } = await joinRoom(room.id, {
    connectionId,
    ...user,
  });
  if (!joinSuccess) {
    console.error(joinError);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: "JOIN_ROOM",
        success: false,
        error: "impossible to join",
      },
    });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { id: roomId, users } = joinResult!;
  const connsToRemove = await sendMessage<{
    roomId: string;
    joiner: User & { connectionId: string };
    users: (User & { connectionId: string })[];
  }>({
    event,
    connectionIds: users.map(({ connectionId }) => connectionId),
    data: {
      action: "JOIN_ROOM",
      success: true,
      result: {
        roomId,
        joiner: { connectionId, ...user },
        users,
      },
    },
  });

  await kickOutUnreachableConnIds({
    event,
    roomId,
    connectionIds: connsToRemove,
  });
};

export default handler;
