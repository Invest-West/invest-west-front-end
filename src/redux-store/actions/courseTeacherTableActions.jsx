import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import {trackActivity} from "../../firebase/realtimeDBUtils";
import firebase from "../../firebase/firebaseApp";
import {
    ADD_NEW_COURSE_ADMIN_STATUS_CHECKING,
    ADD_NEW_COURSE_ADMIN_STATUS_EMAIL_USED,
    ADD_NEW_COURSE_ADMIN_STATUS_MISSING_EMAIL
} from "../../pages/admin/components/CourseAdminsTable";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";
import Api, {ApiRoutes} from "../../api/Api";

export const COURSE_ADMINS_TABLE_SET_COURSE = 'COURSE_ADMINS_TABLE_SET_COURSE';
export const setCourse = newCourse => {
    return (dispatch, getState) => {
        const prevTableCourse = getState().manageCourseAdminsTable.tableCourse;

        if (!newCourse || !prevTableCourse) {
            dispatch({
                type: COURSE_ADMINS_TABLE_SET_COURSE,
                course: newCourse
            });
            return;
        }

        if (prevTableCourse.anid === newCourse.anid) {
            return;
        }

        dispatch({
            type: COURSE_ADMINS_TABLE_SET_COURSE,
            course: newCourse
        });
    }
};

export const COURSE_ADMINS_TABLE_LOADING_COURSE_ADMINS = 'COURSE_ADMINS_TABLE_LOADING_COURSE_ADMINS';
export const COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS = 'COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS';
export const loadCourseAdmins = () => {
    return (dispatch, getState) => {
        const currentStudent = getState().auth.user;
        const tableCourse = getState().manageCourseAdminsTable.tableCourse;

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            dispatch({
                type: COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS,
                courseAdmins: []
            });
            return;
        }

        if (!currentStudent.superAdmin) {
            if (currentStudent.anid !== tableCourse.anid) {
                dispatch({
                    type: COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS,
                    courseAdmins: []
                });
                return;
            }
        }

        dispatch({
            type: COURSE_ADMINS_TABLE_LOADING_COURSE_ADMINS
        });

        realtimeDBUtils
        .loadCourseAdminsBasedOnCourseID(tableCourse.anid)
        .then(courseAdmins => {
            dispatch({
                type: COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS,
                courseAdmins: [...courseAdmins]
            });
        })
        .catch(error => {
            console.error('Error loading course admins:', error);
            dispatch({
                type: COURSE_ADMINS_TABLE_FINISHED_LOADING_COURSE_ADMINS,
                courseAdmins: []
            });
        });
    }
};

export const COURSE_ADMINS_TABLE_PAGE_CHANGED = 'COURSE_ADMINS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: COURSE_ADMINS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const COURSE_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED = 'COURSE_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: COURSE_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const COURSE_ADMINS_TABLE_TOGGLE_SEARCH_MODE = 'COURSE_ADMINS_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return {
        type: COURSE_ADMINS_TABLE_TOGGLE_SEARCH_MODE
    }
};

export const COURSE_ADMINS_TABLE_HANDLE_INPUT_CHANGED = 'COURSE_ADMINS_TABLE_HANDLE_INPUT_CHANGED';
export const handleInputChanged = event => {
    return {
        type: COURSE_ADMINS_TABLE_HANDLE_INPUT_CHANGED,
        event
    }
};

export const COURSE_ADMINS_TABLE_TOGGLE_ADD_NEW_COURSE_ADMIN_DIALOG = 'COURSE_ADMINS_TABLE_TOGGLE_ADD_NEW_COURSE_ADMIN_DIALOG';
export const toggleAddNewCourseAdminDialog = () => {
    return {
        type: COURSE_ADMINS_TABLE_TOGGLE_ADD_NEW_COURSE_ADMIN_DIALOG
    }
};

