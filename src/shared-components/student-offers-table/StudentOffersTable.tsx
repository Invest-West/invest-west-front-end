import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {
    Box,
    Button,
    colors,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@material-ui/core";
import {Close, CreateOutlined, ImportExportOutlined, Refresh, Search} from "@material-ui/icons";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {getCourseRouteTheme, ManageCourseUrlState} from "../../redux-store/reducers/manageCourseUrlReducer";
import {StudentAuthenticationState} from "../../redux-store/reducers/studentAuthenticationReducer";
import {
    hasErrorExportingCsv,
    hasErrorFetchingOffers,
    hasCoursesSelect,
    hasOffersForCurrentFilters,
    isExportingCsv,
    isFetchingOffers,
    isFilteringOffersByName,
    OffersStudentTableStates,
    successfullyFetchedOffers
} from "./StudentOffersTableReducer";
import Student, {isStudent, isTeacher} from "../../models/student";
import Teacher, {isProf} from "../../models/teacher";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    cancelFilteringOffersByName,
    changePage,
    changeRowsPerPage,
    exportCsv,
    fetchStudentOffers,
    filterChanged,
    filterOffersByName,
    setStudent
} from "./StudentOffersTableActions";
import {Col, Row} from "react-bootstrap";
import {BeatLoader} from "react-spinners";
import PublicIcon from "@material-ui/icons/Public";
import RestrictedIcon from "@material-ui/icons/VpnLock";
import PrivateIcon from "@material-ui/icons/LockOutlined";
import {
    isStudentDraftProject,
    isStudentProjectPitchExpiredWaitingForAdminToCheck,
    isStudentProjectPublic,
    isStudentProjectRestricted,
    isStudentProjectTemporarilyClosed,
    isStudentProjectWaitingToGoLive
} from "../../models/studentProject";
import Routes from "../../router/routes";
import {dateInReadableFormat, isProjectInLivePitchPhase} from "../../utils/utils";
import {FetchProjectsPhaseOptions} from "../../api/repositories/OfferRepository";
import {
    PROJECT_STATUS_BEING_CHECKED,
    PROJECT_STATUS_DRAFT,
    PROJECT_VISIBILITY_PRIVATE,
    PROJECT_VISIBILITY_PUBLIC,
    PROJECT_VISIBILITY_RESTRICTED
} from "../../firebase/databaseConsts";
import {toRGBWithOpacity} from "../../utils/colorUtils";

interface OffersTableProps {
    // table student set by passing this prop to the StudentOffersTable component when used
    directTableStudent?: Student | Teacher;

    MediaQueryState: MediaQueryState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageCourseUrlState: ManageCourseUrlState;
    StudentAuthenticationState: StudentAuthenticationState;
    StudentOffersTableLocalState: OffersStudentTableStates;
    setStudent: (student?: Student | Teacher) => any;
    fetchStudentOffers: () => any;
    filterChanged: (event: any) => any;
    filterOffersByName: () => any;
    cancelFilteringOffersByName: () => any;
    changePage: (event: any, page: number) => any;
    changeRowsPerPage: (event: any) => any;
    exportCsv: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageCourseUrlState: state.ManageCourseUrlState,
        StudentAuthenticationState: state.StudentAuthenticationState,
        StudentOffersTableLocalState: state.StudentOffersTableLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setStudent: (student?: Student | Teacher) => dispatch(setStudent(student)),
        fetchStudentOffers: () => dispatch(fetchStudentOffers()),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        filterOffersByName: () => dispatch(filterOffersByName()),
        cancelFilteringOffersByName: () => dispatch(cancelFilteringOffersByName()),
        changePage: (event: any, page: number) => dispatch(changePage(event, page)),
        changeRowsPerPage: (event: any) => dispatch(changeRowsPerPage(event)),
        exportCsv: () => dispatch(exportCsv())
    }
}

class StudentOffersTable extends Component<OffersTableProps, any> {

    componentDidMount() {
        const {
            directTableStudent,
            StudentAuthenticationState,
            setStudent
        } = this.props;
        setStudent(directTableStudent ?? StudentAuthenticationState.currentStudent ?? undefined);
    }

