import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';

export const MANAGE_JOIN_STUDENT_REQUESTS_LOADING_JOIN_STUDENT_REQUESTS = 'MANAGE_JOIN_STUDENT_REQUESTS_LOADING_JOIN_STUDENT_REQUESTS';
export const MANAGE_JOIN_STUDENT_REQUESTS_FINISHED_LOADING_JOIN_STUDENT_REQUESTS = 'MANAGE_JOIN_STUDENT_REQUESTS_FINISHED_LOADING_JOIN_STUDENT_REQUESTS';
export const loadJoinStudentRequests = () => {
    return (dispatch, getState) => {

        const courseProperties = getState().manageCourseFromParams.courseProperties;

        if (!courseProperties) {
            return;
        }

        dispatch({
            type: MANAGE_JOIN_STUDENT_REQUESTS_LOADING_JOIN_STUDENT_REQUESTS
        });

        realtimeDBUtils
            .loadRequestsToJoin({anid: courseProperties.anid})
            .then(joinRequests => {
                dispatch({
                    type: MANAGE_JOIN_STUDENT_REQUESTS_FINISHED_LOADING_JOIN_STUDENT_REQUESTS,
                    joinRequests
                });
            })
            .catch(error => {
                dispatch({
                    type: MANAGE_JOIN_STUDENT_REQUESTS_FINISHED_LOADING_JOIN_STUDENT_REQUESTS,
                    joinRequests: [],
                    error
                });
            });
    }
};

export const MANAGE_JOIN_STUDENT_REQUESTS_TABLE_TOGGLE_SEARCH_MODE = 'MANAGE_JOIN_STUDENT_REQUESTS_TABLE_TOGGLE_SEARCH_MODE';
export const toggleSearchMode = () => {
    return (dispatch, getState) => {
        const inSearchMode = getState().manageJoinRequests.inSearchMode;
        const searchText = getState().manageJoinRequests.searchText;
        const joinRequests = getState().manageJoinRequests.joinRequests;

        if (inSearchMode) {
            dispatch({
                type: MANAGE_JOIN_STUDENT_REQUESTS_TABLE_TOGGLE_SEARCH_MODE,
                enter: false,
                matchedJoinRequests: []
            });
        } else {
            let matchedJoinRequests = joinRequests.filter(joinRequest => joinRequest.studentProfile.email.toLowerCase().includes(searchText.trim().toLowerCase()));
            dispatch({
                type: MANAGE_JOIN_STUDENT_REQUESTS_TABLE_TOGGLE_SEARCH_MODE,
                enter: true,
                matchedJoinRequests
            });
        }
    }
};

export const MANAGE_JOIN_STUDENT_REQUESTS_TABLE_PAGE_CHANGED = 'MANAGE_JOIN_STUDENT_REQUESTS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: MANAGE_JOIN_STUDENT_REQUESTS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const MANAGE_JOIN_STUDENT_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED = 'MANAGE_JOIN_STUDENT_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: MANAGE_JOIN_STUDENT_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const MANAGE_JOIN_STUDENT_REQUESTS_TABLE_INPUT_CHANGED = 'MANAGE_JOIN_STUDENT_REQUESTS_TABLE_INPUT_CHANGED';
export const handleJoinStudentRequestsTableInputChanged = event => {
    return (dispatch, getState) => {
        const joinRequests = getState().manageJoinRequests.joinRequests;

        const searchText = event.target.value;
        let matchedJoinRequests = joinRequests.filter(
            joinRequest => joinRequest.studentProfile.email.toLowerCase().includes(searchText.trim().toLowerCase())
        );

        dispatch({
            type: MANAGE_JOIN_STUDENT_REQUESTS_TABLE_INPUT_CHANGED,
            searchText,
            matchedJoinRequests
        });
    }
};

