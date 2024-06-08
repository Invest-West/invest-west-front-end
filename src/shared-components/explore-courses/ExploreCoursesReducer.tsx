import {
    CompleteFetchingCoursesAction,
    CompleteRemovingAccessRequestAction,
    CompleteSendingAccessRequestAction,
    ExploreCoursesAction,
    ExploreCoursesEvents,
    FilterChangedAction,
    FilterCoursesByCourseFilterAction,
    PaginationChangedAction, RemovingAccessRequestAction, SendingAccessRequestAction
} from "./ExploreCoursesActions";
import CourseProperties from "../../models/course_properties";
import Error from "../../models/error";
import {AccessStudentRequestInstance} from "../../models/access_request";

export const maxCoursesPerPage: number = 12;

export interface ExploreCoursesState {
    courses: CourseProperties[];
    accessStudentRequestsInstances?: AccessStudentRequestInstance[]; // only available for issuer or investor
    fetchingCourses: boolean;
    coursesFetched: boolean;

    filteringCoursesByName: boolean;
    nameFilter: string;
    courseFilter: "all" | "coursesOfMembership" | "coursesOfPendingRequest";
    coursesFiltered: CourseProperties[];

    currentPage: number;

    error?: Error;

    sendingAccessRequestToCourse?: string;
    errorSendingAccessRequest?: Error;

    removingAccessRequestFromCourse?: string;
    errorRemovingAccessRequest?: Error;
}

const initialState: ExploreCoursesState = {
    courses: [],
    fetchingCourses: false,
    coursesFetched: false,

    filteringCoursesByName: false,
    nameFilter: "",
    courseFilter: "all",
    coursesFiltered: [],

    currentPage: 1
}

export const hasNotFetchedCourses = (state: ExploreCoursesState) => {
    return !state.coursesFetched && !state.fetchingCourses;
}

export const isFetchingCourses = (state: ExploreCoursesState) => {
    return !state.coursesFetched && state.fetchingCourses;
}

export const successfullyFetchedCourses = (state: ExploreCoursesState) => {
    return state.coursesFetched && !state.fetchingCourses && state.error === undefined;
}

export const isFilteringCoursesByName = (state: ExploreCoursesState) => {
    return state.filteringCoursesByName;
}

export const hasCoursesForCurrentFilters = (state: ExploreCoursesState) => {
    return successfullyFetchedCourses(state) && state.coursesFiltered.length > 0;
}

export const hasAccessRequestsBeenSatisfied = (state: ExploreCoursesState) => {
    return successfullyFetchedCourses(state) && state.accessStudentRequestsInstances !== undefined;
}

export const calculatePaginationPages = (state: ExploreCoursesState) => {
    if (state.coursesFiltered.length <= maxCoursesPerPage) {
        return 1;
    }
    if (state.coursesFiltered.length % maxCoursesPerPage === 0) {
        return (state.coursesFiltered.length / maxCoursesPerPage) | 0;
    }
    return ((state.coursesFiltered.length / maxCoursesPerPage) | 0) + 1;
}

export const calculatePaginationIndices = (state: ExploreCoursesState) => {
    let startIndex, endIndex;
    startIndex = (state.currentPage - 1) * maxCoursesPerPage;
    endIndex = startIndex + maxCoursesPerPage - 1;
    if (endIndex > state.coursesFiltered.length - 1) {
        endIndex = state.coursesFiltered.length - 1;
    }
    return {
        startIndex,
        endIndex
    };
}

export const isSendingAccessRequest = (state: ExploreCoursesState, courseID: string) => {
    return state.sendingAccessRequestToCourse !== undefined && state.sendingAccessRequestToCourse === courseID;
}

export const hasErrorSendingAccessRequest = (state: ExploreCoursesState, courseID: string) => {
    return !isSendingAccessRequest(state, courseID) && state.errorSendingAccessRequest !== undefined;
}

export const isRemovingAccessRequest = (state: ExploreCoursesState, courseID: string) => {
    return state.removingAccessRequestFromCourse !== undefined && state.removingAccessRequestFromCourse === courseID;
}

