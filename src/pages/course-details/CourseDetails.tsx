import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    CourseDetailsState,
    hasAccessRequestsBeenSatisfied,
    hasErrorLoadingData,
    isLoadingData, isRemovingAccessRequest, isSendingAccessRequest,
    successfullyLoadedData
} from "./CourseDetailsReducer";
import {Box, Button, colors, Divider, Paper, Typography, Link} from "@material-ui/core";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {Col, Image, Row} from "react-bootstrap";
import {BeatLoader} from "react-spinners";
import {getCourseRouteTheme, ManageCourseUrlState} from "../../redux-store/reducers/manageCourseUrlReducer";
import {loadData, removeAccessRequest, sendAccessRequest} from "./CourseDetailsActions";
import {getCourseLogo} from "../../models/course_properties";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import Admin, {isAdmin} from "../../models/admin";
import {dateInReadableFormat} from "../../utils/utils";
import CourseOfMembership, {getHomeCourse} from "../../models/course_of_membership";
import {CheckCircle} from "@material-ui/icons";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import * as appColors from "../../values/colors";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import Footer from "../../shared-components/footer/Footer";

interface CourseDetailsProps {
    MediaQueryState: MediaQueryState;
    ManageCourseUrlState: ManageCourseUrlState;
    AuthenticationState: AuthenticationState;
    CourseDetailsLocalState: CourseDetailsState;
    loadData: (viewedCourseUserName: string) => any;
    sendAccessRequest: () => any;
    removeAccessRequest: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageCourseUrlState: state.ManageCourseUrlState,
        AuthenticationState: state.AuthenticationState,
        CourseDetailsLocalState: state.CourseDetailsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadData: (viewedCourseUserName: string) => dispatch(loadData(viewedCourseUserName)),
        sendAccessRequest: () => dispatch(sendAccessRequest()),
        removeAccessRequest: () => dispatch(removeAccessRequest())
    }
}

class CourseDetails extends Component<CourseDetailsProps & Readonly<RouteComponentProps<RouteParams>>, any> {

    componentDidMount() {
        this.props.loadData(this.props.match.params.viewedCourseUserName);
    }

    render() {
        const {
            MediaQueryState,
            ManageCourseUrlState,
            AuthenticationState,
            CourseDetailsLocalState,
            sendAccessRequest,
            removeAccessRequest
        } = this.props;

        const currentUser = AuthenticationState.currentUser;

        if (!currentUser) {
            return null;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        // loading
        if (isLoadingData(CourseDetailsLocalState)) {
            return <Box display="flex" justifyContent="center" marginTop="50px">
                <BeatLoader
                    color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                />
            </Box>;
        }

        // error
        if (hasErrorLoadingData(CourseDetailsLocalState) || !successfullyLoadedData(CourseDetailsLocalState)) {
            return <Box display="flex" justifyContent="center" alignItems="center" marginTop="50px">
                <Typography variant="h5" color="error" align="center">Error loading page. Please retry.</Typography>
            </Box>;
        }

        let courseMember: CourseOfMembership | undefined = undefined;
        if (!currentAdmin) {
            courseMember = AuthenticationState.coursesOfMembership.find(
                courseOfMembership => courseOfMembership.course.anid === CourseDetailsLocalState.course?.anid);
        }

        let hasRequestedToAccessCourse: boolean = false;
        if (hasAccessRequestsBeenSatisfied(CourseDetailsLocalState)) {
            hasRequestedToAccessCourse = CourseDetailsLocalState.accessRequestsInstances
                ?.findIndex(accessRequestInstance => accessRequestInstance.course.anid === CourseDetailsLocalState.course?.course) !== -1;
        }

        // successfully loaded
        return <Box paddingY={MediaQueryState.isMobile ? "15px" : "40px"}>
            {/** Header section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box>
                        <Paper>
                            <Box padding="20px">
                                <Row noGutters>
                                    {/** Logo section */}
                                    <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 12, order: 1}} lg={{span: 3, order: 1}}>
                                        <Box display="flex"justifyContent="center" alignItems="center">
                                            <Link href={CourseDetailsLocalState.course?.website ?? ""} target="_blank">
                                                <Image alt={`${CourseDetailsLocalState.course?.displayName} logo`} src={getCourseLogo(CourseDetailsLocalState.course ?? null) ?? undefined} style={{width: "100%", height: "auto", padding: 20, objectFit: "scale-down"}}/>
                                            </Link>
                                        </Box>
                                    </Col>

