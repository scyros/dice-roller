import { joinRoom } from "../db";
import { isValidRoom, isValidUser } from "../db/schemas";
import { Errors } from "../errors";
import { sendMessage, sendMessageAndKickoutUnreachables } from "../messaging";
import { Actions, AWSEvent, Room, User } from "../types";
import { extractFromBody, isSuccess } from "../utils";

export const handler = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user");
  const room = extractFromBody<Room>(body, "room");
  if (!isValidUser(user) || !isValidRoom(room)) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Actions.JoinRoom,
        success: false,
        errors: [Errors.InvalidUser, Errors.InvalidRoom],
      },
    });
    return;
  }

  const result = await joinRoom(room.id, { connectionId, ...user });
  if (!isSuccess(result)) {
    result.errors?.map(console.error);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Actions.JoinRoom,
        success: false,
        errors: [Errors.JoinRoomError],
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
    action: Actions.JoinRoom,
    success: true,
  });
};

export default handler;
