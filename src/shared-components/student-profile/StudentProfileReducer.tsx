import {StudentProfileAction, StudentProfileEvents, SetCopiedStudentAction} from "./StudentProfileActions";
import Student, {uniCourseProfile} from "../../models/student";
import Error from "../../models/error";
import {
    ChangeModeAction,
    DeletingImageAction,
    EditImageDialogEvents,
    SavingImageAction,
    SetEditorAction,
    SliderChangedAction,
    SuccessfullySelectedImageAction,
    ToggleDialogAction
} from "./components/edit-image-dialog/StudentEditImageDialogActions";
import {
    UniProfileCheckBoxChangedAction,
    UniProfileEvents,
    ChangeAddressFindingStateAction,
    FindingAddressAction,
    FinishedFindingAddressAction
} from "./components/uni-profile/UniProfileActions";
import Address from "../../models/address";

// State for Personal details section
export interface PersonalDetailsState {

}

export enum AddressStates {
    EnterPostcode = "AddressFindingStates.EnterPostcode",
    FindingAddresses = "AddressFindingStates.FindingAddresses",
    DisplayFoundAddresses = "AddressFindingStates.DisplayFoundAddresses"
}

// State for Uni profile section
export interface UniProfileState {
    // this state is used to keeping track of the changes in Uni profile
    editedUniProfile: uniCourseProfile;
    // find address by postcode state for Registered office section
    registeredOfficeState: AddressStates;
    // find address by postcode state for Registered office section
    tradingAddressState: AddressStates;
    // list of addresses found by postcode from Registered office section
    foundAddressesForRegisteredOffice?: Address[];
    // list of addresses found by postcode from Trading address section
    foundAddressesForTradingAddress?: Address[];
    // error finding addresses for Registered office
    errorFindingAddressesForRegisteredOffice?: Error;
    // error finding addresses for Trading address
    errorFindingAddressesForTradingAddress?: Error;
    tradingAddressSameAsRegisteredOffice: boolean;
}

export enum EditImageDialogModes {
    AddPhoto = "EditImageDialogModes.AddPhoto",
    EditPhoto = "EditImageDialogModes.EditPhoto",
    DisplayPhoto = "EditImageDialogModes.DisplayPhoto"
}

// State for Edit Image dialog
export interface EditImageDialogState {
    dialogOpen: boolean;
    mode: EditImageDialogModes;
    // reference to the editor
    editor?: any;
    rawImage?: File | string;
    editedImage?: Blob;

    scale: number;
    rotate: number;

    savingImage: boolean;
    deletingImage: boolean;
}

// State for the whole Profile page
export interface StudentProfileState {
    copiedStudent?: Student;
    hasInitiallySetCopiedStudent: boolean;
    PersonalDetailsState: PersonalDetailsState;
    UniProfileState: UniProfileState;
    EditImageDialogState: EditImageDialogState;
}

// initial state for Personal details section
const initialPersonalDetailsState: PersonalDetailsState = {}

// initial state for Uni profile section
const initialUniProfileState: UniProfileState = {
    editedUniProfile: {
        uniCourse: "",
        degree: "",
        registrationNo: "",
        sector: "",
        tradingAddress: {
            address1: "",
            postcode: "",
            townCity: ""
        },
        logo: []
    },
    registeredOfficeState: AddressStates.EnterPostcode,
    tradingAddressState: AddressStates.EnterPostcode,
    tradingAddressSameAsRegisteredOffice: true
}

// initial state for Edit Image dialog
const initialEditImageDialogState: EditImageDialogState = {
    dialogOpen: false,
    mode: EditImageDialogModes.AddPhoto,

    scale: 1,
    rotate: 0,

    savingImage: false,
    deletingImage: false
}

// initial state for the whole Profile page
const initialState: StudentProfileState = {
    hasInitiallySetCopiedStudent: false,
    PersonalDetailsState: initialPersonalDetailsState,
    UniProfileState: initialUniProfileState,
    EditImageDialogState: initialEditImageDialogState
}

export const hasInitiallySetCopiedStudent = (state: StudentProfileState) => {
    return state.hasInitiallySetCopiedStudent;
}

export const isSavingProfilePicture = (state: EditImageDialogState) => {
    return state.savingImage;
}

export const isDeletingProfilePicture = (state: EditImageDialogState) => {
    return state.deletingImage;
}

export const hasErrorFindingAddressForRegisteredOffice = (state: UniProfileState) => {
    return state.errorFindingAddressesForRegisteredOffice !== undefined;
}

export const hasErrorFindingAddressForTradingAddress = (state: UniProfileState) => {
    return state.errorFindingAddressesForTradingAddress !== undefined;
}