    render() {
        const {
            ManageCourseUrlState,
            StudentAuthenticationState,
            StudentOffersTableLocalState,
            fetchStudentOffers,
            filterChanged,
            filterOffersByName,
            cancelFilteringOffersByName,
            changePage,
            changeRowsPerPage,
            exportCsv
        } = this.props;

        if (!StudentAuthenticationState.currentStudent) {
            return null;
        }

        const currentStudent: Student | Teacher = StudentAuthenticationState.currentStudent;
        const tableStudent: Student | Teacher | undefined = StudentOffersTableLocalState.tableStudent;

        if (!currentStudent || !tableStudent) {
            return null;
        }

        const currentTeacher: Teacher | null = isProf(currentStudent);
        const tableTeacher: Teacher | null = isProf(tableStudent);

        return <TableContainer
            component={Paper}
        >
            <Table
                color="black"
            >
                {/** Table header */}
                <TableHead>
                    {/** Export csv button (only available for admin */}
                    {
                        !(currentTeacher && tableTeacher && currentTeacher.id === tableTeacher.id)
                            ? null
                            : <TableRow>
                                <TableCell colSpan={5} >
                                    <Box>
                                        <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => exportCsv()} >
                                            <ImportExportOutlined fontSize="small" />
                                            <Box width="10px" />
                                            {
                                                isExportingCsv(StudentOffersTableLocalState)
                                                    ? "Exporting ..."
                                                    : "Export csv"
                                            }
                                        </Button>

                                        {
                                            !hasErrorExportingCsv(StudentOffersTableLocalState)
                                                ? null
                                                : <Box marginTop="12px" >
                                                    <Typography variant="body2" color="error" >
                                                        {`${StudentOffersTableLocalState.errorExportingCsv?.detail}. Please retry.`}
                                                    </Typography>
                                                </Box>
                                        }
                                    </Box>
                                </TableCell>
                            </TableRow>
                    }

                    {/** Create new offer button (only available for issuers and admins) */}
                    {
                        isStudent(currentStudent) || (currentTeacher && currentTeacher.superTeacher)
                            ? null
                            : <TableRow>
                                <TableCell
                                    colSpan={5}
                                >
                                    <CustomLink
                                        url={
                                            isTeacher(currentStudent) || (currentTeacher && tableTeacher && currentTeacher.id === tableTeacher.id)
                                                // issuer creates offer for themselves
                                                // course admin creates offer for their own course
                                                ? Routes.constructCreateProjectRoute(ManageCourseUrlState.courseNameFromUrl ?? null)
                                                : (currentTeacher && isTeacher(tableStudent))
                                                // course admin creates offer for an issuer in their course
                                                ? Routes.constructCreateProjectRoute(ManageCourseUrlState.courseNameFromUrl ?? null, {
                                                    admin: currentTeacher.id,
                                                    issuer: tableStudent.id
                                                })
                                                : ""
                                        }                                        
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Button variant="contained" color="primary" className={css(sharedStyles.no_text_transform)} >
                                                <CreateOutlined fontSize="small" />
                                                <Box width="10px" /> Create new offer
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                    }

                    {/** Search offer by name + refresh button */}
                    <TableRow>
                        <TableCell colSpan={5} >
                            <Row>
                                {/** Search by name field */}
                                <Col xs={11} sm={11} md={8} lg={6} >
                                    <Box
                                        display="flex"
                                        height="100%"
                                        alignItems="center"
                                        bgcolor={
                                            !isFilteringOffersByName(StudentOffersTableLocalState)
                                                ? colors.grey["200"]
                                                : toRGBWithOpacity(getCourseRouteTheme(ManageCourseUrlState).palette.primary.main, 0.18)
                                        }
                                        borderRadius="10px"
                                    >
                                        <InputBase
                                            fullWidth
                                            name="nameFilter"
                                            value={StudentOffersTableLocalState.nameFilter}
                                            placeholder="Search offer by name"
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)}
                                            startAdornment={
                                                <InputAdornment
                                                    position="start"
                                                >
                                                    <IconButton
                                                        onClick={() => filterOffersByName()}
                                                        disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)}
                                                    >
                                                        <Search fontSize="small"/>
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                !isFilteringOffersByName(StudentOffersTableLocalState)
                                                    ? null
                                                    : <InputAdornment
                                                        position="end"
                                                    >
                                                        <IconButton onClick={() => cancelFilteringOffersByName()} >
                                                            <Close fontSize="small"/>
                                                        </IconButton>
                                                    </InputAdornment>
                                            }
                                        />
                                    </Box>
                                </Col>

                                {/** Refresh button */}
                                <Col xs={1} sm={1} md={4} lg={6} >
                                    <Box display="flex" height="100%" justifyContent="flex-end" alignItems="center" >
                                        <IconButton onClick={() => fetchStudentOffers()} disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)} >
                                            <Refresh/>
                                        </IconButton>
                                    </Box>
                                </Col>
                            </Row>
                        </TableCell>
                    </TableRow>

                    {/** Filters */}
                    <TableRow>
                        <TableCell colSpan={5} >
                            <Row>
                                {/** Visibility filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2" >Visibility:</Typography>
                                        <Box
                                            height="8px"
                                        />
                                        <Select
                                            fullWidth
                                            name="visibilityFilter"
                                            value={StudentOffersTableLocalState.visibilityFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_PUBLIC} value={PROJECT_VISIBILITY_PUBLIC}>Public</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_RESTRICTED} value={PROJECT_VISIBILITY_RESTRICTED}>Restricted</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_PRIVATE} value={PROJECT_VISIBILITY_PRIVATE}>Private</MenuItem>
                                        </Select>
                                    </Box>
                                </Col>

                                {/** Course filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2" >Course:</Typography>
                                        <Box height="8px" />
                                        <Select
                                            fullWidth
                                            name="courseFilter"
                                            value={StudentOffersTableLocalState.courseFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            {
                                                !hasCoursesSelect(StudentOffersTableLocalState)
                                                || !StudentOffersTableLocalState.coursesSelect
                                                    ? null
                                                    : StudentOffersTableLocalState.coursesSelect.map(course =>
                                                        <MenuItem
                                                            key={course.anid}
                                                            value={course.anid}
                                                        >
                                                            {course.displayName}
                                                        </MenuItem>
                                                    )
                                            }
                                        </Select>
                                    </Box>
                                </Col>

                                {/** Phase (status) filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2">Status:</Typography>
                                        <Box height="8px" />
                                        <Select
                                            fullWidth
                                            name="phaseFilter"
                                            value={StudentOffersTableLocalState.phaseFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(StudentOffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.LivePitch} value={FetchProjectsPhaseOptions.LivePitch}>Live</MenuItem>
                                            <MenuItem key={PROJECT_STATUS_BEING_CHECKED} value={PROJECT_STATUS_BEING_CHECKED} >Submitted - awaiting review</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.TemporarilyClosed} value={FetchProjectsPhaseOptions.TemporarilyClosed}>Temporarily closed</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.ExpiredPitch} value={FetchProjectsPhaseOptions.ExpiredPitch}>Expired</MenuItem>
                                            <MenuItem key={PROJECT_STATUS_DRAFT} value={PROJECT_STATUS_DRAFT} >Draft</MenuItem>
                                        </Select>
                                    </Box>
                                </Col>
                            </Row>
                        </TableCell>
                    </TableRow>

                    {/** Column headers */}
                    <TableRow>
                        <TableCell colSpan={2} >
                            <Typography variant="body2" color="primary" >Project</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Goal</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Posted / expiry dates</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Status</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/** Table body */}
                <TableBody>
                    {
                        // Fetching offers
                        isFetchingOffers(StudentOffersTableLocalState)
                            ? <TableRow>
                                <TableCell colSpan={5} >
                                    <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                        <BeatLoader color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            // Error setting table student / fetching offers
                            : hasErrorFetchingOffers(StudentOffersTableLocalState)
                            ? <TableRow>
                                <TableCell colSpan={5} >
                                    <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                        <Typography variant="h6" align="center" color="error">Error. Please retry.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            // Not successfully fetching offers
                            : !successfullyFetchedOffers(StudentOffersTableLocalState)
                                ? null
                                // No offers available for current filters
                                : !hasOffersForCurrentFilters(StudentOffersTableLocalState)
                                    ? <TableRow>
                                        <TableCell colSpan={5} >
                                            <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                                <Typography variant="h6" align="center" >There are no offers available using your current filter criteria.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    // Render offers
                                    : StudentOffersTableLocalState.studentOfferInstancesFilteredByName
                                        .slice(StudentOffersTableLocalState.currentPage * StudentOffersTableLocalState.rowsPerPage, StudentOffersTableLocalState.currentPage * StudentOffersTableLocalState.rowsPerPage + StudentOffersTableLocalState.rowsPerPage)
                                        .map(
                                            studentOfferInstance => <TableRow
                                                key={studentOfferInstance.projectDetail.id}
                                                hover
                                            >
                                                {/** Offer name */}
                                                <TableCell colSpan={2} >
                                                    <Box display="flex" flexDirection="column" justifyContent="center" >
                                                        {/** Visibility + Name */}
                                                        <Box display="flex" flexDirection="row" >
                                                            {
                                                                isStudentProjectPublic(studentOfferInstance.projectDetail)
                                                                    ? <PublicIcon fontSize="small"/>
                                                                    : isStudentProjectRestricted(studentOfferInstance.projectDetail)
                                                                    ? <RestrictedIcon fontSize="small"/>
                                                                    : <PrivateIcon fontSize="small"/>
                                                            }
                                                            <Box width="15px" />
                                                            <CustomLink
                                                                url={
                                                                    isStudentDraftProject(studentOfferInstance.projectDetail)
                                                                        ? Routes.constructCreateProjectRoute(ManageCourseUrlState.courseNameFromUrl ?? null, {edit: studentOfferInstance.projectDetail.id})
                                                                        : Routes.constructProjectDetailRoute(ManageCourseUrlState.courseNameFromUrl ?? null, studentOfferInstance.projectDetail.id)
                                                                }
                                                                target={
                                                                    isStudentDraftProject(studentOfferInstance.projectDetail)
                                                                        ? "_blank"
                                                                        : ""
                                                                }
                                                                color="black"
                                                                activeColor={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                                                activeUnderline={false}
                                                                component="nav-link"
                                                                childComponent={
                                                                    <Typography
                                                                        variant="body2"
                                                                        align="left"
                                                                    >
                                                                        {studentOfferInstance.projectDetail.projectName ?? ""}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </Box>

                                                        {/** Created by (not available for issuers who are looking at their own offers table) */}
                                                        {
                                                            isTeacher(currentStudent)
                                                            && StudentOffersTableLocalState.tableStudent !== undefined
                                                            && currentStudent.id === StudentOffersTableLocalState.tableStudent.id
                                                                ? null
                                                                : <Box marginTop="10px" >
                                                                    <Typography variant="body2" align="left" color="textSecondary" >
                                                                        <i>
                                                                            {
                                                                                studentOfferInstance.projectDetail.createdByCourseTeacher
                                                                                    ? `Created by ${studentOfferInstance.course.displayName} admin`
                                                                                    : `Created by ${(studentOfferInstance.issuer as Student).firstName} ${(studentOfferInstance.issuer as Student).lastName}`
                                                                            }
                                                                        </i>
                                                                    </Typography>
                                                                </Box>
                                                        }

                                                        {/** Edit button (only available for draft project) */}
                                                        {
                                                            isStudent(currentStudent)
                                                                ? null
                                                                : !isStudentDraftProject(studentOfferInstance.projectDetail)
                                                                ? null
                                                                : <Box marginTop="18px" >
                                                                    <CustomLink
                                                                        url={
                                                                            Routes.constructCreateProjectRoute(ManageCourseUrlState.courseNameFromUrl ?? null, {edit: studentOfferInstance.projectDetail.id})
                                                                        }
                                                                        target="_blank"
                                                                        color="none"
                                                                        activeColor="none"
                                                                        activeUnderline={false}
                                                                        component="nav-link"
                                                                        childComponent={
                                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} >
                                                                                <CreateOutlined fontSize="small" />
                                                                                <Box width="8px" />
                                                                                Edit
                                                                            </Button>
                                                                        }
                                                                    />
                                                                </Box>
                                                        }
                                                    </Box>
                                                </TableCell>

                                                {/** Goal */}
                                                <TableCell colSpan={1} >
                                                    <Typography variant="body2" align="left" >
                                                        {
                                                            !studentOfferInstance.projectDetail.Pitch.fundRequired
                                                                ? ""
                                                                : `£${Number(studentOfferInstance.projectDetail.Pitch.fundRequired.toFixed(0)).toLocaleString()}`
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                {/** Posted / expiry dates */}
                                                <TableCell colSpan={1} >
                                                    <Box display="flex" flexDirection="column" >
                                                        <Typography variant="body2" align="left" >
                                                            {`Posted date: ${dateInReadableFormat(studentOfferInstance.projectDetail.Pitch.postedDate)}`}
                                                        </Typography>
                                                        <Box height="12px" />
                                                        <Typography variant="body2" align="left" >
                                                            {
                                                                !studentOfferInstance.projectDetail.Pitch.expiredDate
                                                                    ? "Expiry date: unknown"
                                                                    : `Expiry date: ${dateInReadableFormat(studentOfferInstance.projectDetail.Pitch.expiredDate)}`
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/** Status */}
                                                <TableCell colSpan={1} >
                                                    <Typography variant="body2" align="left" >
                                                        {
                                                            isStudentDraftProject(studentOfferInstance.projectDetail)
                                                                ? "Draft"
                                                                : isStudentProjectWaitingToGoLive(studentOfferInstance.projectDetail)
                                                                ? "Submitted. Awaiting course admin review"
                                                                : isProjectInLivePitchPhase(studentOfferInstance.projectDetail)
                                                                    ? isStudentProjectTemporarilyClosed(studentOfferInstance.projectDetail)
                                                                        ? "Temporarily closed"
                                                                        : "Live"
                                                                    : isStudentProjectPitchExpiredWaitingForAdminToCheck(studentOfferInstance.projectDetail)
                                                                        ? "Expired. Awaiting course admin review"
                                                                        : "Closed"
                                                        }
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )
                    }
                </TableBody>

                {/** Table footer */}
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            count={StudentOffersTableLocalState.studentOfferInstancesFilteredByName.length}
                            rowsPerPage={StudentOffersTableLocalState.rowsPerPage}
                            page={StudentOffersTableLocalState.currentPage}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                            }}
                            SelectProps={{
                                native: true,
                            }}
                            onChangePage={changePage}
                            onChangeRowsPerPage={changeRowsPerPage}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentOffersTable);