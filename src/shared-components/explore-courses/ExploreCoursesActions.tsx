import {Action, ActionCreator, Dispatch} from "redux";
import CourseProperties from "../../models/course_properties";
import {AppState} from "../../redux-store/reducers";
import CourseRepository from "../../api/repositories/CourseRepository";
import AccessStudentRequest, {AccessStudentRequestInstance} from "../../models/access_request";
import AccessStudentRequestRepository from "../../api/repositories/AccessStudentRequestRepository";
import Teacher, {isProf} from "../../models/teacher";
import React from "react";

export enum ExploreCoursesEvents {
    FetchingCourses = "ExploreCoursesEvents.FetchingCourses",
    CompleteFetchingCourses = "ExploreCoursesEvents.CompleteFetchingCourses",
    FilterChanged = "ExploreCoursesEvents.FilterChanged",
    FilterCoursesByName = "ExploreCoursesEvents.FilterCoursesByName",
    CancelFilterCoursesByName = "ExploreCoursesEvents.CancelFilterCoursesByName",
    FilterCoursesByCourseFilter = "ExploreCoursesEvents.FilterCoursesByCourseFilter",
    PaginationChanged = "ExploreCoursesEvents.PaginationChanged",
    SendingAccessRequest = "ExploreCoursesEvents.SendingAccessRequest",
    CompleteSendingAccessRequest = "ExploreCoursesEvents.CompleteSendingAccessRequest",
    RemovingAccessRequest = "ExploreCoursesEvents.RemovingAccessRequest",
    CompleteRemovingAccessRequest = "ExploreCoursesEvents.CompleteRemovingAccessRequest"
}

export interface ExploreCoursesAction extends Action {

}

export interface CompleteFetchingCoursesAction extends ExploreCoursesAction {
    courses: CourseProperties[];
    accessStudentRequestInstances?: AccessStudentRequestInstance[];
    error?: string;
}

export interface FilterChangedAction extends ExploreCoursesAction {
    name: string;
    value: any;
}

export interface FilterCoursesByCourseFilterAction extends ExploreCoursesAction {
    coursesFiltered: CourseProperties[];
}

export interface PaginationChangedAction extends ExploreCoursesAction {
    page: number;
}

export interface SendingAccessRequestAction extends ExploreCoursesAction {
    courseID: string;
}

export interface CompleteSendingAccessRequestAction extends ExploreCoursesAction {
    error?: string;
    updatedAccessStudentRequestInstances?: AccessStudentRequestInstance[]
}

export interface RemovingAccessRequestAction extends ExploreCoursesAction {
    courseID: string;
}

export interface CompleteRemovingAccessRequestAction extends ExploreCoursesAction {
    error?: string;
    updatedAccessStudentRequestInstances?: AccessStudentRequestInstance[]
}

export const fetchCourses: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessStudentRequestsInstances,
            nameFilter
        } = getState().ExploreCoursesLocalState;

        dispatch({
            type: ExploreCoursesEvents.FetchingCourses
        });

        const currentStudent = getState().StudentAuthenticationState.currentStudent;

        const completeAction: CompleteFetchingCoursesAction = {
            type: ExploreCoursesEvents.CompleteFetchingCourses,
            courses: []
        };

        if (!currentStudent) {
            completeAction.error = "Unauthenticated student.";
            return dispatch(completeAction);
        }

        try {
            const coursesResponse = await new CourseRepository().fetchCourses(
                nameFilter.trim().length === 0 ? undefined : {name: nameFilter}
            );
            completeAction.courses = coursesResponse.data;

            const teacher: Teacher | null = isProf(currentStudent);
            if (!teacher || (teacher && !teacher.superTeacher)) {
                // student is an issuer, investor, or course teacher
                // and access requests have not been fetched
                if (!accessStudentRequestsInstances) {
                    const accessStudentRequestInstancesResponse = await new AccessStudentRequestRepository().fetchStudentAccessRequests({
                        student: currentStudent.id,
                        orderBy: "student"
                    });
                    completeAction.accessStudentRequestInstances = accessStudentRequestInstancesResponse.data;
                }
            }
            dispatch(completeAction);
            return dispatch(filterCoursesByCourseFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const filterChanged: ActionCreator<any> = (event: any) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: ExploreCoursesEvents.FilterChanged,
            name: name,
            value: value
        }

        dispatch(action);

        if (name === "courseFilter") {
            dispatch(filterCoursesByCourseFilter());
        }
    }
}

export const filterCoursesByName: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreCoursesEvents.FilterCoursesByName
        });
        return dispatch(fetchCourses());
    }
}

export const cancelFilteringCoursesByName: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreCoursesEvents.CancelFilterCoursesByName
        });
        return dispatch(fetchCourses());
    }
}

