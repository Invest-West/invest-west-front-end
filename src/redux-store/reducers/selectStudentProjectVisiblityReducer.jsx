import * as selectStudentProjectVisibilityActions from '../actions/selectProjectVisibilityActions';
import * as authActions from '../actions/authActions';

const initState = {
    studentProjectVisibilitySetting: -1,
    studentProject: null
};

const selectStudentProjectVisibilityReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case selectStudentProjectVisibilityActions.SELECT_STUDENT_PROJECT_VISIBILITY_SET_STUDENT_PROJECT:
            return {
                ...initState,
                studentProject: JSON.parse(JSON.stringify(action.studentProject))
            };
        case selectStudentProjectVisibilityActions.HANDLE_STUDENT_PROJECT_VISIBILITY_SETTING_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        default:
            return state;
    }
}

export default selectStudentProjectVisibilityReducer;