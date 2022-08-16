import { joinRoom } from "../db";
import { isValidRoom, isValidUser } from "../db/schemas";
import { Error } from "../errors";
import { sendMessage, sendMessageAndKickoutUnreachables } from "../messaging";
import { Action, AWSEvent, Handler, Room, User } from '../types';
import { extractFromBody, isSuccess } from "../utils";

const handler: Handler<void> = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user", isValidUser);
  const room = extractFromBody<Room>(body, "room", isValidRoom);

  if (!user || !room) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.JoinRoom,
        success: false,
        errors: [Error.InvalidUser, Error.InvalidRoom],
      },
    });
    return;
  }

  const result = await joinRoom(room.id, { connectionId, ...user });
  if (!isSuccess(result)) {
    result.errors.map(console.error);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.JoinRoom,
        success: false,
        errors: [Error.JoinRoomError],
      },
    });
    return;
  }

  const {
    result: { id: roomId, users },
  } = result;
  await sendMessageAndKickoutUnreachables({
    event,
    roomId,
    connectionIds: (users ?? []).map(({ connectionId }) => connectionId),
    message: { roomId, joiner: { connectionId, ...user }, users: users ?? [] },
    action: Action.JoinRoom,
    success: true,
  });
};

export default handler;
