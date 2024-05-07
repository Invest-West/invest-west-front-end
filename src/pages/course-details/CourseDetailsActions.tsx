import {Action, ActionCreator, Dispatch} from "redux";
import CourseProperties from "../../models/course_properties";
import {InvitedUserWithProfile} from "../../models/invited_user";
import {ProjectInstance} from "../../models/project";
import {AppState} from "../../redux-store/reducers";
import CourseRepository from "../../api/repositories/CourseRepository";
import OfferRepository, {FetchProjectsOrderByOptions} from "../../api/repositories/OfferRepository";
import AccessRequest, {AccessRequestInstance} from "../../models/access_request";
import Admin, {isAdmin} from "../../models/admin";
import AccessRequestRepository from "../../api/repositories/AccessRequestRepository";

export enum CourseDetailsEvents {
    LoadingData = "CourseDetailsEvents.LoadData",
    CompleteLoadingData = "CourseDetailsEvents.CompleteLoadingData",
    SendingAccessRequest = "CourseDetailsEvents.SendingAccessRequest",
    CompleteSendingAccessRequest = "CourseDetailsEvents.CompleteSendingAccessRequest",
    RemovingAccessRequest = "CourseDetailsEvents.RemovingAccessRequest",
    CompleteRemovingAccessRequest = "CourseDetailsEvents.CompleteRemovingAccessRequest"
}

export interface CourseDetailsAction extends Action {

}

export interface CompleteLoadingDataAction extends CourseDetailsAction {
    course?: CourseProperties;
    members?: InvitedUserWithProfile[];
    offers?: ProjectInstance[];
    accessRequestInstances?: AccessRequestInstance[];
    error?: string;
}

export interface CompleteSendingAccessRequestAction extends CourseDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export interface CompleteRemovingAccessRequestAction extends CourseDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export const loadData: ActionCreator<any> = (courseUserName: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessRequestsInstances
        } = getState().CourseDetailsLocalState;

        dispatch({
            type: CourseDetailsEvents.LoadingData
        });

        const currentUser = getState().AuthenticationState.currentUser;

        const completeAction: CompleteLoadingDataAction = {
            type: CourseDetailsEvents.CompleteLoadingData
        }

        if (!currentUser) {
            completeAction.error = "Unauthenticated user.";
            return dispatch(completeAction);
        }

        if (courseUserName === undefined) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const courseResponse = await new CourseRepository().getCourse(courseUserName);
            const course: CourseProperties = courseResponse.data;

            const studentsResponse = await new CourseRepository().fetchCourseMembers(course.anid);
            const students: InvitedStudentWithProfile[] = studentsResponse.data;

            const offersResponse = await new OfferRepository().fetchOffers({
                phase: "all",
                course: course.anid,
                orderBy: FetchProjectsOrderByOptions.Course
            });
            const offers: ProjectInstance[] = offersResponse.data;

            const admin: Admin | null = isAdmin(currentStudent);
            if (!admin || (admin && !admin.superAdmin)) {
                // student is an issuer, investor, or course admin
                // and access requests have not been fetched
                if (!accessRequestsInstances) {
                    const accessRequestInstancesResponse = await new AccessRequestRepository().fetchAccessRequests({
                        student: currentStudent.id,
                        orderBy: "student"
                    });
                    completeAction.accessRequestInstances = accessRequestInstancesResponse.data;
                }
            }

            completeAction.course = course;
            completeAction.students = students;
            completeAction.offers = offers;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const sendAccessRequest: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().AuthenticationState.currentStudent;
        if (!currentStudent) {
            return;
        }

        const course = getState().CourseDetailsLocalState.course;

        dispatch({
            type: CourseDetailsEvents.SendingAccessRequest
        });

        const completeAction: CompleteSendingAccessRequestAction = {
            type: CourseDetailsEvents.CompleteSendingAccessRequest
        };

        if (!course) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const response = await new AccessRequestRepository().createAccessRequest(currentStudent.id, course.anid);
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
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const removeAccessRequest: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().AuthenticationState.currentStudent;
        if (!currentStudent) {
            return;
        }

        const course = getState().CourseDetailsLocalState.course;

        dispatch({
            type: CourseDetailsEvents.RemovingAccessRequest
        });

        const completeAction: CompleteRemovingAccessRequestAction = {
            type: CourseDetailsEvents.CompleteRemovingAccessRequest
        };

        if (!course) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().CourseDetailsLocalState.accessRequestsInstances;
            if (!currentAccessRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentAccessRequestInstances.findIndex(
                accessRequestInstance => accessRequestInstance.course.anid === course.anid && accessRequestInstance.user.id === currentUser.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessRequestInstances: AccessRequestInstance[] = [...currentAccessRequestInstances];
            const accessRequest: AccessRequest = updatedAccessRequestInstances[accessRequestIndex].request;
            await new AccessRequestRepository().removeAccessRequest(accessRequest.id);
            updatedAccessRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessRequestInstances = updatedAccessRequestInstances;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}