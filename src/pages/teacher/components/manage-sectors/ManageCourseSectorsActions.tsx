import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import React from "react";
import {StudentSystemAttributes} from "../../../../models/system_attributes";
import StudentSystemAttributesRepository from "../../../../api/repositories/StudentSystemAttributesRepository";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ManageCourseSectorsEvents {
    SetCourseSectors = "ManageCourseSectorsEvents.SetCourseSectors",
    ToggleAddNewCourseSector = "ManageCourseSectorsEvents.ToggleAddNewCourseSector",
    AddNewCourseSectorTextChanged = "ManageCourseSectorsEvents.AddNewCourseSectorTextChanged",
    SavingCourseSectorsChanges = "ManageCourseSectorsEvents.SavingCourseSectorsChanges",
    CompletedSavingCourseSectorsChanges = "ManageCourseSectorsEvents.CompletedSavingCourseSectorsChanges"
}

export interface ManageCourseSectorsAction extends Action {

}

export interface SetCourseSectorsAction extends ManageCourseSectorsAction {
    sectors: string[];
}

export interface AddNewCourseSectorTextChangedAction extends ManageCourseSectorsAction {
    value: string;
}

export interface CompletedSavingCourseSectorsChangesAction extends ManageCourseSectorsAction {
    error?: string;
}

export const setCourseSectors: ActionCreator<any> = (sectors: string[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCourseSectorsAction = {
            type: ManageCourseSectorsEvents.SetCourseSectors,
            sectors: [...sectors]
        };
        return dispatch(action);
    }
}

export const toggleAddNewCourseSector: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: ManageCourseSectorsEvents.ToggleAddNewCourseSector
        });
    }
}

export const onTextChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: AddNewCourseSectorTextChangedAction = {
            type: ManageCourseSectorsEvents.AddNewCourseSectorTextChanged,
            value: event.target.value
        };
        return dispatch(action);
    }
}

export const addNewCourseSector: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const sectors: string[] = [...getState().ManageCourseSectorsLocalState.sectors];
        const newCourseSector: string = getState().ManageCourseSectorsLocalState.newCourseSector;
        sectors.push(newCourseSector);
        dispatch(setCourseSectors(sectors));
        return dispatch(toggleAddNewCourseSector());
    }
}

export const deleteCourseSector: ActionCreator<any> = (sector: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const sectors: string[] = [...getState().ManageCourseSectorsLocalState.sectors];
        const index = sectors.findIndex(eCourseSector => eCourseSector === sector);
        if (index !== -1) {
            sectors.splice(index, 1);
        }
        return dispatch(setCourseSectors(sectors));
    }
}

export const cancelCourseSectorsChanges: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const studentSystemAttributes: StudentSystemAttributes | null = getState().ManageStudentSystemAttributesState.studentSystemAttributes;
        if (!studentSystemAttributes) {
            return;
        }
        return dispatch(setCourseSectors([...studentSystemAttributes.CourseSectors]));
    }
}

export const saveCourseSectorsChanges: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const studentSystemAttributes: StudentSystemAttributes | null = JSON.parse(JSON.stringify(getState().ManageStudentSystemAttributesState.studentSystemAttributes));
        if (!studentSystemAttributes) {
            return;
        }
        const CourseSectors: string[] = [...getState().ManageCourseSectorsLocalState.CourseSectors];
        const completeAction: CompletedSavingCourseSectorsChangesAction = {
            type: ManageCourseSectorsEvents.CompletedSavingCourseSectorsChanges
        };
        try {
            studentSystemAttributes.CourseSectors = CourseSectors;
            dispatch({
                type: ManageCourseSectorsEvents.SavingCourseSectorsChanges
            });
            await new StudentSystemAttributesRepository().updateStudentSystemAttributes(studentSystemAttributes);
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
            return dispatch(completeAction);
        }
    }
}