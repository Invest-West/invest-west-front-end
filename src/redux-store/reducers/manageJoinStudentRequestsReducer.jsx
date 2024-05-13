import * as manageJoinStudentRequestsActions from '../actions/manageJoinStudentRequestsActions';
import * as authActions from '../actions/authActions';

const initState = {
    joinStudentRequests: [],
    loadingJoinStudentRequests: false,
    joinStudentRequestsLoaded: false,

    searchText: '',
    inSearchMode: false,
    matchedJoinStudentRequests: [],

    page: 0,
    rowsPerPage: 5
};

const manageJoinStudentRequestsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_LOADING_JOIN_STUDENTS_REQUESTS:
            return {
                ...state,
                joinStudentRequests: [],
                loadingJoinStudentRequests: true,
                joinStudentRequestsLoaded: false
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_FINISHED_LOADING_JOIN_STUDENTS_REQUESTS:
            return {
                ...state,
                joinStudentRequests: [...action.joinStudentRequests],
                loadingJoinStudentRequests: false,
                joinStudentRequestsLoaded: true
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedJoinStudentRequests: action.matchedJoinStudentRequests
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedJoinStudentRequests: action.matchedJoinStudentRequests
            };
        case manageJoinStudentRequestsActions.MANAGE_JOIN_STUDENTS_REQUESTS_CHANGED:
            return {
                ...state,
                joinStudentRequests: [...action.joinStudentRequests]
            };
        default:
            return state;
    }
};

export default manageJoinStudentRequestsReducer;