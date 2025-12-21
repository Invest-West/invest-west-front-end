import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import {ProjectRejectFeedback} from "../../../../models/project";
import ProjectFeedbackRepository, {ResubmitProjectOptions} from "../../../../api/repositories/ProjectFeedbackRepository";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

/**
 * Project Feedback Events
 */
export enum ProjectFeedbackEvents {
    // Fetch feedbacks
    FetchingFeedbacks = "ProjectFeedbackEvents.FetchingFeedbacks",
    FetchFeedbacksComplete = "ProjectFeedbackEvents.FetchFeedbacksComplete",

    // Resubmit project
    ResubmittingProject = "ProjectFeedbackEvents.ResubmittingProject",
    ResubmitProjectComplete = "ProjectFeedbackEvents.ResubmitProjectComplete",

    // Toggle panel
    ToggleFeedbackPanel = "ProjectFeedbackEvents.ToggleFeedbackPanel",

    // Toggle dialog
    ToggleResubmitDialog = "ProjectFeedbackEvents.ToggleResubmitDialog",

    // Clear state
    ClearFeedbackState = "ProjectFeedbackEvents.ClearFeedbackState",

    // Mark feedback as addressed (local state)
    MarkFeedbackAddressed = "ProjectFeedbackEvents.MarkFeedbackAddressed"
}

/**
 * Base action interface
 */
export interface ProjectFeedbackAction extends Action {
}

/**
 * Fetch feedbacks complete action
 */
export interface FetchFeedbacksCompleteAction extends ProjectFeedbackAction {
    feedbacks: ProjectRejectFeedback[];
    error?: string;
}

/**
 * Resubmit project complete action
 */
export interface ResubmitProjectCompleteAction extends ProjectFeedbackAction {
    error?: string;
}

/**
 * Toggle feedback panel action
 */
export interface ToggleFeedbackPanelAction extends ProjectFeedbackAction {
    expanded?: boolean;
}

/**
 * Mark feedback addressed action
 */
export interface MarkFeedbackAddressedAction extends ProjectFeedbackAction {
    feedbackId: string;
    addressed: boolean;
}

/**
 * Fetch feedbacks for a project
 */
export const fetchProjectFeedbacks: ActionCreator<any> = (projectID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState().ProjectFeedbackLocalState;

        if (state.isLoading) {
            return;
        }

        dispatch({type: ProjectFeedbackEvents.FetchingFeedbacks});

        const completeAction: FetchFeedbacksCompleteAction = {
            type: ProjectFeedbackEvents.FetchFeedbacksComplete,
            feedbacks: []
        };

        try {
            const feedbacks = await new ProjectFeedbackRepository().fetchFeedbacks(projectID);
            completeAction.feedbacks = feedbacks;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = String(error);
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, "Failed to load feedback."));
        }
    };
};

/**
 * Resubmit project for approval
 */
export const resubmitProject: ActionCreator<any> = (options: ResubmitProjectOptions) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const state = getState().ProjectFeedbackLocalState;

        if (state.isResubmitting) {
            return;
        }

        dispatch({type: ProjectFeedbackEvents.ResubmittingProject});

        const completeAction: ResubmitProjectCompleteAction = {
            type: ProjectFeedbackEvents.ResubmitProjectComplete
        };

        try {
            await new ProjectFeedbackRepository().resubmitProject(options);
            dispatch(completeAction);
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Success, "Project resubmitted for approval."));
            // Close the dialog
            return dispatch({type: ProjectFeedbackEvents.ToggleResubmitDialog});
        } catch (error) {
            completeAction.error = String(error);
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, "Failed to resubmit project."));
        }
    };
};

/**
 * Toggle feedback panel expansion
 */
export const toggleFeedbackPanel: ActionCreator<any> = (expanded?: boolean) => {
    return (dispatch: Dispatch) => {
        const action: ToggleFeedbackPanelAction = {
            type: ProjectFeedbackEvents.ToggleFeedbackPanel,
            expanded: expanded
        };
        return dispatch(action);
    };
};

/**
 * Toggle resubmit confirmation dialog
 */
export const toggleResubmitDialog: ActionCreator<any> = () => {
    return (dispatch: Dispatch) => {
        return dispatch({type: ProjectFeedbackEvents.ToggleResubmitDialog});
    };
};

/**
 * Mark a feedback as addressed (local state for resubmit form)
 */
export const markFeedbackAddressed: ActionCreator<any> = (feedbackId: string, addressed: boolean) => {
    return (dispatch: Dispatch) => {
        const action: MarkFeedbackAddressedAction = {
            type: ProjectFeedbackEvents.MarkFeedbackAddressed,
            feedbackId,
            addressed
        };
        return dispatch(action);
    };
};

/**
 * Clear feedback state (for component unmount)
 */
export const clearFeedbackState: ActionCreator<any> = () => {
    return (dispatch: Dispatch) => {
        return dispatch({type: ProjectFeedbackEvents.ClearFeedbackState});
    };
};
