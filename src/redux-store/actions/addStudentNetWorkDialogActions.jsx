import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as myUtils from '../../utils/utils';
import {
    ADD_STATUS_CHECKING_FOR_EXISTING_STUDENT_NETWORK,
    ADD_STATUS_CREATING_STUDENT_NETWORK_PROFILE,
    ADD_STATUS_EMAIL_ALREADY_USED,
    ADD_STATUS_ERROR_HAPPENED,
    ADD_STATUS_SUCCESSFULLY_ADDED,
    ADD_STATUS_UPLOADING_STUDENT_NETWORK_LOGO,
    ADD_STATUS_STUDENT_NAME_EXISTS,
    UPLOAD_LOGO_WITH_TEXT,
    UPLOAD_PLAIN_LOGO
} from '../../pages/teacher/components/AddStudentNetWorkDialog';
import * as ROUTES from '../../router/routes';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import Api, {ApiRoutes} from "../../api/Api";

export const TOGGLE_ADD_STUDENT_NETWORK_DIALOG = 'TOGGLE_ADD_STUDENT_NETWORK_DIALOG';
export const toggleAddStudentNetworkDialog = () => {
    return {
        type: TOGGLE_ADD_STUDENT_NETWORK_DIALOG
    }
};

export const ADD_STUDENT_NETWORK_DIALOG_INPUT_CHANGED = 'ADD_STUDENT_NETWORK_DIALOG_INPUT_CHANGED';
export const handleAddStudentNetworkInputChanged = event => {
    return {
        type: ADD_STUDENT_NETWORK_DIALOG_INPUT_CHANGED,
        event
    }
};

export const ADD_STUDENT_NETWORK_ADD_BUTTON_CLICKED = 'ADD_STUDENT_NETWORK_ADD_BUTTON_CLICKED';
export const ADD_STUDENT_NETWORK_RESULT_CHANGED = 'ADD_STUDENT_NETWORK_RESULT_CHANGED';
export const addNewStudentNetwork = () => {
    return async (dispatch, getState) => {

        const currentStudent = getState().auth.student;

        dispatch({
            type: ADD_STUDENT_NETWORK_ADD_BUTTON_CLICKED
        });

        const {
            studentNetworkName,
            studentNetworkStudentname,
            email,
            website,
            primaryColor,
            secondaryColor,
            plainLogo,
            logoWithText
        } = getState().manageAddStudentNetworkDialog;

        dispatch({
            type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
            result: ADD_STATUS_CHECKING_FOR_EXISTING_STUDENT_NETWORK
        });

        // generate course id
        const anid = firebase
            .database()
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .push()
            .key;

        try {
            // check if the course studentname has been used or not
            const snapshots = await firebase
                .database()
                .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
                .orderByChild("courseStudentName")
                .equalTo(studentNetworkStudentname.toLowerCase())
                .once("value");

            // studentname has already exists
            if (snapshots.numChildren() > 0) {
                dispatch({
                    type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                    result: ADD_STATUS_STUDENT_NAME_EXISTS
                });
                return;
            }

            const checkExistingStudent = await realtimeDBUtils.doesStudentExist(email);

            // email has already been used
            if (checkExistingStudent.studentExists) {
                dispatch({
                    type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                    result: ADD_STATUS_EMAIL_ALREADY_USED
                });
                return;
            }

            // upload plain logo
            const uploadedPlainLogo = await uploadLogo(dispatch, anid, UPLOAD_PLAIN_LOGO, plainLogo);

            // upload logo with text
            const uploadedLogoWithText = await uploadLogo(dispatch, anid, UPLOAD_LOGO_WITH_TEXT, logoWithText);

            // new course properties
            const newCourseProperties = {
                anid,
                isInvestWest: false,
                displayName: studentNetworkName,
                displayNameLower: studentNetworkName.toLowerCase(), // for search function
                courseStudentName: studentNetworkStudentname.toLowerCase(),
                description: "",
                website: website,
                dateAdded: myUtils.getCurrentDate(),
                status: DB_CONST.COURSE_STATUS_ACTIVE,
                plainLogo: [{
                    storageID: uploadedPlainLogo.storageID,
                    url: uploadedPlainLogo.url
                }],
                logoWithText:
                    !uploadedLogoWithText
                        ?
                        null
                        :
                        [{
                            storageID: uploadedLogoWithText.storageID,
                            url: uploadedLogoWithText.url
                        }],
                settings: {
                    projectVisibility: DB_CONST.STUDENT_PROJECT_VISIBILITY_PRIVATE,
                    makeInvestorsContactDetailsVisibleToIssuers: false, // initially set this to false
                    primaryColor: primaryColor.toUpperCase(),
                    secondaryColor: secondaryColor.toUpperCase()
                }
            }

            // add new course properties to the database
            await firebase
                .database()
                .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
                .child(anid)
                .set(newCourseProperties);

            dispatch({
                type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_CREATING_STUDENT_NETWORK_PROFILE
            });

            await new Api().request(
                "post",
                ApiRoutes.addCourseTeacherRoute,
                {
                    requestBody: {
                        adder: currentStudent,
                        courseProperties: newCourseProperties,
                        newCourseTeacherEmail: email
                    }
                }
            );

            // send a notification to the newly created super course teacher
            await realtimeDBUtils
                .sendNotification({
                    title: "Change your password",
                    message: "Welcome to Invest West. It is important to change your password as soon as possible. Please do it by clicking on the Password tab in your dashboard.",
                    studentID: anid,
                    action: `${ROUTES.TEACHER_STUDENT_SUPER}?tab=Change password`
                });

            // adding a new super course teacher succeeds
            dispatch({
                type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_SUCCESSFULLY_ADDED
            });
        } catch (error) {
            // remove the added course properties if error happened
            await firebase
                .database()
                .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
                .child(anid)
                .remove();

            dispatch({
                type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_ERROR_HAPPENED,
                error
            });
        }
    }
};

