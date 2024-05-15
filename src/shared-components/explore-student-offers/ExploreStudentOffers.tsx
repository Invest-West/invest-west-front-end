import React, {Component, FormEvent} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Col, Row} from "react-bootstrap";
import CourseRepository from "../../api/repositories/CourseRepository";
import CourseProperties from "../../models/course_properties";
import {
    Box,
    Button, colors,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Typography
} from "@material-ui/core";
import {
    calculatePaginationIndices,
    calculatePaginationPages,
    ExploreStudentOffersState,
    hasNotFetchedOffers,
    hasOffersForCurrentFilters,
    isFetchingOffers,
    isSearchFilterActive,
    successfullyFetchedOffers
} from "./ExploreStudentOffersReducer";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {getCourseRouteTheme, ManageCourseUrlState} from "../../redux-store/reducers/manageCourseUrlReducer";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {clearSearchFilter, fetchStudentOffers, filterChanged, onSearchEnter, paginationChanged} from "./ExploreStudentOffersActions";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {BeatLoader} from "react-spinners";
import OfferItem from "./OfferStudentItem";
import {Pagination} from "@material-ui/lab";
import RiskWarning from "../risk-warning/RiskWarning";
import {isTeacher} from "../../models/student";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";
import CreateIcon from "@material-ui/icons/CreateOutlined";
import RefreshIcon from "@material-ui/icons/Refresh";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {FetchStudentProjectsOrderByOptions, FetchStudentProjectsPhaseOptions} from "../../api/repositories/StudentOfferRepository";
import {Close, Search} from "@material-ui/icons";

interface ExploreStudentOffersProps {
    MediaQueryState: MediaQueryState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageCourseUrlState: ManageCourseUrlState;
    AuthenticationState: AuthenticationState;
    ExploreStudentOffersLocalState: ExploreStudentOffersState;
    onSearchEnter: (event: FormEvent) => any;
    fetchStudentOffers: (orderBy?: string) => any;
    filterChanged: (event: any) => any;
    clearSearchFilter: () => any;
    paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageCourseUrlState: state.ManageCourseUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreStudentOffersLocalState: state.ExploreStudentOffersLocalState,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        onSearchEnter: (event: FormEvent) => dispatch(onSearchEnter(event)),
        fetchStudentOffers: (orderBy?: string) => dispatch(fetchStudentOffers(orderBy)),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        clearSearchFilter: () => dispatch(clearSearchFilter()),
        paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => dispatch(paginationChanged(event, page))
    }
}

