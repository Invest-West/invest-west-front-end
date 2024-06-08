import {
    CompleteCreatingAccountAction,
    CompleteLoadingInvitedStudentAction,
    InputFieldChangedAction,
    StudentSignUpAction,
    StudentSignUpEvents
} from "./StudentSignUpActions";
import Error from "../../../models/error";
import InvitedStudent from "../../../models/invited_student";
import {StudentAuthenticationEvents} from "../../../redux-store/actions/studentAuthenticationActions";

export interface StudentSignUpState {
    invitedStudent?: InvitedStudent;
    invitedStudentLoaded: boolean;
    loadingInvitedStudent: boolean;
    errorLoadingInvitedStudent?: Error;

    studentType: number;
    title: string;
    discover: string;
    firstName: string;
    lastName: string;
    email: string;
    confirmedEmail: string;
    password: string;
    confirmedPassword: string;
    acceptMarketingPreferences: boolean;

    creatingAccount: boolean;
    errorCreatingAccount?: Error;
}

const initialState: StudentSignUpState = {
    invitedStudentLoaded: false,
    loadingInvitedStudent: false,

    studentType: -1,
    title: "-1",
    discover: "-1",
    firstName: "",
    lastName: "",
    email: "",
    confirmedEmail: "",
    password: "",
    confirmedPassword: "",
    acceptMarketingPreferences: false,

    creatingAccount: false
}

export const isLoadingInvitedStudent = (state: StudentSignUpState) => {
    return !state.invitedStudentLoaded && state.loadingInvitedStudent;
}

export const hasSuccessfullyLoadedInvitedStudent = (state: StudentSignUpState) => {
    return state.invitedStudentLoaded && !state.loadingInvitedStudent && state.invitedStudent !== undefined && state.errorLoadingInvitedStudent === undefined;
}

export const hasErrorLoadingInvitedStudent = (state: StudentSignUpState) => {
    return state.invitedStudentLoaded && !state.loadingInvitedStudent && state.invitedStudent === undefined && state.errorLoadingInvitedStudent !== undefined;
}

export const notFoundInvitedStudent = (state: StudentSignUpState) => {
    return hasErrorLoadingInvitedStudent(state) && state.errorLoadingInvitedStudent && state.errorLoadingInvitedStudent.detail.includes("404");
}

export const isCreatingAccount = (state: StudentSignUpState) => {
    return state.creatingAccount;
}

export const hasErrorCreatingAccount = (state: StudentSignUpState) => {
    return !state.creatingAccount && state.errorCreatingAccount !== undefined;
}

const studentSignUpReducer = (state = initialState, action: StudentSignUpAction) => {
    switch (action.type) {
        case StudentAuthenticationEvents.StudentSignOut:
            return initialState;
        case StudentAuthenticationEvents.CompleteStudentAuthentication:
            return initialState;
        case StudentSignUpEvents.LoadingInvitedStudent:
            return {
                ...state,
                invitedStudent: undefined,
                invitedStudentLoaded: false,
                loadingInvitedStudent: true,
                errorLoadingInvitedStudent: undefined
            }
        case StudentSignUpEvents.CompleteLoadingInvitedStudent:
            const completeLoadingInvitedStudentAction: CompleteLoadingInvitedStudentAction = action as CompleteLoadingInvitedStudentAction;
            return {
                ...state,
                invitedStudent: completeLoadingInvitedStudentAction.invitedStudent,
                invitedStudentLoaded: true,
                loadingInvitedStudent: false,
                errorLoadingInvitedStudent: completeLoadingInvitedStudentAction.error !== undefined
                    ? {detail: completeLoadingInvitedStudentAction.error} : state.errorLoadingInvitedStudent,
                studentType: completeLoadingInvitedStudentAction.invitedStudent
                    ? completeLoadingInvitedStudentAction.invitedStudent.type : state.studentType,
                title: completeLoadingInvitedStudentAction.invitedStudent
                    ? completeLoadingInvitedStudentAction.invitedStudent.title : state.title,
                firstName: completeLoadingInvitedStudentAction.invitedStudent
                    ? completeLoadingInvitedStudentAction.invitedStudent.firstName : state.firstName,
                lastName: completeLoadingInvitedStudentAction.invitedStudent
                    ? completeLoadingInvitedStudentAction.invitedStudent.lastName : state.lastName,
                email: completeLoadingInvitedStudentAction.invitedStudent
                    ? completeLoadingInvitedStudentAction.invitedStudent.email : state.email
            }
        case StudentSignUpEvents.InputFieldChanged:
            const inputFieldChangedAction: InputFieldChangedAction = action as InputFieldChangedAction;
            return {
                ...state,
                [inputFieldChangedAction.name]: inputFieldChangedAction.value
            }
        case StudentSignUpEvents.CreatingAccount:
            return {
                ...state,
                creatingAccount: true,
                successfullyCreatedAccount: false,
                errorCreatingAccount: undefined
            }
        case StudentSignUpEvents.CompleteCreatingAccount:
            const completeCreatingAccountAction: CompleteCreatingAccountAction = action as CompleteCreatingAccountAction;
            return {
                ...state,
                creatingAccount: false,
                errorCreatingAccount: completeCreatingAccountAction.error
                    ? {detail: completeCreatingAccountAction.error} : state.errorCreatingAccount
            }
        default:
            return state;
    }
}

export default studentSignUpReducer;