import { createRoom } from "../db";
import { isValidUser } from "../db/schemas";
import { Errors } from "../errors";
import { sendMessage } from "../messaging";
import { Actions, AWSEvent, User } from "../types";
import { extractFromBody, isSuccess } from "../utils";

const handler = async (event: AWSEvent) => {
  const {
    body,
    requestContext: { connectionId },
  } = event;

  const user = extractFromBody<User>(body, "user");
  if (!isValidUser(user)) {
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Actions.CreateRoom,
        success: false,
        errors: [Errors.InvalidUser],
      },
    });
    return;
  }

  const result = await createRoom({ connectionId, ...user });
  if (!isSuccess(result)) {
    result.errors?.map(console.error);
    await sendMessage({
      event,
      connectionIds: [connectionId],
      data: {
        action: Actions.CreateRoom,
        success: false,
        errors: [Errors.CreateRoomError],
      },
    });
    return;
  }

  const { result: room } = result;
  await sendMessage({
    event,
    connectionIds: [connectionId],
    data: {
      action: Actions.CreateRoom,
      success: true,
      result: room,
    },
  });
};

export default handler;
