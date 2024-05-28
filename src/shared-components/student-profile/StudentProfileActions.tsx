import {Action, ActionCreator, Dispatch} from "redux";
import Student from "../../models/student";
import {AppState} from "../../redux-store/reducers";
import React from "react";

export enum StudentProfileEvents {
    SetCopiedStudent = "PersonalDetailsEvents.SetCopiedStudent"
}

export interface StudentProfileAction extends Action {

}

export interface SetCopiedStudentAction extends StudentProfileAction {
    copiedStudent?: Student;
    firstTimeSetCopiedStudent?: true; // true or undefined
}

export const setCopiedStudent: ActionCreator<any> = (student: Student | null, firstTimeSetCopiedStudent?: true) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCopiedStudentAction = {
            type: StudentProfileEvents.SetCopiedStudent,
            copiedStudent: student ? JSON.parse(JSON.stringify(student)) : undefined,
            firstTimeSetCopiedStudent
        };
        return dispatch(action);
    }
}

// These are the input field categories corresponding to different groups of input fields in the Profile page
export enum InputCategories {
    // includes text fields in the Personal details section
    PersonalDetails = "InputCategories.PersonalDetails",
    // includes text fields in the Business profile section
    BusinessProfile = "InputCategories.BusinessProfile",
    // includes text fields in the Registered office section (subsection of Business profile)
    RegisteredOffice = "InputCategories.RegisteredOffice",
    // includes text fields in the Trading address section (subsection of Business profile)
    TradingAddress = "InputCategories.TradingAddress",
    // includes text fields in the Director section (subsection of Business profile)
    Director = "InputCategories.Director",
    // includes all checkboxes in Business profile section
    BusinessProfileCheckBox = "InputCategories.BusinessProfileCheckBox"
}

export const handleInputFieldChanged: ActionCreator<any> = (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        let currentCopiedStudent: Student | undefined = JSON.parse(JSON.stringify(getState().StudentLocalState.copiedStudent));
        if (!currentCopiedStudent) {
            return;
        }

        // let newBusinessProfile: BusinessProfile = getState().ProfileLocalState.BusinessProfileState.newBusinessProfile;
        //
        // const inputFieldName: string = event.target.name;
        // const inputFieldValue: string = event.target.value;
        // const inputFieldChecked: boolean = event.target.checked;
        //
        // switch (inputCategory) {
        //     case InputCategories.PersonalDetails:
        //         currentCopiedStudent = {
        //             ...currentCopiedStudent,
        //             [inputFieldName]: inputFieldValue
        //         }
        //         return dispatch(setCopiedStudent(currentCopiedStudent));
        //     case InputCategories.BusinessProfile:
        //         if (hasBusinessProfile(currentCopiedStudent)) {
        //             currentCopiedStudent = {
        //                 ...currentCopiedStudent,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedStudent.BusinessProfile,
        //                     [inputFieldName]: inputFieldValue
        //                 }
        //             }
        //             return dispatch(setCopiedStudent(currentCopiedStudent));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 [inputFieldName]: inputFieldValue
        //             }
        //             const updateNewBusinessStudentProfileAction: UpdateNewBusinessStudentProfileAction = {
        //                 type: BusinessStudentProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessStudentProfileAction);
        //         }
        //     case InputCategories.RegisteredOffice: {
        //         if (inputFieldValue === "none") {
        //             return;
        //         }
        //         const foundAddresses: Address[] | undefined = getState().ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice;
        //         if (!foundAddresses) {
        //             return;
        //         }
        //         const index = foundAddresses.findIndex(address => getFormattedAddress(address) === inputFieldValue);
        //         if (index === -1) {
        //             return;
        //         }
        //         if (hasBusinessProfile(currentCopiedStudent)) {
        //             currentCopiedStudent = {
        //                 ...currentCopiedStudent,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedStudent.BusinessProfile,
        //                     registeredOffice: foundAddresses[index]
        //                 }
        //             }
        //             return dispatch(setCopiedStudent(currentCopiedStudent));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 registeredOffice: foundAddresses[index]
        //             };
        //             const updateNewBusinessStudentProfileAction: UpdateNewBusinessStudentProfileAction = {
        //                 type: BusinessStudentProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessStudentProfileAction);
        //         }
        //     }
        //     case InputCategories.TradingAddress: {
        //         if (inputFieldValue === "none") {
        //             return;
        //         }
        //         const foundAddresses: Address[] | undefined = getState().ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice;
        //         if (!foundAddresses) {
        //             return;
        //         }
        //         const index = foundAddresses.findIndex(address => getFormattedAddress(address) === inputFieldValue);
        //         if (index === -1) {
        //             return;
        //         }
        //         if (hasBusinessProfile(currentCopiedStudent)) {
        //             currentCopiedStudent = {
        //                 ...currentCopiedStudent,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedStudent.BusinessProfile,
        //                     tradingAddress: foundAddresses[index]
        //                 }
        //             }
        //             return dispatch(setCopiedStudent(currentCopiedStudent));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 tradingAddress: foundAddresses[index]
        //             };
        //             const updateNewBusinessStudentProfileAction: UpdateNewBusinessStudentProfileAction = {
        //                 type: BusinessStudentProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessStudentProfileAction);
        //         }
        //     }
        //     case InputCategories.BusinessProfileCheckBox:
        //         const businessProfileCheckBoxChangedAction: BusinessProfileCheckBoxChangedAction = {
        //             type: BusinessStudentProfileEvents.CheckBoxChanged,
        //             name: inputFieldName,
        //             value: inputFieldChecked
        //         };
        //         return dispatch(businessProfileCheckBoxChangedAction);
        //     default:
        //         return;
        // }
    }
}