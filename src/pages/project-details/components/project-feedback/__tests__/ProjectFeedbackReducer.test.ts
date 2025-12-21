/**
 * Tests for ProjectFeedbackReducer
 */

import projectFeedbackReducer, {
    ProjectFeedbackState,
    initialState,
    getPendingFeedbacks,
    getAddressedFeedbacks,
    getResolvedFeedbacks,
    getPendingFeedbackCount,
    hasFeedbacks
} from "../ProjectFeedbackReducer";
import {ProjectFeedbackEvents} from "../ProjectFeedbackActions";
import {
    mockFeedbacks,
    mockPendingFeedback,
    mockAddressedFeedback,
    mockResolvedFeedback,
    mockAllPendingFeedbacks
} from "../../../../../test-utils/fixtures";

describe("ProjectFeedbackReducer", () => {
    describe("initial state", () => {
        it("should return the initial state", () => {
            const state = projectFeedbackReducer(undefined, {type: "UNKNOWN"});
            expect(state).toEqual(initialState);
        });

        it("should have correct initial values", () => {
            expect(initialState.feedbacks).toEqual([]);
            expect(initialState.isLoading).toBe(false);
            expect(initialState.isLoaded).toBe(false);
            expect(initialState.isResubmitting).toBe(false);
            expect(initialState.isPanelExpanded).toBe(false);
            expect(initialState.isResubmitDialogOpen).toBe(false);
            expect(initialState.addressedFeedbackIds).toEqual([]);
        });
    });

    describe("FetchingFeedbacks", () => {
        it("should set isLoading to true", () => {
            const action = {type: ProjectFeedbackEvents.FetchingFeedbacks};
            const state = projectFeedbackReducer(initialState, action);

            expect(state.isLoading).toBe(true);
            expect(state.isLoaded).toBe(false);
            expect(state.fetchError).toBeUndefined();
        });
    });

    describe("FetchFeedbacksComplete", () => {
        it("should set feedbacks and mark as loaded on success", () => {
            const action = {
                type: ProjectFeedbackEvents.FetchFeedbacksComplete,
                feedbacks: mockFeedbacks
            };
            const state = projectFeedbackReducer(
                {...initialState, isLoading: true},
                action
            );

            expect(state.feedbacks).toEqual(mockFeedbacks);
            expect(state.isLoading).toBe(false);
            expect(state.isLoaded).toBe(true);
            expect(state.fetchError).toBeUndefined();
        });

        it("should set error on failure", () => {
            const error = "Network error";
            const action = {
                type: ProjectFeedbackEvents.FetchFeedbacksComplete,
                error
            };
            const state = projectFeedbackReducer(
                {...initialState, isLoading: true},
                action
            );

            expect(state.feedbacks).toEqual([]);
            expect(state.isLoading).toBe(false);
            expect(state.isLoaded).toBe(true);
            expect(state.fetchError).toBe(error);
        });
    });

    describe("ToggleFeedbackPanel", () => {
        it("should toggle panel expanded state", () => {
            const action = {type: ProjectFeedbackEvents.ToggleFeedbackPanel};

            let state = projectFeedbackReducer(initialState, action);
            expect(state.isPanelExpanded).toBe(true);

            state = projectFeedbackReducer(state, action);
            expect(state.isPanelExpanded).toBe(false);
        });

        it("should set specific expanded state when provided", () => {
            const action = {
                type: ProjectFeedbackEvents.ToggleFeedbackPanel,
                expanded: true
            };
            const state = projectFeedbackReducer(initialState, action);
            expect(state.isPanelExpanded).toBe(true);
        });
    });

    describe("ToggleResubmitDialog", () => {
        it("should toggle dialog open state", () => {
            const action = {type: ProjectFeedbackEvents.ToggleResubmitDialog};

            let state = projectFeedbackReducer(initialState, action);
            expect(state.isResubmitDialogOpen).toBe(true);

            state = projectFeedbackReducer(state, action);
            expect(state.isResubmitDialogOpen).toBe(false);
        });

        it("should reset addressedFeedbackIds when closing dialog", () => {
            const stateWithAddressed: ProjectFeedbackState = {
                ...initialState,
                isResubmitDialogOpen: true,
                addressedFeedbackIds: ["feedback-1", "feedback-2"]
            };
            const action = {type: ProjectFeedbackEvents.ToggleResubmitDialog};
            const state = projectFeedbackReducer(stateWithAddressed, action);

            expect(state.isResubmitDialogOpen).toBe(false);
            expect(state.addressedFeedbackIds).toEqual([]);
        });
    });

    describe("MarkFeedbackAddressed", () => {
        it("should add feedback ID when marking as addressed", () => {
            const action = {
                type: ProjectFeedbackEvents.MarkFeedbackAddressed,
                feedbackId: "feedback-1",
                addressed: true
            };
            const state = projectFeedbackReducer(initialState, action);

            expect(state.addressedFeedbackIds).toContain("feedback-1");
        });

        it("should remove feedback ID when unmarking", () => {
            const stateWithAddressed: ProjectFeedbackState = {
                ...initialState,
                addressedFeedbackIds: ["feedback-1", "feedback-2"]
            };
            const action = {
                type: ProjectFeedbackEvents.MarkFeedbackAddressed,
                feedbackId: "feedback-1",
                addressed: false
            };
            const state = projectFeedbackReducer(stateWithAddressed, action);

            expect(state.addressedFeedbackIds).not.toContain("feedback-1");
            expect(state.addressedFeedbackIds).toContain("feedback-2");
        });

        it("should not duplicate feedback IDs", () => {
            const stateWithAddressed: ProjectFeedbackState = {
                ...initialState,
                addressedFeedbackIds: ["feedback-1"]
            };
            const action = {
                type: ProjectFeedbackEvents.MarkFeedbackAddressed,
                feedbackId: "feedback-1",
                addressed: true
            };
            const state = projectFeedbackReducer(stateWithAddressed, action);

            expect(state.addressedFeedbackIds.filter(id => id === "feedback-1").length).toBe(1);
        });
    });

    describe("ResubmittingProject", () => {
        it("should set isResubmitting to true", () => {
            const action = {type: ProjectFeedbackEvents.ResubmittingProject};
            const state = projectFeedbackReducer(initialState, action);

            expect(state.isResubmitting).toBe(true);
            expect(state.resubmitError).toBeUndefined();
        });
    });

    describe("ResubmitProjectComplete", () => {
        it("should reset state on success", () => {
            const stateBeforeSubmit: ProjectFeedbackState = {
                ...initialState,
                isResubmitting: true,
                isResubmitDialogOpen: true,
                addressedFeedbackIds: ["feedback-1"]
            };
            const action = {type: ProjectFeedbackEvents.ResubmitProjectComplete};
            const state = projectFeedbackReducer(stateBeforeSubmit, action);

            expect(state.isResubmitting).toBe(false);
            expect(state.isResubmitDialogOpen).toBe(false);
            expect(state.addressedFeedbackIds).toEqual([]);
        });

        it("should set error on failure", () => {
            const error = "Resubmit failed";
            const action = {
                type: ProjectFeedbackEvents.ResubmitProjectComplete,
                error
            };
            const state = projectFeedbackReducer(
                {...initialState, isResubmitting: true},
                action
            );

            expect(state.isResubmitting).toBe(false);
            expect(state.resubmitError).toBe(error);
        });
    });

    describe("ClearFeedbackState", () => {
        it("should reset to initial state", () => {
            const dirtyState: ProjectFeedbackState = {
                feedbacks: mockFeedbacks,
                isLoading: false,
                isLoaded: true,
                isResubmitting: false,
                isPanelExpanded: true,
                isResubmitDialogOpen: false,
                addressedFeedbackIds: ["feedback-1"],
                fetchError: undefined,
                resubmitError: undefined
            };
            const action = {type: ProjectFeedbackEvents.ClearFeedbackState};
            const state = projectFeedbackReducer(dirtyState, action);

            expect(state).toEqual(initialState);
        });
    });
});

