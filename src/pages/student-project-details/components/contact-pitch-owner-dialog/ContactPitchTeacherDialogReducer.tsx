import {
    CompleteSendingContactEmailAction,
    ContactPitchTeacherDialogAction,
    ContactPitchTeacherDialogEvents,
    ToggleContactDialogAction
} from "./ContactPitchTeacherDialogActions";
import Error from "../../../../models/error";

export interface ContactPitchTeacherDialogState {
    studentProjectName: string | null;
    studentProjectTeacherEmail: string | null;
    contactDialogOpen: boolean;
    sendingContactEmail: boolean;
    errorSendingContactEmail?: Error;
}

const initialState: ContactPitchTeacherDialogState = {
    studentProjectName: null,
    studentProjectTeacherEmail: null,
    contactDialogOpen: false,
    sendingContactEmail: false
}

export const isSendingContactEmail = (state: ContactPitchTeacherDialogState) => {
    return state.sendingContactEmail;
}

export const hasErrorSendingContactEmail = (state: ContactPitchTeacherDialogState) => {
    return !state.sendingContactEmail && state.errorSendingContactEmail !== undefined;
}

const contactPitchTeacherDialogReducer = (state = initialState, action: ContactPitchTeacherDialogAction) => {
    switch (action.type) {
        case ContactPitchTeacherDialogEvents.ToggleContactDialog:
            const toggleContactDialogAction: ToggleContactDialogAction = action as ToggleContactDialogAction;
            return {
                ...state,
                contactDialogOpen: !state.contactDialogOpen,
                projectName: toggleContactDialogAction.studentProjectName,
                projectTeacherEmail: toggleContactDialogAction.studentProjectTeacherEmail
            }
        case ContactPitchTeacherDialogEvents.SendingContactEmail:
            return {
                ...state,
                sendingContactEmail: true,
                errorSendingContactEmail: undefined
            }
        case ContactPitchTeacherDialogEvents.CompleteSendingContactEmail:
            const completeSendingContactEmailFunction: CompleteSendingContactEmailAction = action as CompleteSendingContactEmailAction;
            return {
                ...state,
                contactDialogOpen: false,
                sendingContactEmail: false,
                errorSendingContactEmail: completeSendingContactEmailFunction.error !== undefined
                    ? {detail: completeSendingContactEmailFunction.error}
                    : state.errorSendingContactEmail
            }
        default:
            return state;
    }
}

export default contactPitchTeacherDialogReducer;