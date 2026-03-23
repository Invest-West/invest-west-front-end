import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import ExploreOffers from "../shared-components/explore-offers/ExploreOffers";

const mockStore = configureStore([thunk]);

const baseState = {
  ExploreOffersLocalState: {
    offerInstances: [],
    fetchingOffers: false,
    offersFetched: false,
    groups: [],
    searchFilter: "",
    visibilityFilter: "all",
    sectorFilter: "all",
    phaseFilter: "Live",
    groupFilter: "all",
    currentPage: 1,
  },
  ManageGroupUrlState: { groupNameFromUrl: null, group: null },
  AuthenticationState: { currentUser: null },
  ManageSystemAttributesState: { systemAttributes: null },
  MediaQueryState: { isMobile: false },
};

function openGroupDropdown() {
  const store = mockStore(baseState);
  render(
    <Provider store={store}>
      <ExploreOffers />
    </Provider>
  );
  // MUI v4 Select: mouseDown on the select display element to open dropdown
  const selectDisplay = document.getElementById("mui-component-select-groupFilter")!;
  fireEvent.mouseDown(selectDisplay);
}

describe("ExploreOffers Group Dropdown", () => {
  it("includes Advantage Business Angels as an option", () => {
    openGroupDropdown();
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Advantage Business Angels")).toBeInTheDocument();
  });

  it("still includes Invest West and FinTech West", () => {
    openGroupDropdown();
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Invest West")).toBeInTheDocument();
    expect(within(listbox).getByText("FinTech West")).toBeInTheDocument();
  });
});