/**
 * This function is used to upload an image (logo or profile picture)
 *
 * @returns {Promise<*>}
 */
const uploadLogo = async (dispatch, anid, mode, blob) => {

    return new Promise((resolve, reject) => {

        if (!blob) {
            return resolve(null);
        }

        let firebaseStorage = firebase.storage();

        dispatch({
            type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
            result: ADD_STATUS_UPLOADING_STUDENT_NETWORK_LOGO,
            progress: 0
        });

        let storageID = myUtils.getCurrentDate();
        let storageLocation = `${mode === UPLOAD_PLAIN_LOGO ? DB_CONST.PLAIN_LOGOS_CHILD : DB_CONST.LOGOS_WITH_TEXT_CHILD}/${storageID}`;

        const storageRef = firebaseStorage
            .ref(DB_CONST.COURSE_PROPERTIES_CHILD)
            .child(anid)
            .child(storageLocation);

        // upload logo to firebase storage
        const uploadTask = storageRef.put(blob);
        uploadTask.on('state_changed', snapshot => {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            dispatch({
                type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_UPLOADING_STUDENT_NETWORK_LOGO,
                progress,
                mode
            });
            // handle error
        }, error => {

            dispatch({
                type: ADD_STUDENT_NETWORK_RESULT_CHANGED,
                result: ADD_STATUS_ERROR_HAPPENED,
                mode
            });

            return reject(error);
            // logo successfully uploaded
        }, () => {

            // get download URL of the uploaded logo
            uploadTask.snapshot.ref.getDownloadURL().then(imgDownloadURL => {

                const imgUploadedObj = {
                    storageID: storageID,
                    url: imgDownloadURL
                };

                return resolve(imgUploadedObj);
            });
        });
    });
};

export const ADD_STUDENT_NETWORK_LOADING_IMAGE_FILE = 'ADD_STUDENT_NETWORK_LOADING_IMAGE_FILE';
export const ADD_STUDENT_NETWORK_IMAGE_FILES_LOADED = 'ADD_STUDENT_NETWORK_IMAGE_FILES_LOADED';
export const handleImageFilesChanged = (mode, files) => {
    return (dispatch, getState) => {
        if (getState().manageAddStudentNetworkDialog.imgUploadError.trim().length > 0 || getState().manageAddStudentNetworkDialog.imgUploadErrorSnackbarOpen) {
            return null;
        }

        dispatch({
            type: ADD_STUDENT_NETWORK_LOADING_IMAGE_FILE,
            mode
        });

        const blob = new Blob([files[files.length - 1]], {type: 'image/jpg'});

        dispatch({
            type: ADD_STUDENT_NETWORK_IMAGE_FILES_LOADED,
            blob,
            mode
        });
    }
};

export const ADD_STUDENT_NETWORK_IMAGE_FILE_ERROR = 'ADD_STUDENT_NETWORK_IMAGE_FILE_ERROR';
export const handleImageFileError = (mode, error, file) => {
    if (error.code === 2) {
        return {
            type: ADD_STUDENT_NETWORK_IMAGE_FILE_ERROR,
            error,
            file,
            mode
        }
    }
};

export const ADD_STUDENT_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR = 'ADD_STUDENT_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR';
export const closeImageFileErrorSnackbar = () => {
    return {
        type: ADD_STUDENT_NETWORK_CLOSE_IMAGE_FILE_ERROR_SNACKBAR
    }
};

export const ADD_STUDENT_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED = 'ADD_STUDENT_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED';
export const resetImageFileErrorMessageWhenSnackbarExited = () => {
    return {
        type: ADD_STUDENT_NETWORK_RESET_IMAGE_FILE_ERROR_MESSAGE_WHEN_SNACKBAR_EXITED
    }
};

