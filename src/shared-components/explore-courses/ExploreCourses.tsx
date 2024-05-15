import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {
    calculatePaginationIndices,
    calculatePaginationPages,
    ExploreCoursesState,
    hasCoursesForCurrentFilters,
    hasNotFetchedCourses,
    isFetchingCourses,
    isFilteringCoursesByName,
    successfullyFetchedCourses
} from "./ExploreCoursesReducer";
import {
    Box,
    Card,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Select,
    Typography
} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {getCourseRouteTheme, ManageCourseUrlState} from "../../redux-store/reducers/manageCourseUrlReducer";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Close, Refresh, Search} from "@material-ui/icons";
import {
    cancelFilteringCoursesByName,
    fetchCourses,
    filterChanged,
    filterCoursesByName,
    paginationChanged
} from "./ExploreCoursesActions";
import {BeatLoader} from "react-spinners";
import CourseItem from "./CourseItem";
import {isTeacher} from "../../models/teacher";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {Pagination} from "@material-ui/lab";

interface ExploreCoursesProps {
    MediaQueryState: MediaQueryState;
    ManageCourseUrlState: ManageCourseUrlState;
    AuthenticationState: AuthenticationState;
    ExploreCoursesLocalState: ExploreCoursesState;
    fetchCourses: () => any;
    filterChanged: (event: any) => any;
    filterCoursesByName: () => any;
    cancelFilteringCoursesByName: () => any;
    paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageCourseUrlState: state.ManageCourseUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreCoursesLocalState: state.ExploreCoursesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        fetchCourses: () => dispatch(fetchCourses()),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        filterCoursesByName: () => dispatch(filterCoursesByName()),
        cancelFilteringCoursesByName: () => dispatch(cancelFilteringCoursesByName()),
        paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => dispatch(paginationChanged(event, page))
    }
}

class ExploreCourses extends Component<ExploreCoursesProps, any> {

    componentDidMount() {
        if (hasNotFetchedCourses(this.props.ExploreCoursesLocalState)) {
            this.props.fetchCourses();
        }
    }

    render() {
        const {
            MediaQueryState,
            ManageCourseUrlState,
            AuthenticationState,
            ExploreCoursesLocalState,
            fetchCourses,
            filterChanged,
            filterCoursesByName,
            cancelFilteringCoursesByName,
            paginationChanged
        } = this.props;

        if (!AuthenticationState.currentStudent) {
            return null;
        }

        const paginationPages = calculatePaginationPages(ExploreCoursesLocalState);
        const paginationIndices = calculatePaginationIndices(ExploreCoursesLocalState);

        return <Box paddingX={MediaQueryState.isMobile ? "20px" : "56px"} paddingY={MediaQueryState.isMobile ? "15px" : "40px"} >
            <Row noGutters >
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}} >
                    <Card elevation={0} >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            bgcolor={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                            color="white"
                            paddingY="28px"
                        >
                            <Typography variant="h6" align="center">Courses on Invest West network</Typography>

                            <Box height="28px" />

                            <Box width="85%" height="100%" bgcolor="white" borderRadius="50px" >
                                <InputBase
                                    fullWidth
                                    name="nameFilter"
                                    value={ExploreCoursesLocalState.nameFilter}
                                    placeholder="Search course by name"
                                    onChange={filterChanged}
                                    disabled={!successfullyFetchedCourses(ExploreCoursesLocalState)}
                                    startAdornment={
                                        <InputAdornment position="start" >
                                            <IconButton
                                                onClick={() => filterCoursesByName()}
                                                disabled={!successfullyFetchedCourses(ExploreCoursesLocalState)}
                                            >
                                                <Search fontSize="small"/>
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        !isFilteringCoursesByName(ExploreCoursesLocalState)
                                            ? null
                                            : <InputAdornment position="end" >
                                                <IconButton onClick={() => cancelFilteringCoursesByName()} >
                                                    <Close fontSize="small"/>
                                                </IconButton>
                                            </InputAdornment>
                                    }
                                />
                            </Box>
                        </Box>
                    </Card>
                </Col>
            </Row>

            {/** Filters (only available for teacher and investor) */}
            {
                isTeacher(AuthenticationState.currentStudent)
                    ? null
                    : <Row noGutters >
                        <Col xs={8} sm={8} md={3} lg={2} >
                            <Box display="flex" flexDirection="row" marginTop="48px" >
                                <Select
                                    fullWidth
                                    name="courseFilter"
                                    value={ExploreCoursesLocalState.courseFilter}
                                    variant="outlined"
                                    margin="dense"
                                    input={<OutlinedInput/>}
                                    onChange={filterChanged}
                                    disabled={!successfullyFetchedCourses(ExploreCoursesLocalState)}
                                >
                                    <MenuItem key="all" value="all">All courses</MenuItem>
                                    <MenuItem key="coursesOfMembership" value="coursesOfMembership">My courses</MenuItem>
                                    <MenuItem key="coursesOfPendingRequest" value="coursesOfPendingRequest">Pending requests</MenuItem>
                                </Select>

                                <Box width="15px" />

                                <IconButton onClick={() => fetchCourses()} >
                                    <Refresh/>
                                </IconButton>
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Loader */}
            {
                !isFetchingCourses(ExploreCoursesLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" marginY="80px" justifyContent="center" >
                                <BeatLoader color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main} />
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Courses area */}
            {
                !successfullyFetchedCourses(ExploreCoursesLocalState)
                    ? null
                    : !hasCoursesForCurrentFilters(ExploreCoursesLocalState)
                    ? <Box marginY="80px" >
                        <Typography align="center" variant="h5" > There are no courses available using your current filter criteria </Typography>
                    </Box>
                    : <Box marginTop="30px" >
                        <Row noGutters >
                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Row>
                                    {
                                        ExploreCoursesLocalState.coursesFiltered
                                            .slice(paginationIndices.startIndex, paginationIndices.endIndex + 1)
                                            .map(course =>
                                                <Col key={course.anid} xs={12} sm={12} md={4} lg={3} xl={2} >
                                                    <CourseItem course={course} />
                                                </Col>
                                            )
                                    }
                                </Row>
                            </Col>
                        </Row>
                    </Box>
            }

            {/** Pagination */}
            {
                !successfullyFetchedCourses(ExploreCoursesLocalState)
                    ? null
                    : paginationPages === 1
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" justifyContent="center" marginTop="55px" >
                                <Pagination count={paginationPages} page={ExploreCoursesLocalState.currentPage} color="primary" onChange={paginationChanged} />
                            </Box>
                        </Col>
                    </Row>
            }
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreCourses);