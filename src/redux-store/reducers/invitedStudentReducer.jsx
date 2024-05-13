import * as invitedStudentsActions from '../actions/invitedStudentsActions';
import * as authActions from '../actions/authActions';
import {FILTER_COURSE_MEMBERS_ALL, FILTER_REGISTRATION_STATUS_ALL} from '../../pages/admin/components/InvitedStudents';

const initState = {
    invitedStudents: [],
    invitedStudentsLoaded: false,
    invitedStudentsBeingLoaded: false,

    invitedStudentsPage: 0,
    invitedStudentsRowsPerPage: 5,

    filterRegistrationStatus: FILTER_REGISTRATION_STATUS_ALL,
    filterStudentType: 0, // all student types
    filterCourse: "null", // no course selected --> all
    filterMembers: FILTER_COURSE_MEMBERS_ALL, // display all members (including home and foreign members) for course teachers

    invitedStudentSearchText: '',
    invitedStudentsInSearchMode: false,

    requestingCsv: false,

    addingMembersFromOneCourseToAnotherCourse: false,

    matchedInvitedStudents: []
};

const invitedStudentsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case invitedStudentsActions.LOADING_INVITED_STUDENTS:
            return {
                ...state,
                invitedStudents: [],
                invitedStudentsLoaded: false,
                invitedStudentsBeingLoaded: true
            };
        case invitedStudentsActions.FINISHED_LOADING_INVITED_STUDENTS:
            return {
                ...state,
                invitedStudents: [...action.invitedStudents],
                matchedInvitedStudents: [...action.invitedStudents],
                invitedStudentsLoaded: true,
                invitedStudentsBeingLoaded: false
            };
        case invitedStudentsActions.INVITED_STUDENTS_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                invitedStudentsInSearchMode: !state.invitedStudentsInSearchMode,
                invitedStudentSearchText: state.invitedStudentsInSearchMode ? '' : state.invitedStudentSearchText,
                invitedStudentsPage: 0,
                matchedInvitedStudents: action.matchedInvitedStudents
            };
        case invitedStudentsActions.INVITED_STUDENTS_SEARCH_VARIABLE_CHANGED:
            return {
                ...state,
                [action.name]: action.value,
                matchedInvitedStudents: action.matchedInvitedStudents,
                invitedStudentsPage: 0
            };
        case invitedStudentsActions.INVITED_STUDENTS_CHANGE_PAGE:
            return {
                ...state,
                invitedStudentsPage: action.newPage
            };
        case invitedStudentsActions.INVITED_STUDENTS_CHANGE_ROWS_PER_PAGE:
            return {
                ...state,
                invitedStudentsRowsPerPage: parseInt(action.rows, 10),
                invitedStudentsPage: 0
            };
        case invitedStudentsActions.INVITED_STUDENTS_CHANGED:
            return {
                ...state,
                invitedStudents: action.invitedStudents,
                matchedInvitedStudents: action.matchedInvitedStudents
            };
        case invitedStudentsActions.INVITED_STUDENTS_REQUESTING_CSV_STATE_CHANGED:
            return {
                ...state,
                requestingCsv: action.value
            }
        case invitedStudentsActions.INVITED_STUDENTS_ADDING_MEMBERS_FROM_ONE_COURSE_TO_ANOTHER_COURSE_STATE_CHANGED:
            return {
                ...state,
                addingMembersFromOneCourseToAnotherCourse: action.value
            }
        default:
            return state;
    }
};

export default invitedStudentsReducer;