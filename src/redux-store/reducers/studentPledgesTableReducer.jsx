import * as studentPledgesTableActions from '../actions/studentPledgesTableActions';
import * as authActions from '../actions/authActions';

const initState = {
    studentProject: null,

    studentPledges: [],
    studentPledgesLoaded: false,
    loadingStudentPledges: false,

    searchText: '',
    inSearchMode: false,
    matchedStudentPledges: [],

    page: 0,
    rowsPerPage: 10
};

const studentPledgesTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_SET_PROJECT:
            return {
                ...initState,
                studentProject: JSON.parse(JSON.stringify(action.studentProject))
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_LOADING_PLEDGES:
            return {
                ...state,
                studentPledges: [],
                studentPledgesLoaded: false,
                loadingStudentPledges: true
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES:
            return {
                ...state,
                studentPledges: [...action.studentPledges],
                studentPledgesLoaded: true,
                loadingStudentPledges: false
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value,
                page: 0
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedStudentPledges: [...action.matchedStudentPledges]
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedStudentPledges: [...action.matchedStudentPledges]
            };
        case studentPledgesTableActions.MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED:
            return {
                ...state,
                studentPledges: [...action.studentPledges]
            };
        default:
            return state;
    }
};

export default studentPledgesTableReducer;