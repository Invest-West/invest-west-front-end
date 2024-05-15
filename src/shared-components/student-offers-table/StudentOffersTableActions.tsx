import {Action, ActionCreator, Dispatch} from "redux";
import {ProjectInstance} from "../../models/project";
import {AppState} from "../../redux-store/reducers";
import Student, {isStudent, isTeacher} from "../../models/student";
import Teacher, {isProf} from "../../models/teacher";
import StudentOfferRepository, {
    FetchStudentProjectsOptions,
    FetchStudentProjectsOrderByOptions
} from "../../api/repositories/StudentOfferRepository";
import CourseOfMembership from "../../models/course_of_membership";
import CourseProperties from "../../models/course_properties";
import CourseRepository from "../../api/repositories/CourseRepository";
import Api, {ApiRoutes} from "../../api/Api";

export enum OffersTableEvents {
    SetTableStudent = "OffersTableEvents.SetTableStudent",
    FetchingOffers = "OffersTableEvents.FetchingOffers",
    CompleteFetchingOffers = "OffersTableEvents.CompleteFetchingOffers",
    FilterChanged = "OffersTableEvents.FilterChanged",
    FilterOffersByName = "OffersTableEvents.FilterOffersByName",
    CancelFilteringOffersByName = "OffersTableEvents.CancelFilteringOffersByName",
    ChangePage = "OffersTableEvents.ChangePage",
    ChangeRowsPerPage = "OffersTableEvents.ChangeRowsPerPage",
    ExportingCsv = "OffersTableEvents.ExportingCsv",
    CompleteExportingCsv = "OffersTableEvents.CompleteExportingCsv"
}

export interface OffersTableAction extends Action {

}

export interface SetTableStudentAction extends OffersTableAction {
    student: Student | Teacher | undefined;
    coursesOfMembership: CourseOfMembership[] | undefined;
    coursesSelect: CourseProperties[] | undefined;
    error?: string;
}

export interface CompleteFetchingOffersAction extends OffersTableAction {
    offerInstances: ProjectInstance[];
    error?: string;
}

export interface FilterOffersByNameAction extends OffersTableAction {
    offerInstances: ProjectInstance[];
    isFilteringByName: boolean;
}

export interface FilterChangedAction extends OffersTableAction {
    name: string;
    value: any;
}

export interface ChangePageAction extends OffersTableAction {
    page: number;
}

export interface ChangeRowsPerPageAction extends OffersTableAction {
    rowsPerPage: number;
}

export interface CompleteExportingCsvAction extends OffersTableAction {
    error?: string;
}

export const setStudent: ActionCreator<any> = (student?: Student | Teacher) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentTableStudent = getState().OffersTableLocalState.tableStudent;
        let shouldSetTableStudent: boolean = false;
        if (currentTableStudent === undefined) {
            if (student !== undefined) {
                shouldSetTableStudent = true;
            }
        } else {
            if (student !== undefined) {
                if (currentTableStudent.id !== student.id) {
                    shouldSetTableStudent = true;
                }
            } else {
                shouldSetTableStudent = true;
            }
        }

        if (shouldSetTableStudent) {
            const action: SetTableStudentAction = {
                type: OffersTableEvents.SetTableStudent,
                student: student,
                coursesOfMembership: undefined,
                coursesSelect: undefined
            }

            try {
                if (student) {
                    const coursesOfMembershipResponse = await new Api().request("get",
                        ApiRoutes.listCoursesOfMembership.replace(":uid", student.id));
                    const coursesOfMembership: CourseOfMembership[] = coursesOfMembershipResponse.data;
                    action.coursesOfMembership = coursesOfMembership;

                    const isTableTeacherStudent: Teacher | null = isProf(student);

                    if (isTableTeacherStudent && isTableTeacherStudent.superTeacher) {
                        const allCoursesResponse = await new CourseRepository().fetchCourses();
                        action.coursesSelect = allCoursesResponse.data;
                    } else {
                        action.coursesSelect = coursesOfMembership.map(courseOfMembership => courseOfMembership.course);
                    }
                }
                dispatch(action);
                return dispatch(fetchOffers());
            } catch (error) {
                action.error = error.toString();
                return dispatch(action);
            }
        }
    }
}

