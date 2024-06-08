import * as manageANIDFromParamsActions from '../actions/manageCourseFromParamsActions';

const initState = {
    courseStudent: null,
    anid: null,

    courseProperties: null,
    coursePropertiesLoaded: false,
    studentNetworkBeingLoaded: false,

    expectedPath: null,
    currentPath: null,
    shouldLoadOtherData: false
};

const manageCourseFromParamsReducer = (state = initState, action) => {
    switch (action.type) {
        case manageANIDFromParamsActions.SET_GROUP_STUDENT_NAME_FROM_PARAMS:
            return {
                ...state,
                courseStudent: action.courseStudent,
                courseProperties: null,
                coursePropertiesLoaded: false,
                studentNetworkBeingLoaded: false
            };
        case manageANIDFromParamsActions.SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING:
            return {
                ...state,
                expectedPath: action.expectedPath,
                currentPath: action.currentPath
            };
        case manageANIDFromParamsActions.LOADING_STUDENT_NETWORK:
            return {
                ...state,
                courseProperties: null,
                coursePropertiesLoaded: false,
                studentNetworkBeingLoaded: true,
                shouldLoadOtherData: false
            };
        case manageANIDFromParamsActions.STUDENT_NETWORK_LOADED:
            return {
                ...state,
                courseProperties: JSON.parse(JSON.stringify(action.studentNetwork)),
                coursePropertiesLoaded: true,
                studentNetworkBeingLoaded: false,
                shouldLoadOtherData: action.shouldLoadOtherData
            };
        case manageANIDFromParamsActions.STUDENT_NETWORK_PROPERTIES_CHANGED:
            return {
                ...state,
                courseProperties: {
                    ...state.courseProperties,
                    [action.key]: action.value
                }
            };
        default:
            return state;
    }
};

export default manageCourseFromParamsReducer;

