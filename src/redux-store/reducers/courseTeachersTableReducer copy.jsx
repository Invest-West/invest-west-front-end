import * as groupAdminsTableActions from '../actions/groupAdminsTableActions';
import * as authActions from '../actions/authActions';
import {ADD_NEW_COURSE_ADMIN_STATUS_NONE} from '../../pages/admin/components/CourseAdminsTable';

const initState = {
    tableCourse: null,

    groupAdmins: [],
    groupAdminsLoaded: false,
    loadingCourseAdmins: false,

    searchText: '',
    inSearchMode: false,

    page: 0,
    rowsPerPage: 10,

    addNewCourseAdminDialogOpen: false,
    newCourseAdminEmail: '',
    addNewCourseAdminStatus: ADD_NEW_COURSE_ADMIN_STATUS_NONE
};

const groupAdminsTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_SET_COURSE:
            return {
                ...initState,
                tableCourse: JSON.parse(JSON.stringify(action.group))
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_LOADING_COURSE_ADMINS:
            return {
                ...state,
                groupAdmins: [],
                groupAdminsLoaded: false,
                loadingCourseAdmins: true
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS:
            return {
                ...state,
                groupAdmins: [...action.groupAdmins],
                groupAdminsLoaded: true,
                loadingCourseAdmins: false
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.newPage
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                searchText: state.inSearchMode ? '' : state.searchText,
                inSearchMode: !state.inSearchMode
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_HANDLE_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_TOGGLE_ADD_NEW_COURSE_ADMIN_DIALOG:
            return {
                ...state,
                addNewCourseAdminDialogOpen: !state.addNewCourseAdminDialogOpen,
                newCourseAdminEmail: '',
                addNewCourseAdminStatus: ADD_NEW_COURSE_ADMIN_STATUS_NONE
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_CHANGED:
            return {
                ...state,
                groupAdmins: [...action.groupAdmins]
            };
        case groupAdminsTableActions.COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED:
            return {
                ...state,
                addNewCourseAdminStatus: action.status
            };
        default:
            return state;
    }
};

export default groupAdminsTableReducer;