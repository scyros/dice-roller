import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";

import { createRoom } from "../db";
import { sendMessage } from "../messaging";
import { buildUserFromBody } from "../utils";
import {OperationAction} from '../types';

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = buildUserFromBody(body);
  if (!user) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: OperationAction.CREATE_ROOM,
        success: false,
        error: "invalid user",
      },
    });
    return;
  }

  const { error, result, success } = await createRoom({
    connectionId,
    ...user,
  });
  if (!success) {
    console.error(error);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: OperationAction.CREATE_ROOM,
        success,
        error: "impossible to create room",
      },
    });
    return;
  }

  await sendMessage({
    event,
    connectionIds: [connectionId],
    data: {
      action: OperationAction.CREATE_ROOM,
      success,
      result,
    },
  });
};

export default handler;
