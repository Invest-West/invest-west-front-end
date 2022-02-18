import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';

export const TOGGLE_NOTIFICATIONS = 'TOGGLE_NOTIFICATIONS';
export const toggleNotifications = event => {
    return (dispatch, getState) => {
        const notificationsAnchorEl = getState().manageNotifications.notificationsAnchorEl;
        const notificationsClickedOutside = getState().manageNotifications.notificationsClickedOutside;
        const notificationsClickedOutsideActivated = getState().manageNotifications.notificationsClickedOutsideActivated;

        console.log('Current:');
        console.log(event.currentTarget);
        console.log('AnchorElement:');
        console.log(notificationsAnchorEl);
        console.log('Click outside:');
        console.log(notificationsClickedOutside);
        console.log('Click outside activated:');
        console.log(notificationsClickedOutsideActivated);

        // open notifications
        // initialises states
        if (notificationsAnchorEl === null) {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: event.currentTarget,
                notificationsClickedOutsideActivated: true
            });

            console.log('TOGGLE open 1');
            console.log('---------------------');
        }
        else if (!notificationsAnchorEl && !notificationsClickedOutside) {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: event.currentTarget,
                notificationsClickedOutsideActivated: true
            });

            console.log('TOGGLE open 2');
            console.log('---------------------');
        }
        else if (!notificationsAnchorEl && notificationsClickedOutside) {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: event.currentTarget,
                notificationsClickedOutsideActivated: false
            });

            console.log('TOGGLE open 3');
            console.log('---------------------');
        }
        else {
            dispatch({
                type: TOGGLE_NOTIFICATIONS,
                notificationsAnchorEl: false,
                notificationsClickedOutsideActivated: false
            });

            console.log('TOGGLE close');
            console.log('---------------------');
        }
    }
};

export const CLOSED_NOTIFICATIONS = 'CLOSED_NOTIFICATIONS'
export const closeNotifications = event => {
    return (dispatch, getState) => {
        const notificationsAnchorEl = getState().manageNotifications.notificationsAnchorEl;
        const notificationsClickedOutside = getState().manageNotifications.notificationsClickedOutside;
        const notificationsClickedOutsideActivated = getState().manageNotifications.notificationsClickedOutsideActivated;

        console.log('Current:');
        console.log(event.currentTarget);
        console.log('AnchorElement:');
        console.log(notificationsAnchorEl);
        console.log('Click outside:');
        console.log(notificationsClickedOutside);
        console.log('Click outside activated:');
        console.log(notificationsClickedOutsideActivated);

        if (Boolean(notificationsAnchorEl) && notificationsClickedOutsideActivated) {
            dispatch({
                type: CLOSED_NOTIFICATIONS,
                notificationsAnchorEl: false,
                notificationsClickedOutside: true
            });

            console.log('CLOSE');
            console.log('---------------------');
        }
        else {
            console.log('nothing happened in close.');
            console.log('---------------------');
        }
    }
}

export const LOADING_NOTIFICATIONS = 'LOADING_NOTIFICATIONS';
export const FINISHED_LOADING_NOTIFICATIONS = 'FINISHED_LOADING_NOTIFICATIONS';
export const loadNotifications = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;

        if (!user) {
            return;
        }

        dispatch({
            type: LOADING_NOTIFICATIONS
        });

        realtimeDBUtils
            .loadNotifications(user.hasOwnProperty('anid') ? user.anid : user.id)
            .then(notifications => {
                dispatch({
                    type: FINISHED_LOADING_NOTIFICATIONS,
                    notifications
                });
            })
            .catch(error => {
                dispatch({
                    type: FINISHED_LOADING_NOTIFICATIONS,
                    notifications: []
                });
            });
    }
};

export const deleteANotification = notification => {
    return (dispatch, getState) => {
        firebase
            .database()
            .ref(DB_CONST.NOTIFICATIONS_CHILD)
            .child(notification.id)
            .remove()
            .then(() => {
                dispatch({
                    type: TOGGLE_NOTIFICATIONS,
                    notificationsAnchorEl: null
                });
            });
    }
};

export const deleteAllNotifications = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;

        if (!user) {
            return;
        }

        realtimeDBUtils
            .deleteAllNotifications(user.hasOwnProperty('anid') ? user.anid : user.id);
    }
};

// Listener ------------------------------------------------------------------------------------------------------------

let notificationsListener = null;

export const NOTIFICATIONS_LIST_CHANGED = 'NOTIFICATIONS_LIST_CHANGED';
export const startListeningForNotificationsChanged = () => {
    return (dispatch, getState) => {
        if (!notificationsListener) {

            const user = getState().auth.user;

            if (!user) {
                return;
            }

            notificationsListener = firebase
                .database()
                .ref(DB_CONST.NOTIFICATIONS_CHILD)
                .orderByChild('userID')
                .equalTo(user.hasOwnProperty('anid') ? user.anid : user.id);

            notificationsListener
                .on('child_added', snapshot => {
                    let notification = snapshot.val();

                    let notifications = [...getState().manageNotifications.notifications];
                    let notificationIndex = notifications.findIndex(existingNotification => existingNotification.id === notification.id);
                    if (notificationIndex === -1) {
                        dispatch({
                            type: NOTIFICATIONS_LIST_CHANGED,
                            notifications: [...notifications, notification]
                        });
                    }
                });

            notificationsListener
                .on('child_removed', snapshot => {
                    let notification = snapshot.val();

                    let notifications = [...getState().manageNotifications.notifications];
                    let notificationIndex = notifications.findIndex(existingNotification => existingNotification.id === notification.id);

                    if (notificationIndex !== -1) {
                        notifications.splice(notificationIndex, 1);
                        dispatch({
                            type: NOTIFICATIONS_LIST_CHANGED,
                            notifications
                        });
                    }
                });
        }
    }
};

export const stopListeningForNotificationsChanged = () => {
    return (dispatch, getState) => {
        if (notificationsListener) {
            notificationsListener.off('child_added');
            notificationsListener.off('child_removed');
            notificationsListener = null;
        }
    }
};