const studentProfileReducer = (state = initialState, action: StudentProfileAction) => {
    switch (action.type) {
        case StudentProfileEvents.SetCopiedStudent:
            const setCopiedStudentAction: SetCopiedStudentAction = action as SetCopiedStudentAction;
            return {
                ...state,
                copiedStudent: setCopiedStudentAction.copiedStudent,
                hasInitiallySetCopiedStudent: setCopiedStudentAction.firstTimeSetCopiedStudent === true ? true : state.hasInitiallySetCopiedStudent
            }
        case EditImageDialogEvents.ToggleDialog:
            const toggleDialogAction: ToggleDialogAction = action as ToggleDialogAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...initialEditImageDialogState,
                    dialogOpen: !state.EditImageDialogState.dialogOpen,
                    rawImage: toggleDialogAction.image
                }
            }
        case EditImageDialogEvents.SetEditor:
            const setEditorAction: SetEditorAction = action as SetEditorAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    editor: setEditorAction.editor
                }
            }
        case EditImageDialogEvents.ChangeMode:
            const changeModeAction: ChangeModeAction = action as ChangeModeAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    mode: changeModeAction.mode
                }
            }
        case EditImageDialogEvents.SuccessfullySelectedImage:
            const successfullySelectedImageAction: SuccessfullySelectedImageAction = action as SuccessfullySelectedImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    rawImage: successfullySelectedImageAction.selectedImage
                }
            }
        case EditImageDialogEvents.SliderChanged:
            const sliderChangedAction: SliderChangedAction = action as SliderChangedAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    [sliderChangedAction.name]: sliderChangedAction.value
                }
            }
        case EditImageDialogEvents.SavingImage:
            const savingImageAction: SavingImageAction = action as SavingImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    savingImage: savingImageAction.saving
                }
            }
        case EditImageDialogEvents.DeletingImage:
            const deletingImageAction: DeletingImageAction = action as DeletingImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    deletingImage: deletingImageAction.deleting
                }
            }
        // case UniProfileEvents.NewUniProfileChanged:
        //     const updateNewUniProfileAction: UpdateNewUniProfileAction = action as UpdateNewUniProfileAction;
        //     return {
        //         ...state,
        //         UniProfileState: {
        //             ...state.UniProfileState,
        //             newUniProfile: updateNewUniProfileAction.updatedNewUniProfile
        //         }
        //     }
        case UniProfileEvents.CheckBoxChanged:
            const uniProfileCheckBoxChangedAction: UniProfileCheckBoxChangedAction = action as UniProfileCheckBoxChangedAction;
            return {
                ...state,
                UniProfileState: {
                    ...state.UniProfileState,
                    [uniProfileCheckBoxChangedAction.name]: uniProfileCheckBoxChangedAction.value
                }
            }
        case UniProfileEvents.FindingAddress:
            const findingAddressAction: FindingAddressAction = action as FindingAddressAction;
            return {
                ...state,
                UniProfileState: {
                    ...state.UniProfileState,
                    registeredOfficeState: findingAddressAction.mode === "registeredOffice"
                        ? AddressStates.FindingAddresses : state.UniProfileState.registeredOfficeState,
                    tradingAddressState: findingAddressAction.mode === "tradingAddress"
                        ? AddressStates.FindingAddresses : state.UniProfileState.tradingAddressState
                }
            }
        case UniProfileEvents.FinishedFindingAddress:
            const finishedFindingAddressAction: FinishedFindingAddressAction = action as FinishedFindingAddressAction;
            return {
                ...state,
                UniProfileState: {
                    ...state.UniProfileState,
                    foundAddressesForRegisteredOffice: finishedFindingAddressAction.mode === "registeredOffice"
                        ? finishedFindingAddressAction.foundAddresses : state.UniProfileState.foundAddressesForRegisteredOffice,
                    foundAddressesForTradingAddress: finishedFindingAddressAction.mode === "tradingAddress"
                        ? finishedFindingAddressAction.foundAddresses : state.UniProfileState.foundAddressesForTradingAddress,
                    errorFindingAddressesForRegisteredOffice: finishedFindingAddressAction.mode === "registeredOffice" && finishedFindingAddressAction.error !== undefined
                        ? {detail: finishedFindingAddressAction.error} : state.UniProfileState.errorFindingAddressesForRegisteredOffice,
                    errorFindingAddressesForTradingAddress: finishedFindingAddressAction.mode === "tradingAddress" && finishedFindingAddressAction.error !== undefined
                        ? {detail: finishedFindingAddressAction.error} : state.UniProfileState.errorFindingAddressesForTradingAddress
                }
            }
        case UniProfileEvents.ChangeAddressState:
            const changeAddressStateAction: ChangeAddressFindingStateAction = action as ChangeAddressFindingStateAction;
            return {
                ...state,
                UniProfileState: {
                    ...state.UniProfileState,
                    registeredOfficeState: changeAddressStateAction.mode === "registeredOffice"
                        ? changeAddressStateAction.addressState : state.UniProfileState.registeredOfficeState,
                    tradingAddressState: changeAddressStateAction.mode === "tradingAddress"
                        ? changeAddressStateAction.addressState : state.UniProfileState.tradingAddressState,
                    // if addressState is set to EnterPostcode, reset other states to initial values
                    foundAddressesForRegisteredOffice: changeAddressStateAction.mode === "registeredOffice"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.UniProfileState.foundAddressesForRegisteredOffice,
                    foundAddressesForTradingAddress: changeAddressStateAction.mode === "tradingAddress"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.UniProfileState.foundAddressesForTradingAddress,
                    errorFindingAddressesForRegisteredOffice: changeAddressStateAction.mode === "registeredOffice"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.UniProfileState.errorFindingAddressesForRegisteredOffice,
                    errorFindingAddressesForTradingAddress: changeAddressStateAction.mode === "tradingAddress"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.UniProfileState.errorFindingAddressesForTradingAddress,
                    editedUniProfile: {
                        ...state.UniProfileState.editedUniProfile,
                        registeredOffice: changeAddressStateAction.mode === "registeredOffice"
                        && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                            ? initialUniProfileState.editedUniProfile.tradingAddress
                            : state.UniProfileState.editedUniProfile.tradingAddress
                    }
                }
            }
        default:
            return state;
    }
}

export default studentProfileReducer;