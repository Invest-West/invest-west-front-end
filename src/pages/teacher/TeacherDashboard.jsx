import React, {Component} from 'react';
import {css, StyleSheet} from 'aphrodite';
import Sidebar from 'react-sidebar';
import FlexView from 'react-flexview';
import {Col, Container, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {Accordion, AccordionDetails, AccordionSummary, Badge, Divider, IconButton, Typography} from '@material-ui/core';
import Menu from '@material-ui/icons/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotificationsIcon from '@material-ui/icons/Notifications';
import HashLoader from 'react-spinners/HashLoader';
import queryString from 'query-string';

import firebase from '../../firebase/firebaseApp';

import SidebarContent, {
    CHANGE_PASSWORD_TAB,
    EXPLORE_COURSES_TAB,
    EXPLORE_STUDENT_OFFERS_TAB,
    RESOURCES_TAB,
    COURSE_ACTIVITIES_TAB,
    HOME_TAB,
    MY_ACTIVITIES_TAB,
    SETTINGS_TAB
} from '../../shared-components/nav-bars/StudentSidebarContent';
import {STUDENT_AUTH_SUCCESS} from '../signin/studentSignIn/Studentsignin';
import InvitationDialog from './components/InvitationDialog';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import SuperTeacherSettings from './components/SuperTeacherSettings';
import CourseAdminSettings from './components/CourseAdminSettings';
import InvitedStudents from './components/InvitedStudents';
import AngelNetWorks from './components/AngelNetworks';
import AddAngelNetWorkDialog from './components/AddAngelNetWorkDialog';
import NotificationsBox from '../../shared-components/notifications/NotificationsBox';
import ChangePasswordPage from '../../shared-components/change-password/ChangePasswordPage';
import JoinRequests from './components/JoinRequests';
import ActivitiesTable from '../../shared-components/activities-components/ActivitiesTable';
import CourseAdminsTable from './components/CourseAdminsTable';

import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as dashboardSidebarActions from '../../redux-store/actions/dashboardSidebarActions';
import * as manageCourseFromParamsActions from '../../redux-store/actions/manageCourseFromParamsActions';
import * as notificationsActions from '../../redux-store/actions/notificationsActions';
import * as activitiesTableActions from '../../redux-store/actions/activitiesTableActions';
import * as courseAdminsTableActions from '../../redux-store/actions/courseAdminsTableActions';
import ExploreOffers from "../../shared-components/explore-offers/ExploreOffers";
import OffersTable from "../../shared-components/offers-table/OffersTable";
import {successfullyFetchedOffers} from "../../shared-components/offers-table/OffersTableReducer";
import {isProjectWaitingToGoLive} from "../../models/project";
import ExploreCourses from "../../shared-components/explore-courses/ExploreCourses";
import Resources from "../resources/Resources";

import { safeGetItem, safeRemoveItem } from "../../utils/browser";

export const MAX_CARD_DETAILS_HEIGHT = 2000;

const mapStateToProps = state => {
    return {
        AuthenticationState: state.AuthenticationState,
        OffersTableLocalState: state.OffersTableLocalState,

        // --- old states ----------------------------------------------------------------------------------------------
        courseStudent: state.manageCourseFromParams.courseStudent,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        courseProperties: state.manageCourseFromParams.courseProperties,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        sidebarDocked: state.dashboardSidebar.sidebarDocked,
        sidebarOpen: state.dashboardSidebar.sidebarOpen,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        currentStudent: state.auth.student,
        currentStudentLoaded: state.auth.studentLoaded,

        notifications: state.manageNotifications.notifications,
        notificationsAnchorEl: state.manageNotifications.notificationsAnchorEl,
        notificationBellRef: state.manageNotifications.notificationBellRef,

        joinRequests: state.manageJoinRequests.joinRequests,
        joinRequestsLoaded: state.manageJoinRequests.joinRequestsLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setCourseStudentFromParams: (courseStudent) => dispatch(manageCourseFromParamsActions.setCourseStudentFromParams(courseStudent)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageCourseFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageCourseFromParamsActions.loadAngelNetwork()),

        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        activitiesTable_setStudent: (student) => dispatch(activitiesTableActions.setTableStudent(student)),

        courseAdminsTable_setCourse: (course) => dispatch(courseAdminsTableActions.setCourse(course)),

        toggleNotifications: (event) => dispatch(notificationsActions.toggleNotifications(event)),
        notificationRefUpdated: (ref) => dispatch(notificationsActions.notificationRefUpdated(ref)),
    }
};

class AdminDashboard extends Component {

    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database();
        this.notificationBell = React.createRef();
    }

    /**
     * Set required data for components used within this dashboard
     */
    setDataForComponents = () => {
        const {
            currentStudent,
            courseProperties,

            // projectsTable_setStudent,
            activitiesTable_setStudent,
            courseAdminsTable_setCourse
        } = this.props;

        if (!currentStudent
            || (currentStudent && currentStudent.type !== DB_CONST.TYPE_PROF)
        ) {
            return;
        }

        // // set student so that information can be used in the projects table component
        // projectsTable_setStudent(currentStudent);

        // set student so that information can be used in the activities table component
        activitiesTable_setStudent(
            currentStudent.superTeacher
                ?
                currentStudent
                :
                courseProperties
        );

        // set course so that information can be used in the course teachers table component
        courseAdminsTable_setCourse(courseProperties);
    };

    /**
     * Component will mount
     */
    componentDidMount() {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            setCourseStudentFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork,

            notificationRefUpdated,

            history,
            match,
        } = this.props;

        const redirectTo = safeGetItem('redirectToAfterAuth');
        if (redirectTo) {
            safeRemoveItem('redirectToAfterAuth');
            history.push(redirectTo);
        }

        setCourseStudentFromParams(match.params.hasOwnProperty('courseStudent') ? match.params.courseStudent : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('courseStudent') ? ROUTES.PROF : ROUTES.TEACHER_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            loadAngelNetwork,

            notificationRefUpdated
        } = this.props;

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.setDataForComponents();
        }

        notificationRefUpdated(this.notificationBell.current);
    };

    /**
     * Render page content
     */
    renderPageContent = () => {
        const {
            AuthenticationState,
            OffersTableLocalState,

            currentStudent,

            joinRequests,
            joinRequestsLoaded
        } = this.props;

        const params = queryString.parse(this.props.location.search);

        let projectsAwaitingDecision = 0;
        // only do this if the table student is also set to the current teacher
        if (OffersTableLocalState.tableStudent && OffersTableLocalState.tableStudent.id === AuthenticationState.currentStudent.id) {
            if (successfullyFetchedOffers(OffersTableLocalState)) {
                OffersTableLocalState.offerInstances.forEach(offerInstance => {
                    if (isProjectWaitingToGoLive(offerInstance.projectDetail)) {
                        projectsAwaitingDecision += 1;
                    }
                });
            }
        }

        /**
         * HOME TAB
         */
        if (params.tab === HOME_TAB) {
            return (
                <Row noGutters style={{marginBottom: 30}}>
                    {/* Manage courses */}
                    {
                        !currentStudent.superTeacher
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <Typography paragraph variant="h6" color="primary" align="left">Manage courses</Typography>
                                            <Typography paragraph variant="body1" align="left">Manage courses that have joined the system.</Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FlexView column width="100%">
                                            <AngelNetWorks/>
                                        </FlexView>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                    {/* Manage course members (course teachers) / system students (super teachers) */}
                    <Col xs={12} md={12} lg={12}>
                        <Accordion className={css(styles.card_style)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <FlexView column>
                                    <Typography paragraph variant="h6" color="primary" align="left">
                                        {
                                            currentStudent.superTeacher
                                                ?
                                                "Manage system students"
                                                :
                                                "Manage course members"
                                        }
                                    </Typography>
                                    <Typography paragraph variant="body1" align="left">
                                        {
                                            currentStudent.superTeacher
                                                ?
                                                "Manage all the system students (students and teachers) including those who have been invited but not yet registered."
                                                :
                                                "Manage all the course members (students and teachers) including those who have been invited but not yet registered and those who joined this course from another course."
                                        }
                                    </Typography>
                                </FlexView>
                            </AccordionSummary>
                            <AccordionDetails className={css(styles.card_details_expansion)}>
                                <InvitedStudents/>
                            </AccordionDetails>
                        </Accordion>
                    </Col>

                    {/* Manage access requests */}
                    {
                        currentStudent.superTeacher
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <FlexView width="100%">
                                                <Typography paragraph variant="h6" color="primary" align="left">Manage access requests</Typography>
                                                <FlexView marginLeft={28} marginTop={8}>
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="top-start" flip
                                                        overlay={
                                                            <Tooltip id={`tooltip-top`}>
                                                                {joinRequests.length} access requests
                                                                are awaiting your review.
                                                            </Tooltip>
                                                        }>
                                                        <Badge badgeContent={!joinRequestsLoaded ? 0 : joinRequests.length} color="error"
                                                            invisible={
                                                                !joinRequestsLoaded
                                                                    ?
                                                                    true
                                                                    :
                                                                    joinRequests.length === 0
                                                            }/>
                                                    </OverlayTrigger>
                                                </FlexView>
                                            </FlexView>
                                            <Typography paragraph variant="body1" align="left">
                                                Manage access requests from other courses' students who would like
                                                to
                                                join this course.
                                            </Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails className={css(styles.card_details_expansion)}>
                                        <JoinRequests/>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                    {/* Manage offers */}
                    <Col xs={12} md={12} lg={12}>
                        <Accordion className={css(styles.card_style)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <FlexView column>
                                    <FlexView width="100%">
                                        <Typography paragraph variant="h6" color="primary" align="left">Manage offers</Typography>
                                        <FlexView marginLeft={28} marginTop={8}>
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="top-start" flip
                                                overlay={
                                                    <Tooltip
                                                        id={`tooltip-top`}
                                                    >
                                                        {
                                                            currentStudent.superTeacher
                                                                ?
                                                                `${projectsAwaitingDecision} offers are awaiting course teachers' review. Select "Awaiting review" from the "Phase" dropdown to see details.`
                                                                :
                                                                `${projectsAwaitingDecision} offers are awaiting your review. Select "Awaiting review" from the "Phase" dropdown to see details.`
                                                        }
                                                    </Tooltip>
                                                }>
                                                <Badge badgeContent={projectsAwaitingDecision} color="error"
                                                    invisible={projectsAwaitingDecision === 0}/>
                                            </OverlayTrigger>
                                        </FlexView>
                                    </FlexView>
                                    <Typography paragraph variant="body1" align="left">
                                        {
                                            currentStudent.superTeacher
                                                ?
                                                "Manage all the offers created by all the teachers and course teachers in the system."
                                                :
                                                "Manage all the offers created by the teachers and course teachers of this course."
                                        }
                                    </Typography>
                                </FlexView>
                            </AccordionSummary>
                            <AccordionDetails className={css(styles.card_details_expansion)}>
                                <FlexView column width="100%">
                                    <Divider style={{marginBottom: 15}}/>
                                    <OffersTable/>
                                </FlexView>
                            </AccordionDetails>
                        </Accordion>
                    </Col>

                    {/* Manage course teachers */}
                    {
                        currentStudent.superTeacher
                            ?
                            null
                            :
                            <Col xs={12} md={12} lg={12}>
                                <Accordion className={css(styles.card_style)}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <FlexView column>
                                            <Typography paragraph variant="h6" color="primary" align="left">Manage course teachers</Typography>
                                            <Typography paragraph variant="body1" align="left">Manage course teachers. Only super course teacher can add a new course
                                                teacher.</Typography>
                                        </FlexView>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FlexView column width="100%">
                                            <CourseAdminsTable/>
                                        </FlexView>
                                    </AccordionDetails>
                                </Accordion>
                            </Col>
                    }

                </Row>
            )
        }

        /**
         * SETTINGS TAB
         */
        if (params.tab === SETTINGS_TAB) {
            return (
                currentStudent.superTeacher
                    ?
                    <SuperTeacherSettings/>
                    :
                    <CourseAdminSettings/>
            );
        }

        /**
         * CHANGE PASSWORD TAB
         */
        if (params.tab === CHANGE_PASSWORD_TAB) {
            return (
                <ChangePasswordPage/>
            );
        }

        /**
         * FORUMS TAB
         */
        // if (params.tab === FORUMS_TAB) {
        //     return (
        //         <Forums/>
        //     );
        // }

        /**
         * RESOURCES TAB
         */
        if (params.tab === RESOURCES_TAB) {
            return (
                <Resources/>
            );
        }

        /**
         * COURSE ACTIVITIES TAB
         */
        if (params.tab === COURSE_ACTIVITIES_TAB || params.tab === MY_ACTIVITIES_TAB) {
            return (
                <div
                    style={{
                        margin: 30
                    }}
                >
                    <ActivitiesTable/>
                </div>
            );
        }

        /**
         * EXPLORE OFFERS TAB
         */
        if (params.tab === EXPLORE_STUDENT_OFFERS_TAB) {
            return <ExploreOffers/>;
        }

        /**
         * EXPLORE COURSES TAB
         */
        if (params.tab === EXPLORE_COURSES_TAB) {
            // return (
            //     <ExploreCourses/>
            // );
            return <ExploreCourses/>;
        }
    };

    render() {
        const {
            shouldLoadOtherData,
            coursePropertiesLoaded,
            courseProperties,

            sidebarDocked,
            sidebarOpen,

            authStatus,
            authenticating,
            currentStudent,
            currentStudentLoaded,

            notifications,
            notificationsAnchorEl,

            toggleSidebar,
            toggleNotifications
        } = this.props;

        if (!coursePropertiesLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader color={colors.primaryColor}/>
                </FlexView>
            )
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (authenticating || !currentStudentLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader
                        color={
                            !courseProperties
                                ?
                                colors.primaryColor
                                :
                                courseProperties.settings.primaryColor
                        }
                    />
                </FlexView>
            );
        }

        if (authStatus !== STUDENT_AUTH_SUCCESS
            || !currentStudent
            || (currentStudent && currentStudent.type !== DB_CONST.TYPE_PROF)
        ) {
            return <PageNotFoundWhole/>;
        }

        return <Sidebar
            sidebar={
                <SidebarContent
                    dashboardProps={this.props}
                />
            }
            shadow={false}
            open={sidebarOpen}
            docked={sidebarDocked}
            onSetOpen={() => toggleSidebar(true)}
            transitions
            styles={{
                sidebar: {backgroundColor: colors.blue_gray_50},
                content: {backgroundColor: colors.gray_100}
            }}
        >
            <Container
                fluid
                style={{ padding: 0}}>
                {/** Header */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView height={55} width="100%" vAlignContent="center"
                         style={{backgroundColor:
                                    !courseProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        courseProperties.settings.primaryColor
                            }}>
                            <Row style={{width: "100%"}} noGutters>
                                {/** Page title */}
                                <Col xs={10} sm={10} md={11} lg={11}>
                                    <FlexView vAlignContent="center" width="100%">
                                        {
                                            <IconButton className={css(sharedStyles.hamburger_button)} onClick={() => toggleSidebar(true)}>
                                                <Menu/>
                                            </IconButton>
                                        }
                                        {
                                            this.renderPageTitle()
                                        }
                                    </FlexView>
                                </Col>

                                {/** Notification icon */}
                                <Col xs={2} sm={2} md={1} lg={1} style={{paddingRight: 13}}>
                                    <FlexView vAlignContent="center" hAlignContent="right" width="100%" >
                                        <div ref={this.notificationBell}>
                                        <IconButton onMouseDown={ (e) => {toggleNotifications(e)} } id="notification-button">
                                            <Badge badgeContent={notifications.length} color="secondary" invisible={notifications.length === 0}>
                                                <NotificationsIcon className={css(sharedStyles.white_text)}/>
                                            </Badge>
                                        </IconButton>
                                        </div>
                                    </FlexView>
                                </Col>
                            </Row>
                        </FlexView>
                    </Col>
                </Row>

                <Row noGutters style={{backgroundColor: colors.white}}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="body1" align="center" style={{paddingTop: 16,paddingBottom: 16}}>
                            {
                                currentStudent.superTeacher
                                    ?
                                    "System teacher"
                                    :
                                    currentStudent.superCourseAdmin
                                        ?
                                        "Super course teacher"
                                        :
                                        "Course teacher"
                            }
                            : <b>{currentStudent.email}</b>
                        </Typography>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{backgroundColor: colors.kick_starter_gray_box_border}}/>
                    </Col>
                </Row>

                {
                    this.renderPageContent()
                }
            </Container>

            {/** Notifications box */}
            {notificationsAnchorEl !== null &&
                <NotificationsBox/>
            }

            {/** Student invitation dialog */}
            <InvitationDialog/>

            {/** Add angel network dialog */}
            <AddAngelNetWorkDialog/>
        </Sidebar>;
    }

    /**
     * Render page's title
     *
     * @returns {*}
     */
    renderPageTitle = () => {
        const params = queryString.parse(this.props.location.search);

        let title = '';

        switch (params.tab) {
            case HOME_TAB:
                title = HOME_TAB;
                break;
            case SETTINGS_TAB:
                title = SETTINGS_TAB;
                break;
            case CHANGE_PASSWORD_TAB:
                title = CHANGE_PASSWORD_TAB;
                break;
            // case FORUMS_TAB:
            //     title = FORUMS_TAB;
            //     break;
            case RESOURCES_TAB:
                title = RESOURCES_TAB;
                break;
            case COURSE_ACTIVITIES_TAB:
                title = COURSE_ACTIVITIES_TAB;
                break;
            case EXPLORE_COURSES_TAB:
                title = EXPLORE_COURSES_TAB;
                break;
            case EXPLORE_STUDENT_OFFERS_TAB:
                title = EXPLORE_STUDENT_OFFERS_TAB;
                break;
            default:
                return;
        }

        return (
            <Typography variant="h6" className={css(styles.page_title)}>
                {title}
            </Typography>
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboard);

const styles = StyleSheet.create({
    page_title: {
        fontSize: 19,
        marginLeft: 8,
        color: colors.white
    },

    card_style: {
        marginTop: 25,
        marginLeft: 30,
        marginRight: 30
    },

    card_details_expansion: {
        maxHeight: MAX_CARD_DETAILS_HEIGHT,
        overflowY: "auto"
    }
});