                                    {/** Name section */}
                                    <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} md={{span: 12, order: 2}} lg={{span: 9, order: 2}}>
                                        <Box display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
                                            <Typography align="center" variant="h4">{CourseDetailsLocalState.course?.displayName}</Typography>

                                            {/** Home/platform member + joined date (available for investor and issuer) */}
                                            {
                                                currentAdmin
                                                    ? null
                                                    : !courseMember
                                                    ? <Box marginTop="25px">
                                                        {
                                                            !hasRequestedToAccessCourse
                                                                ? <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => sendAccessRequest()} disabled={isSendingAccessRequest(CourseDetailsLocalState)}>
                                                                    {
                                                                        isSendingAccessRequest(CourseDetailsLocalState)
                                                                            ? "Sending request ..."
                                                                            : "Join Course"
                                                                    }
                                                                </Button>
                                                                : <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => removeAccessRequest()} disabled={isRemovingAccessRequest(CourseDetailsLocalState)}>
                                                                    {
                                                                        isRemovingAccessRequest(CourseDetailsLocalState)
                                                                            ? "Cancelling ..."
                                                                            : "Cancel request"
                                                                    }
                                                                </Button>
                                                        }
                                                    </Box>
                                                    : <Box marginTop="25px">
                                                        <Box display="flex" flexDirection="row">
                                                            <CheckCircle fontSize="small" color="primary"/>
                                                            <Box width="6px"/>
                                                            <Typography variant="body1" align="center" color="textSecondary">
                                                                {
                                                                    getHomeCourse(AuthenticationState.coursesOfMembership)?.course.anid === courseMember.course.anid
                                                                        ? "Home member"
                                                                        : "Platform member"
                                                                }
                                                            </Typography>
                                                        </Box>


                                                        <Box marginTop="5px">
                                                            <Typography variant="body1" align="center" color="textSecondary">
                                                                Joined
                                                                on: {dateInReadableFormat(courseMember.joinedDate)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                            }
                                        </Box>
                                    </Col>
                                </Row>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** About section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box marginTop="25px">
                        <Paper>
                            <Box padding="20px">
                                <Typography variant="h6">About</Typography>

                                <Box marginTop="18px" whiteSpace="pre-line">
                                    <Typography variant="body1" align="left">{CourseDetailsLocalState.course?.description}</Typography>
                                </Box>

                                <Box marginTop="18px">
                                    <Typography variant="body1" align="left">For more information, visit us at:&nbsp;
                                        <CustomLink
                                            url={CourseDetailsLocalState.course?.website ?? ""}
                                            target="_blank"
                                            color="none"
                                            activeColor="none"
                                            activeUnderline={true}
                                            component="a"
                                            childComponent={
                                                CourseDetailsLocalState.course?.website ?? "unknown"
                                            }/>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Statistics section */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                    <Box marginTop="25px">
                        <Paper>
                            <Box padding="20px">
                                <Typography variant="h6">Statistics</Typography>

                                <Box marginTop="20px" border={`1px solid ${colors.grey["300"]}`} bgcolor={appColors.kick_starter_background_color}>
                                    <Row>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <Box padding="18px">
                                                <Typography variant="h4" align="left">{CourseDetailsLocalState.members?.length}</Typography>
                                                    <Box height="2px"/>
                                                <Typography variant="body1" align="left">Members</Typography>
                                            </Box>
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <Box display="flex" flexDirection="row">
                                                <Box>
                                                    <Divider orientation="vertical"/>
                                                </Box>

                                                <Box padding="18px">
                                                    <Typography variant="h4" align="left">{CourseDetailsLocalState.offers?.length}</Typography>

                                                    <Box height="2px"/>

                                                    <Typography variant="body1" align="left">Investment opportunities</Typography>
                                                </Box>
                                            </Box>
                                        </Col>
                                    </Row>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Footer */}
            <Row noGutters>
                <Col xs={12} sm={12} md={12} lg={12}>
                    <Footer/>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseDetails);