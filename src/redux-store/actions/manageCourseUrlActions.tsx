import {Action, ActionCreator, Dispatch} from "redux";
import CourseProperties from "../../models/course_properties";
import Error from "../../models/error";
import {AppState} from "../reducers";
import CourseRepository from "../../api/repositories/CourseRepository";

export enum ManageCourseUrlEvents {
    SetCourseUrl = "ManageCourseUrlEvents.SetCourseUrl",
    ValidatingCourseUrl = "ManageCourseUrlEvents.ValidatingCourseUrl",
    FinishedValidatingCourseUrl = "ManageCourseUrlEvents.FinishedValidatingCourseUrl"
}

export interface ManageCourseUrlAction extends Action {
    path?: string;
    courseStudentName?: string | null;
    course?: CourseProperties | null;
    validCourseUrl?: boolean;
    error?: Error
}

export interface SetCourseUrlAction extends ManageCourseUrlAction {
    path: string;
    courseStudentName: string | null;
}

export interface ValidatingCourseUrlAction extends ManageCourseUrlAction {
}

export interface FinishedValidatingCourseUrlAction extends ManageCourseUrlAction {
    course: CourseProperties | null;
    validCourseUrl: boolean;
    error?: Error
}

export const validateCourseUrl: ActionCreator<any> = (path: string, courseStudentName: string | null) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            routePath,
            courseNameFromUrl,
            course,
            loadingCourse,
            courseLoaded
        } = getState().ManageCourseUrlState;

        const setCourseUrlAction: SetCourseUrlAction = {
            type: ManageCourseUrlEvents.SetCourseUrl,
            path,
            courseStudentName
        }

        let shouldValidateCourseUrl = false;

        // routePath or courseNameFromUrl or both of them have not been defined
        if (routePath === undefined || courseNameFromUrl === undefined) {
            shouldValidateCourseUrl = true;
        }
        // routePath and courseNameFromUrl have been defined
        else {
            if (courseNameFromUrl !== courseStudentName) {
                shouldValidateCourseUrl = true;
            }
        }

        // course has not been loaded
        // or course has been loaded but a new course name is set in the url
        // --> continue validating course url
        if ((!course && !loadingCourse && !courseLoaded)
            || (!(!course && !loadingCourse && !courseLoaded) && shouldValidateCourseUrl)
        ) {
            dispatch(setCourseUrlAction);

            const validatingCourseUrlAction: ValidatingCourseUrlAction = {
                type: ManageCourseUrlEvents.ValidatingCourseUrl
            }

            dispatch(validatingCourseUrlAction);

            const finishedLoadingCourseUrlAction: FinishedValidatingCourseUrlAction = {
                type: ManageCourseUrlEvents.FinishedValidatingCourseUrl,
                course: null,
                validCourseUrl: false
            }

            // course name is not specified in the url
            if (!courseStudentName) {
                finishedLoadingCourseUrlAction.validCourseUrl = true;
                return dispatch(finishedLoadingCourseUrlAction);
            }

            try {
                const response = await new CourseRepository().getCourse(courseStudentName);
                const retrievedCourse: CourseProperties | null = response.data;
                finishedLoadingCourseUrlAction.course = retrievedCourse;
                finishedLoadingCourseUrlAction.validCourseUrl = retrievedCourse !== null;
                return dispatch(finishedLoadingCourseUrlAction);
            } catch (error) {
                finishedLoadingCourseUrlAction.error = {
                    detail: error.toString()
                }
                return dispatch(finishedLoadingCourseUrlAction);
            }
        }
    }
}