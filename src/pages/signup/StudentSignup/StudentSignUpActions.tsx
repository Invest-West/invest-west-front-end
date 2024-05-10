import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../redux-store/reducers";
import InvitedStudent from "../../../models/invited_student";
import StudentRepository from "../../../api/repositories/StudentRepository";
import React from "react";
import {checkPasswordStrength, PASSWORD_VERY_WEAK} from "../../../utils/passwordUtils";
import {isValidEmailAddress} from "../../../utils/emailUtils";
import {signIn} from "../../../redux-store/actions/authenticationActions";

export enum SignUpEvents {
    LoadingInvitedStudent = "SignUpEvents.LoadingInvitedStudent",
    CompleteLoadingInvitedStudent = "SignUpEvents.CompleteLoadingInvitedStudent",
    InputFieldChanged = "SignUpEvents.InputFieldChanged",
    CreatingAccount = "SignUpEvents.CreatingAccount",
    CompleteCreatingAccount = "SignUpEvents.CompleteCreatingAccount"
}

export interface SignUpAction extends Action {

}

export interface CompleteLoadingInvitedStudentAction extends SignUpAction {
    invitedStudent?: InvitedStudent;
    error?: string;
}

export interface InputFieldChangedAction extends SignUpAction {
    name: string;
    value: string | boolean;
}

export interface CompleteCreatingAccountAction extends SignUpAction {
    error?: string;
}

export const loadInvitedStudent: ActionCreator<any> = (invitedStudentID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {

        const completeAction: CompleteLoadingInvitedStudentAction = {
            type: SignUpEvents.CompleteLoadingInvitedStudent
        };

        try {
            dispatch({
                type: SignUpEvents.LoadingInvitedStudent
            });

            const response = await new StudentRepository().retrieveInvitedStudent(invitedStudentID);
            const invitedStudent: InvitedStudent = response.data;
            completeAction.invitedStudent = JSON.parse(JSON.stringify(invitedStudent));
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const handleInputFieldChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const inputFieldType: string = event.target.type;
        const inputFieldName: string = event.target.name;
        const inputFieldValue: string = event.target.value;
        const inputFieldChecked: boolean = event.target.checked;

        const action: InputFieldChangedAction = {
            type: SignUpEvents.InputFieldChanged,
            name: inputFieldName,
            value: inputFieldType === "checkbox" ? inputFieldChecked : inputFieldValue
        };

        return dispatch(action);
    }
}

export const createAccount: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            invitedStudent,
            studentType,
            title,
            firstName,
            lastName,
            email,
            confirmedEmail,
            password,
            confirmedPassword,
            acceptMarketingPreferences
        } = getState().SignUpLocalState;

        const {
            course
        } = getState().ManageCourseUrlState;

        const completeAction: CompleteCreatingAccountAction = {
            type: SignUpEvents.CompleteCreatingAccount
        };

        // invalid email address
        if (!isValidEmailAddress(email) || !isValidEmailAddress(confirmedEmail)) {
            completeAction.error = "Please enter a valid email address.";
            return dispatch(completeAction);
        }

        // emails not match
        if (email.trim().toLocaleLowerCase() !== confirmedEmail.trim().toLocaleLowerCase()) {
            completeAction.error = "Emails do not match.";
            return dispatch(completeAction);
        }

        // passwords not match
        if (password !== confirmedPassword) {
            completeAction.error = "Passwords do not match.";
            return dispatch(completeAction);
        }

        // password not strong enough
        if (checkPasswordStrength(password) === PASSWORD_VERY_WEAK) {
            completeAction.error = "Password is too weak. Please select a stronger password.";
            return dispatch(completeAction);
        }

        try {
            dispatch({
                type: SignUpEvents.CreatingAccount
            });

            await new StudentRepository().signUp({
                isPublicRegistration: invitedStudent === undefined,
                invitedStudentID: invitedStudent !== undefined ? invitedStudent.id : undefined,
                studentProfile: {
                    title,
                    discover,
                    firstName,
                    lastName,
                    email,
                    type: studentType
                },
                password,
                courseID: invitedStudent ? invitedStudent.invitedBy : course?.anid ?? "",
                acceptMarketingPreferences: acceptMarketingPreferences,
            });

            dispatch(completeAction);
            return dispatch(signIn(email, password));
        } catch (error) {
            console.error("Error creating account:", error);
            completeAction.error = `Error creating account: ${error.message}`;
            return dispatch(completeAction);
        }
    }
}