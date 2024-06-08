import * as DB_CONST from '../../firebase/databaseConsts';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import firebase from '../../firebase/firebaseApp';

export const ACTIVITIES_TABLE_SET_TABLE_STUDENT = 'ACTIVITIES_TABLE_SET_TABLE_STUDENT';
export const setTableStudent = newStudent => {
    return (dispatch, getState) => {
        const prevTableStudent = getState().manageActivitiesTable.tableStudent;

        // if student is set to null --> meaning that we're resetting the table
        // if the previous table student is null --> still set the new student
        if (!newStudent || !prevTableStudent) {
            dispatch({
                type: ACTIVITIES_TABLE_SET_TABLE_STUDENT,
                student: newStudent
            });
            return;
        }

        // previous table student is an actual student of normal students or admins
        if (prevTableStudent.hasOwnProperty('id')) {
            // new table student is also an actual student of normal students or admins
            if (newStudent.hasOwnProperty('id')) {
                if (prevTableStudent.id === newStudent.id) {
                    return;
                } else {
                    // set new table student
                }
            }
            // new table student is a courseProperties object
            else {
                // set new table student
            }
        }
        // previous table student is a courseProperties object
        else {
            // new table student is an actual student of normal students or admins
            if (newStudent.hasOwnProperty('id')) {
                // set new table student
            }
            // new table student is also a courseProperties object
            else {
                if (prevTableStudent.anid === newStudent.anid) {
                    return;
                }
            }
        }

        dispatch({
            type: ACTIVITIES_TABLE_SET_TABLE_STUDENT,
            student: newStudent
        });
    }
};

export const ACTIVITIES_TABLE_LOADING_ACTIVITIES = 'ACTIVITIES_TABLE_LOADING_ACTIVITIES';
export const ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES = 'ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES';
export const loadActivities = () => {
    return (dispatch, getState) => {
        const tableStudent = getState().manageActivitiesTable.tableStudent;
        const currentStudent = getState().auth.student;

        if (!tableStudent || !currentStudent) {
            dispatch({
                type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                activities: []
            });
            return;
        }

        // current student is not an admin
        if (currentStudent.type !== DB_CONST.TYPE_PROF) {
            // and the current student is not the student referenced in the table
            if (tableStudent.hasOwnProperty('id') && currentStudent.id === tableStudent.id) {
                // do nothing as the current student is actually the table student
            } else {
                dispatch({
                    type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                    activities: []
                });
                return;
            }
        }

        dispatch({
            type: ACTIVITIES_TABLE_LOADING_ACTIVITIES
        });

        // table student is an actual student
        if (tableStudent.hasOwnProperty('id')) {
            realtimeDBUtils
                .fetchActivitiesBy({
                    studentID: tableStudent.id,
                    fetchBy: realtimeDBUtils.FETCH_ACTIVITIES_BY_STUDENT
                })
                .then(activities => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: [...activities]
                    });
                })
                .catch(error => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: []
                    });
                });
        }
        // table student is a courseProperties object
        else {
            realtimeDBUtils
                .loadCourseTeachersBasedOnCourseID(tableStudent.anid)
                .then(courseTeachers => {

                    let allActivities = [];

                    Promise.all(
                        courseTeachers.map(courseTeacher => {
                            return new Promise((resolve, reject) => {
                                realtimeDBUtils
                                    .fetchActivitiesBy({
                                        studentID: courseTeacher.id,
                                        shouldLoadStudentProfile: true,
                                        fetchBy: realtimeDBUtils.FETCH_ACTIVITIES_BY_STUDENT
                                    })
                                    .then(activities => {
                                        allActivities = [...allActivities, ...activities];
                                        return resolve(allActivities);
                                    })
                                    .catch(error => {
                                        return reject(error);
                                    });
                            });
                        })
                    ).then(() => {
                        dispatch({
                            type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                            activities: [...allActivities]
                        });
                    }).catch(error => {
                        dispatch({
                            type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                            activities: []
                        });
                    });

                })
                .catch(error => {
                    dispatch({
                        type: ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES,
                        activities: []
                    });
                });
        }
    }
};

export const ACTIVITIES_TABLE_PAGE_CHANGED = 'ACTIVITIES_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: ACTIVITIES_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED = 'ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

//----------------------------------------------------------------------------------------------------------------------
let activitiesListener = null;

export const ACTIVITIES_IN_TABLE_CHANGED = 'ACTIVITIES_IN_TABLE_CHANGED';
export const startListeningForActivitiesChanged = () => {
    return (dispatch, getState) => {
        const currentStudent = getState().auth.student;
        const tableStudent = getState().manageActivitiesTable.tableStudent;

        if (currentStudent.type !== DB_CONST.TYPE_PROF && currentStudent.id !== tableStudent.id) {
            return;
        }

        if (activitiesListener) {
            return;
        }

        // table student is an actual student
        if (tableStudent.hasOwnProperty('id')) {
            activitiesListener = firebase
                .database()
                .ref(DB_CONST.ACTIVITIES_LOG_CHILD)
                .orderByChild('studentID')
                .equalTo(tableStudent.id);
        }
        // table student is a courseProperties object
        else {
            activitiesListener = firebase
                .database()
                .ref(DB_CONST.ACTIVITIES_LOG_CHILD);
        }

        activitiesListener
            .on('child_added', snapshot => {
                const activity = snapshot.val();
                let activities = [...getState().manageActivitiesTable.activities];

                const activityIndex = activities.findIndex(existingActivity => existingActivity.id === activity.id);
                if (activityIndex === -1) {
                    // table student is an actual student
                    if (tableStudent.hasOwnProperty('id')) {
                        dispatch({
                            type: ACTIVITIES_IN_TABLE_CHANGED,
                            activities: [...activities, activity]
                        });
                    }
                    // table student is a courseProperties object
                    else {
                        realtimeDBUtils
                            .loadCourseTeachersBasedOnCourseID(tableStudent.anid)
                            .then(courseTeachers => {
                                const adminIndex = courseTeachers.findIndex(courseTeacher => courseTeacher.id === activity.studentID);
                                if (adminIndex !== -1) {
                                    activity.studentProfile = courseTeachers[adminIndex];
                                    dispatch({
                                        type: ACTIVITIES_IN_TABLE_CHANGED,
                                        activities: [...activities, activity]
                                    });
                                }
                            });
                    }
                }
            });
    }
};

export const stopListeningForActivitiesChanged = () => {
    return (dispatch, getState) => {
        if (activitiesListener) {
            activitiesListener.off('child_added');
            activitiesListener = null;
        }
    }
};