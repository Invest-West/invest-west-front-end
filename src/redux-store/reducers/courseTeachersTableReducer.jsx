import * as courseTeachersTableActions from '../actions/courseTeacherTableActions';
import * as authActions from '../actions/authActions';
import {ADD_NEW_COURSE_TEACHER_STATUS_NONE} from '../../pages/admin/components/CourseTeachersTable';

const initState = {
    tableCourse: null,

    courseTeachers: [],
    courseTeachersLoaded: false,
    loadingCourseTeachers: false,

    searchText: '',
    inSearchMode: false,

    page: 0,
    rowsPerPage: 10,

    addNewCourseTeacherDialogOpen: false,
    newCourseTeacherEmail: '',
    addNewCourseTeacherStatus: ADD_NEW_COURSE_TEACHER_STATUS_NONE
};

const courseTeachersTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_SET_COURSE:
            return {
                ...initState,
                tableCourse: JSON.parse(JSON.stringify(action.course))
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_LOADING_COURSE_TEACHERS:
            return {
                ...state,
                courseTeachers: [],
                courseTeachersLoaded: false,
                loadingCourseTeachers: true
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS:
            return {
                ...state,
                courseTeachers: [...action.courseTeachers],
                courseTeachersLoaded: true,
                loadingCourseTeachers: false
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.newPage
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                searchText: state.inSearchMode ? '' : state.searchText,
                inSearchMode: !state.inSearchMode
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_HANDLE_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_TOGGLE_ADD_NEW_COURSE_TEACHER_DIALOG:
            return {
                ...state,
                addNewCourseTeacherDialogOpen: !state.addNewCourseTeacherDialogOpen,
                newCourseTeacherEmail: '',
                addNewCourseTeacherStatus: ADD_NEW_COURSE_TEACHER_STATUS_NONE
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_CHANGED:
            return {
                ...state,
                courseTeachers: [...action.courseTeachers]
            };
        case courseTeachersTableActions.COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED:
            return {
                ...state,
                addNewCourseTeacherStatus: action.status
            };
        default:
            return state;
    }
};

export default courseTeachersTableReducer;