import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import {trackActivity} from "../../firebase/realtimeDBUtils";
import firebase from "../../firebase/firebaseApp";
import {
    ADD_NEW_COURSE_TEACHER_STATUS_CHECKING,
    ADD_NEW_COURSE_TEACHER_STATUS_EMAIL_USED,
    ADD_NEW_COURSE_TEACHER_STATUS_MISSING_EMAIL
} from "../../pages/admin/components/CourseTeachersTable";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";
import Api, {ApiRoutes} from "../../api/Api";

export const COURSE_TEACHERS_TABLE_SET_COURSE = 'COURSE_TEACHERS_TABLE_SET_COURSE';
export const setCourse = newCourse => {
    return (dispatch, getState) => {
        const prevTableCourse = getState().manageCourseTeachersTable.tableCourse;

        if (!newCourse || !prevTableCourse) {
            dispatch({
                type: COURSE_TEACHERS_TABLE_SET_COURSE,
                course: newCourse
            });
            return;
        }

        if (prevTableCourse.anid === newCourse.anid) {
            return;
        }

        dispatch({
            type: COURSE_TEACHERS_TABLE_SET_COURSE,
            course: newCourse
        });
    }
};

export const COURSE_TEACHERS_TABLE_LOADING_COURSE_TEACHERS = 'COURSE_TEACHERS_TABLE_LOADING_COURSE_TEACHERS';
export const COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS = 'COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS';
export const loadCourseTeachers = () => {
    return (dispatch, getState) => {
        const currentStudent = getState().auth.student;
        const tableCourse = getState().manageCourseTeachersTable.tableCourse;

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            dispatch({
                type: COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS,
                courseTeachers: []
            });
            return;
        }

        if (!currentStudent.superTeacher) {
            if (currentStudent.anid !== tableCourse.anid) {
                dispatch({
                    type: COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS,
                    courseTeachers: []
                });
                return;
            }
        }

        dispatch({
            type: COURSE_TEACHERS_TABLE_LOADING_COURSE_TEACHERS
        });

        realtimeDBUtils
        .loadCourseTeachersBasedOnCourseID(tableCourse.anid)
        .then(courseTeachers => {
            dispatch({
                type: COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS,
                courseTeachers: [...courseTeachers]
            });
        })
        .catch(error => {
            console.error('Error loading course admins:', error);
            dispatch({
                type: COURSE_TEACHERS_TABLE_FINISHED_LOADING_COURSE_TEACHERS,
                courseTeachers: []
            });
        });
    }
};

export const COURSE_TEACHERS_TABLE_PAGE_CHANGED = 'COURSE_TEACHERS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: COURSE_TEACHERS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const COURSE_TEACHERS_TABLE_ROWS_PER_PAGE_CHANGED = 'COURSE_TEACHERS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: COURSE_TEACHERS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const COURSE_TEACHERS_TABLE_TOGGLE_SEARCH_MODE = 'COURSE_TEACHERS_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return {
        type: COURSE_TEACHERS_TABLE_TOGGLE_SEARCH_MODE
    }
};

export const COURSE_TEACHERS_TABLE_HANDLE_INPUT_CHANGED = 'COURSE_TEACHERS_TABLE_HANDLE_INPUT_CHANGED';
export const handleInputChanged = event => {
    return {
        type: COURSE_TEACHERS_TABLE_HANDLE_INPUT_CHANGED,
        event
    }
};

export const COURSE_TEACHERS_TABLE_TOGGLE_ADD_NEW_COURSE_TEACHER_DIALOG = 'COURSE_TEACHERS_TABLE_TOGGLE_ADD_NEW_COURSE_TEACHER_DIALOG';
export const toggleAddNewCourseTeacherDialog = () => {
    return {
        type: COURSE_TEACHERS_TABLE_TOGGLE_ADD_NEW_COURSE_TEACHER_DIALOG
    }
};

