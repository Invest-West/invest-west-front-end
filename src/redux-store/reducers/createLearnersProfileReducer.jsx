import * as createLearnersProfileActions from '../actions/createuniCourseProfileActions';
import * as editStudentActions from '../actions/editStudentActions';
import * as editImageActions from '../actions/editImageActions';
import * as editVideoActions from '../actions/editVideoActions';
import * as authActions from '../actions/authActions';

const initState = {
    LearnersProfile: {
        companyName: '',
        registrationNo: '',
        sector: 'None',
        companyWebsite: '',

        registeredOffice: {
            address1: '',
            address2: '',
            address3: '',
            townCity: '',
            postcode: ''
        },

        tradingAddress: {
            address1: '',
            address2: '',
            address3: '',
            townCity: '',
            postcode: ''
        },

        directors: []
    },

    logoToBeUploaded: null,
    videoToBeUploaded: null,

    registeredOfficeSearchPostcode: '', // field for student to fill in with postcode
    registeredOfficeEnterAddressManually: false,
    registeredOfficeRecommendedAddresses: null, // searched addresses from entered postcode

    tradingAddressSameAsRegisteredOffice: true,
    tradingAddressSearchPostcode: '', // field for student to fill in with postcode
    tradingAddressEnterAddressManually: false,
    tradingAddressRecommendedAddresses: null, // searched addresses from entered postcode

    expandLearnersProfileFilling: false // this field is only available for investor
};

const createLearnersProfileReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case createLearnersProfileActions.ORDINARY_LEARNERS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    [action.fieldName]: action.fieldValue
                }
            };
        case createLearnersProfileActions.REGISTERED_OFFICE_LEARNERS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    registeredOffice: {
                        ...state.LearnersProfile.registeredOffice,
                        [action.fieldName]: action.fieldValue
                    }
                }
            };
        case createLearnersProfileActions.TRADING_ADDRESS_LEARNERS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    tradingAddress: {
                        ...state.LearnersProfile.tradingAddress,
                        [action.fieldName]: action.fieldValue
                    }
                }
            };
        case createLearnersProfileActions.LEARNERS_PROFILE_CONTROL_FIELDS_CHANGED:
            return {
                ...state,
                [action.fieldName]: action.fieldValue,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    registeredOffice:
                        action.fieldName !== "registeredOfficeSearchPostcode"
                            ?
                            state.LearnersProfile.registeredOffice
                            :
                            {
                                address1: '',
                                address2: '',
                                address3: '',
                                townCity: '',
                                postcode: ''
                            },
                    tradingAddress:
                        action.fieldName !== "tradingAddressSearchPostcode"
                            ?
                            state.LearnersProfile.tradingAddress
                            :
                            {
                                address1: '',
                                address2: '',
                                address3: '',
                                townCity: '',
                                postcode: ''
                            }
                },
                registeredOfficeEnterAddressManually:
                    action.fieldName !== "registeredOfficeSearchPostcode" ? state.registeredOfficeEnterAddressManually : false,
                registeredOfficeRecommendedAddresses:
                    action.fieldName !== "registeredOfficeSearchPostcode" ? state.registeredOfficeRecommendedAddresses : null,
                tradingAddressEnterAddressManually:
                    action.fieldName !== "tradingAddressSearchPostcode" ? state.tradingAddressEnterAddressManually : false,
                tradingAddressRecommendedAddresses:
                    action.fieldName !== "tradingAddressSearchPostcode" ? state.tradingAddressRecommendedAddresses : null,
            };
        case createLearnersProfileActions.SEARCHING_REGISTERED_OFFICE_ADDRESSES:
            return state;
        case createLearnersProfileActions.DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES:
            return {
                ...state,
                registeredOfficeRecommendedAddresses: action.results
            };
        case createLearnersProfileActions.SEARCHING_TRADING_ADDRESSES:
            return state;
        case createLearnersProfileActions.DONE_SEARCHING_TRADING_ADDRESSES:
            return {
                ...state,
                tradingAddressRecommendedAddresses: action.results
            };
        case createLearnersProfileActions.SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS:
            return {
                ...state,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    registeredOffice: {
                        ...state.LearnersProfile.registeredOffice,
                        address1: action.selectedAddress[0],
                        address2: action.selectedAddress[1],
                        address3: action.selectedAddress[2],
                        townCity: action.selectedAddress[3],
                        postcode: state.registeredOfficeSearchPostcode.toUpperCase(),
                    }
                },
                registeredOfficeEnterAddressManually: true,
                registeredOfficeSearchPostcode: '',
                registeredOfficeRecommendedAddresses: null
            };
        case createLearnersProfileActions.SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS:
            return {
                ...state,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    tradingAddress: {
                        ...state.LearnersProfile.tradingAddress,
                        address1: action.selectedAddress[0],
                        address2: action.selectedAddress[1],
                        address3: action.selectedAddress[2],
                        townCity: action.selectedAddress[3],
                        postcode: state.tradingAddressSearchPostcode.toUpperCase(),
                    }
                },
                tradingAddressEnterAddressManually: true,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null
            };
        case createLearnersProfileActions.TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY:
            return {
                ...state,
                registeredOfficeEnterAddressManually: !state.registeredOfficeEnterAddressManually,
                registeredOfficeSearchPostcode: '',
                registeredOfficeRecommendedAddresses: null
            };
        case createLearnersProfileActions.TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY:
            return {
                ...state,
                tradingAddressEnterAddressManually: !state.tradingAddressEnterAddressManually,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null
            };
        case createLearnersProfileActions.TOGGLE_TRADING_ADDRESS_SAME_AS_REGISTERED_OFFICE:
            return {
                ...state,
                tradingAddressSameAsRegisteredOffice: action.checked,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null,
                tradingAddressEnterAddressManually: false,
                LearnersProfile: {
                    ...state.LearnersProfile,
                    tradingAddress: {
                        address1: '',
                        address2: '',
                        address3: '',
                        townCity: '',
                        postcode: ''
                    }
                }
            };
        case editStudentActions.ADD_NEW_DIRECTOR_TEMPORARILY:
            // update this state only when creating a new business profile
            if (!action.isEditingExistingLearnersProfile) {
                return {
                    ...state,
                    LearnersProfile: {
                        ...state.LearnersProfile,
                        directors: [...state.LearnersProfile.directors, action.director]
                    }
                };
            }
            return state;
        case editStudentActions.DELETE_DIRECTOR_TEMPORARILY:
            if (!action.isEditingExistingLearnersProfile) {
                let editedDirectors = JSON.parse(JSON.stringify(state.LearnersProfile.directors));
                editedDirectors.splice(action.index, 1);
                return {
                    ...state,
                    LearnersProfile: {
                        ...state.LearnersProfile,
                        directors: editedDirectors
                    }
                };
            }
            return state;
        case editImageActions.CREATE_LEARNERS_PROFILE_SAVE_EDITED_IMAGE:
            return {
                ...state,
                logoToBeUploaded: action.blob
            };
        case editVideoActions.CREATE_LEARNERS_PROFILE_SAVE_VIDEO:
            return {
                ...state,
                videoToBeUploaded: action.video
            };
        case createLearnersProfileActions.CLEAR_FILLED_LEARNERS_PROFILE_INFORMATION:
            return {
                ...initState,
                expandLearnersProfileFilling: state.expandLearnersProfileFilling
            };
        case createLearnersProfileActions.TOGGLE_EXPAND_LEARNERS_PROFILE_FILLING_FOR_INVESTOR:
            return {
                ...initState,
                expandLearnersProfileFilling: !state.expandLearnersProfileFilling
            };
        default:
            return state;
    }
};

export default createLearnersProfileReducer;