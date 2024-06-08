import {
    CompleteLoadingDataAction,
    CompleteRemovingAccessRequestAction,
    CompleteSendingAccessRequestAction,
    CourseDetailsAction,
    CourseDetailsEvents
} from "./CourseDetailsActions";
import CourseProperties from "../../models/course_properties";
import {InvitedStudentWithProfile} from "../../models/invited_student";
import {StudentProjectInstance} from "../../models/studentProject";
import Error from "../../models/error";
import {AccessStudentRequestInstance} from "../../models/access_request";

export interface CourseDetailsState {
    course?: CourseProperties;
    members?: InvitedStudentWithProfile[];
    studentOffers?: StudentProjectInstance[];
    accessRequestsInstances?: AccessStudentRequestInstance[];

    loadingData: boolean;
    dataLoaded: boolean;

    error?: Error;

    sendingAccessRequest: boolean;
    errorSendingAccessRequest?: Error;

    removingAccessRequest: boolean;
    errorRemovingAccessRequest?: Error;
}

const initialState: CourseDetailsState = {
    loadingData: false,
    dataLoaded: false,

    sendingAccessRequest: false,
    removingAccessRequest: false
}

export const hasNotLoadedData = (state: CourseDetailsState) => {
    return !state.dataLoaded && !state.loadingData;
}

export const isLoadingData = (state: CourseDetailsState) => {
    return !state.dataLoaded && state.loadingData;
}

export const successfullyLoadedData = (state: CourseDetailsState) => {
    return state.dataLoaded && !state.loadingData && state.course && state.members && state.studentOffers && state.error === undefined;
}

export const hasAccessRequestsBeenSatisfied = (state: CourseDetailsState) => {
    return successfullyLoadedData(state) && state.accessRequestsInstances !== undefined;
}

export const hasErrorLoadingData = (state: CourseDetailsState) => {
    return state.dataLoaded && !state.loadingData && state.error !== undefined;
}

export const isSendingAccessRequest = (state: CourseDetailsState) => {
    return state.sendingAccessRequest;
}

export const hasErrorSendingAccessRequest = (state: CourseDetailsState) => {
    return !isSendingAccessRequest(state) && state.errorSendingAccessRequest !== undefined;
}

export const isRemovingAccessRequest = (state: CourseDetailsState) => {
    return state.removingAccessRequest;
}

export const hasErrorRemovingAccessRequest = (state: CourseDetailsState) => {
    return !isRemovingAccessRequest(state) && state.errorRemovingAccessRequest !== undefined;
}

const courseDetailsReducer = (state = initialState, action: CourseDetailsAction) => {
    switch (action.type) {
        case CourseDetailsEvents.LoadingData:
            return {
                ...initialState,
                loadingData: true,
                dataLoaded: false
            }
        case CourseDetailsEvents.CompleteLoadingData:
            const completeLoadingDataAction: CompleteLoadingDataAction = action as CompleteLoadingDataAction;
            return {
                ...state,
                loadingData: false,
                dataLoaded: true,
                course: completeLoadingDataAction.course !== undefined
                    ? JSON.parse(JSON.stringify(completeLoadingDataAction.course))
                    : state.course,
                members: completeLoadingDataAction.members !== undefined
                    ? [...completeLoadingDataAction.members]
                    : state.members,
                studentOffers: completeLoadingDataAction.studentOffers !== undefined    
                    ? [...completeLoadingDataAction.studentOffers]
                    : state.studentOffers,
                accessRequestsInstances: completeLoadingDataAction.accessStudentRequestInstances !== undefined
                    ? [...completeLoadingDataAction.accessStudentRequestInstances]
                    : state.accessRequestsInstances,
                error: completeLoadingDataAction.error !== undefined
                    ? {detail: completeLoadingDataAction.error}
                    : state.error
            }
        case CourseDetailsEvents.SendingAccessRequest:
            return {
                ...state,
                sendingAccessRequest: true,
                errorSendingAccessRequest: undefined
            }
        case CourseDetailsEvents.CompleteSendingAccessRequest:
            const completeSendingAccessRequestAction: CompleteSendingAccessRequestAction = action as CompleteSendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequest: false,
                accessRequestsInstances: completeSendingAccessRequestAction.updatedAccessRequestInstances !== undefined
                    ? [...completeSendingAccessRequestAction.updatedAccessRequestInstances]
                    : state.accessRequestsInstances,
                errorSendingAccessRequest: completeSendingAccessRequestAction.error !== undefined
                    ? {detail: completeSendingAccessRequestAction.error} : state.errorSendingAccessRequest
            }
        case CourseDetailsEvents.RemovingAccessRequest:
            return {
                ...state,
                removingAccessRequest: true,
                errorRemovingAccessRequest: undefined
            }
        case CourseDetailsEvents.CompleteRemovingAccessRequest:
            const completeRemovingAccessRequestAction: CompleteRemovingAccessRequestAction = action as CompleteRemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequest: false,
                accessRequestsInstances: completeRemovingAccessRequestAction.updatedAccessRequestInstances !== undefined
                    ? [...completeRemovingAccessRequestAction.updatedAccessRequestInstances]
                    : state.accessRequestsInstances,
                errorRemovingAccessRequest: completeRemovingAccessRequestAction.error !== undefined
                    ? {detail: completeRemovingAccessRequestAction.error} : state.errorRemovingAccessRequest
            }
        default:
            return state;
    }
}

export default courseDetailsReducer;