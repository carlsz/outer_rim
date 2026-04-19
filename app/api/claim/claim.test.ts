import { describe, it, expect } from "vitest";

// Sequential order validation logic (extracted for testing without Firestore)
function validateClaimOrder(
  stops: string[],
  claimedSpots: string[],
  spotId: string
): { ok: boolean; error?: string } {
  const expectedIndex = claimedSpots.length;
  const spotIndex = stops.indexOf(spotId);

  if (spotIndex === -1) return { ok: false, error: "Spot not in this hunt" };
  if (claimedSpots.includes(spotId)) return { ok: false, error: "Already claimed" };
  if (spotIndex !== expectedIndex) {
    return {
      ok: false,
      error: `Must claim stops in order — expected stop ${expectedIndex + 1} (${stops[expectedIndex]})`,
    };
  }
  return { ok: true };
}

const STOPS = ["stop-a", "stop-b", "stop-c", "stop-d"];

describe("claim sequential order validation", () => {
  it("allows claiming stop-a first with no prior claims", () => {
    expect(validateClaimOrder(STOPS, [], "stop-a").ok).toBe(true);
  });

  it("allows claiming stop-b after stop-a", () => {
    expect(validateClaimOrder(STOPS, ["stop-a"], "stop-b").ok).toBe(true);
  });

  it("rejects claiming stop-c before stop-b", () => {
    const result = validateClaimOrder(STOPS, ["stop-a"], "stop-c");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/order/);
  });

  it("rejects claiming stop-a again after already claimed", () => {
    const result = validateClaimOrder(STOPS, ["stop-a", "stop-b"], "stop-a");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Already claimed");
  });

  it("rejects claiming a stop not in the hunt", () => {
    const result = validateClaimOrder(STOPS, [], "stop-z");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Spot not in this hunt");
  });

  it("allows claiming the last stop", () => {
    expect(validateClaimOrder(STOPS, ["stop-a", "stop-b", "stop-c"], "stop-d").ok).toBe(true);
  });
});