describe("Selectors", () => {
    const stateWithMixedFeedbacks: ProjectFeedbackState = {
        ...initialState,
        feedbacks: mockFeedbacks,
        isLoaded: true
    };

    describe("getPendingFeedbacks", () => {
        it("should return only pending feedbacks", () => {
            const pending = getPendingFeedbacks(stateWithMixedFeedbacks);
            expect(pending).toHaveLength(1);
            expect(pending[0]).toEqual(mockPendingFeedback);
        });

        it("should return empty array when no pending feedbacks", () => {
            const stateWithNoFeedbacks: ProjectFeedbackState = {
                ...initialState,
                feedbacks: [mockAddressedFeedback, mockResolvedFeedback]
            };
            const pending = getPendingFeedbacks(stateWithNoFeedbacks);
            expect(pending).toHaveLength(0);
        });
    });

    describe("getAddressedFeedbacks", () => {
        it("should return only addressed feedbacks", () => {
            const addressed = getAddressedFeedbacks(stateWithMixedFeedbacks);
            expect(addressed).toHaveLength(1);
            expect(addressed[0]).toEqual(mockAddressedFeedback);
        });
    });

    describe("getResolvedFeedbacks", () => {
        it("should return only resolved feedbacks", () => {
            const resolved = getResolvedFeedbacks(stateWithMixedFeedbacks);
            expect(resolved).toHaveLength(1);
            expect(resolved[0]).toEqual(mockResolvedFeedback);
        });
    });

    describe("getPendingFeedbackCount", () => {
        it("should return correct count of pending feedbacks", () => {
            const count = getPendingFeedbackCount(stateWithMixedFeedbacks);
            expect(count).toBe(1);
        });

        it("should return 0 when no feedbacks", () => {
            const count = getPendingFeedbackCount(initialState);
            expect(count).toBe(0);
        });

        it("should return correct count with multiple pending", () => {
            const stateWithMultiplePending: ProjectFeedbackState = {
                ...initialState,
                feedbacks: mockAllPendingFeedbacks
            };
            const count = getPendingFeedbackCount(stateWithMultiplePending);
            expect(count).toBe(2);
        });
    });

    describe("hasFeedbacks", () => {
        it("should return true when feedbacks exist", () => {
            expect(hasFeedbacks(stateWithMixedFeedbacks)).toBe(true);
        });

        it("should return false when no feedbacks", () => {
            expect(hasFeedbacks(initialState)).toBe(false);
        });
    });
});