export const COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED = 'COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED';
export const handleAddNewCourseAdmin = () => {
    return async (dispatch, getState) => {
        const newCourseAdminEmail = getState().manageCourseAdminsTable.newCourseAdminEmail;
        const currentStudent = getState().auth.user;
        const courseProperties = getState().manageCourseFromParams.courseProperties;

        if (!currentStudent) {
            return;
        }

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            return;
        }

        if (!currentStudent.superCourseAdmin) {
            return;
        }

        if (newCourseAdminEmail.trim().length === 0) {
            dispatch({
                type: COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
                status: ADD_NEW_COURSE_ADMIN_STATUS_MISSING_EMAIL
            });
            return;
        }

        dispatch({
            type: COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
            status: ADD_NEW_COURSE_ADMIN_STATUS_CHECKING
        });

        try {
            const checkResult = await realtimeDBUtils.doesStudentExist(newCourseAdminEmail.toLowerCase());

            // this email has already been used
            if (checkResult.userExists) {
                dispatch({
                    type: COURSE_ADMINS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
                    status: ADD_NEW_COURSE_ADMIN_STATUS_EMAIL_USED
                });
            } else {
                const response = await new Api().request(
                    "post",
                    ApiRoutes.addCourseAdminRoute,
                    {
                        queryParameters: null,
                        requestBody: {
                            adder: currentStudent,
                            courseProperties: courseProperties,
                            newCourseAdminEmail: newCourseAdminEmail
                        }
                    }
                );

                // obtain the newly created course admin profile from the server
                const newCourseAdmin = response.data;

                // track super course admin's activity
                trackActivity({
                    userID: currentStudent.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.ADMINISTRATORS_CHILD,
                    interactedObjectID: newCourseAdmin.id,
                    activitySummary:
                        realtimeDBUtils
                            .ACTIVITY_SUMMARY_TEMPLATE_ADDED_A_NEW_COURSE_ADMIN
                            .replace("%courseAdminEmail%", newCourseAdminEmail)
                    ,
                    value: newCourseAdmin
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Course admin added successfully.",
                    color: "primary",
                    position: "bottom"
                });

                dispatch({
                    type: COURSE_ADMINS_TABLE_TOGGLE_ADD_NEW_COURSE_ADMIN_DIALOG
                });
            }
        } catch (error) {
            dispatch({
                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                message: "Error happened. Couldn't add this course admin.",
                color: "error",
                position: "bottom"
            });
        }
    }
};
//----------------------------------------------------------------------------------------------------------------------

let courseAdminsListener = null;

export const COURSE_ADMINS_TABLE_CHANGED = 'COURSE_ADMINS_TABLE_CHANGED';
export const startListeningForCourseAdminsChanged = () => {
    return (dispatch, getState) => {
        if (courseAdminsListener) {
            return;
        }

        const currentStudent = getState().auth.user;
        const tableCourse = getState().manageCourseAdminsTable.tableCourse;

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            return;
        }

        if (!currentStudent.superAdmin && currentStudent.anid !== tableCourse.anid) {
            return;
        }

        courseAdminsListener = firebase
            .database()
            .ref(DB_CONST.ADMINISTRATORS_CHILD);

        courseAdminsListener
            .on('child_added', snapshot => {
                const courseAdmin = snapshot.val();
                let courseAdmins = [...getState().manageCourseAdminsTable.courseAdmins];

                const index = courseAdmins.findIndex(existingCourseAdmin => existingCourseAdmin.id === courseAdmin.id);
                if (index === -1) {

                    if (courseAdmin.anid === tableCourse.anid) {
                        dispatch({
                            type: COURSE_ADMINS_TABLE_CHANGED,
                            courseAdmins: [...courseAdmins, courseAdmin]
                        });
                    }
                }
            });

        courseAdminsListener
            .on('child_changed', snapshot => {
                const courseAdmin = snapshot.val();
                let courseAdmins = [...getState().manageCourseAdminsTable.courseAdmins];

                const index = courseAdmins.findIndex(existingCourseAdmin => existingCourseAdmin.id === courseAdmin.id);
                if (index !== -1) {
                    courseAdmins[index] = courseAdmin;
                    dispatch({
                        type: COURSE_ADMINS_TABLE_CHANGED,
                        courseAdmins: [...courseAdmins]
                    });
                }
            });

        courseAdminsListener
            .on('child_removed', snapshot => {
                const courseAdmin = snapshot.val();
                let courseAdmins = [...getState().manageCourseAdminsTable.courseAdmins];

                const index = courseAdmins.findIndex(existingCourseAdmin => existingCourseAdmin.id === courseAdmin.id);
                if (index !== -1) {
                    courseAdmins.splice(index, 1);
                    dispatch({
                        type: COURSE_ADMINS_TABLE_CHANGED,
                        courseAdmins: [...courseAdmins]
                    });
                }
            });
    }
};

export const stopListeningForCourseAdminsChanged = () => {
    return (dispatch, getState) => {
        if (courseAdminsListener) {
            courseAdminsListener.off('child_added');
            courseAdminsListener.off('child_changed');
            courseAdminsListener.off('child_removed');
            courseAdminsListener = null;
        }
    }
};