export const COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED = 'COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED';
export const handleAddNewCourseTeacher = () => {
    return async (dispatch, getState) => {
        const newCourseTeacherEmail = getState().manageCourseTeachersTable.newCourseTeacherEmail;
        const currentStudent = getState().auth.student;
        const courseProperties = getState().manageCourseFromParams.courseProperties;

        if (!currentStudent) {
            return;
        }

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            return;
        }

        if (!currentStudent.superCourseTeacher) {
            return;
        }

        if (newCourseTeacherEmail.trim().length === 0) {
            dispatch({
                type: COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
                status: ADD_NEW_COURSE_TEACHER_STATUS_MISSING_EMAIL
            });
            return;
        }

        dispatch({
            type: COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
            status: ADD_NEW_COURSE_TEACHER_STATUS_CHECKING
        });

        try {
            const checkResult = await realtimeDBUtils.doesStudentExist(newCourseTeacherEmail.toLowerCase());

            // this email has already been used
            if (checkResult.studentExists) {
                dispatch({
                    type: COURSE_TEACHERS_TABLE_ADD_NEW_COURSE_STATUS_CHANGED,
                    status: ADD_NEW_COURSE_TEACHER_STATUS_EMAIL_USED
                });
            } else {
                const response = await new Api().request(
                    "post",
                    ApiRoutes.addCourseTeacherRoute,
                    {
                        queryParameters: null,
                        requestBody: {
                            adder: currentStudent,
                            courseProperties: courseProperties,
                            newCourseTeacherEmail: newCourseTeacherEmail
                        }
                    }
                );

                // obtain the newly created course admin profile from the server
                const newCourseTeacher = response.data;

                // track super course admin's activity
                trackActivity({
                    studentID: currentStudent.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.ADMINISTRATORS_CHILD,
                    interactedObjectID: newCourseTeacher.id,
                    activitySummary:
                        realtimeDBUtils
                            .ACTIVITY_SUMMARY_TEMPLATE_ADDED_A_NEW_COURSE_TEACHER
                            .replace("%courseTeacherEmail%", newCourseTeacherEmail)
                    ,
                    value: newCourseTeacher
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Course admin added successfully.",
                    color: "primary",
                    position: "bottom"
                });

                dispatch({
                    type: COURSE_TEACHERS_TABLE_TOGGLE_ADD_NEW_COURSE_TEACHER_DIALOG
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

let courseTeachersListener = null;

export const COURSE_TEACHERS_TABLE_CHANGED = 'COURSE_TEACHERS_TABLE_CHANGED';
export const startListeningForCourseTeachersChanged = () => {
    return (dispatch, getState) => {
        if (courseTeachersListener) {
            return;
        }

        const currentStudent = getState().auth.student;
        const tableCourse = getState().manageCourseTeachersTable.tableCourse;

        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            return;
        }

        if (!currentStudent.superTeacher && currentStudent.anid !== tableCourse.anid) {
            return;
        }

        courseTeachersListener = firebase
            .database()
            .ref(DB_CONST.ADMINISTRATORS_CHILD);

        courseTeachersListener
            .on('child_added', snapshot => {
                const courseTeacher = snapshot.val();
                let courseTeachers = [...getState().manageCourseTeachersTable.courseTeachers];

                const index = courseTeachers.findIndex(existingCourseTeacher => existingCourseTeacher.id === courseTeacher.id);
                if (index === -1) {

                    if (courseTeacher.anid === tableCourse.anid) {
                        dispatch({
                            type: COURSE_TEACHERS_TABLE_CHANGED,
                            courseTeachers: [...courseTeachers, courseTeacher]
                        });
                    }
                }
            });

        courseTeachersListener
            .on('child_changed', snapshot => {
                const courseTeacher = snapshot.val();
                let courseTeachers = [...getState().manageCourseTeachersTable.courseTeachers];

                const index = courseTeachers.findIndex(existingCourseTeacher => existingCourseTeacher.id === courseTeacher.id);
                if (index !== -1) {
                    courseTeachers[index] = courseTeacher;
                    dispatch({
                        type: COURSE_TEACHERS_TABLE_CHANGED,
                        courseTeachers: [...courseTeachers]
                    });
                }
            });

        courseTeachersListener
            .on('child_removed', snapshot => {
                const courseTeacher = snapshot.val();
                let courseTeachers = [...getState().manageCourseTeachersTable.courseTeachers];

                const index = courseTeachers.findIndex(existingCourseTeacher => existingCourseTeacher.id === courseTeacher.id);
                if (index !== -1) {
                    courseTeachers.splice(index, 1);
                    dispatch({
                        type: COURSE_TEACHERS_TABLE_CHANGED,
                        courseTeachers: [...courseTeachers]
                    });
                }
            });
    }
};

export const stopListeningForCourseTeachersChanged = () => {
    return (dispatch, getState) => {
        if (courseTeachersListener) {
            courseTeachersListener.off('child_added');
            courseTeachersListener.off('child_changed');
            courseTeachersListener.off('child_removed');
            courseTeachersListener = null;
        }
    }
};