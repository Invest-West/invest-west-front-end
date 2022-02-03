import {Action, ActionCreator, Dispatch} from "redux";
import {ProjectInstance} from "../../models/project";
import React, {FormEvent} from "react";
import {AppState} from "../../redux-store/reducers";
import {PROJECT_VISIBILITY_PUBLIC, PROJECT_VISIBILITY_RESTRICTED} from "../../firebase/databaseConsts";
import OfferRepository, {
    FetchProjectsOptions,
    FetchProjectsOrderByOptions
} from "../../api/repositories/OfferRepository";

export enum ExploreOffersEvents {
    FetchingOffers = "ExploreOffersEvents.FetchingOffers",
    CompleteFetchingOffers = "ExploreOffersEvents.CompleteFetchingOffers",
    FilterChanged = "ExploreOffersEvents.FilterChanged",
    ClearSearchFilter = "ExploreOffersEvents.ClearSearchFilter",
    PaginationChanged = "ExploreOffersEvents.PaginationChanged"
}

export interface ExploreOffersAction extends Action {

}

export interface CompleteFetchingOffersAction extends ExploreOffersAction {
    offerInstances: ProjectInstance[];
    error?: string;
}

export interface FilterChangedAction extends ExploreOffersAction {
    name: string;
    value: any;
}

export interface PaginationChangedAction extends ExploreOffersAction {
    page: number;
}

export const onSearchEnter: ActionCreator<any> = (event: FormEvent) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        event.preventDefault();
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase))
    }
}

export const fetchOffers: ActionCreator<any> = (orderBy?: FetchProjectsOrderByOptions) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            searchFilter,
            visibilityFilter,
            sectorFilter,
            phaseFilter,
            groupFilter
        } = getState().ExploreOffersLocalState;

        const fetchOffersOptions: FetchProjectsOptions = orderBy === undefined ? {
            search: searchFilter.trim().length === 0 ? undefined : searchFilter,
            visibility: visibilityFilter === "all" || visibilityFilter === PROJECT_VISIBILITY_PUBLIC
            || visibilityFilter === PROJECT_VISIBILITY_RESTRICTED
                ? visibilityFilter : undefined,
            group: groupFilter,
            sector: sectorFilter,
            phase: phaseFilter
        } : {
            search: searchFilter.trim().length === 0 ? undefined : searchFilter,
            visibility: visibilityFilter === "all" || visibilityFilter === PROJECT_VISIBILITY_PUBLIC
            || visibilityFilter === PROJECT_VISIBILITY_RESTRICTED
                ? visibilityFilter : undefined,
            group: groupFilter,
            sector: sectorFilter,
            phase: phaseFilter,
            orderBy: orderBy
        };

        dispatch({
            type: ExploreOffersEvents.FetchingOffers
        });

        const completeAction: CompleteFetchingOffersAction = {
            type: ExploreOffersEvents.CompleteFetchingOffers,
            offerInstances: []
        }

        try {
            const response = await new OfferRepository().fetchOffers(fetchOffersOptions);
            completeAction.offerInstances = response.data;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const filterChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: ExploreOffersEvents.FilterChanged,
            name: name,
            value: value
        }
        dispatch(action);

        switch (name) {
            case "searchFilter":
                return;
            case "visibilityFilter":
                if (value === "all" || value.toString() === PROJECT_VISIBILITY_PUBLIC.toString() || value.toString() === PROJECT_VISIBILITY_RESTRICTED.toString()) {
                    return dispatch(fetchOffers(FetchProjectsOrderByOptions.Visibility));
                }
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Group));
            case "sectorFilter":
                return  dispatch(fetchOffers(FetchProjectsOrderByOptions.Sector));
            case "phaseFilter":
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase));
            case "groupFilter":
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Group))
            default:
                return;
        }
    }
}

export const clearSearchFilter: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreOffersEvents.ClearSearchFilter
        });
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase))
    }
}

export const paginationChanged: ActionCreator<any> = (event: React.ChangeEvent<unknown>, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: PaginationChangedAction = {
            type: ExploreOffersEvents.PaginationChanged,
            page: page
        }
        return dispatch(action);
    }
}

