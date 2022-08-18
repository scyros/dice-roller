import handler from "../handlers/authorize";

describe("Authorize handler", () => {
  it("should authorize", async () => {
    const { isAuthorized } = await handler({}, {});
    expect(isAuthorized).toBeTruthy();
  });
});
