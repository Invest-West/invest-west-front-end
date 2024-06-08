import React, {Component} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import HashLoader from 'react-spinners/HashLoader';
import FlexView from "react-flexview";

import {connect} from 'react-redux';
import * as manageCourseFromParamsActions from '../../redux-store/actions/manageCourseFromParamsActions';
import * as editStudentActions from '../../redux-store/actions/editStudentActions';
import * as activitiesTableActions from '../../redux-store/actions/activitiesTableActions';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';

import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as ROUTES from '../../router/routes';
import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';

import {STUDENT_AUTH_SUCCESS} from '../signin/studentSignIn/Studentsignin';
import PageNotFoundWhole from '../../shared-components/page-not-found/PageNotFoundWhole';
import Profile from '../../shared-components/profile/Profile';

const mapStateToProps = state => {
    return {
        AuthenticationState: state.AuthenticationState,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,
        authStatus: state.auth ? state.auth.authStatus : null,
        authenticating: state.auth ? state.auth.authenticating : false,
        teacher: state.auth ? state.auth.student : null,
        teacherLoaded: state.auth ? state.auth.studentLoaded : false,
        editStudentProfile_studentEdited: state.editStudent.studentEdited,
        projectsTable_student: state.projectsTable ? state.projectsTable.student : null
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setCourseStudentNameFromParams: (courseStudentName) => dispatch(manageCourseFromParamsActions.setCourseStudentNameFromParams(courseStudentName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageCourseFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageCourseFromParamsActions.loadAngelNetwork()),

        editStudentProfile_setOriginalStudentAndEditedStudent: (student) => dispatch(editStudentActions.setOriginalStudentAndEditedStudent(student)),
        editStudentProfile_startOriginalStudentChangedListener: () => dispatch(editStudentActions.startOriginalStudentChangedListener()),
        editStudentProfile_stopOriginalStudentChangedListener: () => dispatch(editStudentActions.stopOriginalStudentChangedListener()),

        // projectsTable_setStudent: (student) => dispatch(projectsTableActions.setStudent(student)),
        // projectsTable_stopListeningForProjectsChanged: () => dispatch(projectsTableActions.stopListeningForProjectsChanged()),
        // projectsTable_stopListeningForPledgesChanged: () => dispatch(projectsTableActions.stopListeningForPledgesChanged()),
        // projectsTable_stopListeningForPledgesMadeByTableInvestor: () => dispatch(projectsTableActions.stopListeningForPledgesMadeByTableInvestor()),

        activitiesTable_setStudent: (student) => dispatch(activitiesTableActions.setTableStudent(student)),
        activitiesTable_stopListeningForActivitiesChanged: () => dispatch(activitiesTableActions.stopListeningForActivitiesChanged()),

        setFeedbackSnackbarContent: (message, color, position) => dispatch(feedbackSnackbarActions.setFeedbackSnackbarContent(message, color, position))
    }
};

class StudentProfilePageEditable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            studentToBeEdited: null,
            studentToBeEditedLoaded: false,
            loadingStudentToBeEdited: false
        }
    }

    componentDidMount() {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            setCourseStudentNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork
        } = this.props;

        const match = this.props.match;

        setCourseStudentNameFromParams(match.params.hasOwnProperty('courseStudentName') ? match.params.courseStudentName : null);
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('courseStudentName') ? ROUTES.EDIT_STUDENT_PROFILE : ROUTES.EDIT_STUDENT_PROFILE_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            teacher,

            loadAngelNetwork,
            editStudentProfile_setOriginalStudentAndEditedStudent,
            // projectsTable_setStudent,
            activitiesTable_setStudent
        } = this.props;

        const {
            studentToBeEdited
        } = this.state;

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.loadData();

            if (teacher && studentToBeEdited) {
                editStudentProfile_setOriginalStudentAndEditedStudent(studentToBeEdited);

                // projectsTable_setStudent(studentToBeEdited);

                activitiesTable_setStudent(studentToBeEdited);
            }
        }
    }

    componentWillUnmount() {
        const {
            editStudentProfile_setOriginalStudentAndEditedStudent,

            // projectsTable_setStudent,
            // projectsTable_stopListeningForProjectsChanged,
            // projectsTable_stopListeningForPledgesChanged,
            // projectsTable_stopListeningForPledgesMadeByTableInvestor,

            activitiesTable_setStudent,
            activitiesTable_stopListeningForActivitiesChanged,

            editStudentProfile_stopOriginalStudentChangedListener
        } = this.props;

        // when click to go back,
        // reset the student referenced in edit student profile
        editStudentProfile_setOriginalStudentAndEditedStudent(null);

        // stop listening for student's profile changes if added
        editStudentProfile_stopOriginalStudentChangedListener();

        // reset the student references in projects table
        // ---> avoid caches
        // projectsTable_setStudent(null);
        // projectsTable_stopListeningForProjectsChanged();
        // projectsTable_stopListeningForPledgesChanged();
        // projectsTable_stopListeningForPledgesMadeByTableInvestor();

        // reset the student references in activities table
        // ---> avoid caches
        activitiesTable_setStudent(null);
        activitiesTable_stopListeningForActivitiesChanged();
    }

    /**
     * Load data
     */
    loadData = () => {
        // get student's id from the URL
        const studentToBeEditedID = this.props.match.params.studentID;

        const {
            editStudentProfile_startOriginalStudentChangedListener
        } = this.props;

        const {
            studentToBeEdited,
            studentToBeEditedLoaded,
            loadingStudentToBeEdited
        } = this.state;

        if (!studentToBeEdited && !studentToBeEditedLoaded && !loadingStudentToBeEdited) {
            this.setState({
                studentToBeEditedLoaded: false,
                loadingStudentToBeEdited: true
            });

            realtimeDBUtils
                .getStudentBasedOnID(studentToBeEditedID)
                .then(student => {

                    realtimeDBUtils
                        .loadCoursesStudentIsIn(studentToBeEditedID)
                        .then(coursesStudentIsIn => {

                            student.coursesStudentIsIn = coursesStudentIsIn;

                            this.setState({
                                studentToBeEdited: JSON.parse(JSON.stringify(student)),
                                studentToBeEditedLoaded: true,
                                loadingStudentToBeEdited: false
                            });

                            // start listening for student's profile changes
                            editStudentProfile_startOriginalStudentChangedListener();
                        })
                        .catch(error => {
                            this.setState({
                                studentToBeEdited: null,
                                studentToBeEditedLoaded: true,
                                loadingStudentToBeEdited: false
                            });
                        });
                })
                .catch(error => {
                    this.setState({
                        studentToBeEdited: null,
                        studentToBeEditedLoaded: true,
                        loadingStudentToBeEdited: false
                    });
                });
        }
    }

    render() {
        const {
            courseProperties,
            shouldLoadOtherData,
            coursePropertiesLoaded,

            authStatus,
            authenticating,
            teacher,
            teacherLoaded
        } = this.props;

        const {
            studentToBeEdited,
            studentToBeEditedLoaded
        } = this.state;

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

        if (authenticating
            || !teacherLoaded
            || !studentToBeEditedLoaded
        ) {
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
            || !teacher
            || (teacher && teacher.type !== DB_CONST.TYPE_PROF)
            || !studentToBeEdited
        ) {
            return (
                <PageNotFoundWhole/>
            );
        }

        // the course teachers are trying to open this page
        // to edit profile of a student that is NOT a member of their course
        if (!teacher.superTeacher
            && studentToBeEdited.hasOwnProperty('coursesStudentIsIn')
            && studentToBeEdited.coursesStudentIsIn.findIndex(course => course.anid === teacher.anid) === -1
        ) {
            return (
                <PageNotFoundWhole/>
            );
        }

        return (
            <Container fluid style={{padding: 0}}>
                {/** Body */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 8, offset: 2}} style={{marginTop: 30, marginBottom: 30}}>
                        {
                            !studentToBeEdited
                                ?
                                null
                                :
                                <Profile/>
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfilePageEditable);