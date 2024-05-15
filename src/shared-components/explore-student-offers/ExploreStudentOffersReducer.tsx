import Error from "../../models/error";
import {
    CompleteFetchingStudentOffersAction,
    ExploreStudentOffersAction,
    ExploreStudentOffersEvents,
    FilterChangedAction,
    PaginationChangedAction
} from "./ExploreStudentOffersActions";
import {StudentProjectInstance} from "../../models/studentProject";
import CourseProperties from "../../models/course_properties";
import {FetchStudentProjectsPhaseOptions} from "../../api/repositories/StudentOfferRepository";

export const maxOffersPerPage: number = 12;

export interface ExploreStudentOffersState {
    offerStudentInstances: StudentProjectInstance[];
    fetchingOffers: boolean;
    offersFetched: boolean;

    courses: CourseProperties[];

    searchFilter: string;
    visibilityFilter: number | "all";
    sectorFilter: string | "all";
    phaseFilter: FetchStudentProjectsPhaseOptions;
    courseFilter: string | "all";
    currentPage: number;

    error?: Error;
}

const initialState: ExploreStudentOffersState = {
    offerStudentInstances: [],
    fetchingOffers: false,
    offersFetched: false,
    courses: [],
    searchFilter: "",
    visibilityFilter: "all",
    sectorFilter: "all",
    phaseFilter: FetchStudentProjectsPhaseOptions.Live,
    courseFilter: "all",
    currentPage: 1
}

export const hasNotFetchedOffers = (state: ExploreStudentOffersState) => {
    return !state.fetchingOffers && !state.offersFetched;
}

export const isFetchingOffers = (state: ExploreStudentOffersState) => {
    return state.fetchingOffers;
}

export const successfullyFetchedOffers = (state: ExploreStudentOffersState) => {
    return state.offersFetched && !state.fetchingOffers && state.error === undefined;
}

export const hasOffersForCurrentFilters = (state: ExploreStudentOffersState) => {
    return successfullyFetchedOffers(state) && state.offerStudentInstances.length > 0;
}

export const isSearchFilterActive = (state: ExploreStudentOffersState) =>  {
    return state.searchFilter.trim().length > 0;
}

export const calculatePaginationPages = (state: ExploreStudentOffersState) => {
    if (state.offerStudentInstances.length <= maxOffersPerPage) {
        return 1;
    }
    if (state.offerStudentInstances.length % maxOffersPerPage === 0) {
        return (state.offerStudentInstances.length / maxOffersPerPage) | 0;
    }
    return ((state.offerStudentInstances.length / maxOffersPerPage) | 0) + 1;
}

export const calculatePaginationIndices = (state: ExploreStudentOffersState) => {
    let startIndex, endIndex;
    startIndex = (state.currentPage - 1) * maxOffersPerPage;
    endIndex = startIndex + maxOffersPerPage - 1;
    if (endIndex > state.offerStudentInstances.length - 1) {
        endIndex = state.offerStudentInstances.length - 1;
    }
    return {
        startIndex,
        endIndex
    };
}

const exploreOffersReducer = (state: ExploreStudentOffersState = initialState, action: ExploreStudentOffersAction) => {
    //console.log("Current state:", state);
    //console.log("Received action:", action);
    switch (action.type) {
        case ExploreStudentOffersEvents.FetchingOffers:
            return {
                ...state,
                offerStudentInstances: [],
                fetchingOffers: true,
                offersFetched: false,
                error: undefined
            }
        case ExploreStudentOffersEvents.CompleteFetchingOffers:
            const CompleteFetchingStudentOffersAction: CompleteFetchingStudentOffersAction = action as CompleteFetchingStudentOffersAction;
            return {
                ...state,
                offerStudentInstances: [...CompleteFetchingStudentOffersAction.offerStudentInstances],
                fetchingOffers: false,
                offersFetched: true,
                currentPage: 1,
                error: CompleteFetchingStudentOffersAction.error !== undefined
                    ? {detail: CompleteFetchingStudentOffersAction.error} : state.error
            }
        case ExploreStudentOffersEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value,
                offerStudentInstances: [],
                fetchingOffers: false,
                offersFetched: false,
                currentPage: 1,
                error: undefined
            };
        case ExploreStudentOffersEvents.ClearSearchFilter:
            return {
                ...state,
                searchFilter: ""
            }
        case ExploreStudentOffersEvents.PaginationChanged:
            const paginationChangedAction: PaginationChangedAction = action as PaginationChangedAction;
            return {
                ...state,
                currentPage: paginationChangedAction.page
            }
        default:
            return state;
    }
}

export default exploreOffersReducer;