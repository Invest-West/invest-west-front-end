import * as manageSystemCoursesActions from '../actions/manageSystemCoursesActions';
import * as authActions from '../actions/authActions';

const initState = {
    systemCourses: [],
    loadingCourses: false,
    coursesLoaded: false
};

const manageSystemCoursesReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageSystemCoursesActions.LOADING_SYSTEM_COURSES:
            return {
                ...state,
                systemCourses: [],
                loadingCourses: true,
                coursesLoaded: false
            };
        case manageSystemCoursesActions.FINISHED_LOADING_SYSTEM_COURSES:
            return {
                ...state,
                systemCourses: action.courses,
                loadingCourses: false,
                coursesLoaded: true
            };
        case manageSystemCoursesActions.SYSTEM_COURSES_CHANGED:
            return {
                ...state,
                systemCourses: action.courses
            };
        default:
            return state;
    }
}

export default manageSystemCoursesReducer;