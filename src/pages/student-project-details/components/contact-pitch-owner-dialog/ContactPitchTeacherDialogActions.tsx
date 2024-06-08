import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import StudentEmailRepository, {
    ClientEmailTypes,
    ContactPitchTeacherEmailData
} from "../../../../api/repositories/StudentEmailRepository";
import Student from "../../../../models/student";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ContactPitchTeacherDialogEvents {
    ToggleContactDialog = "ContactPitchTeacherDialogEvents.ToggleContactDialog",
    SendingContactEmail = "ContactPitchTeacherDialogEvents.SendingContactEmail",
    CompleteSendingContactEmail = "ContactPitchTeacherDialogEvents.CompleteSendingContactEmail"
}

export interface ContactPitchTeacherDialogAction extends Action {

}

export interface ToggleContactDialogAction extends ContactPitchTeacherDialogAction {
    studentProjectName: string | null;
    studentProjectTeacherEmail: string | null;
}

export interface CompleteSendingContactEmailAction extends ContactPitchTeacherDialogAction {
    error?: string;
}

export const toggleContactPitchTeacherDialog: ActionCreator<any> = (studentProjectName?: string, studentProjectTeacherEmail?: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ToggleContactDialogAction = {
            type: ContactPitchTeacherDialogEvents.ToggleContactDialog,
            studentProjectName: studentProjectName ?? null,
            studentProjectTeacherEmail: studentProjectTeacherEmail ?? null
        };
        return dispatch(action);
    }
}

export const sendContactEmail: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            studentProjectName,
            studentProjectTeacherEmail,
            sendingContactEmail
        } = getState().ContactPitchTeacherDialogLocalState;

        if (sendingContactEmail) {
            return;
        }

        if (!studentProjectName || !studentProjectTeacherEmail) {
            return;
        }

        const {
            currentStudent
        } = getState().StudentAuthenticationState;

        if (!currentStudent) {
            return;
        }

        dispatch({
            type: ContactPitchTeacherDialogEvents.SendingContactEmail
        });

        const completeAction: CompleteSendingContactEmailAction = {
            type: ContactPitchTeacherDialogEvents.CompleteSendingContactEmail
        };

        try {
            const emailInfo: ContactPitchTeacherEmailData = {
                receiver: studentProjectTeacherEmail,
                sender: currentStudent.email,
                studentName: `${(currentStudent as Student).firstName} ${(currentStudent as Student).lastName}`,
                studentProjectName: studentProjectName
            };

            await new StudentEmailRepository().sendEmail({
                emailType: ClientEmailTypes.ContactPitchTeacher,
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