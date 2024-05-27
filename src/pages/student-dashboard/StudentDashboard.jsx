import React, {Component} from "react";
import FlexView from "react-flexview";
import {css, StyleSheet} from "aphrodite";
import Sidebar from "react-sidebar";
import {Badge, IconButton, Typography} from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";
import {Col, Container, Row} from "react-bootstrap";
import Menu from "@material-ui/icons/Menu";
import {HashLoader} from "react-spinners";

import firebase from "../../firebase/firebaseApp";

import UploadingDialog from "../../shared-components/uploading-dialog/UploadingDialog";
import EditImageDialog from "../../shared-components/edit-image/EditImageDialog";
import EditVideoDialog from "../../shared-components/edit-video/EditVideoDialog";
import PageNotFoundWhole from "../../shared-components/page-not-found/PageNotFoundWhole";
import ChangePasswordPage from "../../shared-components/change-password/ChangePasswordPage";
import SidebarContent, {
    CHANGE_PASSWORD_TAB,
    EXPLORE_COURSES_TAB,
    HOME_TAB,
    MY_OFFERS_TAB,
    PROFILE_TAB,
    RESOURCES_TAB
} from "../../shared-components/nav-bars/SidebarContent";
import {AUTH_SUCCESS} from "../signin/Signin";
import ProfileTab from "../../shared-components/profile/Profile";
import NotificationsBox from "../../shared-components/notifications/NotificationsBox";

import * as colors from "../../values/colors";
import * as DB_CONST from "../../firebase/databaseConsts";
import queryString from "query-string";
import * as ROUTES from "../../router/routes";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";

import {connect} from "react-redux";
import * as manageCourseFromParamsActions from "../../redux-store/actions/manageCourseFromParamsActions";
import * as dashboardSidebarActions from "../../redux-store/actions/dashboardSidebarActions";
import * as editStudentActions from "../../redux-store/actions/editStudentActions";
import * as notificationsActions from "../../redux-store/actions/notificationsActions";
import ExploreStudentOffers from "../../shared-components/explore-student-offers/ExploreStudentOffers";
import OffersTable from "../../shared-components/offers-table/OffersTable";
import ExploreCourses from "../../shared-components/explore-courses/ExploreCourses";
import Resources from "../resources/Resources";

import { safeGetItem, safeRemoveItem } from "../../utils/browser";

