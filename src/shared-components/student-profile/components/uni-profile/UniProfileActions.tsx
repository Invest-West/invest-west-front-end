import {StudentProfileAction} from "../../StudentProfileActions";
import {ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import Address from "../../../../models/address";
import AddressRepository from "../../../../api/repositories/AddressRepository";
import {AddressStates} from "../../StudentProfileReducer";

export enum UniProfileEvents {
    NewUniProfileChanged = "UniProfileEvents.NewUniProfileChanged",
    CheckBoxChanged = "UniProfileEvents.CheckBoxChanged",
    FindingAddress = "UniProfileEvents.FindingAddress",
    FinishedFindingAddress = "UniProfileEvents.FinishedFindingAddress",
    ChangeAddressState = "UniProfileEvents.ChangeAddressState"
}

export interface UniProfileAction extends StudentProfileAction {

}

export interface ToggleEnterAddressManuallyAction extends UniProfileAction {
    mode: "registeredOffice" | "tradingAddress"
}

export interface FindingAddressAction extends UniProfileAction {
    mode: "registeredOffice" | "tradingAddress";
}

export interface FinishedFindingAddressAction extends UniProfileAction {
    mode: "registeredOffice" | "tradingAddress";
    foundAddresses: Address[] | undefined;
    error?: string;
}

export interface ChangeAddressFindingStateAction extends UniProfileAction {
    mode: "registeredOffice" | "tradingAddress";
    addressState: AddressStates;
}

export interface UniProfileCheckBoxChangedAction extends UniProfileAction {
    name: string;
    value: boolean;
}

export const findAddress: ActionCreator<any> = (mode: "registeredOffice" | "tradingAddress") => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            copiedUser
        } = getState().ProfileLocalState;

        if (!copiedUser) {
            return;
        }

        // if (hasUniProfile(copiedUser)) {
        //     if (mode === "registeredOffice") {
        //         postcode = copiedUser.UniProfile?.registeredOffice.postcode ?? "";
        //     } else {
        //         postcode = copiedUser.UniProfile?.tradingAddress.postcode ?? "";
        //     }
        // } else {
        //     if (mode === "registeredOffice") {
        //         postcode = UniProfileState.newUniProfile.registeredOffice.postcode;
        //     } else {
        //         postcode = UniProfileState.newUniProfile.tradingAddress.postcode;
        //     }
        // }

        const finishedFindingAddressAction: FinishedFindingAddressAction = {
            type: UniProfileEvents.FinishedFindingAddress,
            mode,
            foundAddresses: undefined
        };

        try {
            const findingAddressAction: FindingAddressAction = {
                type: UniProfileEvents.FindingAddress,
                mode
            };
            dispatch(findingAddressAction);

            const results: Address[] = await new AddressRepository().findAddress("dummy postcode");
            finishedFindingAddressAction.foundAddresses = [...results];
            dispatch(finishedFindingAddressAction);
            return dispatch(changeAddressFindingState(mode, AddressStates.DisplayFoundAddresses));
        } catch (error) {
            finishedFindingAddressAction.error = error.toString();
            dispatch(finishedFindingAddressAction);
            return dispatch(changeAddressFindingState(mode, AddressStates.EnterPostcode));
        }
    }
}

export const changeAddressFindingState: ActionCreator<any> = (mode: "registeredOffice" | "tradingAddress", addressState: AddressStates) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangeAddressFindingStateAction = {
            type: UniProfileEvents.ChangeAddressState,
            mode,
            addressState
        };
        return dispatch(action);
    }
}