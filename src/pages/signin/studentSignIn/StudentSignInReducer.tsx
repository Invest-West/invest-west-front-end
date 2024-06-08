import {
    CompleteProcessingResetPasswordRequestAction,
    SignInAction,
    SignInEvents,
    TextChangedAction
} from "./StudentSignInActions";
import Error from "../../../models/error";

export interface StudentSignInState {
    signInEmail: string;
    signInPassword: string;
    showPassword: boolean;

    errorSignInEmail: boolean;
    errorSignInPassword: boolean;
    showResetPasswordDialog: boolean;
    resetPasswordDialogEmail: string;
    resetPasswordDialogProcessing: boolean;
    resetPasswordDialogEmailSent: boolean;
    resetPasswordDialogError?: Error;
}

const initialState: StudentSignInState = {
    signInEmail: "",
    signInPassword: "",
    showPassword: false,
    
    errorSignInEmail: false,
    errorSignInPassword: false,
    showResetPasswordDialog: false,
    resetPasswordDialogEmail: "",
    resetPasswordDialogProcessing: false,
    resetPasswordDialogEmailSent: false
}

export const successfullySentResetPassword = (state: StudentSignInState) => {
    return state.resetPasswordDialogEmailSent && state.resetPasswordDialogError === undefined;
}

export const errorSendingResetPassword = (state: StudentSignInState) => {
    return state.resetPasswordDialogError !== undefined;
}

export const isProcessingResetPasswordRequest = (state: StudentSignInState) => {
    return state.resetPasswordDialogProcessing;
}

const studentSignInReducer = (state: StudentSignInState = initialState, action: SignInAction) => {
    switch (action.type) {
        case SignInEvents.ResetAllStates:
            return {
                ...initialState
            }
        case SignInEvents.TextChanged:
            const textChangedAction: TextChangedAction = (action as TextChangedAction);
            return {
                ...state,
                [textChangedAction.name]: textChangedAction.value
            }
        case SignInEvents.TogglePasswordVisibility:
            return {
                ...state,
                showPassword: !state.showPassword
            }
        case SignInEvents.SignInEmailError:
            return {
                ...state,
                errorSignInEmail: true
            }
        case SignInEvents.SignInPasswordError:
            return {
                ...state,
                errorSignInPassword: true
            }           
        case SignInEvents.ClearErrors:
            return {
                ...state,
                errorSignInEmail: false,
                errorSignInPassword: false
            }
        case SignInEvents.ToggleResetPasswordDialog:
            return {
                ...state,
                showResetPasswordDialog: !state.showResetPasswordDialog,
                resetPasswordDialogEmail: "",
            }
        case SignInEvents.ProcessingResetPasswordRequest:
            return {
                ...state,
                resetPasswordDialogProcessing: true,
                resetPasswordDialogError: undefined
            }
        case SignInEvents.CompleteProcessingResetPasswordRequest:
            const completeAction: CompleteProcessingResetPasswordRequestAction =
                (action as CompleteProcessingResetPasswordRequestAction);
            return {
                ...state,
                resetPasswordDialogEmailSent: completeAction.error === undefined,
                resetPasswordDialogError: completeAction.error !== undefined
                    ? {detail: completeAction.error} : state.resetPasswordDialogError,
                resetPasswordDialogProcessing: false
            }
        default:
            return state;
    }
}

export default studentSignInReducer;