const mapStateToProps = state => {
    return {
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        courseProperties: state.manageCourseFromParams.courseProperties,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        sidebarDocked: state.dashboardSidebar.sidebarDocked,
        sidebarOpen: state.dashboardSidebar.sidebarOpen,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        student: state.auth.student,
        studentLoaded: state.auth.studentLoaded,

        notifications: state.manageNotifications.notifications,
        notificationsAnchorEl: state.manageNotifications.notificationsAnchorEl,
        notificationBellRef: state.manageNotifications.notificationBellRef,

        editStudentProfile_studentEdited: state.editStudent.studentEdited
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setCourseStudentNameFromParams: (courseStudentName) => dispatch(manageCourseFromParamsActions.setCourseStudentNameFromParams(courseStudentName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageCourseFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageCourseFromParamsActions.loadAngelNetwork()),

        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        editStudentProfile_setOriginalStudentAndEditedStudent: (student) => dispatch(editStudentActions.setOriginalStudentAndEditedStudent(student)),

        // projectsTable_setStudent: (student) => dispatch(projectsTableActions.setStudent(student)),

        toggleNotifications: (event) => dispatch(notificationsActions.toggleNotifications(event)),
        notificationRefUpdated: (ref) => dispatch(notificationsActions.notificationRefUpdated(ref)),
    }
};

class TeacherDashboard extends Component {

    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database();
        this.notificationBell = React.createRef();
    }

    componentDidMount() {


        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            setCourseStudentNameFromParams,
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

        setCourseStudentNameFromParams(match.params.hasOwnProperty('courseStudentName') ? match.params.courseStudentName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('courseStudentName') ? ROUTES.DASHBOARD_TEACHER : ROUTES.DASHBOARD_TEACHER_INVEST_WEST_SUPER, match.path);

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
    }

    /**
     * Set required data for components used within this dashboard
     */
    setDataForComponents = () => {
        const {
            student,
            editStudentProfile_studentEdited,

            editStudentProfile_setOriginalStudentAndEditedStudent,
            // projectsTable_setStudent
        } = this.props;

        if (!student || (student && student.type !== DB_CONST.TYPE_TEACHER)) {
            return;
        }

        if (!editStudentProfile_studentEdited) {
            // initialize a copied instance of the Student for editing
            editStudentProfile_setOriginalStudentAndEditedStudent(student);
        }

        // // set student so that information can be used in the projects table component
        // projectsTable_setStudent(student);
    };

    /**
     * This function gets called to change the main content of the page based on the tab chosen in the sidebar.
     */
    renderPageContent = () => {

        const params = queryString.parse(this.props.location.search);

        /**
         * HOME TAB
         */
        if (params.tab === HOME_TAB) {
            return <ExploreStudentOffers/>;
        }

        /**
         * MY OFFERS TAB
         */
        if (params.tab === MY_OFFERS_TAB) {
            return (
                <div
                    style={{
                        margin: 30
                    }}
                >
                    <OffersTable/>
                </div>
            );
        }

        /**
         * PROFILE TAB
         */
        if (params.tab === PROFILE_TAB) {
            return (
                <ProfileTab/>
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
         * EXPLORE COURSES TAB
         */
        if (params.tab === EXPLORE_COURSES_TAB) {
            // return (
            //     <ExploreCoursesTab/>
            // );
            return <ExploreCourses/>;
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
    };

    /**
     * Main render
     */
    render() {
        const {
            shouldLoadOtherData,
            courseProperties,
            coursePropertiesLoaded,

            sidebarDocked,
            sidebarOpen,

            authStatus,
            authenticating,
            student,
            studentLoaded,

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
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (authenticating || !studentLoaded) {
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

        if (authStatus !== AUTH_SUCCESS || !student || (student && student.type !== DB_CONST.TYPE_TEACHER)) {
            return <PageNotFoundWhole/>;
        }

        return (
            <Sidebar
                sidebar={
                    <SidebarContent dashboardProps={this.props}/>
                }
                shadow={false}
                open={sidebarOpen}
                docked={sidebarDocked}
                onSetOpen={() => toggleSidebar(true)}
                transitions
                styles={{sidebar: {backgroundColor: colors.blue_gray_50}, content: {backgroundColor: colors.gray_50}
                }}>

                <Container fluid style={{padding: 0}}>
                    {/** Header */}
                    <Row noGutters>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <FlexView height={55} width="100%" vAlignContent="center"
                                style={{
                                    backgroundColor:
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                }}>

                                <Row style={{width: "100%"}} noGutters>
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
                                    <Col xs={2} sm={2} md={1} lg={1} style={{paddingRight: 13}}>
                                        <FlexView vAlignContent="center" hAlignContent="right" width="100%">
                                            <div ref={this.notificationBell}>
                                            <IconButton onClick={toggleNotifications}>
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

                    {
                        this.renderPageContent()
                    }

                    {/** Notifications box */}
                    {notificationsAnchorEl !== null &&
                        <NotificationsBox/>
                    }

                    {/** Uploading dialog */}
                    <UploadingDialog/>

                    {/** Edit image dialog */}
                    <EditImageDialog/>

                    {/** Edit video dialog */}
                    <EditVideoDialog/>
                </Container>
            </Sidebar>
        );
    }

    /**
     * Render the title of the page
     *
     * @returns {*}
     */
    renderPageTitle = () => {
        const params = queryString.parse(this.props.location.search);

        let title = "";

        switch (params.tab) {
            case HOME_TAB:
                title = HOME_TAB;
                break;
            case MY_OFFERS_TAB:
                title = MY_OFFERS_TAB;
                break;
            case PROFILE_TAB:
                title = PROFILE_TAB;
                break;
            // case FORUMS_TAB:
            //     title = FORUMS_TAB;
            //     break;
            case RESOURCES_TAB:
                title = RESOURCES_TAB;
                break;
            case CHANGE_PASSWORD_TAB:
                title = CHANGE_PASSWORD_TAB;
                break;
            case EXPLORE_COURSES_TAB:
                title = EXPLORE_COURSES_TAB;
                break;
            default:
                return;
        }

        return (
            <Typography variant="h6" className={css(styles.page_title)}>{title}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeacherDashboard);

const styles = StyleSheet.create({
    page_title: {
        fontSize: 19,
        marginLeft: 8,
        color: colors.white
    }
});
