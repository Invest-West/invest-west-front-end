import {
    AddNewCourseSectorTextChangedAction,
    CompletedSavingCourseSectorsChangesAction,
    ManageCourseSectorsAction,
    ManageCourseSectorsEvents,
    SetCourseSectorsAction
} from "./ManageCourseSectorsActions";
import Error from "../../../../models/error";

export interface ManageCourseSectorsState {
    addingNewCourseSector: boolean;
    newCourseSector: string;
    sectors: string[];
    savingCourseSectors: boolean;
    errorSavingCourseSectors?: Error;
}

const initialState: ManageCourseSectorsState = {
    addingNewCourseSector: false,
    newCourseSector: "",
    sectors: [],
    savingCourseSectors: false
}

export const isSavingCourseSectorsChanges = (state: ManageCourseSectorsState) => {
    return state.savingCourseSectors;
}

export const manageCourseSectorsReducer = (state = initialState, action: ManageCourseSectorsAction) => {
    switch (action.type) {
        case ManageCourseSectorsEvents.SetCourseSectors:
            const setCourseSectorsAction: SetCourseSectorsAction = action as SetCourseSectorsAction;
            return {
                ...state,
                sectors: setCourseSectorsAction.sectors
            }
        case ManageCourseSectorsEvents.ToggleAddNewCourseSector:
            return {
                ...state,
                addingNewCourseSector: !state.addingNewCourseSector,
                newCourseSector: ""
            }
        case ManageCourseSectorsEvents.AddNewCourseSectorTextChanged:
            const addNewCourseSectorTextChangedAction: AddNewCourseSectorTextChangedAction = action as AddNewCourseSectorTextChangedAction;
            return {
                ...state,
                newCourseSector: addNewCourseSectorTextChangedAction.value
            }
        case ManageCourseSectorsEvents.SavingCourseSectorsChanges:
            return {
                ...state,
                savingCourseSectors: true,
                errorSavingCourseSectors: undefined
            }
        case ManageCourseSectorsEvents.CompletedSavingCourseSectorsChanges:
            const completedSavingCourseSectorsChanges: CompletedSavingCourseSectorsChangesAction = action as CompletedSavingCourseSectorsChangesAction;
            return {
                ...state,
                savingCourseSectors: false,
                errorSavingCourseSectors: completedSavingCourseSectorsChanges.error !== undefined
                    ? {detail: completedSavingCourseSectorsChanges.error} : state.errorSavingCourseSectors
            }
        default:
            return state;
    }
}

export default manageCourseSectorsReducer;