import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as ROUTES from '../../router/routes';
import * as utils from '../../utils/utils';

export const SET_ORIGINAL_STUDENT_AND_EDITED_STUDENT = 'SET_ORIGINAL_STUDENT_AND_EDITED_STUDENT';
export const setOriginalStudentAndEditedStudent = student => {
    return (dispatch, getState) => {
        const currentStudent = getState().auth.student;
        const previouslySetStudent = getState().editStudent.originalStudent;

        let allowEditing = true;

        // student is set to null
        if (!student) {
            dispatch({
                type: SET_ORIGINAL_STUDENT_AND_EDITED_STUDENT,
                student,
                allowEditing
            });
            return;
        }

        if (previouslySetStudent && previouslySetStudent.id === student.id) {
            return;
        }

        if (student.hasOwnProperty('groupsStudentIsIn')
            && currentStudent.type === DB_CONST.TYPE_ADMIN
            && !currentStudent.superAdmin
        ) {
            let studentHomeGroup = utils.getStudentHomeGroup(student.groupsStudentIsIn);
            // studentHomeGroup is null --> failed to find student's home group
            // do not let any group admins to edit this student's profile
            if (!studentHomeGroup) {
                allowEditing = false;
            }
            // studentHomeGroup is not null
            else {
                // this current group admin does not belong to the studentHomeGroup
                if (currentStudent.anid !== studentHomeGroup.anid) {
                    allowEditing = false;
                }
            }
        }

        dispatch({
            type: SET_ORIGINAL_STUDENT_AND_EDITED_STUDENT,
            student,
            allowEditing
        });
    }
};

export const EDIT_PERSONAL_INFORMATION = 'EDIT_PERSONAL_INFORMATION';
export const EDIT_ORDINARY_UNI_PROFILE_INFORMATION = 'EDIT_ORDINARY_UNI_PROFILE_INFORMATION';
export const EDIT_TRADING_ADDRESS_UNI_PROFILE = 'EDIT_TRADING_ADDRESS_UNI_PROFILE';
export const EDIT_REGISTERED_OFFICE_UNI_PROFILE = 'EDIT_REGISTERED_OFFICE_UNI_PROFILE';
export const ADDING_NEW_DIRECTOR = 'ADDING_NEW_DIRECTOR';
export const editStudentLocally = (type, edit) => {
    return (dispatch, getState) => {
        dispatch({
            type,
            edit: {
                property: edit.property,
                value: edit.value
            }
        });
    }
};

export const TOGGLE_ADD_NEW_DIRECTOR = 'TOGGLE_ADD_NEW_DIRECTOR';
export const toggleAddNewDirector = () => {
    return {
        type: TOGGLE_ADD_NEW_DIRECTOR
    }
};

export const ADD_NEW_DIRECTOR_TEMPORARILY = 'ADD_NEW_DIRECTOR_TEMPORARILY';
export const addNewDirectorTemporarily = isEditingExistingBusinessProfile => {
    return (dispatch, getState) => {
        dispatch({
            type: ADD_NEW_DIRECTOR_TEMPORARILY,
            isEditingExistingBusinessProfile,
            director: getState().editStudent.newDirectorText
        });
    }
};

export const DELETE_DIRECTOR_TEMPORARILY = 'DELETE_DIRECTOR_TEMPORARILY';
export const deleteDirectorTemporarily = (index, isEditingExistingBusinessProfile) => {
    return {
        type: DELETE_DIRECTOR_TEMPORARILY,
        index,
        isEditingExistingBusinessProfile
    }
};

export const RESET_PERSONAL_INFORMATION = 'RESET_PERSONAL_INFORMATION';
export const RESET_UNI_PROFILE = 'RESET_UNI_PROFILE';
export const cancelEditingStudent = type => {
    return {
        type
    }
};

