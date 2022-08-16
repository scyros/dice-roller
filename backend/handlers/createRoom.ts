import { createRoom } from "../db";
import { isValidUser } from "../db/schemas";
import { Error } from "../errors";
import { sendMessage } from "../messaging";
import { Action, AWSEvent, Handler, User } from '../types';
import { extractFromBody, isSuccess } from "../utils";

const handler: Handler<void> = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user", isValidUser);
  if (!user) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.CreateRoom,
        success: false,
        errors: [Error.InvalidUser],
      },
    });
    return;
  }

  const result = await createRoom({ connectionId, ...user });
  if (!isSuccess(result)) {
    result.errors.map(console.error);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.CreateRoom,
        success: false,
        errors: [Error.CreateRoomError],
      },
    });
    return;
  }

  const { result: room } = result;
  await sendMessage({
    event,
    connectionIds: [connectionId],
    data: {
      action: Action.CreateRoom,
      success: true,
      result: room,
    },
  });
};

export default handler;
