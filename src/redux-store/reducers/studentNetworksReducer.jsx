import * as studentNetworksActions from '../actions/studentNetworksActions';
import * as authActions from '../actions/authActions';

const initState = {
    studentNetworks: [],
    loadingStudentNetworks: false,
    studentNetworksLoaded: false,
    page: 0,
    rowsPerPage: 5,

    searchText: '', // string typed to search student networks by name
    inSearchMode: false, // when the search button is clicked --> show X icon to exit search mode
    matchedStudentNetworks: [] // student networks that match
};

const studentNetworksReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case studentNetworksActions.LOADING_STUDENT_NETWORKS:
            return {
                ...state,
                loadingStudentNetworks: true,
                studentNetworksLoaded: false,
                studentNetworks: []
            };
        case studentNetworksActions.FINISHED_LOADING_STUDENT_NETWORKS:
            return {
                ...state,
                loadingStudentNetworks: false,
                studentNetworksLoaded: true,
                studentNetworks: action.hasOwnProperty('studentNetworks') ? [...action.studentNetworks] : []
            };
        case studentNetworksActions.STUDENT_NETWORKS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case studentNetworksActions.STUDENT_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case studentNetworksActions.STUDENT_NETWORKS_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedStudentNetworks: [...action.matchedStudentNetworks]
            };
        case studentNetworksActions.TOGGLE_SEARCH_MODE_IN_STUDENT_NETWORKS_TABLE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedStudentNetworks: [...action.matchedStudentNetworks]
            };
        case studentNetworksActions.STUDENT_NETWORKS_IN_TABLE_CHANGED:
            return {
                ...state,
                studentNetworks: [...action.studentNetworks]
            };
        default:
            return state;
    }
};

export default studentNetworksReducer;