export const COMMIT_PERSONAL_INFORMATION_CHANGES = 'COMMIT_PERSONAL_INFORMATION_CHANGES';
export const COMMIT_UNI_PROFILE_CHANGES = 'COMMIT_UNI_PROFILE_CHANGES';
export const commitStudentProfileChanges = type => {
    return (dispatch, getState) => {

        const currentStudent = getState().auth.student;
        const originalStudent = JSON.parse(JSON.stringify(getState().editStudent.originalStudent));
        const studentEdited = JSON.parse(JSON.stringify(getState().editStudent.studentEdited));

        const studentRef = firebase
            .database()
            .ref(DB_CONST.STUDENTS_CHILD)
            .child(studentEdited.id);

        if (type === COMMIT_PERSONAL_INFORMATION_CHANGES) {
            studentRef
                .update({
                    title: studentEdited.title,
                    firstName: studentEdited.firstName,
                    lastName: studentEdited.lastName,
                    email: studentEdited.email,
                    linkedin:
                        studentEdited.linkedin && studentEdited.linkedin.trim().length > 0
                            ?
                            studentEdited.linkedin
                            :
                            null
                })
                .then(() => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentStudent.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the student's profile
                                "Student's personal details have been updated."
                                :
                                // the student is editing their own profile
                                "Your personal details have been updated."
                        ,
                        color: "primary",
                        position: "bottom"
                    });

                    realtimeDBUtils
                        .trackActivity({
                            studentID: currentStudent.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.STUDENTS_CHILD,
                            interactedObjectID: studentEdited.id,
                            activitySummary:
                                currentStudent.id === studentEdited.id
                                    ?
                                    // student is editing their own details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_UPDATED_PERSONAL_DETAILS
                                    :
                                    // admin is editing student's details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_STUDENT_PERSONAL_DETAILS
                                        .replace("%student%", studentEdited.firstName + " " + studentEdited.lastName)
                            ,
                            action:
                                currentStudent.id === studentEdited.id
                                    ?
                                    // student is editing their own details
                                    null
                                    :
                                    // admin is editing student's details
                                    ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER.replace(":studentID", studentEdited.id)
                            ,
                            value: {
                                before: originalStudent,
                                after: studentEdited
                            }
                        });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentStudent.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the student's profile
                                "Error happened. Couldn't update this student's personal details."
                                :
                                // the student is editing their own profile
                                "Error happened. We couldn't update your personal details."
                        ,
                        color: "error",
                        position: "bottom"
                    });
                });
        } else if (type === COMMIT_UNI_PROFILE_CHANGES) {

            let businessProfile = JSON.parse(JSON.stringify(studentEdited.BusinessProfile));
            businessProfile.registeredOffice.postcode = businessProfile.registeredOffice.postcode.toUpperCase();
            businessProfile.tradingAddress.postcode = businessProfile.tradingAddress.postcode.toUpperCase();

            studentRef
                .update({
                    BusinessProfile: businessProfile
                })
                .then(() => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentStudent.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the student's profile
                                "Student's business profile has been updated."
                                :
                                // the student is editing their own profile
                                "Your business profile has been updated."
                        ,
                        color: "primary",
                        position: "bottom"
                    });

                    realtimeDBUtils
                        .trackActivity({
                            studentID: currentStudent.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.STUDENTS_CHILD,
                            interactedObjectID: studentEdited.id,
                            activitySummary:
                                currentStudent.id === studentEdited.id
                                    ?
                                    // student is editing their own details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_UPDATED_UNI_PROFILE
                                    :
                                    // admin is editing student's details
                                    realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_ADMIN_UPDATED_STUDENT_UNI_PROFILE
                                        .replace("%student%", studentEdited.firstName + " " + studentEdited.lastName)
                            ,
                            action:
                                currentStudent.id === studentEdited.id
                                    ?
                                    // student is editing their own details
                                    null
                                    :
                                    // admin is editing student's details
                                    ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER.replace(":studentID", studentEdited.id)
                            ,
                            value: {
                                before: originalStudent,
                                after: studentEdited
                            }
                        });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message:
                            currentStudent.type === DB_CONST.TYPE_ADMIN
                                ?
                                // an admin is editing the student's profile
                                "Error happened. Couldn't update this student's business profile."
                                :
                                // the student is editing their own profile
                                "Error happened. We couldn't update your business profile."
                        ,
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    };
};

let originalStudentListener = null;

export const EDIT_STUDENT_ORIGINAL_STUDENT_CHANGED = 'EDIT_STUDENT_ORIGINAL_STUDENT_CHANGED';
export const startOriginalStudentChangedListener = () => {
    return (dispatch, getState) => {
        const currentStudent = getState().auth.student;
        const originalStudent = getState().editStudent.originalStudent;

        if (!currentStudent || !originalStudent) {
            return;
        }

        // if the current student is the same as the student being edited
        // then we don't need this listener since the current student changes
        // are taken care by the auth actions.
        if (currentStudent.id === originalStudent.id) {
            return;
        }

        if (!originalStudentListener) {
            originalStudentListener = firebase
                .database()
                .ref(DB_CONST.STUDENTS_CHILD)
                .child(originalStudent.id);

            originalStudentListener
                .on('value', snapshot => {
                    let studentChanged = snapshot.val();

                    if (studentChanged) {
                        studentChanged.groupsStudentIsIn = originalStudent.groupsStudentIsIn;

                        dispatch({
                            type: EDIT_STUDENT_ORIGINAL_STUDENT_CHANGED,
                            studentChanged
                        });
                    }
                });
        }
    }
};

export const stopOriginalStudentChangedListener = () => {
    return (dispatch, getState) => {
        if (originalStudentListener) {
            originalStudentListener.off('value');
            originalStudentListener = null;
        }
    }
}