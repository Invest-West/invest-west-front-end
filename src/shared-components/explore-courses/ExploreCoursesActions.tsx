import {Action, ActionCreator, Dispatch} from "redux";
import CourseProperties from "../../models/course_properties";
import {AppState} from "../../redux-store/reducers";
import CourseRepository from "../../api/repositories/CourseRepository";
import AccessRequest, {AccessRequestInstance} from "../../models/access_request";
import AccessRequestRepository from "../../api/repositories/AccessRequestRepository";
import Teacher, {isTeacher} from "../../models/teacher";
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
    accessRequestInstances?: AccessRequestInstance[];
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
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export interface RemovingAccessRequestAction extends ExploreCoursesAction {
    courseID: string;
}

export interface CompleteRemovingAccessRequestAction extends ExploreCoursesAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export const fetchCourses: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessRequestsInstances,
            nameFilter
        } = getState().ExploreCoursesLocalState;

        dispatch({
            type: ExploreCoursesEvents.FetchingCourses
        });

        const currentStudent = getState().AuthenticationState.currentStudent;

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

            const teacher: Teacher | null = isTeacher(currentStudent);
            if (!teacher || (teacher && !teacher.superTeacher)) {
                // student is an issuer, investor, or course teacher
                // and access requests have not been fetched
                if (!accessRequestsInstances) {
                    const accessRequestInstancesResponse = await new AccessRequestRepository().fetchAccessRequests({
                        student: currentStudent.id,
                        orderBy: "student"
                    });
                    completeAction.accessRequestInstances = accessRequestInstancesResponse.data;
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
            accessRequestsInstances,
            courses
        } = getState().ExploreCoursesLocalState;

        const AuthenticationState = getState().AuthenticationState;
        const currentStudent = AuthenticationState.currentStudent;

        if (!currentStudent) {
            return;
        }

        const coursesFiltered: CourseProperties[] = [];

        courses.map(course => {
            let satisfiedFilter = false;
            switch (courseFilter) {
                case "all":
                    const teacher: Teacher | null = isTeacher(currentStudent);
                    if (teacher && teacher.superTeacher) {
                        satisfiedFilter = true;
                    } else {
                        satisfiedFilter = AuthenticationState.coursesOfMembership.findIndex(
                            courseOfMembership => courseOfMembership.course.anid === course.anid) === -1
                            && accessRequestsInstances !== undefined
                            && accessRequestsInstances.findIndex(
                                accessRequestInstance => accessRequestInstance.course.anid === course.anid) === -1;
                    }
                    break;
                case "coursesOfMembership":
                    satisfiedFilter = AuthenticationState.coursesOfMembership.findIndex(
                        courseOfMembership => courseOfMembership.course.anid === course.anid) !== -1;
                    break;
                case "coursesOfPendingRequest":
                    satisfiedFilter = accessRequestsInstances !== undefined
                        && accessRequestsInstances.findIndex(
                            accessRequestInstance => accessRequestInstance.course.anid === course.anid) !== -1;
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

export const sendAccessRequest: ActionCreator<any> = (courseID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().AuthenticationState.currentStudent;
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
            const response = await new AccessRequestRepository().createAccessRequest(currentStudent.id, courseID);
            const accessRequestInstance: AccessRequestInstance = response.data;
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().ExploreCoursesLocalState.accessRequestsInstances;
            if (currentAccessRequestInstances !== undefined) {
                completeAction.updatedAccessRequestInstances = [
                    ...currentAccessRequestInstances,
                    accessRequestInstance
                ];
            } else {
                completeAction.updatedAccessRequestInstances = [accessRequestInstance];
            }
            dispatch(completeAction);
            return dispatch(filterCoursesByCourseFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const removeAccessRequest: ActionCreator<any> = (courseID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().AuthenticationState.currentStudent;
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
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().ExploreCoursesLocalState.accessRequestsInstances;
            if (!currentAccessRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentAccessRequestInstances.findIndex(
                accessRequestInstance => accessRequestInstance.course.anid === courseID && accessRequestInstance.student.id === currentStudent.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessRequestInstances: AccessRequestInstance[] = [...currentAccessRequestInstances];
            const accessRequest: AccessRequest = updatedAccessRequestInstances[accessRequestIndex].request;
            await new AccessRequestRepository().removeAccessRequest(accessRequest.id);
            updatedAccessRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessRequestInstances = updatedAccessRequestInstances;
            dispatch(completeAction);
            return dispatch(filterCoursesByCourseFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}