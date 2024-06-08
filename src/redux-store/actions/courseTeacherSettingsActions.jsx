import firebase from "../../firebase/firebaseApp";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as myUtils from "../../utils/utils";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";

export const COURSE_TEACHER_SETTINGS_INITIALIZE_COURSE_ATTRIBUTES_EDITED = 'COURSE_TEACHER_SETTINGS_INITIALIZE_COURSE_ATTRIBUTES_EDITED';
export const initializeCourseAttributesEdited = () => {
    return (dispatch, getState) => {
        dispatch({
            type: COURSE_TEACHER_SETTINGS_INITIALIZE_COURSE_ATTRIBUTES_EDITED,
            course: getState().manageCourseFromParams.courseProperties
        });
    }
};

export const COURSE_TEACHER_SETTINGS_CHANGED = 'COURSE_TEACHER_SETTINGS_CHANGED';
export const handleInputChanged = event => {
    return (dispatch, getState) => {
        const courseProperties = getState().manageCourseFromParams.courseProperties;
        const courseAttributesEdited = getState().courseAdminSettings.courseAttributesEdited;
        const target = event.target;

        let isPropertyOfCourseAttributes = false;

        let updateValue = null;
        let shouldUpdateDatabase = false;

        switch (target.type) {
            case 'checkbox':
                if (courseAttributesEdited.hasOwnProperty(target.name)) {
                    shouldUpdateDatabase = true;
                    updateValue = target.checked;
                }
                break;
            case 'radio':
                if (courseAttributesEdited.hasOwnProperty(target.name)) {
                    shouldUpdateDatabase = true;
                    updateValue = !isNaN(target.value) ? parseInt(target.value) : target.value;
                }
                break;
            case 'text':
                if (target.name !== "primaryColor"
                    && target.name !== "secondaryColor"
                    && courseAttributesEdited.hasOwnProperty(target.name)
                ) {
                    isPropertyOfCourseAttributes = true;
                    shouldUpdateDatabase = true;
                    updateValue = target.value;
                }
                break;
            case 'textarea':
                if (courseAttributesEdited.hasOwnProperty(target.name)) {
                    isPropertyOfCourseAttributes = true;
                }
                break;
            default:
                return;
        }

        if (shouldUpdateDatabase) {
            realtimeDBUtils
                .updateCoursePropertiesSetting({
                    anid: courseProperties.anid,
                    field: target.name,
                    value: updateValue
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not update this field.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }

        dispatch({
            type: COURSE_TEACHER_SETTINGS_CHANGED,
            name: target.name,
            value: target.type === 'checkbox' ? target.checked : target.value,
            isPropertyOfCourseAttributes
        });
    }
};

export const handlePitchExpiryDateChanged = date => {
    return (dispatch, getState) => {
        if (date && date === "Invalid Date") {
            dispatch({
                type: COURSE_TEACHER_SETTINGS_CHANGED,
                isPropertyOfCourseAttributes: true,
                name: "defaultPitchExpiryDate",
                value: NaN
            });
            return;
        }

        dispatch({
            type: COURSE_TEACHER_SETTINGS_CHANGED,
            isPropertyOfCourseAttributes: true,
            name: "defaultPitchExpiryDate",
            value:
                !date
                    ?
                    null
                    :
                    date.getTime()
        });
    }
}

export const handleSavePitchExpiryDate = () => {
    return (dispatch, getState) => {

        const courseProperties = getState().manageCourseFromParams.courseProperties;
        const courseSettings = getState().courseAdminSettings.courseAttributesEdited;

        realtimeDBUtils
            .updateCoursePropertiesSetting({
                anid: courseProperties.anid,
                field: "defaultPitchExpiryDate",
                value: courseSettings.defaultPitchExpiryDate
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not update this field.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
}

export const handleCancelEditingPitchExpiryDate = () => {
    return (dispatch, getState) => {
        const courseProperties = getState().manageCourseFromParams.courseProperties;

        dispatch({
            type: COURSE_TEACHER_SETTINGS_CHANGED,
            isPropertyOfCourseAttributes: true,
            name: "defaultPitchExpiryDate",
            value:
                !courseProperties.settings.hasOwnProperty('defaultPitchExpiryDate')
                    ?
                    myUtils.getDateWithDaysFurtherThanToday(1)
                    :
                    courseProperties.settings.defaultPitchExpiryDate
        });
    }
}

export const COURSE_TEACHER_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED = 'COURSE_TEACHER_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED';
export const handleExpandPledgeFAQPanel = (FAQ, isExpanded) => {
    return (dispatch, getState) => {

        const expandedPledgeFAQ = getState().courseAdminSettings.expandedPledgeFAQ;

        if (isExpanded) {
            dispatch({
                type: COURSE_TEACHER_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                expandedPledgeFAQ: FAQ,
                editExpandedPledgeFAQ: false
            });
        } else {
            if (expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id) {
                dispatch({
                    type: COURSE_TEACHER_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                    expandedPledgeFAQ: null,
                    editExpandedPledgeFAQ: false
                });
            }
        }
    }
};

export const COURSE_TEACHER_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ = 'COURSE_TEACHER_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ';
export const toggleEditExpandedPledgeFAQ = () => {
    return {
        type: COURSE_TEACHER_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
    }
};

export const COURSE_TEACHER_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ = 'COURSE_TEACHER_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ';
export const toggleAddNewPledgeFAQ = () => {
    return {
        type: COURSE_TEACHER_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
    }
};

export const submitNewPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            addedPledgeQuestion,
            addedPledgeAnswer
        } = getState().courseAdminSettings;

        const courseProperties = getState().manageCourseFromParams.courseProperties;

        const courseAttributesEdited = Object.assign({}, getState().courseAdminSettings.courseAttributesEdited);

        if (addedPledgeQuestion.trim().length === 0 || addedPledgeAnswer.trim().length === 0) {
            return;
        }

        const faq = {
            id: myUtils.getCurrentDate(),
            question: addedPledgeQuestion,
            answer: addedPledgeAnswer
        };

        if (courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]) {
            courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].push(faq);
        } else {
            courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD] = [faq];
        }

        firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(courseProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: COURSE_TEACHER_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
                });
            });
    }
};

