import Student from "../../models/student";
import Teacher from "../../models/teacher";
import {
    StudentAuthenticationAction,
    StudentAuthenticationEvents,
    CompleteStudentAuthenticationAction,
    UpdateStudentChangesAction
} from "../actions/studentAuthenticationActions";
import Error from "../../models/error";
import CourseOfMembership from "../../models/course_of_membership";

export enum StudentAuthenticationStatus {
    NotInitialized,
    Authenticating,
    Authenticated,
    Unauthenticated
}

export interface StudentAuthenticationState {
    status: StudentAuthenticationStatus;
    currentStudent: Student | Teacher | null;
    coursesOfMembership: CourseOfMembership[];
    error?: Error
}


// Student path
const startState: StudentAuthenticationState = {
    status: StudentAuthenticationStatus.NotInitialized,
    currentStudent: null,
    coursesOfMembership: []
}

//Student path
export const authStudentIsNotInitialized = (state: StudentAuthenticationState) => {
    return state.status === StudentAuthenticationStatus.NotInitialized;
}

export const isStudentAuthenticating = (state: StudentAuthenticationState) => {
    return state.status === StudentAuthenticationStatus.Authenticating;
}

export const successfullyStudentAuthenticated = (state: StudentAuthenticationState) => {
    return state.status === StudentAuthenticationStatus.Authenticated && state.currentStudent && state.error === undefined;
}

export const hasStudentAuthenticationError = (state: StudentAuthenticationState) => {
    return state.error !== undefined;
}



const authenticationReducer = (state = startState, action: StudentAuthenticationAction) => {
    switch (action.type) {
        case StudentAuthenticationEvents.StartStudentAuthenticating:
            return {
                ...startState,
                status: StudentAuthenticationStatus.Authenticating
            }
        case StudentAuthenticationEvents.CompleteStudentAuthentication:
            const completeStudentAuthenticationAction: CompleteStudentAuthenticationAction = (action as CompleteStudentAuthenticationAction);
            if (completeStudentAuthenticationAction.status === StudentAuthenticationStatus.Authenticated) {
                console.log('Successfully logged in!'); // Add this line
            }          
            return {
                ...state,
                status: completeStudentAuthenticationAction.status,
                currentStudent: completeStudentAuthenticationAction.currentStudent
                    ? JSON.parse(JSON.stringify(completeStudentAuthenticationAction.currentStudent)) : state.currentStudent,
                coursesOfMembership: JSON.parse(JSON.stringify(completeStudentAuthenticationAction.courseOfMembership)),
                error: completeStudentAuthenticationAction.error
            }
        case StudentAuthenticationEvents.StudentSignOut:
            return {
                ...state,
                status: state.status === StudentAuthenticationStatus.NotInitialized
                || state.status === StudentAuthenticationStatus.Authenticated
                    ? StudentAuthenticationStatus.Unauthenticated
                    : state.status,
                currentStudent: state.status === StudentAuthenticationStatus.NotInitialized
                || state.status === StudentAuthenticationStatus.Authenticated
                    ? null
                    : state.currentStudent,
                coursesOfMembership: state.status === StudentAuthenticationStatus.NotInitialized
                || state.status === StudentAuthenticationStatus.Authenticated
                    ? []
                    : state.coursesOfMembership,
                error: state.status === StudentAuthenticationStatus.NotInitialized
                || state.status === StudentAuthenticationStatus.Authenticated
                    ? undefined
                    : state.error
            }
        case StudentAuthenticationEvents.UpdateStudentChanges:
            const updateStudentChangesAction: UpdateStudentChangesAction = action as UpdateStudentChangesAction;
            return {
                ...state,
                currentStudent: updateStudentChangesAction.updatedStudent
            }
        default:
            return state;
    }
};

export default authenticationReducer;