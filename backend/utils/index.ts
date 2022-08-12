import { isValidRoom, isValidUser } from "../db/schemas";
import { buildRoll, isValidRoll } from "../dice";
import { Roll, Room, User } from "../types";

export function buildUserFromBody(body = ""): User | null {
  try {
    const { user } = JSON.parse(body) as { user: unknown };
    if (isValidUser(user)) return user;
    return null;
  } catch (e) {
    return null;
  }
}

export function buildRoomFromBody(body = ""): Room | null {
  try {
    const { room } = JSON.parse(body) as { room: unknown };
    if (isValidRoom(room)) return { users: [], ...room };
    return null;
  } catch (e) {
    return null;
  }
}

export function buildRollsFromBody(body = ""): Roll[] | null {
  try {
    const { rolls } = JSON.parse(body) as { rolls: unknown };
    if (!Array.isArray(rolls)) return null;
    if (!rolls.every(isValidRoll)) return null;

    return rolls.map(buildRoll);
  } catch (e) {
    return null;
  }
}

export function removeItemFromCollection<T>(collection: T[], item: T): T[] {
  const idx = collection.findIndex((i) => i === item);
  const copy = collection.slice();
  if (idx !== -1) copy.splice(idx, 1);
  return copy;
}