export const saveEditedPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            courseAttributesEdited,
            expandedPledgeFAQ,
            editedPledgeQuestion,
            editedPledgeAnswer
        } = getState().courseAdminSettings;

        const courseProperties = getState().manageCourseFromParams.courseProperties;

        if (editedPledgeQuestion.trim().length === 0 || editedPledgeAnswer.trim().length === 0) {
            return;
        }

        const editedFAQ = {
            id: expandedPledgeFAQ.id,
            question: editedPledgeQuestion,
            answer: editedPledgeAnswer
        };

        let index = courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD][index] = editedFAQ;

        firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(courseProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: COURSE_TEACHER_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
                });
            });
    }
};

export const deleteExistingPledgeFAQ = () => {
    return (dispatch, getState) => {
        const expandedPledgeFAQ = getState().courseAdminSettings.expandedPledgeFAQ;
        const courseAttributesEdited = Object.assign({}, getState().courseAdminSettings.courseAttributesEdited);

        const courseProperties = getState().manageCourseFromParams.courseProperties;

        let index = courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].splice(index, 1);

        firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(courseProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(courseAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]);
    }
};

export const saveCourseDetails = (field, value) => {
    return (dispatch, getState) => {
        const course = getState().manageCourseFromParams.courseProperties;

        firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(course.anid)
            .child(field)
            .set(value);
    }
};

export const COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COURSE_DETAILS = 'COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COURSE_DETAILS';
export const cancelEditingCourseDetails = (field) => {
    return (dispatch, getState) => {
        const course = getState().manageCourseFromParams.courseProperties;

        dispatch({
            type: COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COURSE_DETAILS,
            name: field,
            value: course[field]
        });
    }
};

export const saveColor = field => {
    return (dispatch, getState) => {
        const course = getState().manageCourseFromParams.courseProperties;
        const color = field === "primaryColor" ? getState().courseAdminSettings.primaryColor : getState().courseAdminSettings.secondaryColor;

        firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(course.anid)
            .child('settings')
            .child(field)
            .set(color.toUpperCase());
    }
};

export const COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COLOR = 'COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COLOR';
export const cancelEditingColor = field => {
    return (dispatch, getState) => {
        const course = getState().manageCourseFromParams.courseProperties;
        const color = field === "primaryColor" ? course.settings.primaryColor : course.settings.secondaryColor;

        dispatch({
            type: COURSE_TEACHER_SETTINGS_CANCEL_EDITING_COLOR,
            field,
            color
        });
    }
};