export const hasErrorRemovingAccessRequest = (state: ExploreCoursesState, courseID: string) => {
    return !isRemovingAccessRequest(state, courseID) && state.errorRemovingAccessRequest !== undefined;
}

const exploreCoursesReducer = (state = initialState, action: ExploreCoursesAction) => {
    switch (action.type) {
        case ExploreCoursesEvents.FetchingCourses:
            return {
                ...state,
                courses: [],
                fetchingCourses: true,
                coursesFetched: false,
                error: undefined
            }
        case ExploreCoursesEvents.CompleteFetchingCourses:
            const completeFetchingCoursesAction: CompleteFetchingCoursesAction = action as CompleteFetchingCoursesAction;
            return {
                ...state,
                courses: [...completeFetchingCoursesAction.courses],
                accessStudentRequestsInstances: completeFetchingCoursesAction.accessStudentRequestInstances !== undefined
                    ? [...completeFetchingCoursesAction.accessStudentRequestInstances]
                    : state.accessStudentRequestsInstances,
                fetchingCourses: false,
                coursesFetched: true,
                currentPage: 1,
                error: completeFetchingCoursesAction.error !== undefined
                    ? {detail: completeFetchingCoursesAction.error} : state.error
            }
        case ExploreCoursesEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value
            }
        case ExploreCoursesEvents.FilterCoursesByName:
            return {
                ...state,
                filteringCoursesByName: true
            }
        case ExploreCoursesEvents.CancelFilterCoursesByName:
            return {
                ...state,
                nameFilter: "",
                filteringCoursesByName: false
            }
        case ExploreCoursesEvents.FilterCoursesByCourseFilter:
            const filterCoursesByCourseFilterAction: FilterCoursesByCourseFilterAction = action as FilterCoursesByCourseFilterAction;
            return {
                ...state,
                coursesFiltered: [...filterCoursesByCourseFilterAction.coursesFiltered],
                currentPage: 1
            }
        case ExploreCoursesEvents.PaginationChanged:
            const paginationChangedAction: PaginationChangedAction = action as PaginationChangedAction;
            return {
                ...state,
                currentPage: paginationChangedAction.page
            }
        case ExploreCoursesEvents.SendingAccessRequest:
            const sendingAccessRequestAction: SendingAccessRequestAction = action as SendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequestToCourse: sendingAccessRequestAction.courseID,
                errorSendingAccessRequest: undefined
            }
        case ExploreCoursesEvents.CompleteSendingAccessRequest:
            const completeSendingAccessRequestAction: CompleteSendingAccessRequestAction = action as CompleteSendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequestToCourse: undefined,
                accessStudentRequestsInstances: completeSendingAccessRequestAction.updatedAccessStudentRequestInstances !== undefined
                    ? [...completeSendingAccessRequestAction.updatedAccessStudentRequestInstances]
                    : state.accessStudentRequestsInstances,
                errorSendingAccessRequest: completeSendingAccessRequestAction.error !== undefined
                    ? {detail: completeSendingAccessRequestAction.error} : state.errorSendingAccessRequest
            }
        case ExploreCoursesEvents.RemovingAccessRequest:
            const removingAccessRequestAction: RemovingAccessRequestAction = action as RemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequestFromCourse: removingAccessRequestAction.courseID,
                errorRemovingAccessRequest: undefined
            }
        case ExploreCoursesEvents.CompleteRemovingAccessRequest:
            const completeRemovingAccessRequestAction: CompleteRemovingAccessRequestAction = action as CompleteRemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequestFromCourse: undefined,
                accessStudentRequestsInstances: completeRemovingAccessRequestAction.updatedAccessStudentRequestInstances !== undefined
                    ? [...completeRemovingAccessRequestAction.updatedAccessStudentRequestInstances]
                    : state.accessStudentRequestsInstances,
                errorRemovingAccessRequest: completeRemovingAccessRequestAction.error !== undefined
                    ? {detail: completeRemovingAccessRequestAction.error} : state.errorRemovingAccessRequest
            }
        default:
            return state;
    }
}

export default exploreCoursesReducer;