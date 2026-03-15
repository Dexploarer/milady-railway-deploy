import { describe, expect, it } from "vitest";
import { resolveAutoEmoteId } from "./emotes.ts";

describe("resolveAutoEmoteId", () => {
  it("does not auto-trigger when the agent already requested PLAY_EMOTE", () => {
    expect(
      resolveAutoEmoteId("can you do a dance", ["REPLY", "PLAY_EMOTE"]),
    ).toBe(false);
  });

  it("falls back to chat heuristics when no PLAY_EMOTE action was chosen", () => {
    expect(resolveAutoEmoteId("can you do a dance", ["REPLY"])).toBe(
      "dance-happy",
    );
  });

  it("returns false when neither actions nor chat imply an emote", () => {
    expect(resolveAutoEmoteId("what's your favorite color?", ["REPLY"])).toBe(
      false,
    );
  });
});
