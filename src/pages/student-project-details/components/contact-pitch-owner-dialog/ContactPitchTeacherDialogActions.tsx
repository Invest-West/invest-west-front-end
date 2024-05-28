import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import EmailRepository, {
    ClientEmailTypes,
    ContactPitchOwnerEmailData
} from "../../../../api/repositories/EmailRepository";
import Student from "../../../../models/student";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ContactPitchOwnerDialogEvents {
    ToggleContactDialog = "ContactPitchOwnerDialogEvents.ToggleContactDialog",
    SendingContactEmail = "ContactPitchOwnerDialogEvents.SendingContactEmail",
    CompleteSendingContactEmail = "ContactPitchOwnerDialogEvents.CompleteSendingContactEmail"
}

export interface ContactPitchOwnerDialogAction extends Action {

}

export interface ToggleContactDialogAction extends ContactPitchOwnerDialogAction {
    studentProjectName: string | null;
    studentProjectOwnerEmail: string | null;
}

export interface CompleteSendingContactEmailAction extends ContactPitchOwnerDialogAction {
    error?: string;
}

export const toggleContactPitchOwnerDialog: ActionCreator<any> = (studentProjectName?: string, studentProjectOwnerEmail?: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ToggleContactDialogAction = {
            type: ContactPitchOwnerDialogEvents.ToggleContactDialog,
            studentProjectName: studentProjectName ?? null,
            studentProjectOwnerEmail: studentProjectOwnerEmail ?? null
        };
        return dispatch(action);
    }
}

export const sendContactEmail: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            studentProjectName,
            studentProjectOwnerEmail,
            sendingContactEmail
        } = getState().ContactPitchOwnerDialogLocalState;

        if (sendingContactEmail) {
            return;
        }

        if (!studentProjectName || !studentProjectOwnerEmail) {
            return;
        }

        const {
            currentStudent
        } = getState().AuthenticationState;

        if (!currentStudent) {
            return;
        }

        dispatch({
            type: ContactPitchOwnerDialogEvents.SendingContactEmail
        });

        const completeAction: CompleteSendingContactEmailAction = {
            type: ContactPitchOwnerDialogEvents.CompleteSendingContactEmail
        };

        try {
            const emailInfo: ContactPitchOwnerEmailData = {
                receiver: studentProjectOwnerEmail,
                sender: currentStudent.email,
                userName: `${(currentStudent as Student).firstName} ${(currentStudent as Student).lastName}`,
                studentProjectName: studentProjectName
            };

            await new EmailRepository().sendEmail({
                emailType: ClientEmailTypes.ContactPitchOwner,
                emailInfo: emailInfo
            });

            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Success, "Email sent."));
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(completeAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
        }
    }
}