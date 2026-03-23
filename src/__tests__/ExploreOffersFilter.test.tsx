import {
  FetchProjectsPhaseOptions,
} from "../api/repositories/OfferRepository";
import {
  initialState,
} from "../shared-components/explore-offers/ExploreOffersReducer";

describe("ExploreOffers initial state", () => {
  it("defaults phaseFilter to Live", () => {
    expect(initialState.phaseFilter).toBe(FetchProjectsPhaseOptions.Live);
  });

  it("defaults groupFilter to all", () => {
    expect(initialState.groupFilter).toBe("all");
  });

  it("has Live as a string enum value", () => {
    expect(FetchProjectsPhaseOptions.Live).toBe("Live");
  });
});
