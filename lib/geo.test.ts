import { describe, it, expect } from "vitest";
import { haversineDistance } from "./geo";

// SLO: ~35.2828° N, 120.6596° W
const SLO_LAT = 35.2828;
const SLO_LNG = -120.6596;

describe("haversineDistance", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineDistance(SLO_LAT, SLO_LNG, SLO_LAT, SLO_LNG)).toBe(0);
  });

  it("returns < 50m for 49m offset", () => {
    // ~49m north offset at SLO latitude
    const latOffset = 49 / 111320;
    const dist = haversineDistance(SLO_LAT, SLO_LNG, SLO_LAT + latOffset, SLO_LNG);
    expect(dist).toBeLessThan(50);
  });

  it("returns > 50m for 51m offset", () => {
    const latOffset = 51 / 111320;
    const dist = haversineDistance(SLO_LAT, SLO_LNG, SLO_LAT + latOffset, SLO_LNG);
    expect(dist).toBeGreaterThan(50);
  });

  it("returns reasonable distance between two SLO taco stops", () => {
    // roughly 500m apart
    const dist = haversineDistance(35.2804, -120.6622, 35.2850, -120.6640);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(700);
  });
});
