import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const SET_COURSE_STUDENT_NAME_FROM_PARAMS = 'SET_COURSE_STUDENT_NAME_FROM_PARAMS';
export const setCourseStudentFromParams = courseStudent => {
    return (dispatch, getState) => {
        const prevCourseStudent = getState().manageCourseFromParams.courseStudent;

        // if the newly set courseStudent is different from the current courseStudent, check again
        if (prevCourseStudent !== courseStudent) {
            dispatch({
                type: SET_COURSE_STUDENT_NAME_FROM_PARAMS,
                courseStudent
            });
        }
    }
};

export const SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING = 'SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING';
export const setExpectedAndCurrentPathsForChecking = (expectedPath, currentPath) => {
    return {
        type: SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING,
        expectedPath,
        currentPath
    }
};

export const LOADING_STUDENT_NETWORK = 'LOADING_STUDENT_NETWORK';
export const STUDENT_NETWORK_LOADED = 'STUDENT_NETWORK_LOADED';
export const loadStudentNetwork = () => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const {
                courseStudent,
                courseProperties,
                coursePropertiesLoaded,
                studentNetworkBeingLoaded,

                expectedPath,
                currentPath
            } = getState().manageCourseFromParams;

            const firebaseUser = firebase.auth().currentUser;

            // student network has not been loaded before
            if (!courseProperties && !coursePropertiesLoaded && !studentNetworkBeingLoaded) {
                dispatch({
                    type: LOADING_STUDENT_NETWORK
                });

                // path expected and current path not matched
                if (expectedPath !== currentPath) {
                    dispatch({
                        type: STUDENT_NETWORK_LOADED,
                        studentNetwork: null,
                        shouldLoadOtherData: false
                    });
                    resolve();
                    return;
                }

                // courseStudent is not specified --> Invest West super
                if (!courseStudent) {
                    // the student is logged in
                    if (firebaseUser) {
                        realtimeDBUtils
                            .getStudentBasedOnID(firebaseUser.uid)
                            .then(student => {
                                if (student.type === DB_CONST.TYPE_PROF) {
                                    if (student.superAdmin) {
                                        dispatch({
                                            type: STUDENT_NETWORK_LOADED,
                                            studentNetwork: null,
                                            shouldLoadOtherData: true
                                        });
                                    } else {
                                        dispatch({
                                            type: STUDENT_NETWORK_LOADED,
                                            studentNetwork: null,
                                            shouldLoadOtherData: false
                                        });
                                    }
                                } else {
                                    dispatch({
                                        type: STUDENT_NETWORK_LOADED,
                                        studentNetwork: null,
                                        shouldLoadOtherData: false
                                    });
                                }
                                resolve();
                            })
                            .catch(error => {
                                console.error('Error loading student:', error);
                                dispatch({
                                    type: STUDENT_NETWORK_LOADED,
                                    studentNetwork: null,
                                    shouldLoadOtherData: false
                                });
                                reject(error);
                            });
                    }
                    // the student is not logged in
                    else {
                        dispatch({
                            type: STUDENT_NETWORK_LOADED,
                            studentNetwork: null,
                            shouldLoadOtherData: true
                        });
                        resolve();
                        return;
                    }
                    return;
                }

                // student network has been loaded before
                if (courseProperties) {
                    // if anid = null (Invest West) or anid = student network's anid
                    // do not need to load the student network again
                    if (courseStudent === courseProperties.courseStudent) {
                        dispatch({
                            type: STUDENT_NETWORK_LOADED,
                            studentNetwork: courseProperties,
                            shouldLoadOtherData: true
                        });
                        resolve();
                        return;
                    }
                    // if the loaded student network's anid is not the same as the anid specified in the URL --> load again
                    else {
                        dispatch({
                            type: SET_COURSE_STUDENT_NAME_FROM_PARAMS,
                            courseStudent
                        });

                        dispatch({
                            type: LOADING_STUDENT_NETWORK
                        });
                    }
                }

                realtimeDBUtils
                    .loadStudentNetworkBasedOnCourseStudentName(courseStudent)
                    .then(studentNetwork => {
                        dispatch({
                            type: STUDENT_NETWORK_LOADED,
                            studentNetwork,
                            shouldLoadOtherData: true
                        });
                        resolve();
                    })
                    .catch(error => {
                        console.error('Error loading student network:', error);
                        dispatch({
                            type: STUDENT_NETWORK_LOADED,
                            studentNetwork: null,
                            shouldLoadOtherData: false
                        });
                        reject(error);
                    });
            }
        });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let studentNetworkListener = null;

export const STUDENT_NETWORK_PROPERTIES_CHANGED = 'STUDENT_NETWORK_PROPERTIES_CHANGED';
export const startListeningForStudentNetworkChanged = () => {
    return (dispatch, getState) => {
        if (!studentNetworkListener) {
            const {
                courseProperties
            } = getState().manageCourseFromParams;

            if (courseProperties) {
                if (studentNetworkListener) {
                    return;
                }
                studentNetworkListener = firebase
                    .database()
                    .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
                    .child(courseProperties.anid)
                    .on('child_changed', snapshot => {
                        const key = snapshot.key;
                        const value = snapshot.val();
                        dispatch({
                            type: STUDENT_NETWORK_PROPERTIES_CHANGED,
                            key,
                            value
                        });
                    });
            }
            else {
                if (studentNetworkListener) {
                    studentNetworkListener.off('child_changed');
                    studentNetworkListener = null;
                }
            }
        }
    }
};

export const stopListeningForStudentNetworkChanged = () => {
    return (dispatch, getState) => {
        if (studentNetworkListener) {
            studentNetworkListener.off('child_changed');
            studentNetworkListener = null;
        }
    }
};