import CourseProperties from "../../models/course_properties";
import {
    FinishedValidatingCourseUrlAction,
    ManageCourseUrlAction,
    ManageCourseUrlEvents,
    SetCourseUrlAction
} from "../actions/manageCourseUrlActions";
import Error from "../../models/error";
import {colors} from "@material-ui/core";
import {createMuiTheme, responsiveFontSizes, Theme} from "@material-ui/core/styles";
import {defaultTheme} from "../../values/defaultThemes";

export interface ManageCourseUrlState {
    routePath: string | undefined;
    courseNameFromUrl: string | null | undefined;

    course: CourseProperties | null;
    courseLoaded: boolean;
    loadingCourse: boolean;

    validCourseUrl: boolean;

    courseRouteTheme: Theme;

    error?: Error;
}

const initialState: ManageCourseUrlState = {
    routePath: undefined,
    courseNameFromUrl: undefined,

    course: null,
    courseLoaded: false,
    loadingCourse: false,

    courseRouteTheme: defaultTheme,

    validCourseUrl: false
};

export const isValidatingCourseUrl = (state: ManageCourseUrlState) => {
    return (!state.course && !state.courseLoaded && state.loadingCourse)
        || (!state.course && !state.courseLoaded && !state.loadingCourse);
}

export const routeContainsCourseName = (state: ManageCourseUrlState) => {
    return state.courseNameFromUrl !== null;
}

export const successfullyValidatedCourseUrl = (state: ManageCourseUrlState) => {
    return state.validCourseUrl && state.error === undefined;
}

export const hasCourseValidationError = (state: ManageCourseUrlState) => {
    return state.error !== undefined;
}

export const getCourseRouteTheme = (state: ManageCourseUrlState): Theme => {
    if (state.courseRouteTheme === undefined) {
        return defaultTheme;
    }
    return state.courseRouteTheme;
}

const manageCourseUrlReducer = (state: ManageCourseUrlState = initialState, action: ManageCourseUrlAction) => {
    switch (action.type) {
        case ManageCourseUrlEvents.SetCourseUrl:
            const setCourseUrlAction: SetCourseUrlAction = action as SetCourseUrlAction;
            return {
                ...state,
                routePath: setCourseUrlAction.path,
                courseNameFromUrl: setCourseUrlAction.courseStudent
            }
        case ManageCourseUrlEvents.ValidatingCourseUrl:
            return {
                ...state,
                course: null,
                courseLoaded: false,
                loadingCourse: true,
                validCourseUrl: false
            }
        case ManageCourseUrlEvents.FinishedValidatingCourseUrl:
            const finishedValidatingCourseUrlAction: FinishedValidatingCourseUrlAction = action as FinishedValidatingCourseUrlAction;
            return {
                ...state,
                course: finishedValidatingCourseUrlAction.course === null ? null : JSON.parse(JSON.stringify(action.course)),
                courseLoaded: true,
                loadingCourse: false,
                validCourseUrl: finishedValidatingCourseUrlAction.validCourseUrl,
                error: finishedValidatingCourseUrlAction.error,
                courseRouteTheme:
                    finishedValidatingCourseUrlAction.validCourseUrl && finishedValidatingCourseUrlAction.course
                        ?
                        responsiveFontSizes(
                            createMuiTheme({
                                palette: {
                                    primary: {
                                        main: finishedValidatingCourseUrlAction.course.settings.primaryColor
                                    },

                                    secondary: {
                                        main: finishedValidatingCourseUrlAction.course.settings.secondaryColor
                                    },

                                    text: {
                                        secondary: colors.blueGrey["700"],
                                    }
                                },
                                typography: {
                                    fontFamily: "Muli, sans-serif"
                                }
                            })
                        )
                        :
                        defaultTheme
            }
        default:
            return state;
    }
}

export default manageCourseUrlReducer;