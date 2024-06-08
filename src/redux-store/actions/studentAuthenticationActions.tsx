import {Action, ActionCreator, Dispatch} from "redux";
import {StudentAuthenticationStatus, isStudentAuthenticating, successfullyStudentAuthenticated} from "../reducers/studentAuthenticationReducer";
import Student from "../../models/student";
import Teacher, {isProf} from "../../models/teacher";
import Error from "../../models/error";
import firebase from "../../firebase/firebaseApp";
import CourseOfMembership from "../../models/course_of_membership";
import {AppState} from "../reducers";
import Routes from "../../router/routes";
import Firebase from "firebase";
import StudentRepository from "../../api/repositories/StudentRepository";

export enum StudentAuthenticationEvents {
    StartStudentAuthenticating = "StudentAuthenticationEvents.StartStudentAuthenticating",
    CompleteStudentAuthentication = "StudentAuthenticationEvents.CompleteAuthentication",
    StudentSignOut = "StudentAuthenticationEvents.StudentSignOut",
    UpdateStudentChanges = "StudentAuthenticationEvents.UpdateStudentChanges"
}


export interface StudentAuthenticationAction extends Action {
}

export interface StudentAuthenticationStudentAction extends Action {
}

export interface UpdateStudentChangesAction extends Action {
    updatedStudent: Student | Teacher;
}

export interface CompleteStudentAuthenticationAction extends StudentAuthenticationStudentAction {
    status: StudentAuthenticationStatus;
    currentStudent: Student | Teacher | null;
    courseOfMembership: CourseOfMembership[];
    error?: Error;
}

/* TODO: remove console logs */
/* Student view login */
export const studentSignIn: ActionCreator<any> = (email?: string, password?: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            ManageCourseUrlState,
            StudentAuthenticationState
        } = getState();

        if (isStudentAuthenticating(StudentAuthenticationState)) {
            return;
        }

        const studentAuthenticationCompleteAction: CompleteStudentAuthenticationAction = {
            type: StudentAuthenticationEvents.CompleteStudentAuthentication,
            status: StudentAuthenticationStatus.Authenticating,
            currentStudent: null,
            courseOfMembership: []
        }

        try {
            let currentFirebaseStudent: firebase.default.User | null = await firebase.auth().currentUser;

            // Student is currently signed in with Firebase
            if (currentFirebaseStudent) {
                if (successfullyStudentAuthenticated(StudentAuthenticationState)) {
                    return;
                }

                dispatch({
                    type: StudentAuthenticationEvents.StartStudentAuthenticating
                });
            }
            // user is currently not signed in with Firebase
            else {
                if (email === undefined || password === undefined) {
                    studentAuthenticationCompleteAction.status = StudentAuthenticationStatus.Unauthenticated;
                    studentAuthenticationCompleteAction.error = {
                        detail: "Email and password not provided."
                    }
                    return dispatch(studentAuthenticationCompleteAction);
                }

                dispatch({
                    type: StudentAuthenticationEvents.StartStudentAuthenticating
                });

                // set persistence state to SESSION
                await firebase.auth().setPersistence(Firebase.auth.Auth.Persistence.LOCAL);

                // sign in with Firebase using email and password
                const credential: firebase.default.auth.UserCredential =
                    await firebase.auth().signInWithEmailAndPassword(email, password);

                currentFirebaseStudent = credential.user;
            }

            if (currentFirebaseStudent) {
                const uid: string | undefined = currentFirebaseStudent.uid;

                // get current Student profile
                const retrieveStudentResponse = await new StudentRepository().retrieveStudent(uid);

                const currentStudent: Student | Teacher = retrieveStudentResponse.data;
                const currentTeacher: Teacher | null = isProf(currentStudent);

                // Check:
                // 1. Super Teacher must sign in via the dedicated URL.
                // 2. Only super Teacher can sign in via the dedicated URL.
                let validSuperTeacherSignIn: boolean = true;

                if (Routes.isSuperTeacherSignInRoute(ManageCourseUrlState.routePath ?? "")) {
                    if (!(currentTeacher && currentTeacher.superTeacher)) {
                        validSuperTeacherSignIn = false;
                        studentAuthenticationCompleteAction.error = {
                            detail: "You have no privileges to sign in."
                        }
                    }
                } else if (Routes.isSignInRoute(ManageCourseUrlState.routePath ?? "")) {
                    if (currentTeacher && currentTeacher.superTeacher) {
                        validSuperTeacherSignIn = false;
                        studentAuthenticationCompleteAction.error = {
                            detail: "Please sign in via your dedicated page."
                        }
                    }
                }

                if (!validSuperTeacherSignIn) {
                    await dispatch(studentSignOut());
                    studentAuthenticationCompleteAction.status = StudentAuthenticationStatus.Unauthenticated;
                    return dispatch(studentAuthenticationCompleteAction);
                }

                studentAuthenticationCompleteAction.currentStudent = currentStudent;

                // get Courses of membership for the current Student
                const listCoursesOfMembershipResponse = await new StudentRepository().listCoursesOfMembership(uid);

                studentAuthenticationCompleteAction.courseOfMembership = listCoursesOfMembershipResponse.data;

                studentAuthenticationCompleteAction.status = StudentAuthenticationStatus.Authenticated;
                return dispatch(studentAuthenticationCompleteAction);
            } else {
                await dispatch(studentSignOut());
                studentAuthenticationCompleteAction.status = StudentAuthenticationStatus.Unauthenticated;
                studentAuthenticationCompleteAction.error = {
                    detail: "Invalid credential."
                }
                return dispatch(studentAuthenticationCompleteAction);
            }
        } catch (error) {
            await dispatch(studentSignOut());
            studentAuthenticationCompleteAction.status = StudentAuthenticationStatus.Unauthenticated;
            studentAuthenticationCompleteAction.error = {
                detail: error.toString()
            }
            return dispatch(studentAuthenticationCompleteAction);
        }
    }
}

// Student sign out
export const studentSignOut: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.log(`Error signing out: ${error.toString()}`);
        }
        return dispatch({
            type: StudentAuthenticationEvents.StudentSignOut
        });
    }
}

export const updateStudentChanges: ActionCreator<any> = (updatedStudent: Student | Teacher) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: UpdateStudentChangesAction = {
            type: StudentAuthenticationEvents.UpdateStudentChanges,
            updatedStudent: JSON.parse(JSON.stringify(updatedStudent))
        };
        return dispatch(action);
    }
}