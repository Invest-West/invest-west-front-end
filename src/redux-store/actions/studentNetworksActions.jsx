import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_STUDENT_NETWORKS = 'LOADING_STUDENT_NETWORKS';
export const FINISHED_LOADING_STUDENT_NETWORKS = 'FINISHED_LOADING_STUDENT_NETWORKS';
export const loadStudentNetworks = () => {
    return (dispatch, getState) => {
        const admin = getState().auth.user;

        if (!admin || (admin && !admin.superAdmin)) {
            dispatch({
                type: FINISHED_LOADING_STUDENT_NETWORKS
            });
            return;
        }

        dispatch({
            type: LOADING_STUDENT_NETWORKS
        });

        realtimeDBUtils
            .loadStudentNetworks({}, realtimeDBUtils.SEARCH_STUDENT_NETWORKS_NONE)
            .then(studentNetworks => {
                dispatch({
                    type: FINISHED_LOADING_STUDENT_NETWORKS,
                    studentNetworks
                });
            })
            .catch(error => {
                dispatch({
                    type: FINISHED_LOADING_STUDENT_NETWORKS,
                    error
                });
            });
    }
};

export const STUDENT_NETWORKS_TABLE_PAGE_CHANGED = 'STUDENT_NETWORKS_TABLE_PAGE_CHANGED';
export const changePage = (event, newPage) => {
    return {
        type: STUDENT_NETWORKS_TABLE_PAGE_CHANGED,
        newPage
    }
};

export const STUDENT_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED = 'STUDENT_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = event => {
    return {
        type: STUDENT_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10)
    }
};

export const STUDENT_NETWORKS_TABLE_INPUT_CHANGED = 'STUDENT_NETWORKS_TABLE_INPUT_CHANGED';
export const handleStudentNetworksTableInputChanged = event => {
    return (dispatch, getState) => {
        const studentNetworks = [...getState().manageStudentNetworks.studentNetworks];

        const searchText = event.target.value;
        let matchedStudentNetworks = studentNetworks.filter(studentNetwork => studentNetwork.displayName.toLowerCase().includes(searchText.trim().toLowerCase()));

        dispatch({
            type: STUDENT_NETWORKS_TABLE_INPUT_CHANGED,
            searchText,
            matchedStudentNetworks
        });
    }
};

export const TOGGLE_SEARCH_MODE_IN_STUDENT_NETWORKS_TABLE = 'TOGGLE_SEARCH_MODE_IN_STUDENT_NETWORKS_TABLE';
export const toggleSearchMode = () => {
    return (dispatch, getState) => {
        const inSearchMode = getState().manageStudentNetworks.inSearchMode;
        const searchText = getState().manageStudentNetworks.searchText;
        const studentNetworks = [...getState().manageStudentNetworks.studentNetworks];

        if (inSearchMode) {
            dispatch({
                type: TOGGLE_SEARCH_MODE_IN_STUDENT_NETWORKS_TABLE,
                enter: false,
                matchedStudentNetworks: []
            });
        } else {
            let matchedStudentNetworks = studentNetworks.filter(studentNetwork => studentNetwork.displayName.toLowerCase().includes(searchText.trim().toLowerCase()));
            dispatch({
                type: TOGGLE_SEARCH_MODE_IN_STUDENT_NETWORKS_TABLE,
                enter: true,
                matchedStudentNetworks
            });
        }
    }
};

// Listeners -----------------------------------------------------------------------------------------------------------

let studentNetworksListener = null;

export const STUDENT_NETWORKS_IN_TABLE_CHANGED = 'STUDENT_NETWORKS_IN_TABLE_CHANGED';

export const startListeningForStudentNetworksChanged = () => {
    return (dispatch, getState) => {
        if (!studentNetworksListener) {
            studentNetworksListener = firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD);

            studentNetworksListener
                .on('child_added', snapshot => {
                    let studentNetwork = snapshot.val();

                    let studentNetworks = [...getState().manageStudentNetworks.studentNetworks];
                    let studentNetworkIndex = studentNetworks.findIndex(existingAN => existingAN.anid === studentNetwork.anid);

                    if (studentNetworkIndex === -1) {
                        dispatch({
                            type: STUDENT_NETWORKS_IN_TABLE_CHANGED,
                            studentNetworks: [...studentNetworks, studentNetwork]
                        });
                    }
                });

            studentNetworksListener
                .on('child_changed', snapshot => {
                    let studentNetwork = snapshot.val();

                    let studentNetworks = [...getState().manageStudentNetworks.studentNetworks];
                    let studentNetworkIndex = studentNetworks.findIndex(existingAN => existingAN.anid === studentNetwork.anid);

                    if (studentNetworkIndex !== -1) {
                        studentNetworks[studentNetworkIndex] = studentNetwork;
                        dispatch({
                            type: STUDENT_NETWORKS_IN_TABLE_CHANGED,
                            studentNetworks
                        });
                    }
                });
        }
    }
};

export const stopListeningForStudentNetworksChanged = () => {
    return (dispatch, getState) => {
        if (studentNetworksListener) {
            studentNetworksListener.off('child_added');
            studentNetworksListener.off('child_changed');
            studentNetworksListener = null;
        }
    }
};