export const acceptJoinRequest = (request) => {
    return (dispatch, getState) => {
        // remove the join request
        firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
            .child(request.id)
            .remove()
            .then(() => {
                const pushKey = firebase.database().ref(DB_CONST.INVITED_STUDENTS_CHILD).push().key;
                const currentDate = utils.getCurrentDate();
                // add a node in InvitedStudents
                firebase
                    .database()
                    .ref(DB_CONST.INVITED_STUDENTS_CHILD)
                    .child(pushKey)
                    .set({
                        id: pushKey,
                        email: request.studentProfile.email,
                        firstName: request.studentProfile.firstName,
                        lastName: request.studentProfile.lastName,
                        title: request.studentProfile.title,
                        type: request.studentProfile.type,
                        status: DB_CONST.INVITED_STUDENT_STATUS_ACTIVE,
                        officialStudentID: request.studentID,
                        invitedBy: request.courseToJoin,
                        invitedDate: "none",
                        requestedToJoin: true,
                        requestedToJoinDate: currentDate,
                        joinedDate: currentDate
                    })
                    .then(() => {
                        realtimeDBUtils
                            .sendNotification({
                                title: `${request.course.displayName} has accepted your join request`,
                                message: `Congratulations. You are now a member of ${request.course.displayName}. You can see and interact with all offers from ${request.course.displayName}.`,
                                studentID: request.studentID,
                                action: `${ROUTES.DASHBOARD_STUDENT_INVEST_WEST_SUPER}?tab=Explore courses`
                            })
                            .then(() => {
                                // do something
                            })
                            .catch(error => {
                                // handle error
                            });
                    });
            });
    }
};

export const rejectJoinRequest = (request) => {
    return (dispatch, getState) => {
        // remove the join request
        firebase
            .database()
            .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
            .child(request.id)
            .remove()
            .then(() => {
                realtimeDBUtils
                    .sendNotification({
                        title: `${request.course.displayName} has rejected your join request`,
                        message: `We are so sorry that ${request.course.displayName} has rejected your join request. However, there are other courses that you can take part in.`,
                        studentID: request.studentID,
                        action: `${ROUTES.DASHBOARD_STUDENT_INVEST_WEST_SUPER}?tab=Explore courses`
                    })
                    .then(() => {
                        // do something
                    })
                    .catch(error => {
                        // handle error
                    });
            });
    }
};

//----------------------------------------------------------------------------------------------------------------------
let joinRequestsListener = null;

export const MANAGE_JOIN_STUDENT_REQUESTS_CHANGED = 'MANAGE_JOIN_STUDENT_REQUESTS_CHANGED';
export const startListeningForJoinStudentRequestsChanged = () => {
    return (dispatch, getState) => {
        const student = getState().auth.student;
        const courseProperties = getState().manageCourseFromParams.courseProperties;

        if (!student || !courseProperties) {
            return;
        }

        if (!joinRequestsListener) {
            joinRequestsListener = firebase
                .database()
                .ref(DB_CONST.REQUESTS_TO_JOIN_CHILD)
                .orderByChild('courseToJoin')
                .equalTo(courseProperties.anid);

            joinRequestsListener
                .on('child_added', snapshot => {
                    let joinRequest = snapshot.val();

                    let joinRequests = [...getState().manageJoinRequests.joinRequests];
                    const index = joinRequests.findIndex(existingJoinRequest => existingJoinRequest.id === joinRequest.id);
                    if (index === -1) {
                        realtimeDBUtils
                            .getStudentBasedOnID(joinRequest.studentID)
                            .then(studentProfile => {
                                joinRequest.studentProfile = studentProfile;

                                realtimeDBUtils
                                    .loadAngelNetworkBasedOnANID(joinRequest.courseToJoin)
                                    .then(studentNetwork => {
                                        joinRequest.course = studentNetwork;

                                        dispatch({
                                            type: MANAGE_JOIN_STUDENT_REQUESTS_CHANGED,
                                            joinRequests: [...joinRequests, joinRequest]
                                        });
                                    });
                            })
                    }
                });

            joinRequestsListener
                .on('child_removed', snapshot => {
                    let joinRequest = snapshot.val();

                    let joinRequests = [...getState().manageJoinRequests.joinRequests];
                    const index = joinRequests.findIndex(existingJoinRequest => existingJoinRequest.id === joinRequest.id);

                    if (index !== -1) {
                        joinRequests.splice(index, 1);
                        dispatch({
                            type: MANAGE_JOIN_STUDENT_REQUESTS_CHANGED,
                            joinRequests
                        });
                    }
                });
        }
    }
};

export const stopListeningForJoinStudentRequestsChanged = () => {
    return (dispatch, getState) => {
        if (joinRequestsListener) {
            joinRequestsListener.off('child_added');
            joinRequestsListener.off('child_removed');
            joinRequestsListener = null;
        }
    }
};