const filterCoursesByCourseFilter: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            courseFilter,
            accessStudentRequestsInstances,
            courses
        } = getState().ExploreCoursesLocalState;

        const StudentAuthenticationState = getState().StudentAuthenticationState;
        const currentStudent = StudentAuthenticationState.currentStudent;

        if (!currentStudent) {
            return;
        }

        const coursesFiltered: CourseProperties[] = [];

        courses.map(course => {
            let satisfiedFilter = false;
            switch (courseFilter) {
                case "all":
                    const teacher: Teacher | null = isProf(currentStudent);
                    if (teacher && teacher.superTeacher) {
                        satisfiedFilter = true;
                    } else {
                        satisfiedFilter = StudentAuthenticationState.coursesOfMembership.findIndex(
                            courseOfMembership => courseOfMembership.course.anid === course.anid) === -1
                            && accessStudentRequestsInstances !== undefined
                            && accessStudentRequestsInstances.findIndex(
                                accessStudentRequestInstance => accessStudentRequestInstance.course.anid === course.anid) === -1;
                    }
                    break;
                case "coursesOfMembership":
                    satisfiedFilter = StudentAuthenticationState.coursesOfMembership.findIndex(
                        courseOfMembership => courseOfMembership.course.anid === course.anid) !== -1;
                    break;
                case "coursesOfPendingRequest":
                    satisfiedFilter = accessStudentRequestsInstances !== undefined
                        && accessStudentRequestsInstances.findIndex(
                            accessStudentRequestInstance => accessStudentRequestInstance.course.anid === course.anid) !== -1;
                    break;
                default:
                    break;
            }
            if (satisfiedFilter) {
                coursesFiltered.push(course);
            }
            return null;
        });

        const action: FilterCoursesByCourseFilterAction = {
            type: ExploreCoursesEvents.FilterCoursesByCourseFilter,
            coursesFiltered: coursesFiltered
        }
        return dispatch(action);
    }
}

export const paginationChanged: ActionCreator<any> = (event: React.ChangeEvent<unknown>, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: PaginationChangedAction = {
            type: ExploreCoursesEvents.PaginationChanged,
            page: page
        }
        return dispatch(action);
    }
}

export const sendStudentAccessRequest: ActionCreator<any> = (courseID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().StudentAuthenticationState.currentStudent;
        if (!currentStudent) {
            return;
        }

        const sendingAction: SendingAccessRequestAction = {
            type: ExploreCoursesEvents.SendingAccessRequest,
            courseID
        };
        dispatch(sendingAction);

        const completeAction: CompleteSendingAccessRequestAction = {
            type: ExploreCoursesEvents.CompleteSendingAccessRequest
        };

        try {
            const response = await new AccessStudentRequestRepository().createStudentAccessRequest(currentStudent.id, courseID);
            const accessStudentRequestInstance: AccessStudentRequestInstance = response.data;
            const currentAccessStudentRequestInstances: AccessStudentRequestInstance[] | undefined = getState().ExploreCoursesLocalState.accessStudentRequestsInstances;
            if (currentAccessStudentRequestInstances !== undefined) {
                completeAction.updatedAccessStudentRequestInstances = [
                    ...currentAccessStudentRequestInstances,
                    accessStudentRequestInstance
                ];
            } else {
                completeAction.updatedAccessStudentRequestInstances = [accessStudentRequestInstance];
            }
            dispatch(completeAction);
            return dispatch(filterCoursesByCourseFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const removeStudentAccessRequest: ActionCreator<any> = (courseID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().StudentAuthenticationState.currentStudent;
        if (!currentStudent) {
            return;
        }

        const removingAction: RemovingAccessRequestAction = {
            type: ExploreCoursesEvents.RemovingAccessRequest,
            courseID
        };
        dispatch(removingAction);

        const completeAction: CompleteRemovingAccessRequestAction = {
            type: ExploreCoursesEvents.CompleteRemovingAccessRequest
        };

        try {
            const currentAccessStudentRequestInstances: AccessStudentRequestInstance[] | undefined = getState().ExploreCoursesLocalState.accessStudentRequestsInstances;
            if (!currentAccessStudentRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentAccessStudentRequestInstances.findIndex(
                accessStudentRequestInstance => accessStudentRequestInstance.course.anid === courseID && accessStudentRequestInstance.student.id === currentStudent.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessStudentRequestInstances: AccessStudentRequestInstance[] = [...currentAccessStudentRequestInstances];
            const accessRequest: AccessStudentRequest = updatedAccessStudentRequestInstances[accessRequestIndex].request;
            await new AccessStudentRequestRepository().removeStudentAccessRequest(accessRequest.id);
            updatedAccessStudentRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessStudentRequestInstances = updatedAccessStudentRequestInstances;
            dispatch(completeAction);
            return dispatch(filterCoursesByCourseFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}