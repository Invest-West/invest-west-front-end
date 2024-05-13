import * as editStudentActions from '../actions/editStudentActions';
import * as authActions from '../actions/authActions';

const initState = {
    // this variable is to ensure the student's profile won't be able to be edited
    // by the course teachers if they don't belong to that course
    // if the originalStudent has the "coursesStudentIsIn" property
    // and the course teachers do not belong to the student's home course,
    // then they won't be able to edit this student's profile.
    allowEditing: true,

    // original student object
    originalStudent: null,
    // student edited object
    studentEdited: null,

    // when a new director is being added
    addNewDirector: false,
    newDirectorText: ''
};

// Reducer
const editStudentReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case editStudentActions.SET_ORIGINAL_STUDENT_AND_EDITED_STUDENT:
            return {
                ...state,
                originalStudent: action.student,
                studentEdited: action.student,
                allowEditing: action.allowEditing
            };
        case editStudentActions.EDIT_PERSONAL_INFORMATION:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    [action.edit.property]: action.edit.value
                }
            };
        case editStudentActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    BusinessProfile: {
                        ...state.studentEdited.BusinessProfile,
                        [action.edit.property]: action.edit.value
                    }
                }
            };
        case editStudentActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    BusinessProfile: {
                        ...state.studentEdited.BusinessProfile,
                        registeredOffice: {
                            ...state.studentEdited.BusinessProfile.registeredOffice,
                            [action.edit.property]: action.edit.value
                        }
                    }
                }
            };
        case editStudentActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    BusinessProfile: {
                        ...state.studentEdited.BusinessProfile,
                        tradingAddress: {
                            ...state.studentEdited.BusinessProfile.tradingAddress,
                            [action.edit.property]: action.edit.value
                        }
                    }
                }
            };
        case editStudentActions.TOGGLE_ADD_NEW_DIRECTOR:
            return {
                ...state,
                addNewDirector: !state.addNewDirector,
                newDirectorText: state.addNewDirector ? '' : state.newDirectorText
            };
        case editStudentActions.ADDING_NEW_DIRECTOR:
            return {
                ...state,
                [action.edit.property]: action.edit.value
            };
        case editStudentActions.ADD_NEW_DIRECTOR_TEMPORARILY:
            // update this state only when editing an existing business profile
            if (action.isEditingExistingBusinessProfile) {
                return {
                    ...state,
                    studentEdited: {
                        ...state.studentEdited,
                        BusinessProfile: {
                            ...state.studentEdited.BusinessProfile,
                            directors: [...state.studentEdited.BusinessProfile.directors, state.newDirectorText]
                        }
                    },
                    addNewDirector: false,
                    newDirectorText: ''
                };
            }
            return {
                ...state,
                addNewDirector: false,
                newDirectorText: ''
            };
        case editStudentActions.DELETE_DIRECTOR_TEMPORARILY:
            // update this state only when editing an existing business profile
            if (action.isEditingExistingBusinessProfile) {
                let editedDirectors = JSON.parse(JSON.stringify(state.studentEdited.BusinessProfile.directors));
                editedDirectors.splice(action.index, 1);
                return {
                    ...state,
                    studentEdited: {
                        ...state.studentEdited,
                        BusinessProfile: {
                            ...state.studentEdited.BusinessProfile,
                            directors: editedDirectors
                        }
                    }
                };
            }
            return state;
        case editStudentActions.RESET_PERSONAL_INFORMATION:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    title: state.originalStudent.title,
                    firstName: state.originalStudent.firstName,
                    lastName: state.originalStudent.lastName,
                    email: state.originalStudent.email,
                    linkedin: !state.originalStudent.linkedin ? '' : state.originalStudent.linkedin
                }
            };
        case editStudentActions.RESET_BUSINESS_PROFILE:
            return {
                ...state,
                studentEdited: {
                    ...state.studentEdited,
                    BusinessProfile: JSON.parse(JSON.stringify(state.originalStudent.BusinessProfile))
                }
            };
        case authActions.CURRENT_STUDENT_PROFILE_HAS_CHANGED:
            return {
                ...state,
                originalStudent: JSON.parse(JSON.stringify(action.studentChanged)),
                studentEdited: JSON.parse(JSON.stringify(action.studentChanged))
            };
        case editStudentActions.EDIT_STUDENT_ORIGINAL_STUDENT_CHANGED:
            return {
                ...state,
                originalStudent: JSON.parse(JSON.stringify(action.studentChanged)),
                studentEdited: JSON.parse(JSON.stringify(action.studentChanged))
            }
        default:
            return state;
    }
};

export default editStudentReducer;