import {
    ChangePageAction,
    ChangeRowsPerPageAction,
    CompleteExportingCsvAction,
    CompleteFetchingOffersAction,
    FilterChangedAction,
    FilterOffersByNameAction,
    OffersTableAction,
    OffersTableEvents,
    SetTableStudentAction
} from "./StudentOffersTableActions";
import {ProjectInstance} from "../../models/project";
import Student from "../../models/student";
import Teacher from "../../models/teacher";
import Error from "../../models/error";
import CourseOfMembership from "../../models/course_of_membership";
import CourseProperties from "../../models/course_properties";
import {AuthenticationEvents} from "../../redux-store/actions/authenticationActions";

export interface OffersStudentTableStates {
    offerInstances: ProjectInstance[];
    offerInstancesFilteredByName: ProjectInstance[];
    fetchingOffers: boolean;
    offersFetched: boolean;

    tableStudent?: Student | Teacher;
    tableStudentCoursesOfMembership?: CourseOfMembership[];

    nameFilter: string;
    visibilityFilter: number | "all";
    courseFilter: string | "all";
    coursesSelect?: CourseProperties[];
    phaseFilter: string | number | "all";
    filteringOffersByName: boolean;

    currentPage: number;
    rowsPerPage: number;

    exportingCsv: boolean;
    errorExportingCsv?: Error;

    error?: Error
}

const initialState: OffersStudentTableStates = {
    offerInstances: [],
    offerInstancesFilteredByName: [],
    fetchingOffers: false,
    offersFetched: false,

    nameFilter: "",
    visibilityFilter: "all",
    courseFilter: "all",
    phaseFilter: "all",
    filteringOffersByName: false,

    currentPage: 0,
    rowsPerPage: 5,

    exportingCsv: false
}

export const isFetchingOffers = (state: OffersStudentTableStates) => {
    return !state.offersFetched && state.fetchingOffers;
}

export const successfullyFetchedOffers = (state: OffersStudentTableStates) => {
    return state.offersFetched && !state.fetchingOffers && state.error === undefined;
}

export const hasOffersForCurrentFilters = (state: OffersStudentTableStates) => {
    return successfullyFetchedOffers(state) && state.offerInstancesFilteredByName.length > 0;
}

export const isFilteringOffersByName = (state: OffersStudentTableStates) => {
    return state.filteringOffersByName;
}

export const hasErrorFetchingOffers = (state: OffersStudentTableStates) => {
    return state.error !== undefined;
}

export const isExportingCsv = (state: OffersStudentTableStates) => {
    return state.exportingCsv;
}

export const hasErrorExportingCsv = (state: OffersStudentTableStates) => {
    return state.errorExportingCsv !== undefined;
}

export const hasCoursesSelect = (state: OffersStudentTableStates) => {
    return state.coursesSelect !== undefined && state.coursesSelect.length > 0;
}

const offersTableReducer = (state = initialState, action: OffersTableAction) => {
    switch (action.type) {
        case AuthenticationEvents.SignOut:
            return initialState;
        case OffersTableEvents.SetTableStudent:
            const setTableStudentAction: SetTableStudentAction = action as SetTableStudentAction;
            return {
                ...initialState,
                tableStudent: setTableStudentAction.student !== undefined
                    ? JSON.parse(JSON.stringify(setTableStudentAction.student))
                    : undefined,
                tableStudentCoursesOfMembership: setTableStudentAction.coursesOfMembership !== undefined
                    ? [...setTableStudentAction.coursesOfMembership]
                    : undefined,
                coursesSelect: setTableStudentAction.coursesSelect !== undefined
                    ? [...setTableStudentAction.coursesSelect]
                    : undefined,
                error: setTableStudentAction.error !== undefined ? {detail: setTableStudentAction.error} : state.error,
            }
        case OffersTableEvents.FetchingOffers:
            return {
                ...state,
                offerInstances: [],
                offerInstancesFilteredByName: [],
                fetchingOffers: true,
                offersFetched: false,
                error: undefined
            }
        case OffersTableEvents.CompleteFetchingOffers:
            const completeFetchingOffersAction: CompleteFetchingOffersAction = action as CompleteFetchingOffersAction;
            return {
                ...state,
                offerInstances: [...completeFetchingOffersAction.offerInstances],
                fetchingOffers: false,
                offersFetched: true,
                currentPage: 0,
                error: completeFetchingOffersAction.error !== undefined
                    ? {detail: completeFetchingOffersAction.error} : state.error
            }
        case OffersTableEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value,
                currentPage: 0
            }
        case OffersTableEvents.FilterOffersByName:
            const filterOffersByNameAction: FilterOffersByNameAction = action as FilterOffersByNameAction;
            return {
                ...state,
                offerInstancesFilteredByName: [...filterOffersByNameAction.offerInstances],
                filteringOffersByName: filterOffersByNameAction.isFilteringByName,
                currentPage: 0
            }
        case OffersTableEvents.CancelFilteringOffersByName:
            return {
                ...state,
                offerInstancesFilteredByName: [...state.offerInstances],
                nameFilter: "",
                filteringOffersByName: false,
                currentPage: 0
            }
        case OffersTableEvents.ChangePage:
            const changePageAction: ChangePageAction = action as ChangePageAction;
            return {
                ...state,
                currentPage: changePageAction.page
            }
        case OffersTableEvents.ChangeRowsPerPage:
            const changeRowsPerPageAction: ChangeRowsPerPageAction = action as ChangeRowsPerPageAction;
            return {
                ...state,
                rowsPerPage: changeRowsPerPageAction.rowsPerPage,
                currentPage: 0
            }
        case OffersTableEvents.ExportingCsv:
            return {
                ...state,
                exportingCsv: true,
                errorExportingCsv: undefined
            }
        case OffersTableEvents.CompleteExportingCsv:
            const completeExportingCsvAction: CompleteExportingCsvAction = action as CompleteExportingCsvAction;
            return {
                ...state,
                exportingCsv: false,
                errorExportingCsv: completeExportingCsvAction.error !== undefined
                    ? {detail: completeExportingCsvAction.error} : state.errorExportingCsv
            }
        default:
            return state;
    }
}

export default offersTableReducer;