interface ExploreStudentOffersComponentState {
    courses: CourseProperties[];
  }

  class ExploreStudentOffers extends Component<ExploreStudentOffersProps, ExploreStudentOffersComponentState> {
    constructor(props: ExploreStudentOffersProps) {
      super(props);
      this.state = {
        courses: [],
      };
    }
  
    componentDidMount() {
        if (hasNotFetchedOffers(this.props.ExploreStudentOffersLocalState)) {
          this.props.fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase);
        }
        this.fetchCourses();
      }
  
      fetchCourses = async () => {
        try {
          const response = await new CourseRepository().fetchCourses();
          this.setState({ courses: response.data });
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      };
  
    render() {
        const {
            MediaQueryState,
            ManageSystemAttributesState,
            ManageCourseUrlState,
            AuthenticationState,
            ExploreStudentOffersLocalState,
            fetchStudentOffers,
            filterChanged,
            clearSearchFilter,
            paginationChanged,
            onSearchEnter,
        } = this.props;

        const paginationPages = calculatePaginationPages(ExploreStudentOffersLocalState);
        const paginationIndices = calculatePaginationIndices(ExploreStudentOffersLocalState);

        return <Box
            paddingX={MediaQueryState.isMobile ? "20px" : "56px"}
            paddingY={MediaQueryState.isMobile ? "15px" : "40px"}
        >
            <Row>
                {/** Course filter for Explore offers */}
                <Col xs={12} sm={12} md={6} lg={4}>
                    <Box paddingY="6px">
                    <Typography variant="body1">Course:</Typography>
                    <Box height="8px" />
                    <Paper>
                        <Select
                        fullWidth
                        variant="outlined"
                        name="courseFilter"
                        value={ExploreStudentOffersLocalState.courseFilter}
                        onChange={filterChanged}
                        input={<OutlinedInput />}
                        /* disabled={!successfullyFetchedOffers(ExploreStudentOffersLocalState)}  */
                        >
                        <MenuItem key="all" value="all">
                            All
                        </MenuItem>
                        {this.state.courses.map((course) => (
                            <MenuItem key={course.anid} value={course.anid}>
                            {course.displayName}
                            </MenuItem>
                        ))}
                        </Select>
                    </Paper>
                    </Box>
                </Col>


                {/** Sector filter */}
                <Col xs={12} sm={12} md={6} lg={4} >
                    <Box paddingY="6px" >
                        <Typography variant="body1">Sector:</Typography>
                        <Box height="8px" />
                        <Paper>
                            <Select
                                fullWidth
                                variant="outlined"
                                name="sectorFilter"
                                value={ExploreStudentOffersLocalState.sectorFilter}
                                onChange={filterChanged}
                               /* disabled={!successfullyFetchedOffers(ExploreStudentOffersLocalState)} */
                                input={<OutlinedInput/>}
                            >
                                <MenuItem key="all" value="all">All sectors</MenuItem>

                                {
                                    !ManageSystemAttributesState.systemAttributes
                                        ? null
                                        : ManageSystemAttributesState.systemAttributes.Sectors.map((sector, index) => (
                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                        ))
                                }
                            </Select>
                        </Paper>
                    </Box>
                </Col>

                {/** Status filter */}
                <Col xs={12} sm={12} md={6} lg={4}>
                <Box paddingY="6px">
                    <Typography variant="body1">Status:</Typography>
                    <Box height="8px" />
                    <Paper>
                        <Select
                            fullWidth
                            variant="outlined"
                            name="phaseFilter"
                            value={ExploreStudentOffersLocalState.phaseFilter}
                            onChange={filterChanged}
                            input={<OutlinedInput />}
                        >
                            <MenuItem key={FetchStudentProjectsPhaseOptions.Live} value={FetchStudentProjectsPhaseOptions.Live}>
                                Live
                            </MenuItem>
                            <MenuItem key={FetchStudentProjectsPhaseOptions.ExpiredPitch} value={FetchStudentProjectsPhaseOptions.ExpiredPitch}>
                                Expired
                            </MenuItem>
                        </Select>
                    </Paper>
                </Box>
            </Col>
            </Row>

            {/** Search bar */}
            <Row style={{ marginTop: 40 }} >
                <Col xs={12} sm={12} md={8} lg={4} >
                    <Box
                        width="100%"
                        height="100%"
                        bgcolor="white"
                        border={2}
                        borderColor={colors.grey[300]}
                        borderRadius="20px"
                        paddingX="5px"
                        paddingY="8px"
                    >
                        <form onSubmit={onSearchEnter} >
                            <InputBase
                                fullWidth
                                name="searchFilter"
                                value={ExploreStudentOffersLocalState.searchFilter}
                                placeholder="Search name, course or teacher"
                                onChange={filterChanged}
                                disabled={!successfullyFetchedOffers(ExploreStudentOffersLocalState)}
                                startAdornment={
                                    <InputAdornment position="start" >
                                        <IconButton
                                            type="submit"
                                            onClick={() => fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase)}
                                            disabled={!successfullyFetchedOffers(ExploreStudentOffersLocalState)}
                                        >
                                            <Search fontSize="small"/>
                                        </IconButton>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    !isSearchFilterActive(ExploreStudentOffersLocalState)
                                        ? null
                                        : <InputAdornment position="end" >
                                            <IconButton onClick={() => clearSearchFilter()} >
                                                <Close fontSize="small"/>
                                            </IconButton>
                                        </InputAdornment>
                                }
                            />
                        </form>
                    </Box>
                </Col>
            </Row>

            {/** Loader */}
            {
                !isFetchingOffers(ExploreStudentOffersLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" marginY="50px" justifyContent="center" >
                                <BeatLoader color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main} />
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Offers */}
            {
                !successfullyFetchedOffers(ExploreStudentOffersLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            {
                                !hasOffersForCurrentFilters(ExploreStudentOffersLocalState)
                                    ? <Box marginY="80px" >
                                        <Typography align="center" variant="h5" >There are no offers available using your current filter criteria</Typography>
                                    </Box>
                                    : <Box>
                                        {/** Explore n offers + refresh button */}
                                        <Box
                                            display="flex"
                                            flexDirection="row"
                                            alignItems="center"
                                            marginTop="50px"
                                            marginBottom="25px"
                                        >
                                            <Typography variant="h6">Explore</Typography>
                                            <Typography variant="h6" color="primary">&nbsp;<b>{ExploreStudentOffersLocalState.offerStudentInstances.length} projects</b></Typography>
                                            <Box marginLeft="8px" >
                                                <IconButton onClick={() => fetchStudentOffers(FetchStudentProjectsOrderByOptions.Phase)} >
                                                    <RefreshIcon/>
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/** Create offer button (only available for issuers) */}
                                        {
                                            !AuthenticationState.currentStudent
                                                ? null
                                                : !isTeacher(AuthenticationState.currentStudent)
                                                ? null
                                                : <Box marginBottom="40px" >
                                                    <CustomLink
                                                        url={Routes.constructCreateProjectRoute(ManageCourseUrlState.courseNameFromUrl ?? null)}                                                  
                                                        color="none"
                                                        activeColor="none"
                                                        activeUnderline={false}
                                                        component="a"
                                                        childComponent={
                                                            <Button size="medium" variant="contained" color="primary" className={css(sharedStyles.no_text_transform)} >
                                                                <Box marginRight="8px" >
                                                                    <CreateIcon fontSize="small" />
                                                                </Box>Create new offer
                                                            </Button>
                                                        }
                                                    />
                                                </Box>
                                        }

                                        {/** Offers area */}
                                        <Row>
                                            {
                                                ExploreStudentOffersLocalState.offerStudentInstances
                                                    .slice(paginationIndices.startIndex, paginationIndices.endIndex + 1)
                                                    .map(offerStudentInstance => (
                                                        <Col key={offerStudentInstance.projectDetail.id} xs={12} sm={12} md={6} lg={3} >
                                                            <Box margin="16px" >
                                                                <OfferItem offerStudentInstance={offerStudentInstance} />
                                                            </Box>
                                                        </Col>
                                                    ))
                                            }
                                        </Row>
                                    </Box>
                            }
                        </Col>
                    </Row>
            }

            {/** Pagination */}
            {
                !successfullyFetchedOffers(ExploreStudentOffersLocalState)
                    ? null
                    : paginationPages === 1
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" justifyContent="center" marginTop="55px" >
                                <Pagination count={paginationPages} page={ExploreStudentOffersLocalState.currentPage} color="primary" onChange={paginationChanged} />
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Risk warning */}
            <Row noGutters >
                <Col xs={12} sm={12} md={12} lg={12} >
                    <Box marginTop="100px" >
                        <RiskWarning/>
                    </Box>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreStudentOffers);