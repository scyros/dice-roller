import { getRoom } from "../db";
import { doRoll } from '../dice';
import { sendMessage, sendMessageAndKickoutUnreachables } from "../messaging";
import { extractFromBody, isSuccess } from "../utils";
import { Action, AWSEvent, Handler, Roll, Room, User } from '../types';
import { Error } from "../errors";
import { isValidArrayOf, isValidRoll, isValidRoom, isValidUser } from '../db/schemas';

const handler: Handler<void> = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user", isValidUser);
  const room = extractFromBody<Room>(body, "room", isValidRoom);
  const rolls = extractFromBody<Roll[]>(body, "rolls", isValidArrayOf(isValidRoll));
  if (!user || !room || !rolls) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.Roll,
        success: false,
        errors: [Error.InvalidUser, Error.InvalidRoom, Error.InvalidRoll],
      },
    });
    return;
  }

  const result = await getRoom(room.id);
  if (!isSuccess(result)) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Action.Roll,
        success: false,
        errors: [Error.NoRoom],
      },
    });
    return;
  }

  const {
    result: { id: roomId, users },
  } = result;
  const rollResults = rolls.map(doRoll);
  await sendMessageAndKickoutUnreachables({
    event,
    roomId: roomId,
    connectionIds: (users ?? []).map(({ connectionId }) => connectionId),
    message: { roller: { connectionId, ...user }, ...rollResults },
    action: Action.Roll,
    success: true,
  });
};

export default handler;
