import { getRoom } from "../db";
import { doRoll } from "../dice";
import { sendMessage, sendMessageAndKickoutUnreachables } from "../messaging";
import { extractFromBody, isSuccess } from "../utils";
import { Actions, AWSEvent, Roll, Room, User } from "../types";
import { Errors } from "../errors";

export const handler = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user");
  const room = extractFromBody<Room>(body, "room");
  const rolls = extractFromBody<Roll[]>(body, "rolls");
  if (!user || !room || !rolls) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Actions.Roll,
        success: false,
        errors: [Errors.InvalidUser, Errors.InvalidRoom, Errors.InvalidRoll],
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
        action: Actions.Roll,
        success: false,
        errors: [Errors.NoRoom],
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
    action: Actions.Roll,
    success: true,
  });
};

export default handler;
