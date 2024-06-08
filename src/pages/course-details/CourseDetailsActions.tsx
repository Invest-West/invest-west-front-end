import {Action, ActionCreator, Dispatch} from "redux";
import CourseProperties from "../../models/course_properties";
import {InvitedStudentWithProfile} from "../../models/invited_student";
import {StudentProjectInstance} from "../../models/studentProject";
import {AppState} from "../../redux-store/reducers";
import CourseRepository from "../../api/repositories/CourseRepository";
import StudentOfferRepository, {FetchStudentProjectsOrderByOptions} from "../../api/repositories/StudentOfferRepository";
import AccessStudentRequest, {AccessStudentRequestInstance} from "../../models/access_request";
import Teacher, {isProf} from "../../models/teacher";
import AccessStudentRequestRepository from "../../api/repositories/AccessStudentRequestRepository";

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
    members?: InvitedStudentWithProfile[];
    studentOffers?: StudentProjectInstance[];
    accessStudentRequestInstances?: AccessStudentRequestInstance[];
    error?: string;
}

export interface CompleteSendingAccessRequestAction extends CourseDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessStudentRequestInstance[]
}

export interface CompleteRemovingAccessRequestAction extends CourseDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessStudentRequestInstance[]
}

export const loadData: ActionCreator<any> = (courseStudent: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessRequestsInstances
        } = getState().CourseDetailsLocalState;

        dispatch({
            type: CourseDetailsEvents.LoadingData
        });

        const currentStudent = getState().StudentAuthenticationState.currentStudent;

        const completeAction: CompleteLoadingDataAction = {
            type: CourseDetailsEvents.CompleteLoadingData
        }

        if (!currentStudent) {
            completeAction.error = "Unauthenticated student.";
            return dispatch(completeAction);
        }

        if (courseStudent === undefined) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const courseResponse = await new CourseRepository().getCourse(courseStudent);
            const course: CourseProperties = courseResponse.data;

            const studentsResponse = await new CourseRepository().fetchCourseMembers(course.anid);
            const students: InvitedStudentWithProfile[] = studentsResponse.data;

            const offersResponse = await new StudentOfferRepository().fetchStudentOffers({
                phase: "all",
                course: course.anid,
                orderBy: FetchStudentProjectsOrderByOptions.Course
            });
            const offers: StudentProjectInstance[] = offersResponse.data;

            const teacher: Teacher | null = isProf(currentStudent);
            if (!teacher || (teacher && !teacher.superTeacher)) {
                // student is an teacher, investor, or course teacher
                // and access requests have not been fetched
                if (!accessRequestsInstances) {
                    const accessRequestInstancesResponse = await new AccessStudentRequestRepository().fetchStudentAccessRequests({
                        student: currentStudent.id,
                        orderBy: "student"
                    });
                    completeAction.accessStudentRequestInstances = accessRequestInstancesResponse.data;
                }
            }

            completeAction.course = course;
            completeAction.members = students;
            completeAction.studentOffers = offers;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const sendAccessRequest: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().StudentAuthenticationState.currentStudent;
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
            const response = await new AccessStudentRequestRepository().createStudentAccessRequest(currentStudent.id, course.anid);
            const accessStudentRequestInstance: AccessStudentRequestInstance = response.data;
            const currentStudentAccessRequestInstances: AccessStudentRequestInstance[] | undefined = getState().ExploreCoursesLocalState.accessRequestsInstances;
            if (currentStudentAccessRequestInstances !== undefined) {
                completeAction.updatedAccessRequestInstances = [
                    ...currentStudentAccessRequestInstances,
                    accessStudentRequestInstance
                ];
            } else {
                completeAction.updatedAccessRequestInstances = [accessStudentRequestInstance];
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
        const currentStudent = getState().StudentAuthenticationState.currentStudent;
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
            const currentStudentAccessRequestInstances: AccessStudentRequestInstance[] | undefined = getState().CourseDetailsLocalState.accessRequestsInstances;
            if (!currentStudentAccessRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentStudentAccessRequestInstances.findIndex(
                accessStudentRequestInstance => accessStudentRequestInstance.course.anid === course.anid && accessStudentRequestInstance.student.id === currentStudent.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessRequestInstances: AccessStudentRequestInstance[] = [...currentStudentAccessRequestInstances];
            const accessRequest: AccessStudentRequest = updatedAccessRequestInstances[accessRequestIndex].request;
            await new AccessStudentRequestRepository().removeStudentAccessRequest(accessRequest.id);
            updatedAccessRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessRequestInstances = updatedAccessRequestInstances;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}