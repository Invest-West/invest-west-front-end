import * as courseTeacherSettingsActions from "../actions/courseTeacherSettingsActions";
import * as manageANIDFromParamsActions from "../actions/manageCourseFromParamsActions";
import * as authActions from "../actions/authActions";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as utils from "../../utils/utils"

const initState = {
    courseAttributesEdited: null,

    website: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',

    addNewPledgeFAQ: false,
    addedPledgeQuestion: '',
    addedPledgeAnswer: '',
    expandedPledgeFAQ: null,
    editExpandedPledgeFAQ: false,
    editedPledgeQuestion: '',
    editedPledgeAnswer: ''
};

const courseTeacherSettingsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_INITIALIZE_COURSE_ATTRIBUTES_EDITED:

            let courseSettings = JSON.parse(JSON.stringify(action.course.settings));
            // if the defaultPitchExpiryDate property does not exist,
            // assign it with an initial value
            if (!courseSettings.hasOwnProperty('defaultPitchExpiryDate')) {
                courseSettings.defaultPitchExpiryDate = utils.getDateWithDaysFurtherThanToday(1);
            }

            return {
                ...state,
                courseAttributesEdited: courseSettings,
                website:  action.course.hasOwnProperty('website') ? action.course.website : '',
                description: action.course.hasOwnProperty('description') ? action.course.description : '',
                primaryColor: action.course.settings.primaryColor,
                secondaryColor: action.course.settings.secondaryColor
            };
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_CHANGED:
            const isPropertyOfCourseAttributes = action.isPropertyOfCourseAttributes;

            if (isPropertyOfCourseAttributes) {
                return {
                    ...state,
                    courseAttributesEdited: {
                        ...state.courseAttributesEdited,
                        [action.name]: action.value
                    }
                };
            }
            else {
                return {
                    ...state,
                    [action.name]: action.value
                };
            }
        case manageANIDFromParamsActions.STUDENT_NETWORK_PROPERTIES_CHANGED:
            if (action.key === 'settings') {
                return {
                    ...state,
                    courseAttributesEdited: JSON.parse(JSON.stringify(action.value)),
                    primaryColor: action.value.primaryColor,
                    secondaryColor: action.value.secondaryColor,
                    expandedPledgeFAQ:
                        !action.value.hasOwnProperty(DB_CONST.PLEDGE_FAQS_CHILD)
                            ?
                            null
                            :
                            !state.expandedPledgeFAQ
                                ?
                                null
                                :
                                action.value[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(pledge => pledge.id === state.expandedPledgeFAQ.id) !== -1
                                    ?
                                    action.value[DB_CONST.PLEDGE_FAQS_CHILD][action.value[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(pledge => pledge.id === state.expandedPledgeFAQ.id)]
                                    :
                                    state.expandedPledgeFAQ
                }
            }
            else {
                return {
                    ...state,
                    [action.key]: action.value
                }
            }
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED:
            return {
                ...state,
                expandedPledgeFAQ: action.expandedPledgeFAQ,
                editExpandedPledgeFAQ: action.editExpandedPledgeFAQ
            };
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ:
            return {
                ...state,
                addNewPledgeFAQ: !state.addNewPledgeFAQ,
                addedPledgeQuestion: '',
                addedPledgeAnswer: ''
            };
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ:
            return {
                ...state,
                editExpandedPledgeFAQ: !state.editExpandedPledgeFAQ,
                editedPledgeQuestion: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.question : '',
                editedPledgeAnswer: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.answer : ''
            };
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COURSE_DETAILS:
            return {
                ...state,
                [action.name]: action.value
            };
        case courseTeacherSettingsActions.COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COLOR:
            return {
                ...state,
                primaryColor: action.field === "primaryColor" ? action.color : state.primaryColor,
                secondaryColor: action.field === "secondaryColor" ? action.color : state.secondaryColor
            };
        default:
            return state;
    }
};

export default courseTeacherSettingsReducer;