import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

import { getRoom } from "../db";
import { doRoll } from "../dice";
import { kickOutUnreachableConnIds, sendMessage } from "../messaging";
import {
  buildRollsFromBody,
  buildRoomFromBody,
  buildUserFromBody,
} from "../utils";

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = buildUserFromBody(body);
  const room = buildRoomFromBody(body);
  const rolls = buildRollsFromBody(body);
  if (!user || !room || !rolls) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: "ROLL",
        success: false,
        error: "invalid user, room or rolls",
      },
    });
    return;
  }

  const { success, result: dbRoom } = await getRoom(room.id);
  if (!success) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: "ROLL",
        success: false,
        error: "no room",
      },
    });
    return;
  }

  const rollResults = rolls.map(doRoll);
  const connsToRemove = await sendMessage({
    event,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    connectionIds: dbRoom!.users.map(({ connectionId }) => connectionId),
    data: {
      action: "ROLL",
      success: true,
      result: { roller: { id: connectionId, ...user }, ...rollResults },
    },
  });

  await kickOutUnreachableConnIds({
    event,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    roomId: dbRoom!.id,
    connectionIds: connsToRemove,
  });
};

export default handler;