export const fetchOffers: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            tableStudent,
            tableStudentCoursesOfMembership,
            visibilityFilter,
            courseFilter,
            phaseFilter
        } = getState().OffersTableLocalState;

        const currentStudent = getState().AuthenticationState.currentStudent;

        if (!currentStudent || !tableStudent) {
            return;
        }

        const currentTeacher: Teacher | null = isProf(currentStudent);

        const fetchOffersOptions: FetchStudentProjectsOptions = {
            visibility: visibilityFilter,
            course: courseFilter,
            phase: phaseFilter
        };

        const completeAction: CompleteFetchingOffersAction = {
            type: OffersTableEvents.CompleteFetchingOffers,
            offerInstances: []
        }

        let shouldFetchOffers: boolean = false;

        // currentStudent = tableStudent --> issuer/investor/admin is viewing their own offers table
        if (currentStudent.id === tableStudent.id) {
            shouldFetchOffers = true;
        }
        // currentStudent != tableStudent --> admin is viewing issuer/investor/admin offers table
        else if (currentTeacher) {
            // super admin is viewing issuer/investor/admin offers table
            if (currentTeacher.superTeacher) {
                shouldFetchOffers = true;
            }
            // course admin is viewing issuer/investor offers table
            else {
                if (tableStudentCoursesOfMembership !== undefined
                    && tableStudentCoursesOfMembership.findIndex(courseOfMembership => courseOfMembership.course.anid === currentTeacher.anid) !== -1
                    && !isProf(tableStudent)
                ) {
                    shouldFetchOffers = true;
                }
            }
        }

        if (shouldFetchOffers) {
            if (isTeacher(tableStudent)) {
                fetchOffersOptions.issuer = tableStudent.id;
                fetchOffersOptions.orderBy = FetchStudentProjectsOrderByOptions.Teacher;
            } else if (isStudent(tableStudent)) {
                fetchOffersOptions.investor = tableStudent.id;
                fetchOffersOptions.orderBy = FetchStudentProjectsOrderByOptions.Student;
            } else if (currentTeacher) {
                if (!currentTeacher.superTeacher) {
                    fetchOffersOptions.course = currentTeacher.anid;
                    fetchOffersOptions.orderBy = FetchStudentProjectsOrderByOptions.Course;
                }
            } else {
                completeAction.error = "Invalid student reference.";
                return dispatch(completeAction);
            }
        } else {
            completeAction.error = "You don't have privileges to access this data.";
            return dispatch(completeAction);
        }

        dispatch({
            type: OffersTableEvents.FetchingOffers
        });

        try {
            const response = await new StudentOfferRepository().fetchOffers(fetchOffersOptions);
            completeAction.offerInstances = response.data;
            dispatch(completeAction);
            return dispatch(filterOffersByName());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const filterChanged: ActionCreator<any> = (event: any) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: OffersTableEvents.FilterChanged,
            name: name,
            value: value
        }
        dispatch(action);
        if (name !== "nameFilter") {
            dispatch(fetchOffers());
        }
    }
}

export const filterOffersByName: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const nameFilter: string = getState().OffersTableLocalState.nameFilter;
        let offerInstances: ProjectInstance[] = [...getState().OffersTableLocalState.offerInstances];

        const action: FilterOffersByNameAction = {
            type: OffersTableEvents.FilterOffersByName,
            offerInstances: offerInstances,
            isFilteringByName: false
        }

        if (nameFilter.trim().length > 0) {
            offerInstances = offerInstances.filter(
                offerInstance => offerInstance.projectDetail.projectName?.toLowerCase().includes(nameFilter.toLowerCase())
            );
            action.offerInstances = offerInstances;
            action.isFilteringByName = true;
        }
        return dispatch(action);
    }
}

export const cancelFilteringOffersByName: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: OffersTableEvents.CancelFilteringOffersByName
        });
    }
}

export const changePage: ActionCreator<any> = (event: any, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangePageAction = {
            type: OffersTableEvents.ChangePage,
            page: page
        }
        return dispatch(action);
    }
}

export const changeRowsPerPage: ActionCreator<any> = (event: any) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangeRowsPerPageAction = {
            type: OffersTableEvents.ChangeRowsPerPage,
            rowsPerPage: parseInt(event.target.value, 10)
        }
        return dispatch(action);
    }
}

export const exportCsv: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentStudent = getState().AuthenticationState.currentStudent;
        const exportingCsv = getState().OffersTableLocalState.exportingCsv;

        if (!currentStudent) {
            return;
        }

        const currentTeacher: Teacher | null = isProf(currentStudent);

        if (!currentTeacher) {
            return;
        }

        if (exportingCsv) {
            return;
        }

        dispatch({
            type: OffersTableEvents.ExportingCsv
        });

        const completeAction: CompleteExportingCsvAction = {
            type: OffersTableEvents.CompleteExportingCsv
        };

        try {
            await new StudentOfferRepository().exportCsv(
                currentTeacher.superTeacher
                    ? undefined
                    : {course: currentTeacher.anid, orderBy: FetchStudentProjectsOrderByOptions.Course}
            );
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}