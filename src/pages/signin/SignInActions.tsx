import {Action, ActionCreator, Dispatch} from "redux";
import React, {FormEvent} from "react";
import {signIn} from "../../redux-store/actions/authenticationActions";
import {AppState} from "../../redux-store/reducers";
import Api, {ApiRoutes} from "../../api/Api";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import firebaseApp from "../../firebase/firebaseApp.jsx";

export enum SignInEvents {
    ResetAllStates = "SignInEvents.ResetAllStates",
    TextChanged = "SignInEvents.TextChanged",
    TogglePasswordVisibility = "SignInEvents.TogglePasswordVisibility",
    SignInEmailError = "SignInEvents.SignInEmailError",
    SignInPasswordError = "SignInEvents.SignInPasswordError",
    ClearErrors = "SignInEvents.ClearErrors",
    ToggleResetPasswordDialog = "SignInEvents.ToggleResetPasswordDialog",
    ProcessingResetPasswordRequest = "SignInEvents.ProcessingResetPasswordRequest",
    CompleteProcessingResetPasswordRequest = "SignInEvents.CompleteProcessingResetPasswordRequest",
    UpdateCaptchaToken = "SIGN_IN_UPDATE_CAPTCHA_TOKEN",
    CaptchaError = "SignInEvents.CaptchaError",
    CaptchaNotCompletedError = 'SignInEvents.CaptchaNotCompletedError',
}


export const setCaptchaError: ActionCreator<any> = () => {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SignInEvents.CaptchaError
        });
    }
}

export interface SignInAction extends Action {
}

export interface UpdateCaptchaTokenAction extends SignInAction {
    captchaToken: string;
  }
  
  export const updateCaptchaToken: ActionCreator<any> = (captchaToken: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
      const action: UpdateCaptchaTokenAction = {
        type: SignInEvents.UpdateCaptchaToken,
        captchaToken,
      };
      return dispatch(action);
    };
  };


export interface TextChangedAction extends SignInAction {
    name: string;
    value: string;
}

export interface CompleteProcessingResetPasswordRequestAction extends SignInAction {
    error?: string;
}

export const onTextChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: TextChangedAction = {
            type: SignInEvents.TextChanged,
            name: event.target.name,
            value: event.target.value
        }
        return dispatch(action);
    }
}

export const togglePasswordVisibility: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: SignInEvents.TogglePasswordVisibility
        });
    }
}

export const onSignInClick: ActionCreator<any> = (event: FormEvent, captchaToken: string, isFirstLogin: boolean = false) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            signInEmail,
            signInPassword
        } = getState().SignInLocalState;

        event.preventDefault();

        dispatch({
            type: SignInEvents.ClearErrors
        });

        const email: string = signInEmail.trim().toLowerCase();
        const password: string = signInPassword;

        let allowSignIn: boolean = true;

        if (email.length === 0) {
            dispatch({
                type: SignInEvents.SignInEmailError
            });
            allowSignIn = false;
        }

        if (password.length === 0) {
            dispatch({
                type: SignInEvents.SignInPasswordError
            });
            allowSignIn = false;
        }

        if (captchaToken.length === 0) {
            dispatch(setCaptchaError());
            allowSignIn = false;
        }
        if (captchaToken === "") {
            dispatch({
                type: SignInEvents.CaptchaNotCompletedError,
            });
            allowSignIn = false;
        }

        if (!allowSignIn) {
            return;
        }

        if (!isFirstLogin) {
            if (captchaToken.length === 0) {
                dispatch(setCaptchaError());
                allowSignIn = false;
            }
            if (captchaToken === "") {
                dispatch({
                    type: SignInEvents.CaptchaNotCompletedError,
                });
                allowSignIn = false;
            }
        }


        // Use the captchaToken here, for example, you can pass it to your signIn function
        return dispatch(signIn(email, password, isFirstLogin ? null : captchaToken));
    }
}

  

export const toggleResetPasswordDialog: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: SignInEvents.ToggleResetPasswordDialog
        });
    }
}

export const onSendResetPasswordClick: ActionCreator<any> = (email: string) => {
    return async (dispatch: Dispatch) => {
        console.log("onSendResetPasswordClick");
        dispatch({
            type: SignInEvents.ProcessingResetPasswordRequest
        });

        const completeAction: CompleteProcessingResetPasswordRequestAction = {
            type: SignInEvents.CompleteProcessingResetPasswordRequest
        }

        try {
            const auth = firebaseApp.auth();
            await auth.sendPasswordResetEmail(email);
            dispatch(toggleResetPasswordDialog());
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}