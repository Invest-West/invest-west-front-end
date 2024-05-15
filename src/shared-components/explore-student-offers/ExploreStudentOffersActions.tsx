import {Action, ActionCreator, Dispatch} from "redux";
import {ProjectInstance} from "../../models/project";
import React, {FormEvent} from "react";
import {AppState} from "../../redux-store/reducers";
import {PROJECT_VISIBILITY_PUBLIC, PROJECT_VISIBILITY_RESTRICTED} from "../../firebase/databaseConsts";
import StudentOfferRepository, {
    FetchStudentProjectsOptions,
    FetchStudentProjectsOrderByOptions,
    FetchStudentProjectsPhaseOptions
} from "../../api/repositories/StudentOfferRepository";

export enum ExploreStudentOffersEvents {
    FetchingOffers = "ExploreStudentOffersEvents.FetchingOffers",
    CompleteFetchingOffers = "ExploreStudentOffersEvents.CompleteFetchingOffers",
    FilterChanged = "ExploreStudentOffersEvents.FilterChanged",
    ClearSearchFilter = "ExploreStudentOffersEvents.ClearSearchFilter",
    PaginationChanged = "ExploreStudentOffersEvents.PaginationChanged"
}

export interface ExploreStudentOffersAction extends Action {

}

export interface CompleteFetchingStudentOffersAction extends ExploreStudentOffersAction {
    offerStudentInstances: ProjectInstance[];
    error?: string;
}

export interface FilterChangedAction extends ExploreStudentOffersAction {
    name: string;
    value: any;
}

export interface PaginationChangedAction extends ExploreStudentOffersAction {
    page: number;
}

export const onSearchEnter: ActionCreator<any> = (event: FormEvent) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        event.preventDefault();
        return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase))
    }
}

export const fetchStudentOffers: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            searchFilter,
            visibilityFilter,
            sectorFilter,
            phaseFilter,
            courseFilter,
        } = getState().ExploreStudentOffersLocalState;

        // Determine orderBy based on phaseFilter and potentially other conditions
        let orderBy;
        if (courseFilter === "all") {
            orderBy = phaseFilter === FetchStudentProjectsPhaseOptions.ExpiredPitch ? FetchStudentProjectsOrderByOptions.Course : FetchStudentProjectsOrderByOptions.Phase;
        } else {
            // If not 'all' courses, maintain existing logic
            orderBy = phaseFilter === FetchStudentProjectsPhaseOptions.ExpiredPitch ? FetchStudentProjectsOrderByOptions.Course : FetchStudentProjectsOrderByOptions.Phase;
        }

        const fetchStudentOffersOptions: FetchStudentProjectsOptions = {
            search: searchFilter.trim().length === 0 ? undefined : searchFilter,
            visibility: visibilityFilter,
            course: courseFilter === "all" ? undefined : courseFilter,
            sector: sectorFilter === "all" ? undefined : sectorFilter,
            phase: phaseFilter,
            orderBy,
        };

        dispatch({ type: ExploreStudentOffersEvents.FetchingOffers });

        try {
            const response = await new StudentOfferRepository().fetchStudentOffers(fetchStudentOffersOptions);
            dispatch({
                type: ExploreStudentOffersEvents.CompleteFetchingOffers,
                offerStudentInstances: response.data,
            });
        } catch (error) {
            dispatch({
                type: ExploreStudentOffersEvents.CompleteFetchingOffers,
                error: error.toString(),
                offerStudentInstances: [],
            });
        }
    };
};

export const filterChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: ExploreStudentOffersEvents.FilterChanged,
            name: name,
            value: value
        }
        dispatch(action);

        switch (name) {
            case "searchFilter":
                return;
            case "visibilityFilter":
                if (value === "all" || value.toString() === PROJECT_VISIBILITY_PUBLIC.toString() || value.toString() === PROJECT_VISIBILITY_RESTRICTED.toString()) {
                    return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Visibility));
                }
                return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Course));
            case "sectorFilter":
                return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Sector));
            case "phaseFilter":
                return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase));
            case "courseFilter":
                return dispatch(fetchStudentOffers(value === "all" ? undefined : FetchStudentProjectsOrderByOptions.Course));
            default:
                return;
        }
    }
}

export const clearSearchFilter: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreStudentOffersEvents.ClearSearchFilter
        });
        return dispatch(fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase))
    }
}

export const paginationChanged: ActionCreator<any> = (event: React.ChangeEvent<unknown>, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: PaginationChangedAction = {
            type: ExploreStudentOffersEvents.PaginationChanged,
            page: page
        }
        return dispatch(action);
    }
}

