import {ProjectRejectFeedback} from "../../../../models/project";
import {
    ProjectFeedbackAction,
    ProjectFeedbackEvents,
    FetchFeedbacksCompleteAction,
    ResubmitProjectCompleteAction,
    ToggleFeedbackPanelAction,
    MarkFeedbackAddressedAction
} from "./ProjectFeedbackActions";

/**
 * Project Feedback State
 */
export interface ProjectFeedbackState {
    // Feedback data
    feedbacks: ProjectRejectFeedback[];

    // Loading states
    isLoading: boolean;
    isLoaded: boolean;
    isResubmitting: boolean;

    // UI states
    isPanelExpanded: boolean;
    isResubmitDialogOpen: boolean;

    // Addressed feedbacks (for resubmit form)
    addressedFeedbackIds: string[];

    // Errors (stored as strings for serialization)
    fetchError?: string;
    resubmitError?: string;
}

/**
 * Initial state
 */
export const initialState: ProjectFeedbackState = {
    feedbacks: [],
    isLoading: false,
    isLoaded: false,
    isResubmitting: false,
    isPanelExpanded: false,
    isResubmitDialogOpen: false,
    addressedFeedbackIds: []
};

/**
 * Selector: Check if loading feedbacks
 */
export const isLoadingFeedbacks = (state: ProjectFeedbackState): boolean =>
    state.isLoading;

/**
 * Selector: Check if has feedbacks
 */
export const hasFeedbacks = (state: ProjectFeedbackState): boolean =>
    state.feedbacks.length > 0;

/**
 * Selector: Get pending feedbacks
 */
export const getPendingFeedbacks = (state: ProjectFeedbackState): ProjectRejectFeedback[] =>
    state.feedbacks.filter(f => f.status === 'pending');

/**
 * Selector: Get addressed feedbacks
 */
export const getAddressedFeedbacks = (state: ProjectFeedbackState): ProjectRejectFeedback[] =>
    state.feedbacks.filter(f => f.status === 'addressed');

/**
 * Selector: Get resolved feedbacks
 */
export const getResolvedFeedbacks = (state: ProjectFeedbackState): ProjectRejectFeedback[] =>
    state.feedbacks.filter(f => f.status === 'resolved');

/**
 * Selector: Get pending feedback count
 */
export const getPendingFeedbackCount = (state: ProjectFeedbackState): number =>
    getPendingFeedbacks(state).length;

/**
 * Project Feedback Reducer
 */
const projectFeedbackReducer = (state = initialState, action: ProjectFeedbackAction): ProjectFeedbackState => {
    switch (action.type) {
        case ProjectFeedbackEvents.FetchingFeedbacks:
            return {
                ...state,
                isLoading: true,
                fetchError: undefined
            };

        case ProjectFeedbackEvents.FetchFeedbacksComplete:
            const fetchComplete = action as FetchFeedbacksCompleteAction;
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                feedbacks: fetchComplete.feedbacks
                    ? JSON.parse(JSON.stringify(fetchComplete.feedbacks))
                    : [],
                fetchError: fetchComplete.error
            };

        case ProjectFeedbackEvents.ResubmittingProject:
            return {
                ...state,
                isResubmitting: true,
                resubmitError: undefined
            };

        case ProjectFeedbackEvents.ResubmitProjectComplete:
            const resubmitComplete = action as ResubmitProjectCompleteAction;
            if (resubmitComplete.error) {
                return {
                    ...state,
                    isResubmitting: false,
                    resubmitError: resubmitComplete.error
                };
            }
            // Success: close dialog and clear addressed IDs
            return {
                ...state,
                isResubmitting: false,
                isResubmitDialogOpen: false,
                addressedFeedbackIds: [],
                resubmitError: undefined
            };

        case ProjectFeedbackEvents.ToggleFeedbackPanel:
            const toggleAction = action as ToggleFeedbackPanelAction;
            return {
                ...state,
                isPanelExpanded: toggleAction.expanded !== undefined
                    ? toggleAction.expanded
                    : !state.isPanelExpanded
            };

        case ProjectFeedbackEvents.ToggleResubmitDialog:
            return {
                ...state,
                isResubmitDialogOpen: !state.isResubmitDialogOpen,
                // Clear addressed feedbacks when closing dialog
                addressedFeedbackIds: state.isResubmitDialogOpen ? [] : state.addressedFeedbackIds
            };

        case ProjectFeedbackEvents.MarkFeedbackAddressed:
            const markAction = action as MarkFeedbackAddressedAction;
            const currentIds = state.addressedFeedbackIds;
            let newIds: string[];
            if (markAction.addressed) {
                // Add if not already present
                newIds = currentIds.includes(markAction.feedbackId)
                    ? currentIds
                    : [...currentIds, markAction.feedbackId];
            } else {
                // Remove
                newIds = currentIds.filter(id => id !== markAction.feedbackId);
            }
            return {
                ...state,
                addressedFeedbackIds: newIds
            };

        case ProjectFeedbackEvents.ClearFeedbackState:
            return initialState;

        default:
            return state;
    }
};

export default projectFeedbackReducer;
