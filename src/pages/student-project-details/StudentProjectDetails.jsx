import React, {Component} from "react";
import FlexView from "react-flexview";
import {css, StyleSheet} from "aphrodite";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    InputBase,
    Paper,
    Step,
    StepButton,
    StepContent,
    StepLabel,
    Stepper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/CreateOutlined";
import CreateIcon from "@material-ui/icons/CreateOutlined";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import {Col, Container, Image, Row} from "react-bootstrap";
import HashLoader from "react-spinners/HashLoader";
import {NavLink} from "react-router-dom";
import ReactPlayer from "react-player";
import * as colors from "../../values/colors";
import * as utils from "../../utils/utils";
import PageNotFound from "../../shared-components/page-not-found/PageNotFound";
import PageNotFoundWhole from "../../shared-components/page-not-found/PageNotFoundWhole";
import CreatePledgeDialog from "../../shared-components/create-pledge-dialog/CreatePledgeDialog";
import SelectPitchVisibility from "../../shared-components/select-pitch-visibility/SelectPitchVisibility";
import InfoOverlay from "../../shared-components/info_overlay/InfoOverlay";
import {connect} from "react-redux";
import * as manageCourseFromParamsActions from "../../redux-store/actions/manageCourseFromParamsActions";
import * as pledgesTableActions from "../../redux-store/actions/pledgesTableActions";
import * as investorSelfCertificationAgreementsActions
    from "../../redux-store/actions/investorSelfCertificationAgreementsActions";
import * as createPledgeDialogActions from "../../redux-store/actions/createPledgeDialogActions";
import * as selectProjectVisibilityActions from "../../redux-store/actions/selectProjectVisibilityActions";
import * as feedbackSnackbarActions from "../../redux-store/actions/feedbackSnackbarActions";
import "./ProjectDetails.scss";
import firebase from "../../firebase/firebaseApp";
import * as DB_CONST from "../../firebase/databaseConsts";
import {TYPE_INVESTOR} from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import * as ROUTES from "../../router/routes";
import {AUTH_SUCCESS} from "../signin/Signin";
import {KeyboardDatePicker} from "@material-ui/pickers";
import Api, {ApiRoutes} from "../../api/Api";
import {
    isDraftProject,
    isProjectCreatedByCourseTeacher,
    isProjectFailed,
    isProjectInLivePitchPhase,
    isProjectInLivePledgePhase,
    isProjectLive,
    isProjectOwner,
    isProjectPitchExpiredWaitingForTeacherToCheck,
    isProjectRejectedToGoLive,
    isProjectSuccessful,
    isProjectTemporarilyClosed,
    isProjectWaitingForPledgeToBeChecked,
    isProjectWaitingForPledgeToBeCreated,
    isProjectWaitingToGoLive
} from "../../models/studentProjectproject";
import DocumentsDownload from "../../shared-components/documents-download/DocumentsDownload";
import RiskWarning from "../../shared-components/risk-warning/RiskWarning";
import {toggleContactPitchOwnerDialog} from "./components/contact-pitch-owner-dialog/ContactPitchOwnerDialogActions";
import ContactPitchOwnerDialog from "./components/contact-pitch-owner-dialog/ContactPitchOwnerDialog";
import FeedbackSnackbarNew from "../../shared-components/feedback-snackbar/FeedbackSnackbarNew";
import {hasAuthenticationError, isAuthenticating} from "../../redux-store/reducers/authenticationReducer";

const TEACHER_OFFER_STATES_PUBLISH_PITCH = 0;
const TEACHER_OFFER_STATES_MOVE_TO_PLEDGE = 1;
const TEACHER_OFFER_STATES_PUBLISH_PLEDGE = 2;

const MAIN_BODY_TEACHER_OFFER_STATES = 0;
const MAIN_BODY_CAMPAIGN = 1;
const MAIN_BODY_DOCUMENTS = 2;
const MAIN_BODY_COMMENTS = 3;
const MAIN_BODY_NOTES = 4;
const MAIN_BODY_INVESTORS_PLEDGED = 5; // only available for teacher and teacher

const MAX_COVER_HEIGHT_IN_MOBILE_MODE = 240;
const MAX_COVER_HEIGHT_IN_BIG_SCREEN_MODE = 550;

const mapStateToProps = (state) => {
    return {
        AuthenticationState: state.AuthenticationState,

        isMobile: state.MediaQueryState.isMobile,

        courseStudent: state.manageCourseFromParams.courseStudent,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        student: state.auth.student,
        studentLoaded: state.auth.studentLoaded,
        studentBeingLoaded: state.auth.studentBeingLoaded,
        coursesStudentIsIn: state.auth.coursesStudentIsIn,

        // Investor self-certification agreement (for investor only) ----------------------------------------------------
        investorSelfCertificationAgreement_studentID: state.manageInvestorSelfCertificationAgreement.studentID,
        investorSelfCertificationAgreement: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreement,
        investorSelfCertificationAgreementLoaded: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreementLoaded,
        investorSelfCertificationAgreementBeingLoaded: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreementBeingLoaded,
        //--------------------------------------------------------------------------------------------------------------

        projectVisibilitySetting: state.manageSelectProjectVisibility.projectVisibilitySetting
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        setCourseStudentFromParams: (courseStudent) => dispatch(manageCourseFromParamsActions.setCourseStudentFromParams(courseStudent)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageCourseFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageCourseFromParamsActions.loadAngelNetwork()),

        // Investor self-certification agreement functions --------------------------------------------------------------
        investorSelfCertificationAgreement_setStudent: (uid) => dispatch(investorSelfCertificationAgreementsActions.setStudent(uid)),
        loadInvestorSelfCertificationAgreement: () => dispatch(investorSelfCertificationAgreementsActions.loadInvestorSelfCertificationAgreement()),
        //--------------------------------------------------------------------------------------------------------------

        pledgesTable_setProject: (project) => dispatch(pledgesTableActions.setProject(project)),
        pledgesTable_stopListeningForPledgesChanged: () => dispatch(pledgesTableActions.stopListeningForPledgesChanged()),

        createPledgeDialog_toggleDialog: () => dispatch(createPledgeDialogActions.toggleCreatePledgeDialog()),
        createPledgeDialog_setProject: (project) => dispatch(createPledgeDialogActions.setProject(project)),

        selectProjectVisibility_setProject: (project) => dispatch(selectProjectVisibilityActions.setProject(project)),

        setFeedbackSnackbarContent: (message, color, position) => dispatch(feedbackSnackbarActions.setFeedbackSnackbarContent(message, color, position)),

        toggleContactPitchOwnerDialog: (projectName, projectOwnerEmail) => dispatch(toggleContactPitchOwnerDialog(projectName, projectOwnerEmail))
    }
};

class ProjectDetailsMain extends Component {

    constructor(props) {
        super(props);

        this.database = firebase.database();

        // project changed listener
        this.projectListener = null;
        // comments changed listener
        this.commentsListener = null;
        // comments replies changed listener
        this.commentsRepliesListener = null;
        // pledges changed listener
        this.pledgesListener = null;
        // votes changed listener
        this.votesListener = null;

        this.state = {
            // variables to check if all the data has been loaded or being loaded
            dataLoaded: false,
            dataBeingLoaded: false,

            investorPledge: null,
            investorPledgeLoaded: false,

            mainBody: MAIN_BODY_CAMPAIGN,
            teacherOfferStatesActiveStep: TEACHER_OFFER_STATES_PUBLISH_PITCH,

            comments: [],
            commentsLoaded: false,

            // states for an investor to post a NEW comment
            commentDialogOpen: false,
            commentText: "",
            commentSubmitClick: false,
            // ---------------------------------

            // existing comment of the current investor
            currentComment: null,
            currentCommentText: "",
            // -------------------------------------------

            // available for the teacher/course teachers who own the project only
            // allow the owners to reply to the investor's comments
            replyingToComment: null,
            replyText: "",
            replyEdited: null,
            // -------------------------------------------

            // this state is used to capture the change in date when an teacher wants to bring
            // an expired pitch back to live
            changedPitchExpiryDate: null,

            // when an teacher wants to send the pitch back to the teacher with some feedback rather than publish it
            addingRejectFeedback: false,
            rejectFeedback: "",
            sendingProjectBack: false,

            // pitch's details
            projectDetail: {
                // the pitch object
                project: null,
                projectLoaded: false,

                pledges: [],
                pledgesLoaded: false,

                votes: [],
                votesLoaded: false,

                // the teacher object (the teacher who made this pitch)
                projectTeacher: null,
                projectTeacherLoaded: false
            }
        }
    }

    componentDidMount() {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            student,
            studentLoaded,
            studentBeingLoaded,

            investorSelfCertificationAgreement_studentID,
            investorSelfCertificationAgreementLoaded,
            investorSelfCertificationAgreementBeingLoaded,

            setCourseStudentFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork,
            investorSelfCertificationAgreement_setStudent,
            loadInvestorSelfCertificationAgreement,
        } = this.props;

        const {
            dataLoaded,
            dataBeingLoaded
        } = this.state;

        const match = this.props.match;

        setCourseStudentFromParams(match.params.hasOwnProperty("courseStudent")
            ?
            match.params.courseStudent
            :
            null
        );
        setExpectedAndCurrentPathsForChecking(
            match.params.hasOwnProperty("courseStudent")
                ?
                ROUTES.PROJECT_DETAILS
                :
                ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER, match.path
        );

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            if (!studentBeingLoaded && studentLoaded) {
                if (!dataBeingLoaded && !dataLoaded) {
                    // load data if not loaded
                    this.loadData();
                }

                if (student) {
                    if (!investorSelfCertificationAgreement_studentID && student.type === DB_CONST.TYPE_INVESTOR) {
                        investorSelfCertificationAgreement_setStudent(student.id);
                    }
                }
            }

            // if student id for reference in self-certification agreement has been set
            if (investorSelfCertificationAgreement_studentID) {
                // if self-certification agreement has not been loaded
                if (!investorSelfCertificationAgreementLoaded
                    && !investorSelfCertificationAgreementBeingLoaded
                    && student.type === DB_CONST.TYPE_INVESTOR
                ) {
                    loadInvestorSelfCertificationAgreement();
                }
            }
        }
        console.log('Page loaded. Authentication status:', this.props.AuthenticationState.isAuthenticated ? 'Authenticated' : 'Not Authenticated');
        console.log('Current student on page load:', this.props.AuthenticationState.currentStudent);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            student,
            studentLoaded,
            studentBeingLoaded,

            investorSelfCertificationAgreement_studentID,
            investorSelfCertificationAgreementLoaded,
            investorSelfCertificationAgreementBeingLoaded,

            investorSelfCertificationAgreement_setStudent,
            loadInvestorSelfCertificationAgreement,

            loadAngelNetwork
        } = this.props;

        const {
            dataLoaded,
            dataBeingLoaded
        } = this.state;

        const {
            project,
            projectLoaded
        } = this.state.projectDetail;

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            if (!studentBeingLoaded && studentLoaded) {
                if (!dataBeingLoaded && !dataLoaded) {
                    // load data if not loaded
                    this.loadData();
                }

                if (student) {
                    if (!investorSelfCertificationAgreement_studentID && student.type === DB_CONST.TYPE_INVESTOR) {
                        investorSelfCertificationAgreement_setStudent(student.id);
                    }
                }
            }

            // if student id for reference in self-certification agreement has been set
            if (investorSelfCertificationAgreement_studentID) {
                // if self-certification agreement has not been loaded
                if (!investorSelfCertificationAgreementLoaded
                    && !investorSelfCertificationAgreementBeingLoaded
                    && student.type === DB_CONST.TYPE_INVESTOR
                ) {
                    loadInvestorSelfCertificationAgreement();
                }
            }

            // attach project changed listener
            if (projectLoaded && project) {
                this.attachProjectChangedListener();
            }

            this.loadDataWhenUIElementsChange();
        }
    }

    componentWillUnmount() {
        const {
            pledgesTable_stopListeningForPledgesChanged
        } = this.props;

        // detach pitch changed listener
        this.detachProjectChangedListener();

        // detach listener for votes
        if (this.votesListener) {
            this.votesListener.off("child_added");
            this.votesListener.off("child_changed");
            this.votesListener.off("child_removed");
        }

        // detach listener for pledges
        if (this.pledgesListener) {
            this.pledgesListener.off("child_added");
            this.pledgesListener.off("child_changed");
            this.pledgesListener.off("child_removed");
        }

        // detach listener for comments
        if (this.commentsListener) {
            this.commentsListener.off("child_added");
            this.commentsListener.off("child_changed");
        }

        // detach listener for comments replies
        if (this.commentsRepliesListener) {
            this.commentsRepliesListener.off("child_added");
            this.commentsRepliesListener.off("child_changed");
        }

        // detach listener for pledges changed in pledges table
        pledgesTable_stopListeningForPledgesChanged();
    }

    /**
     * This function is used to load data for the whole page
     */
    loadData = () => {
        const {
            student,
            studentLoaded,

            selectProjectVisibility_setProject
        } = this.props;

        const {
            dataLoaded,
            dataBeingLoaded
        } = this.state;

        if (!studentLoaded) {
            return;
        }

        if (!student) {
            if (!dataLoaded) {
                this.setState({
                    dataLoaded: true,
                    dataBeingLoaded: false,
                    investorPledgeLoaded: true,
                    projectDetail: {
                        ...this.state.projectDetail,
                        projectLoaded: true, // project is null
                        projectTeacherLoaded: true, // project teacher is null
                        votesLoaded: true,
                        pledgesLoaded: true
                    }
                });
                return;
            }
        }

        // data is being loaded
        if (dataBeingLoaded) {
            return;
        }

        this.setState({
            dataLoaded: false,
            dataBeingLoaded: true
        });

        // load the requested project
        const projectID = this.props.match.params.projectID;
        realtimeDBUtils
            .loadAParticularProject(projectID)
            .then(project => {
                // track activity for investors only
                if (student.type === DB_CONST.TYPE_INVESTOR) {
                    realtimeDBUtils
                        .trackActivity({
                            studentID: student.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_VIEW,
                            interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                            interactedObjectID: project.id,
                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_VIEWED_PROJECT_DETAILS.replace("%project%", project.projectName),
                            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                        });
                }

                // set project for the Select component that is used to choose the project visibility
                selectProjectVisibility_setProject(project);

                this.setState({
                    projectDetail: {
                        ...this.state.projectDetail,
                        project: project,
                        projectLoaded: true
                    },
                    mainBody:
                        student.type === DB_CONST.TYPE_PROF
                            ?
                            student.anid === project.anid
                                ?
                                MAIN_BODY_TEACHER_OFFER_STATES
                                :
                                MAIN_BODY_CAMPAIGN
                            :
                            MAIN_BODY_CAMPAIGN
                    ,
                    teacherOfferStatesActiveStep:
                        project.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED
                            ?
                            TEACHER_OFFER_STATES_PUBLISH_PITCH
                            :
                            (project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE || project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED)
                                ?
                                TEACHER_OFFER_STATES_MOVE_TO_PLEDGE
                                :
                                (project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED || project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE)
                                    ?
                                    TEACHER_OFFER_STATES_PUBLISH_PLEDGE
                                    :
                                    TEACHER_OFFER_STATES_PUBLISH_PITCH
                });

                // load votes
                realtimeDBUtils
                    .loadVotes(project.id, null, realtimeDBUtils.LOAD_VOTES_ORDER_BY_PROJECT)
                    .then(votes => {

                        this.setState({
                            projectDetail: {
                                ...this.state.projectDetail,
                                votes: votes,
                                votesLoaded: true
                            }
                        });

                        // load pledges
                        realtimeDBUtils
                            .loadPledges(project.id, null, realtimeDBUtils.LOAD_PLEDGES_ORDER_BY_PROJECT)
                            .then(pledges => {

                                // if the current student is an investor, check if they pledged this project
                                if (student.type === DB_CONST.TYPE_INVESTOR) {
                                    let currentStudentPledgeIndex = pledges.findIndex(pledge => pledge.investorID === student.id && pledge.amount !== '');
                                    // this investor has pledges this project before
                                    if (currentStudentPledgeIndex !== -1) {
                                        this.setState({
                                            investorPledge: pledges[currentStudentPledgeIndex]
                                        });
                                    }
                                }

                                this.setState({
                                    dataLoaded: true,
                                    dataBeingLoaded: false,
                                    investorPledgeLoaded: true,
                                    projectDetail: {
                                        ...this.state.projectDetail,
                                        pledges: pledges,
                                        pledgesLoaded: true
                                    }
                                });

                                // load the profile of the teacher or the course teacher created this project
                                // this student can be the teacher who created the offer themselves
                                // or the course teacher who created this offer on behalf of an unknown teacher
                                // or the teacher who got the course teacher create this offer for
                                realtimeDBUtils
                                    .getStudentBasedOnID(project.teacherID)
                                    .then(projectTeacher => {
                                        this.setState({
                                            projectDetail: {
                                                ...this.state.projectDetail,
                                                projectTeacher: projectTeacher,
                                                projectTeacherLoaded: true
                                            }
                                        });
                                    })
                                    .catch(error => {
                                        this.setState({
                                            dataLoaded: true,
                                            dataBeingLoaded: false,
                                            investorPledgeLoaded: true,
                                            projectDetail: {
                                                ...this.state.projectDetail,
                                                projectLoaded: true, // project is null
                                                projectTeacherLoaded: true, // project Teacher is null
                                                votesLoaded: true,
                                                pledgesLoaded: true
                                            }
                                        });
                                    });
                            })
                            .catch(error => {
                                this.setState({
                                    dataLoaded: true,
                                    dataBeingLoaded: false,
                                    investorPledgeLoaded: true,
                                    projectDetail: {
                                        ...this.state.projectDetail,
                                        projectLoaded: true, // project is null
                                        projectTeacherLoaded: true, // project Teacher is null
                                        votesLoaded: true,
                                        pledgesLoaded: true
                                    }
                                });
                            });
                    })
                    .catch(error => {
                        this.setState({
                            dataLoaded: true,
                            dataBeingLoaded: false,
                            investorPledgeLoaded: true,
                            projectDetail: {
                                ...this.state.projectDetail,
                                projectLoaded: true, // project is null
                                projectTeacherLoaded: true, // project Teacher is null
                                votesLoaded: true,
                                pledgesLoaded: true
                            }
                        });
                    });
            })
            .catch(error => {
                // error happens when loading the requested project
                // we'll stop the loading process for all others
                this.setState({
                    dataLoaded: true,
                    dataBeingLoaded: false,
                    investorPledgeLoaded: true,
                    projectDetail: {
                        ...this.state.projectDetail,
                        projectLoaded: true, // project is null
                        projectTeacherLoaded: true, // project Teacher is null
                        votesLoaded: true,
                        pledgesLoaded: true
                    }
                });
            });
    };

    /**
     * Load data when UI elements change
     */
    loadDataWhenUIElementsChange = () => {
        const {
            student,

            pledgesTable_setProject
        } = this.props;

        const {
            mainBody,
            commentsLoaded
        } = this.state;

        const {
            project,
            projectLoaded,

            pledges,
            pledgesLoaded,

            votes,
            votesLoaded
        } = this.state.projectDetail;

        // attach votes changed listener
        if (votes && votesLoaded && project && projectLoaded) {
            // votes can only happen if the project is in Pitch phase
            if (project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE) {
                if (!this.votesListener) {
                    this.votesListener = this.database
                        .ref(DB_CONST.VOTES_CHILD)
                        .orderByChild("projectID")
                        .equalTo(project.id);

                    // vote added
                    this.votesListener
                        .on("child_added", snapshot => {
                            let vote = snapshot.val();

                            const votes = this.state.projectDetail.votes;
                            let voteIndex = votes.findIndex(existingVote => existingVote.id === vote.id);
                            if (voteIndex === -1) {
                                realtimeDBUtils
                                    .getStudentBasedOnID(vote.investorID)
                                    .then(investor => {
                                        vote.investor = investor;
                                        this.setState({
                                            projectDetail: {
                                                ...this.state.projectDetail,
                                                votes: [...votes, vote]
                                            }
                                        });
                                    });
                            }
                        });

                    // vote changed
                    this.votesListener
                        .on("child_changed", snapshot => {
                            let vote = snapshot.val();

                            const votes = this.state.projectDetail.votes;
                            let voteIndex = votes.findIndex(existingVote => existingVote.id === vote.id);

                            if (voteIndex !== -1) {
                                let updatedVotes = votes;

                                vote.investor = updatedVotes[voteIndex].investor;
                                updatedVotes[voteIndex] = vote;

                                this.setState({
                                    projectDetail: {
                                        ...this.state.projectDetail,
                                        votes: updatedVotes
                                    }
                                });
                            }
                        });

                    // vote removed
                    this.votesListener
                        .on("child_removed", snapshot => {
                            let voteRemovedID = snapshot.key;

                            const votes = this.state.projectDetail.votes;
                            let voteIndex = votes.findIndex(existingVote => existingVote.id === voteRemovedID);

                            if (voteIndex !== -1) {
                                let updatedVotes = votes;
                                updatedVotes.splice(voteIndex, 1);

                                this.setState({
                                    projectDetail: {
                                        ...this.state.projectDetail,
                                        votes: updatedVotes
                                    }
                                });
                            }
                        });
                }
            }
        }

        // attach pledges changed listener
        if (pledges && pledgesLoaded && projectLoaded && project) {
            // pledges can only happen if the project is in Primary offer phase
            if (project.status !== DB_CONST.PROJECT_STATUS_BEING_CHECKED
                && project.status !== DB_CONST.PROJECT_STATUS_FAILED
                && project.status !== DB_CONST.PROJECT_STATUS_PITCH_PHASE
            ) {
                if (!this.pledgesListener) {
                    this.pledgesListener = this.database
                        .ref(DB_CONST.PLEDGES_CHILD)
                        .orderByChild("projectID")
                        .equalTo(project.id);

                    // new pledge added
                    this.pledgesListener
                        .on("child_added", snapshot => {
                            let pledge = snapshot.val();

                            let pledges = [...this.state.projectDetail.pledges];
                            let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledge.id);
                            if (pledgeIndex === -1) {
                                realtimeDBUtils
                                    .getStudentBasedOnID(pledge.investorID)
                                    .then(investor => {
                                        pledge.investor = investor;
                                        this.setState({
                                            projectDetail: {
                                                ...this.state.projectDetail,
                                                pledges: [...pledges, pledge]
                                            }
                                        });
                                    });
                            }
                        });

                    // pledge changed
                    this.pledgesListener
                        .on("child_changed", snapshot => {
                            let pledge = snapshot.val();

                            let pledges = [...this.state.projectDetail.pledges];
                            let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledge.id);

                            if (pledgeIndex !== -1) {
                                let updatedPledges = pledges;

                                pledge.investor = updatedPledges[pledgeIndex].investor;
                                updatedPledges[pledgeIndex] = pledge;

                                const currentPledge = JSON.parse(JSON.stringify(this.state.investorPledge));

                                this.setState({
                                    investorPledge:
                                    // current pledge is not null
                                        currentPledge !== null
                                            ?
                                            currentPledge.id === pledge.id
                                                ?
                                                pledge.amount === ""
                                                    ?
                                                    null
                                                    :
                                                    JSON.parse(JSON.stringify(pledge))
                                                :
                                                currentPledge
                                            :
                                            // current pledge is null
                                            pledge.investorID === student.id
                                                ?
                                                pledge.amount === ""
                                                    ?
                                                    null
                                                    :
                                                    JSON.parse(JSON.stringify(pledge))
                                                :
                                                null
                                    ,
                                    projectDetail: {
                                        ...this.state.projectDetail,
                                        pledges: updatedPledges
                                    }
                                });
                            }
                        });

                    // pledge removed
                    this.pledgesListener
                        .on("child_removed", snapshot => {
                            let pledgeRemovedID = snapshot.key;

                            let pledges = [...this.state.projectDetail.pledges];
                            let pledgeIndex = pledges.findIndex(existingPledge => existingPledge.id === pledgeRemovedID);

                            if (pledgeIndex !== -1) {
                                let updatedPledges = pledges;
                                updatedPledges.splice(pledgeIndex, 1);

                                const currentPledge = this.state.investorPledge;
                                if (!currentPledge && currentPledge.id === pledgeRemovedID) {
                                    this.setState({
                                        investorPledge: null,
                                        projectDetail: {
                                            ...this.state.projectDetail,
                                            pledges: updatedPledges
                                        }
                                    });
                                } else {
                                    this.setState({
                                        projectDetail: {
                                            ...this.state.projectDetail,
                                            pledges: updatedPledges
                                        }
                                    });
                                }
                            }
                        });
                }
            }
        }

        // if the student clicks on the Pledges tab
        if (mainBody === MAIN_BODY_INVESTORS_PLEDGED) {
            if (project) {
                pledgesTable_setProject(project);
            }
        }

        // if the student clicks on the Comments tab
        if (mainBody === MAIN_BODY_COMMENTS) {
            // if comments have not been loaded yet
            if (!commentsLoaded) {
                // load comments
                realtimeDBUtils
                    .loadComments(project.id)
                    .then(returnedComments => {

                        realtimeDBUtils
                            .loadCommentsReplies(returnedComments)
                            .then(commentsWithReplies => {
                                // comments loaded with replies
                                this.setState({
                                    comments: [...commentsWithReplies],
                                    commentsLoaded: true
                                });

                                // attach comments listener
                                if (!this.commentsListener) {
                                    this.commentsListener = this.database
                                        .ref(DB_CONST.COMMENTS_CHILD)
                                        .orderByChild("projectID")
                                        .equalTo(project.id);

                                    // new comment added
                                    this.commentsListener
                                        .on("child_added", snapshot => {
                                            let comment = snapshot.val();
                                            comment.replies = [];

                                            // assign comment to currentComment object if it belongs to the current investor
                                            if (comment.commentedBy === student.id) {
                                                const currentComment = this.state.currenComment;
                                                if (!currentComment) {
                                                    this.setState({
                                                        currentComment: comment,
                                                        currentCommentText: comment.comment
                                                    });
                                                }
                                            }

                                            let comments = [...this.state.comments];
                                            let commentIndex = comments.findIndex(existingComment => existingComment.id === comment.id);

                                            if (commentIndex === -1) {
                                                realtimeDBUtils
                                                    .getStudentBasedOnID(comment.commentedBy)
                                                    .then(student => {
                                                        comment.author = student;
                                                        this.setState({
                                                            comments: [...comments, comment]
                                                        });
                                                    });
                                            }
                                        });

                                    // comment changed
                                    this.commentsListener
                                        .on("child_changed", snapshot => {
                                            let comment = snapshot.val();

                                            let comments = [...this.state.comments];
                                            let commentIndex = comments.findIndex(existingComment => existingComment.id === comment.id);

                                            if (commentIndex !== -1) {
                                                let updatedComments = [...comments];
                                                comment.author = updatedComments[commentIndex].author;
                                                comment.replies = updatedComments[commentIndex].replies;

                                                updatedComments[commentIndex] = comment;

                                                // NOTE: Must explicitly call state here to avoid null from previous state
                                                const currentComment = this.state.currentComment;

                                                if (currentComment && currentComment.id === comment.id) {
                                                    this.setState({
                                                        comments: updatedComments,
                                                        currentComment: comment
                                                    });
                                                } else {
                                                    this.setState({
                                                        comments: [...updatedComments]
                                                    });
                                                }
                                            }
                                        });
                                }

                                // attach comments replies listener
                                if (!this.commentsRepliesListener) {
                                    this.commentsRepliesListener = this.database
                                        .ref(DB_CONST.COMMENT_REPLIES_CHILD)
                                        .orderByChild("projectID")
                                        .equalTo(project.id);

                                    this.commentsRepliesListener
                                        .on("child_added", snapshot => {
                                            let reply = snapshot.val();

                                            let comments = [...this.state.comments];

                                            const correspondingCommentIndex = comments.findIndex(comment => comment.id === reply.commentID);

                                            // ensure the comment exists locally
                                            if (correspondingCommentIndex !== -1) {
                                                let comment = comments[correspondingCommentIndex];
                                                const replyIndex = comment.replies.findIndex(existingReply => existingReply.id === reply.id);

                                                // the newly added reply does not exist in the local replies list of this comment
                                                if (replyIndex === -1) {
                                                    if (reply.hasOwnProperty('deleted') && reply.deleted === true) {
                                                        return;
                                                    }
                                                    realtimeDBUtils
                                                        .getStudentBasedOnID(reply.repliedBy)
                                                        .then(student => {
                                                            reply.author = student;
                                                            comment.replies = [...comment.replies, reply];

                                                            comments[correspondingCommentIndex] = comment;

                                                            this.setState({
                                                                comments: [...comments]
                                                            });
                                                        });
                                                }
                                            }
                                        });

                                    this.commentsRepliesListener
                                        .on("child_changed", snapshot => {
                                            let reply = snapshot.val();

                                            let comments = [...this.state.comments];

                                            const correspondingCommentIndex = comments.findIndex(comment => comment.id === reply.commentID);

                                            // ensure the comment exists locally
                                            if (correspondingCommentIndex !== -1) {
                                                let comment = comments[correspondingCommentIndex];
                                                const replyIndex = comment.replies.findIndex(existingReply => existingReply.id === reply.id);

                                                // the newly added reply does not exist in the local replies list of this comment
                                                if (replyIndex !== -1) {
                                                    // reply has been deleted
                                                    if (reply.hasOwnProperty("deleted") && reply.deleted === true) {
                                                        // remove reply from the local replies list
                                                        comment.replies.splice(replyIndex, 1);

                                                        comments[correspondingCommentIndex] = comment;

                                                        this.setState({
                                                            comments: [...comments]
                                                        });
                                                    }
                                                    // reply is live
                                                    else {
                                                        realtimeDBUtils
                                                            .geStudentBasedOnID(reply.repliedBy)
                                                            .then(student => {
                                                                reply.author = comment.replies[replyIndex].author;
                                                                comment.replies[replyIndex] = reply;

                                                                comments[correspondingCommentIndex] = comment;

                                                                this.setState({
                                                                    comments: [...comments]
                                                                });
                                                            });
                                                    }
                                                }
                                            }
                                        });
                                }
                            })
                            .catch(error => {
                                this.setState({
                                    commentsLoaded: true
                                });
                            });
                    })
                    .catch(error => {
                        this.setState({
                            commentsLoaded: true
                        });
                    });
            }
        }
    };

    /**
     * Vot for pitch function
     *
     * @param voteVal
     */
    handleVotePitch = voteVal => {
        const {
            courseProperties,
            student
        } = this.props;

        const {
            project,
            votes
        } = this.state.projectDetail;

        let currentVoteObj = getInvestorVote(votes, student);
        if (currentVoteObj) {
            currentVoteObj.investor = null;
        }

        let newVoteObj = {};

        // investor has already voted before or voted and cancelled
        // when an investor cancelled their vote, the vote value will be ''
        if (currentVoteObj) {

            newVoteObj = JSON.parse(JSON.stringify(currentVoteObj));

            // the investor cancelled their vote
            if (newVoteObj.voted === '') {
                newVoteObj.voted = voteVal;
            }
            // the investor now clicks to cancel their vote
            else {
                newVoteObj.voted = ''; // update vote to void
            }

            // update the existing vote
            newVoteObj.date = utils.getCurrentDate();

            this.database
                .ref(DB_CONST.VOTES_CHILD)
                .child(newVoteObj.id)
                .update(newVoteObj)
                .then(() => {
                    // record the investor's activity
                    realtimeDBUtils
                        .trackActivity({
                            studentID: student.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.VOTES_CHILD,
                            interactedObjectID: newVoteObj.id,
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_EDITED_VOTE_FOR_PROJECT
                                .replace("%project%", project.projectName)
                            ,
                            action: ROUTES
                                .PROJECT_DETAILS_INVEST_WEST_SUPER
                                .replace(":projectID", project.id)
                            ,
                            value: {
                                before: currentVoteObj,
                                after: newVoteObj
                            }
                        });
                });
        }
        // investor has not voted before
        else {
            const id = this.database
                .ref(DB_CONST.VOTES_CHILD)
                .push()
                .key;

            newVoteObj.id = id;
            newVoteObj.anid = courseProperties ? courseProperties.anid : null;
            newVoteObj.investorID = student.id;
            newVoteObj.projectID = project.id;
            newVoteObj.voted = voteVal;
            newVoteObj.date = utils.getCurrentDate();

            this.database
                .ref(DB_CONST.VOTES_CHILD)
                .child(id)
                .set(newVoteObj)
                .then(() => {
                    // record the investor's activity for first time voting
                    realtimeDBUtils
                        .trackActivity({
                            studentID: student.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.VOTES_CHILD,
                            interactedObjectID: id,
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_MADE_A_VOTE_FOR_PROJECT
                                .replace("%project%", project.projectName)
                            ,
                            action: ROUTES
                                .PROJECT_DETAILS_INVEST_WEST_SUPER
                                .replace(":projectID", project.id)
                            ,
                            value: newVoteObj
                        });

                    // send a notification to notify the teacher
                    realtimeDBUtils
                        .sendNotification({
                            title: "Someone liked your pitch",
                            message: "Congratulations. A new investor has showed interest in your pitch.",
                            studentID: project.teacherID,
                            action: ROUTES
                                .PROJECT_DETAILS_INVEST_WEST_SUPER
                                .replace(":projectID", project.id)
                        })
                        .then(() => {
                            // do something
                        })
                        .catch(error => {
                            // handle error
                        });
                });
        }
    };

    /**
     * Attach listener for any changes that happen on this pitch
     * Attach listener for any changes that happen on this pitch
     */
    attachProjectChangedListener = () => {

        const {
            project
        } = this.state.projectDetail;

        if (this.projectListener === null) {
            this.projectListener = this.database
                .ref(DB_CONST.PROJECTS_CHILD)
                .child(project.id);

            this.projectListener
                .on("value", snapshot => {
                    const project = snapshot.val();
                    project.course = this.state.projectDetail.project.course;
                    project.teacher = this.state.projectDetail.project.teacher;

                    this.setState({
                        projectDetail: {
                            ...this.state.projectDetail,
                            project: project,
                        },
                        teacherOfferStatesActiveStep:
                            project.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED
                                ?
                                TEACHER_OFFER_STATES_PUBLISH_PITCH
                                :
                                project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE
                                || project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
                                    ?
                                    TEACHER_OFFER_STATES_MOVE_TO_PLEDGE
                                    :
                                    project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED
                                    || project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE
                                        ?
                                        TEACHER_OFFER_STATES_PUBLISH_PLEDGE
                                        :
                                        TEACHER_OFFER_STATES_PUBLISH_PITCH
                    });
                });
        }
    };

    /**
     * Detach changes listener for this pitch
     */
    detachProjectChangedListener = () => {
        if (this.projectListener) {
            this.projectListener.off("value");
        }
    };

    /**
     * Handle when a document is clicked (download it)
     *
     * @param downloadURL
     */
    handleDocumentClick = downloadURL => {
        window.open(downloadURL, "_blank");
    };

    /**
     * Handle when the Super student decides whether the project can go live or not
     *
     * @param decision
     */
    handleMakeProjectGoLiveDecision = decision => {
        const {
            student
        } = this.props;
        const {
            project
        } = this.state.projectDetail;

        realtimeDBUtils
            .makeProjectGoLiveDecision(student, JSON.parse(JSON.stringify(project)), decision)
            .then(() => {
                // success
            })
            .catch(error => {
                // handle error
            });
    };

    /**
     * Handle when the Super student decides whether the project can go to the Pledge phase
     *
     * @param decision
     */
    handleMakeProjectGoToPledgePhaseDecision = decision => {
        const {
            student
        } = this.props;
        const {
            project
        } = this.state.projectDetail;

        if (project.Pitch.status !== DB_CONST.PITCH_STATUS_ON_GOING
            && project.Pitch.status !== DB_CONST.PITCH_STATUS_WAITING_FOR_TEACHER
        ) {
            return;
        }

        realtimeDBUtils
            .makeProjectGoToPledgePhaseDecision(student, JSON.parse(JSON.stringify(project)), decision)
            .then(() => {
                // success
            })
            .catch(error => {
                // handle error
            });
    };

    /**
     * Handle when the Super student decides whether the project's Pledge can go live
     *
     * @param decision
     */
    handleMakeProjectPledgeGoLiveDecision = decision => {
        const {
            student
        } = this.props;
        const {
            project
        } = this.state.projectDetail;

        realtimeDBUtils
            .makeProjectPledgeGoLiveDecision(student, JSON.parse(JSON.stringify(project)), decision)
            .then(() => {
                // success
            })
            .catch(error => {
                // handle error
            });
    };

    /**
     * Handle when the main body tab changed
     *
     * @param event
     * @param value
     */
    handleMainBodyTabChanged = (event, value) => {
        this.setState({
            mainBody: value
        });
    };

    /**
     * Handle when the Post a comment button clicked (open a dialog for the Investors to write their comment)
     */
    handlePostACommentClick = () => {
        this.setState({
            commentDialogOpen: true
        });
    };

    /**
     * Handle when the comment dialog is closed
     */
    handleCloseCommentDialog = () => {
        this.setState({
            commentDialogOpen: false,
            commentText: '',
            commentSubmitClick: false
        });
    };

    /**
     * Handle text changed
     *
     * @param event
     */
    handleTextChanged = event => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            [name]: value
        });
    };

    /**
     * Handle date changed
     *
     * @param date
     */
    handleDateChanged = date => {
        if (date && date === "Invalid Date") {
            this.setState({
                changedPitchExpiryDate: NaN
            });
            return;
        }

        this.setState({
            changedPitchExpiryDate:
                !date
                    ?
                    null
                    :
                    date.getTime()
        });
    }

    /**
     * Handle when the Investor clicks to submit their comment
     */
    handleSubmitCommentClick = () => {
        const {
            courseProperties,
            student,

            setFeedbackSnackbarContent
        } = this.props;

        const {
            commentText
        } = this.state;

        const {
            project
        } = this.state.projectDetail;

        this.setState({
            commentSubmitClick: true
        });

        if (commentText.trim().length === 0) {
            return;
        }

        const id = this.database
            .ref(DB_CONST.COMMENTS_CHILD)
            .push()
            .key;

        const comment = {
            id,
            commenterANID: courseProperties ? courseProperties.anid : null,
            projectID: project.id,
            commentedBy: student.id,
            status: DB_CONST.COMMENT_STATUS_POSTED,
            commentedDate: utils.getCurrentDate(),
            comment: commentText
        };

        this.database
            .ref(DB_CONST.COMMENTS_CHILD)
            .child(id)
            .set(comment)
            .then(() => {
                // track investor's activity for posting a new comment
                realtimeDBUtils
                    .trackActivity({
                        studentID: student.id,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.COMMENTS_CHILD,
                        interactedObjectID: id,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_COMMENTED_IN_PROJECT.replace("%project%", project.projectName),
                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                        value: comment
                    });

                // send a notification to notify the teacher
                realtimeDBUtils
                    .sendNotification({
                        title: "Someone commented on your pitch",
                        message: "An investor has commented on your pitch. Go and see what they said.",
                        studentID: project.teacherID,
                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                    })
                    .then(() => {
                        this.handleCloseCommentDialog();
                    })
                    .catch(error => {
                        this.handleCloseCommentDialog();
                    });

                setFeedbackSnackbarContent(
                    "Comment added.",
                    "primary",
                    "bottom"
                );
            })
            .catch(error => {
                this.handleCloseCommentDialog();

                setFeedbackSnackbarContent(
                    "Error happened. Could not add comment.",
                    "error",
                    "bottom"
                );
            });
    };

    /**
     * Handle when the student (investor) cancels the update for their comment
     */
    handleCancelUpdateCurrentComment = () => {
        const {
            currentComment
        } = this.state;

        this.setState({
            currentCommentText: !currentComment.comment ? '' : currentComment.comment
        });
    };

    /**
     * Handle when the student (investor) submits the update for their comment
     */
    handleSubmitUpdateCurrentComment = () => {
        const {
            currentComment,
            currentCommentText
        } = this.state;

        const {
            project
        } = this.state.projectDetail;

        const {
            setFeedbackSnackbarContent
        } = this.props;

        if (currentCommentText.trim().length === 0) {
            return;
        }

        let newComment = JSON.parse(JSON.stringify(currentComment));
        newComment.status = DB_CONST.COMMENT_STATUS_EDITED;
        newComment.comment = currentCommentText;
        newComment.commentedDate = utils.getCurrentDate();
        newComment.replies = null;
        newComment.author = null;

        this.database
            .ref(DB_CONST.COMMENTS_CHILD)
            .child(newComment.id)
            .update(newComment)
            .then(() => {
                // track investor's activity
                realtimeDBUtils
                    .trackActivity({
                        studentID: currentComment.commentedBy,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.COMMENTS_CHILD,
                        interactedObjectID: currentComment.id,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_COMMENT_IN_PROJECT.replace("%project%", project.projectName),
                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id),
                        value: {
                            before: JSON.parse(JSON.stringify(currentComment)),
                            after: newComment
                        }
                    });

                setFeedbackSnackbarContent(
                    "Comment updated.",
                    "primary",
                    "bottom"
                );
            });
    };

    /**
     * Handle to toggle the input area to allow the project's owners to reply to investor's comments
     *
     * @param comment
     * @param replyEdited
     */
    handleToggleReplyToComment = (comment, replyEdited) => {
        this.setState({
            replyingToComment: comment,
            replyText: replyEdited ? replyEdited.text : '',
            replyEdited
        });
    }

    /**
     * Handle to submit comment reply
     */
    handleSubmitCommentReply = () => {
        const {
            replyingToComment,
            replyText,
            replyEdited
        } = this.state;

        const {
            project
        } = this.state.projectDetail;

        const {
            student,
            setFeedbackSnackbarContent
        } = this.props;

        if (!replyEdited) {
            const commentReply = {
                text: replyText,
                repliedDate: utils.getCurrentDate(),
                projectID: project.id,
                commentID: replyingToComment.id,
                repliedBy: student.id,
                status: DB_CONST.COMMENT_REPLY_STATUS_POSTED
            };

            realtimeDBUtils
                .postCommentReply(commentReply)
                .then(replyID => {
                    // track activity
                    realtimeDBUtils
                        .trackActivity({
                            studentID: student.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.COMMENT_REPLIES_CHILD,
                            interactedObjectID: replyID,
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_COMMENT
                                .replace("%projectName%", project.projectName)
                            ,
                            action: ROUTES
                                .PROJECT_DETAILS_INVEST_WEST_SUPER
                                .replace(":projectID", project.id)
                            ,
                            value: {
                                ...commentReply,
                                id: replyID
                            }
                        });

                    // turn off input area
                    this.handleToggleReplyToComment(null, null);

                    setFeedbackSnackbarContent(
                        "Reply added.",
                        "primary",
                        "bottom"
                    );
                })
                .catch(error => {
                    // handle error
                    setFeedbackSnackbarContent(
                        "Error happened. Could not add reply.",
                        "error",
                        "bottom"
                    );
                });
        } else {
            let replyBeforeUpdating = JSON.parse(JSON.stringify(replyEdited));
            replyBeforeUpdating.author = null

            let replyAfterUpdating = JSON.parse(JSON.stringify(replyBeforeUpdating));
            replyAfterUpdating.text = replyText;
            replyAfterUpdating.status = DB_CONST.COMMENT_REPLY_STATUS_EDITED;
            replyAfterUpdating.repliedDate = utils.getCurrentDate();

            realtimeDBUtils
                .updateCommentReply(replyAfterUpdating)
                .then(() => {
                    // track activity
                    realtimeDBUtils
                        .trackActivity({
                            studentID: student.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.COMMENT_REPLIES_CHILD,
                            interactedObjectID: replyAfterUpdating.id,
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_REPLY_OF_A_COMMENT
                                .replace("%projectName%", project.projectName)
                            ,
                            action: ROUTES
                                .PROJECT_DETAILS_INVEST_WEST_SUPER
                                .replace(":projectID", project.id)
                            ,
                            value: {
                                before: replyBeforeUpdating,
                                after: replyAfterUpdating
                            }
                        });

                    // turn off input area
                    this.handleToggleReplyToComment(null, null);

                    setFeedbackSnackbarContent(
                        "Reply updated.",
                        "primary",
                        "bottom"
                    );
                })
                .catch(error => {
                    // handle error
                    setFeedbackSnackbarContent(
                        "Error happened. Could not update reply.",
                        "error",
                        "bottom"
                    );
                });
        }
    }

    /**
     * Handle to delete a reply of a comment
     *
     * @param reply
     */
    handleDeleteCommentReply = reply => {

        const {
            student,
            setFeedbackSnackbarContent
        } = this.props;

        const {
            project
        } = this.state.projectDetail;

        realtimeDBUtils
            .deleteCommentReply(reply.id)
            .then(() => {
                // track activity
                realtimeDBUtils
                    .trackActivity({
                        studentID: student.id,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.COMMENT_REPLIES_CHILD,
                        interactedObjectID: reply.id,
                        activitySummary: realtimeDBUtils
                            .ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_REPLY_OF_A_COMMENT
                            .replace("%projectName%", project.projectName)
                        ,
                        action: ROUTES
                            .PROJECT_DETAILS_INVEST_WEST_SUPER
                            .replace(":projectID", project.id)
                        ,
                        value: {
                            before: {
                                ...reply,
                                author: null
                            },
                            after: {
                                ...reply,
                                author: null,
                                deleted: true
                            }
                        }
                    });

                setFeedbackSnackbarContent(
                    "Reply deleted.",
                    "primary",
                    "bottom"
                );
            })
            .catch(error => {
                // handle error
                setFeedbackSnackbarContent(
                    "Error happened. Could not delete reply.",
                    "error",
                    "bottom"
                );
            });
    }

    /**
     * Offer states click to change active step
     *
     * @param step
     */
    handleTeacherOfferStatesStepClick = step => {
        this.setState({
            teacherOfferStatesActiveStep: step
        });
    };

    /**
     * Bring pitch back to live again
     *
     * @returns {Promise<void>}
     */
    bringPitchBackToLive = async () => {
        const {
            project
        } = this.state.projectDetail;

        const {
            changedPitchExpiryDate
        } = this.state;

        const {
            student,
            setFeedbackSnackbarContent
        } = this.props;

        if (student.type !== DB_CONST.TYPE_PROF) {
            return;
        }

        try {
            await realtimeDBUtils
                .bringPitchBackToLive({
                    project: JSON.parse(JSON.stringify(project)),
                    newPitchExpiryDate: changedPitchExpiryDate
                });

            setFeedbackSnackbarContent(
                "Pitch is now live again.",
                "primary",
                "bottom"
            );
        } catch (error) {
            // handle error
            setFeedbackSnackbarContent(
                "Error happened. Couldn't update pitch.",
                "error",
                "bottom"
            );
        }
    }

    /**
     * Toggle reject feedback
     */
    toggleRejectFeedback = () => {
        this.setState({
            addingRejectFeedback: !this.state.addingRejectFeedback,
            rejectFeedback: ""
        });
    }

    /**
     * Send project back to teacher
     */
    sendProjectBackToTeacher = async () => {
        const {
            projectDetail,
            rejectFeedback,
            sendingProjectBack
        } = this.state;

        const {
            setFeedbackSnackbarContent
        } = this.props;

        if (rejectFeedback.trim().length === 0 || sendingProjectBack) {
            return;
        }

        this.setState({
            sendingProjectBack: true
        });

        try {
            // send project back to the teacher
            await new Api().request(
                "post",
                ApiRoutes.sendProjectBackToTeacherRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        projectID: projectDetail.project.id,
                        feedback: rejectFeedback
                    }
                }
            );

            this.setState({
                sendingProjectBack: false
            });

            setFeedbackSnackbarContent(
                "Pitch has been sent back.",
                "primary",
                "bottom"
            );
        } catch (error) {
            setFeedbackSnackbarContent(
                "Error happened. Couldn't send offer back.",
                "error",
                "bottom"
            );
        }
    }

    render() {
        const {
            AuthenticationState,

            isMobile,

            courseStudent,
            courseProperties,
            coursePropertiesLoaded,
            shouldLoadOtherData,

            authStatus,
            authenticating,
            student,
            studentLoaded,
            coursesStudentIsIn,

            investorSelfCertificationAgreement,

            createPledgeDialog_toggleDialog,
            createPledgeDialog_setProject,

            projectVisibilitySetting,
            selectProjectVisibility_setProject
        } = this.props;

        const {
            investorPledge,
            investorPledgeLoaded,

            mainBody,
            teacherOfferStatesActiveStep,

            comments,
            commentsLoaded,

            commentDialogOpen,
            commentText,
            commentSubmitClick,

            currentComment,
            currentCommentText,

            replyingToComment,
            replyText,
            replyEdited,

            changedPitchExpiryDate,

            addingRejectFeedback,
            rejectFeedback,
            sendingProjectBack
        } = this.state;

        const {
            project,
            projectLoaded,

            pledges,
            pledgesLoaded,

            votes,
            votesLoaded,

            projectTeacher,
            projectTeacherLoaded
        } = this.state.projectDetail;

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

        if (authenticating || !studentLoaded || isAuthenticating(AuthenticationState)) {
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

        if (authStatus !== AUTH_SUCCESS || !student || hasAuthenticationError(AuthenticationState)) {
            return <PageNotFoundWhole/>;
        }

        return (
            <div>
                <ProjectDetails
                    AuthenticationState={this.props.AuthenticationState}
                    courseStudent={courseStudent}
                    courseProperties={courseProperties}
                    isMobile={isMobile}
                    student={student}
                    studentLoaded={studentLoaded}
                    coursesStudentIsIn={coursesStudentIsIn}
                    investorSelfCertificationAgreement={investorSelfCertificationAgreement}
                    mainBody={mainBody}
                    teacherOfferStatesActiveStep={teacherOfferStatesActiveStep}
                    comments={comments}
                    commentsLoaded={commentsLoaded}
                    currentComment={currentComment}
                    currentCommentText={currentCommentText}
                    replyingToComment={replyingToComment}
                    replyText={replyText}
                    replyEdited={replyEdited}
                    changedPitchExpiryDate={changedPitchExpiryDate}
                    addingRejectFeedback={addingRejectFeedback}
                    rejectFeedback={rejectFeedback}
                    sendingProjectBack={sendingProjectBack}
                    project={project}
                    projectLoaded={projectLoaded}
                    votes={votes}
                    votesLoaded={votesLoaded}
                    pledges={pledges}
                    pledgesLoaded={pledgesLoaded}
                    investorPledge={investorPledge}
                    investorPledgeLoaded={investorPledgeLoaded}
                    projectTeacher={projectTeacher}
                    projectTeacherLoaded={projectTeacherLoaded}
                    projectVisibilitySetting={projectVisibilitySetting}
                    onVote={this.handleVotePitch}
                    onDocumentClick={this.handleDocumentClick}
                    // only available for teachers ----------------------------
                    onMakeProjectGoLiveDecision={this.handleMakeProjectGoLiveDecision}
                    onMakeProjectGoToPledgePhaseDecision={this.handleMakeProjectGoToPledgePhaseDecision}
                    onMakeProjectPledgeGoLiveDecision={this.handleMakeProjectPledgeGoLiveDecision}
                    //-------------------------------------------------------
                    onTabChanged={this.handleMainBodyTabChanged}
                    onPostACommentClick={this.handlePostACommentClick}
                    onTextChanged={this.handleTextChanged}
                    onDateChanged={this.handleDateChanged}
                    onCancelUpdateCurrentComment={this.handleCancelUpdateCurrentComment}
                    onSubmitUpdateCurrentComment={this.handleSubmitUpdateCurrentComment}
                    onToggleReplyToComment={this.handleToggleReplyToComment}
                    onSubmitCommentReply={this.handleSubmitCommentReply}
                    onDeleteCommentReply={this.handleDeleteCommentReply}
                    onTeacherOfferStatesStepClick={this.handleTeacherOfferStatesStepClick}
                    createPledgeDialog_toggleDialog={createPledgeDialog_toggleDialog}
                    createPledgeDialog_setProject={createPledgeDialog_setProject}
                    selectProjectVisibility_setProject={selectProjectVisibility_setProject}
                    bringPitchBackToLive={this.bringPitchBackToLive}
                    toggleRejectFeedback={this.toggleRejectFeedback}
                    sendProjectBackToTeacher={this.sendProjectBackToTeacher}
                    toggleContactPitchOwnerDialog={() => this.props.toggleContactPitchOwnerDialog(project.projectName, projectTeacher.email)}
                />

                <CommentDialog
                    open={commentDialogOpen}
                    project={project}
                    commentText={commentText}
                    commentSubmitClick={commentSubmitClick}
                    onClose={this.handleCloseCommentDialog}
                    onCommentTextChanged={this.handleTextChanged}
                    onSubmitCommentClick={this.handleSubmitCommentClick}
                />

                <CreatePledgeDialog/>

                <ContactPitchOwnerDialog/>

                <FeedbackSnackbarNew/>
            </div>
        );
    }
}

class ProjectDetails extends Component {

    /**
     * Handle when the navigation tab is changed
     *
     * @param event
     * @param value
     */
    onTabChanged = (event, value) => {
        this.props.onTabChanged(event, value);
    };

    /**
     * Handle when text input changed
     *
     * @param event
     */
    onTextChanged = event => {
        this.props.onTextChanged(event);
    };

    /**
     * Handle date changed
     *
     * @param date
     */
    onDateChanged = date => {
        this.props.onDateChanged(date);
    }

    /**
     * Handle when the vote button is clicked.
     *
     * @param vote
     */
    onVote = vote => {
        this.props.onVote(vote);
    };

    /**
     * Handle when a document is clicked
     */
    onDocumentClick = downloadURL => {
        this.props.onDocumentClick(downloadURL);
    };

    /**
     * Make a decision whether a project can go live (Teacher only)
     *
     * @param decision
     */
    onMakeProjectGoLiveDecision = decision => {
        this.props.onMakeProjectGoLiveDecision(decision);
    };

    /**
     * Make a decision whether a project can go to the Pledge phase
     *
     * @param decision
     */
    onMakeProjectGoToPledgePhaseDecision = decision => {
        this.props.onMakeProjectGoToPledgePhaseDecision(decision);
    };
    /**
     * Make a decision whether a project's Pledge can go live
     *
     * @param decision
     */
    onMakeProjectPledgeGoLiveDecision = decision => {
        this.props.onMakeProjectPledgeGoLiveDecision(decision);
    };

    /**
     * Handle when the Post comment button is clicked --> Open comment dialog
     */
    onPostACommentClick = () => {
        this.props.onPostACommentClick();
    };

    /**
     * Handle to cancel updating current comment
     */
    onCancelUpdateCurrentComment = () => {
        this.props.onCancelUpdateCurrentComment();
    };

    /**
     * Handle to submit the updated comment
     */
    onSubmitUpdateCurrentComment = () => {
        this.props.onSubmitUpdateCurrentComment();
    };

    /**
     * Handle to toggle input area to allow the project's owners to reply to the investor's comments
     *
     * @param comment
     * @param replyEdited
     */
    onToggleReplyToComment = (comment, replyEdited) => {
        this.props.onToggleReplyToComment(comment, replyEdited);
    }

    /**
     * Handle to submit comment reply
     */
    onSubmitCommentReply = () => {
        this.props.onSubmitCommentReply();
    }

    /**
     * Handle to delete a reply of a comment
     *
     * @param reply
     */
    onDeleteCommentReply = reply => {
        this.props.onDeleteCommentReply(reply);
    }

    /**
     * Handle when the offer state is changed
     *
     * @param step
     */
    onTeacherOfferStatesStepClick = step => {
        this.props.onTeacherOfferStatesStepClick(step);
    };

    /**
     * Bring pitch back to live
     */
    bringPitchBackToLive = () => {
        this.props.bringPitchBackToLive();
    }

    /**
     * Toggle reject feedback
     */
    toggleRejectFeedback = () => {
        this.props.toggleRejectFeedback();
    }

    /**
     * Send project back to Teacher
     */
    sendProjectBackToTeacher = () => {
        this.props.sendProjectBackToTeacher();
    }

    /**
     * Toggle contact pitch owner dialog
     */
    toggleContactPitchOwnerDialog = () => {
        this.props.toggleContactPitchOwnerDialog();
    }

    /**
     * Render the page content
     */
    renderPageContent = () => {
        const {
            AuthenticationState,

            coursesStudentIsIn,

            courseStudent,
            courseProperties,

            isMobile,

            student,

            investorSelfCertificationAgreement,

            mainBody,
            teacherOfferStatesActiveStep,

            comments,
            commentsLoaded,

            project,

            pledges,
            pledgesLoaded,

            votes,
            votesLoaded,

            investorPledge,
            investorPledgeLoaded,

            projectTeacher,
            projectTeacherLoaded,

            currentComment,
            currentCommentText,

            replyingToComment,
            replyText,
            replyEdited,

            changedPitchExpiryDate,

            addingRejectFeedback,
            rejectFeedback,
            sendingProjectBack,

            projectVisibilitySetting,

            createPledgeDialog_toggleDialog,
            createPledgeDialog_setProject,
            selectProjectVisibility_setProject
        } = this.props;

        // if the data is being loaded
        // display loading
        if (!pledgesLoaded
            || !votesLoaded
            || !investorPledgeLoaded
            || !projectTeacherLoaded
        ) {
            return (
                <Row noGutters>
                    <Col xs={12} md={12} lg={12}>
                        <FlexView width="100%" marginTop={20} hAlignContent="center">
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
                    </Col>
                </Row>
            );
        }

        // return Page Not Found for security reason
        if (!project
            || !pledges
            || !projectTeacher
            // the project is private
            // the student is an investor/teacher that is not in the course that owns this project
            || (
                project.visibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE
                && (student.type === DB_CONST.TYPE_INVESTOR || student.type === DB_CONST.TYPE_TEACHER)
                && (coursesStudentIsIn !== null && coursesStudentIsIn.findIndex(course => course.anid === project.anid) === -1)
            )
        ) {
            return (
                <Row noGutters>
                    <Col xs={12} md={12} lg={12}>
                        <PageNotFound/>
                    </Col>
                </Row>
            );
        }

        // the project is temporarily closed
        // only display its content to the super teachers,
        // course teachers that own this project, and the teacher of this project
        if (utils.isProjectTemporarilyClosed(project)
            && (
                (student.type === DB_CONST.TYPE_TEACHER && student.id !== project.teacherID)
                || (student.type === DB_CONST.TYPE_INVESTOR)
                || (student.type === DB_CONST.TYPE_PROF && !student.superTeacher && student.anid !== project.anid)
            )
        ) {
            return (
                <Row noGutters style={{marginLeft: 10, marginRight: 10}}>
                    <Col xs={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                        <FlexView marginTop={40} hAlignContent="center">
                            <Typography variant="h5" align="center">This offer has been closed temporarily.</Typography>
                        </FlexView>
                    </Col>
                </Row>
            );
        }

        // the project is private
        // the student is a course teacher that does not own this project
        if (project.visibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE
            && (student.type === DB_CONST.TYPE_PROF)
            && !student.superTeacher
            && student.anid !== project.anid
        ) {
            return (
                <Row noGutters style={{marginLeft: 10, marginRight: 10}}>
                    <Col xs={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}}>
                        <FlexView marginTop={40} hAlignContent="center">
                            <Typography variant="h5" align="center"> You can only edit offers from your course.</Typography>
                        </FlexView>
                    </Col>
                </Row>
            );
        }

        let sortedComments = comments;
        // if the list of comments is not null
        if (sortedComments) {
            // sort by oldest day first
            sortedComments.sort((comment1, comment2) => {
                return (comment1.commentedDate - comment2.commentedDate);
            });

            let currentCommentIndex = sortedComments.findIndex(comment => comment.commentedBy === student.id);
            if (currentCommentIndex !== -1) {
                const currentComment = comments[currentCommentIndex];
                sortedComments.splice(currentCommentIndex, 1);
                sortedComments.push(currentComment);
            }

            sortedComments.reverse();
        }

        // sort replies in each comment
        sortedComments.forEach(comment => {
            comment.replies.sort((reply1, reply2) => {
                return reply2.repliedDate - reply1.repliedDate;
            });
        });

        return (
            <Container fluid style={{paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 100}}>
                <Row noGutters style={{paddingTop: 25, paddingBottom: 25, backgroundColor: colors.kick_starter_background_color}}>
                    {/** Banner to announce if a project is temporarily closed */}
                    {
                        !utils.isProjectTemporarilyClosed(project)
                            ?
                            null
                            :
                            <Col xs={{span: 12, offset: 0, order: 0}} sm={{span: 12, offset: 0, order: 0}} md={{span: 12, offset: 0, order: 0}} lg={{span: 12, offset: 0, order: 0}}>
                                <FlexView marginBottom={20} hAlignContent="center" style={{backgroundColor: colors.errorColor, padding: 15}} >
                                    <Typography variant="body2" align="center" className={css(sharedStyles.white_text)}><b>This offer has been temporarily closed.</b></Typography>
                                </FlexView>
                            </Col>
                    }

                    {/** Pledge (displayed if the student is an investor and has pledged this project before) */}
                    {
                        !investorPledge
                            ?
                            null
                            :
                            <Col xs={{span: 12, offset: 0, order: 2}} sm={{span: 12, offset: 0, order: 2}} md={{span: 10, offset: 1, order: 2}} lg={{span: 10, offset: 1, order: 1}}>
                                <Paper elevation={3} style={{margin: 12}} square>
                                    <Row noGutters style={{padding: 6}}>
                                        <Col xs={12} sm={12} md={{span: 5, order: 1}} lg={{span: 3, order: 1}}>
                                            <FlexView hAlignContent="center" vAlignContent="center" height="100%" width="100%" style={{padding: 10}}>
                                                <CheckCircleIcon color="primary" style={{marginRight: 15}}/>
                                                <Typography align="left" variant="body1">
                                                    {
                                                        investorPledge.status === DB_CONST.MAKE_A_NEW_PLEDGE
                                                            ?
                                                            `You pledged £${Number(investorPledge.amount.toFixed(2)).toLocaleString()}.`
                                                            :
                                                            `You updated your pledge to £${Number(investorPledge.amount.toFixed(2)).toLocaleString()}.`
                                                    }
                                                </Typography>
                                            </FlexView>
                                        </Col>
                                        <Col xs={12} sm={12} md={{span: 5, offset: 2, order: 2}} lg={{span: 3, offset: 6, order: 2}}>
                                            <FlexView width="100%" hAlignContent="center" style={{padding: 10}}>
                                                {
                                                    !utils.isProjectInLivePledgePhase(project)
                                                        ?
                                                        <Typography align="left" variant="body2" color="secondary">Offer has ended. You can't change your pledge anymore.</Typography>
                                                        :
                                                        <NavLink
                                                            to={{
                                                                pathname: courseStudent
                                                                    ?
                                                                    ROUTES.PLEDGE.replace(":courseStudent", courseStudent)
                                                                    :
                                                                    ROUTES.PLEDGE_INVEST_WEST_SUPER
                                                                ,
                                                                search: `?project=${project.id}`
                                                            }}
                                                            className={css(sharedStyles.nav_link_hover)}
                                                        >
                                                            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary">Manage your pledge</Button>
                                                        </NavLink>
                                                }
                                            </FlexView>
                                        </Col>
                                    </Row>
                                </Paper>
                            </Col>
                    }

                    {/** Project title and description */}
                    <Col xs={{span: 12, offset: 0, order: 3}} sm={{span: 12, offset: 0, order: 3}} md={{span: 10, offset: 1, order: 3}} lg={{span: 8, offset: 2, order: 2}} style={{paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 40}}>
                        <FlexView column width="100%" hAlignContent="center">
                            <Typography align="center" variant="h5" style={{marginBottom: 12}}>
                                {
                                    this.shouldHideInformation()
                                        ?
                                        "This is an offer"
                                        :
                                        project.projectName
                                }
                            </Typography>
                            <Typography className={css(styles.gray_text)} align="center" variant="body1" style={{whiteSpace: "pre-line"}}>
                                {
                                    this.shouldHideInformation()
                                        ?
                                        `in ${project.sector} sector`
                                        :
                                        project.description
                                }
                            </Typography>
                            {
                                student.type === DB_CONST.TYPE_PROF
                                || (student.type === DB_CONST.TYPE_TEACHER && student.id === project.teacherID)
                                    ?
                                    <FlexView width="100%" hAlignContent="center" vAlignContent="center" marginTop={20}>
                                        {
                                            !utils.shouldAProjectBeEdited(student, project)
                                                ?
                                                <Button color="default" variant="outlined" size="medium" className={css(sharedStyles.no_text_transform)} disabled>
                                                    <CreateIcon style={{marginRight: 8,  width: 20, height: "auto"}}
                                                    />Edit offer</Button>
                                                :
                                                <NavLink
                                                    to={
                                                        courseStudent
                                                            ?
                                                            ROUTES.EDIT_OFFER
                                                                .replace(":courseStudent", courseStudent)
                                                                .replace(":projectID", project.id)
                                                            :
                                                            ROUTES.EDIT_OFFER_INVEST_WEST_SUPER
                                                                .replace(":projectID", project.id)
                                                    }
                                                    className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                                >
                                                    <Button color="default" variant="outlined" size="medium" className={css(sharedStyles.no_text_transform)}>
                                                        <CreateIcon style={{marginRight: 8, width: 20, height: "auto"}}/>Edit offer</Button>
                                                </NavLink>
                                        }
                                        {/*<FlexView*/}
                                        {/*    marginLeft={15}*/}
                                        {/*>*/}
                                        {/*    <InfoOverlay*/}
                                        {/*        message={*/}
                                        {/*            student.type === DB_CONST.TYPE_PROF*/}
                                        {/*                ?*/}
                                        {/*                "Edit offer."*/}
                                        {/*                :*/}
                                        {/*                utils.isDraftProject(project)*/}
                                        {/*                    ?*/}
                                        {/*                    "This offer is still a draft. Complete it."*/}
                                        {/*                    :*/}
                                        {/*                    !utils.shouldAProjectBeEdited(student, project)*/}
                                        {/*                        ?*/}
                                        {/*                        "Pages cannot be edited."*/}
                                        {/*                        :*/}
                                        {/*                        `Pages can only be edited before the pitch phase expires. You can edit until ${utils.dateInReadableFormat(project.Pitch.expiredDate)}.`*/}
                                        {/*        }*/}
                                        {/*        placement="right"*/}
                                        {/*    />*/}
                                        {/*</FlexView>*/}
                                    </FlexView>
                                    :
                                    null
                            }

                            {
                                student.id === project.teacherID
                                    ?
                                    null
                                    :
                                    <FlexView column hAlignContent="center">
                                        <NavLink
                                            to={
                                                this.shouldHideInformation()
                                                || (
                                                    project.hasOwnProperty('createdByCourseTeacher')
                                                    && project.createdByCourseTeacher
                                                )
                                                    ?
                                                    courseStudent
                                                        ?
                                                        ROUTES.VIEW_COURSE_DETAILS
                                                            .replace(":courseStudent", courseStudent)
                                                            .replace(":courseID", project.course.courseStudent)
                                                        :
                                                        ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER
                                                            .replace(":courseID", project.course.courseStudent)
                                                    :
                                                    courseStudent
                                                        ?
                                                        ROUTES.STUDENT_PROFILE
                                                            .replace(":courseStudent", courseStudent)
                                                            .replace(":studentID", projectTeacher.id)
                                                        :
                                                        ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER
                                                            .replace(":studentID", projectTeacher.id)
                                            }
                                            className={css(sharedStyles.nav_link_hover, styles.black_text)}
                                        >
                                            <Typography align="center" variant="body2" style={{marginTop: 23}}>
                                                {
                                                    this.shouldHideInformation()
                                                    || (
                                                        project.hasOwnProperty('createdByCourseTeacher')
                                                        && project.createdByCourseTeacher
                                                    )
                                                        ?
                                                        <u>by {`${project.course.displayName}`}</u>
                                                        :
                                                        <u>by {`${projectTeacher.firstName} ${projectTeacher.lastName}`}</u>
                                                }
                                            </Typography>
                                        </NavLink>
                                        {
                                            project.hasOwnProperty('createdByCourseTeacher')
                                            && project.createdByCourseTeacher
                                                ?
                                                null
                                                :
                                                projectTeacher.hasOwnProperty('linkedin')
                                                && projectTeacher.linkedin.trim().length > 0
                                                    ?
                                                    <a href={projectTeacher.linkedin} target="_blank" rel="noopener noreferrer">
                                                        <img alt="linkedin_logo" src={require("../../img/linkedin_logo.png").default} style={{width: 64,  height: 64}}/>
                                                    </a>
                                                    :
                                                    null
                                        }
                                    </FlexView>
                            }
                        </FlexView>
                    </Col>

                    {/** Project cover (image or video) */}
                    <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 12, order: 1}} lg={{span: 7, offset: 1, order: 3}} style={{paddingLeft: 20, paddingRight: 20, height: isMobile ? MAX_COVER_HEIGHT_IN_MOBILE_MODE : MAX_COVER_HEIGHT_IN_BIG_SCREEN_MODE}}>
                        {
                            this.shouldHideInformation()
                                ?
                                <Image src={utils.getLogoFromCourse(utils.GET_PLAIN_LOGO, project.course)}
                                    style={{
                                        maxHeight:
                                            isMobile
                                                ?
                                                MAX_COVER_HEIGHT_IN_MOBILE_MODE
                                                :
                                                MAX_COVER_HEIGHT_IN_BIG_SCREEN_MODE
                                        ,
                                        border: `1px solid ${colors.gray_300}`,
                                        width: "100%",
                                        objectFit: "scale-down"
                                    }}
                                />
                                :
                                project.Pitch.cover.map((coverItem, index) => (
                                    coverItem.hasOwnProperty('removed')
                                        ?
                                        null
                                        :
                                        (
                                            coverItem.fileType === DB_CONST.FILE_TYPE_VIDEO
                                                ?
                                                <ReactPlayer
                                                    key={index}
                                                    url={coverItem.url}
                                                    playsInline
                                                    pip={true}
                                                    width="100%"
                                                    height={coverItem.storageID === "" ? "100%" : "auto"}
                                                    playing={false}
                                                    controls={true}
                                                />
                                                :
                                                <Image key={index} src={coverItem.url} style={{maxHeight: isMobile ? MAX_COVER_HEIGHT_IN_MOBILE_MODE : MAX_COVER_HEIGHT_IN_BIG_SCREEN_MODE, border: `1px solid ${colors.gray_300}`, width: "100%", objectFit: "scale-down"}}/>
                                        )
                                ))
                        }
                    </Col>

                    {/** Project information */}
                    <Col xs={{span: 12, order: 4}} sm={{span: 12, order: 4}} md={{span: 12, order: 4}} lg={{span: 3, order: 4}} style={{paddingLeft: 20, paddingRight: 20}}>
                        <Row noGutters>

                            {/** Divider */}
                            <Col xs={12} sm={12} md={{span: 10, offset: 1, order: 1}} lg={{span: 12, offset: 0, order: 1}}>
                                <FlexView width="100%" height={4} style={{
                                        backgroundColor:
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                    }}
                                />
                            </Col>

                            {/** Funding goal / Pledged */}
                            <Col xs={12} sm={12} md={{span: 5, offset: 1, order: 2}} lg={{span: 12, offset: 0, order: 2}}>
                                <FlexView column marginTop={18}>
                                    {
                                        utils.isDraftProject(project)
                                        || utils.isProjectWaitingToGoLive(project)
                                        || utils.isProjectRejectedToGoLive(project)
                                        || utils.isProjectInLivePitchPhase(project)
                                        || utils.isProjectPitchExpiredWaitingForTeacherToCheck(project)
                                        || utils.isProjectWaitingForPledgeToBeCreated(project)
                                        || utils.isProjectWaitingForPledgeToBeChecked(project)
                                            ?
                                            <FlexView vAlignContent="center">
                                                <FlexView column marginRight={20}>
                                                    <Typography variant="h5" color="secondary" align="left">{'£' + Number(project.Pitch.fundRequired.toFixed(2)).toLocaleString()}</Typography>
                                                    <Typography variant="body2" color="textSecondary" align="left">Funding goal</Typography>
                                                </FlexView>
                                                <InfoOverlay message="Funding amount sought via Invest West." placement="top"/>
                                            </FlexView>
                                            :
                                            <FlexView vAlignContent="center">
                                                <FlexView column marginRight={20}>
                                                    <Typography variant="h5" color="primary" align="left">{`£${Number(utils.calculatePledgesAmount(pledges).toFixed(2)).toLocaleString()}`}</Typography>
                                                    <Typography variant="body2" color="textSecondary" align="left">{`pledged of £${Number(project.Pitch.fundRequired.toFixed(2)).toLocaleString()} goal`}</Typography>
                                                </FlexView>
                                                <InfoOverlay message="Total amount pledged via Invest West." placement="top"/>
                                            </FlexView>
                                    }
                                </FlexView>
                            </Col>

                            {/** Post money valuation */}
                            {
                                !project.Pitch.hasOwnProperty('postMoneyValuation')
                                    ?
                                    null
                                    :
                                    <Col xs={12} sm={12} md={{span: 5, offset: 1, order: 3}} lg={{span: 12, offset: 0, order: 3}}>
                                        <FlexView marginTop={20} vAlignContent="center">
                                            <FlexView column marginRight={20}>
                                                <Typography variant="h5" color="inherit" align="left">{'£' + Number(project.Pitch.postMoneyValuation.toFixed(2)).toLocaleString()}</Typography>
                                                <Typography variant="body2" color="textSecondary" align="left">Post money valuation</Typography>
                                            </FlexView>
                                            <InfoOverlay message="This is the company post money valuation." placement="top"/>
                                        </FlexView>
                                    </Col>
                            }

                            

                            {/** Project status */}
                            <Col xs={12} sm={12} md={{span: 5, offset: 0, order: 4}} lg={{span: 12, offset: 0, order: 4}}>
                                {
                                    this.renderProjectStatus()
                                }
                            </Col>

                            {/** SEIS badge check */}
                            {
                                project.Pitch.hasSEIS === "Yes"
                                    ?
                                    <Col xs={12} sm={12} md={{span: 1, offset: 1, order: 5}} lg={{span: 3, offset: 0, order: 5}}>
                                        <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column hAlignContent="center" vAlignContent="center">
                                                    <Typography variant="body1"><b>SEIS</b></Typography>
                                        </FlexView>
                                    </Col>
                                    :
                                    null
                            }

                            {/** EIS badge check */}
                            {

                                project.Pitch.hasEIS === "Yes"
                                    ?
                                    <Col xs={12} sm={12} md={{span: 1, offset: 1, order: 6}} lg={{span: 3, offset: 0, order: 6}}>
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color,}} hAlignContent="center" vAlignContent="center">
                                                    <Typography variant="body1"><b>EIS</b></Typography>
                                        </FlexView>
                                    </Col>
                                    :
                                    null
                            }

                            {/** Contact us */}
                            {
                                isProjectOwner(AuthenticationState.currentStudent, project)
                                    ? null
                                    : <Col xs={12} sm={12} md={{span: 10, offset: 1, order: 5}} lg={{span: 12, offset: 0, order: 7}} style={{marginTop: 15}}>
                                        <FlexView column hAlignContent="left">
                                            <FlexView hAlignContent="center" vAlignContent="center">
                                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={this.shouldHideInformation() || (student.type === TYPE_INVESTOR && !investorSelfCertificationAgreement)} onClick={() => this.toggleContactPitchOwnerDialog()}>Contact us</Button>
                                                {/*<Button*/}
                                                {/*    size="medium"*/}
                                                {/*    variant={getInvestorVote(votes, student) && getInvestorVote(votes, student).voted ? "contained" : "outlined"}*/}
                                                {/*    color="primary"*/}
                                                {/*    disabled={this.shouldVoteDisabled()}*/}
                                                {/*    onClick={() => this.onVote(true)}*/}
                                                {/*    className={css(sharedStyles.no_text_transform)}*/}
                                                {/*>*/}
                                                {/*    <i*/}
                                                {/*        style={{*/}
                                                {/*            fontSize: 21,*/}
                                                {/*            marginRight: 8*/}
                                                {/*        }}*/}
                                                {/*        className="far fa-thumbs-up"*/}
                                                {/*    />*/}
                                                {/*    <Typography*/}
                                                {/*        variant="body1"*/}
                                                {/*    >*/}
                                                {/*        Like*/}
                                                {/*    </Typography>*/}
                                                {/*</Button>*/}
                                                {/*<FlexView*/}
                                                {/*    marginLeft={10}*/}
                                                {/*>*/}
                                                {/*    <Typography*/}
                                                {/*        variant="body1"*/}
                                                {/*        color="primary"*/}
                                                {/*    >*/}
                                                {/*        {this.displayVote(true)}*/}
                                                {/*    </Typography>*/}
                                                {/*</FlexView>*/}
                                            </FlexView>
                                            {/*{*/}
                                            {/*    student.type === DB_CONST.TYPE_TEACHER*/}
                                            {/*        ?*/}
                                            {/*        <Typography*/}
                                            {/*            variant="body2"*/}
                                            {/*            align="left"*/}
                                            {/*            color="error"*/}
                                            {/*            style={{*/}
                                            {/*                marginTop: 10*/}
                                            {/*            }}*/}
                                            {/*        >*/}
                                            {/*            Only investors can vote.*/}
                                            {/*        </Typography>*/}
                                            {/*        :*/}
                                            {/*        null*/}
                                            {/*}*/}
                                        </FlexView>
                                        {
                                            this.shouldHideInformation()
                                                ?
                                                student.type === DB_CONST.TYPE_PROF
                                                    ?
                                                    <FlexView column marginTop={20}>
                                                        <Typography align="left" variant="body2" color="textSecondary">You cannot see detailed information of this restricted offer.</Typography>
                                                    </FlexView>
                                                    :
                                                    <FlexView column marginTop={20}>
                                                        <Typography align="left" variant="body2" color="textSecondary">Restricted to {project.course.displayName} members.</Typography>
                                                        <NavLink
                                                            to={
                                                                courseStudent
                                                                    ?
                                                                    ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", project.course.courseStudent)
                                                                    :
                                                                    ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", project.course.courseStudent)
                                                            }
                                                            style={{marginTop: 4}}>
                                                            <Typography variant="body2">Request access</Typography>
                                                        </NavLink>
                                                    </FlexView>
                                                :
                                                this.renderInvestorSelfCertifyReminder()
                                        }
                                    </Col>
                            }

                            {/** Pledge this project (available only for investor and only appears when the project is in the Primary offer phase) */}
                            {
                                !utils.isProjectInLivePledgePhase(project)
                                    ?
                                    null
                                    :
                                    (
                                        student.type !== DB_CONST.TYPE_INVESTOR
                                            ?
                                            (
                                                <Col xs={12} sm={12} md={{span: 10, offset: 1, order: 6}} lg={{span: 12, offset: 0, order: 6}} style={{marginTop: 30}}>
                                                    <Typography align="left" variant="body2">
                                                        <u>Closes on {utils.dateTimeInReadableFormat(project.PrimaryOffer.expiredDate)}.</u>
                                                    </Typography>
                                                </Col>
                                            )
                                            :
                                            (
                                                investorPledge
                                                    ?
                                                    <Col xs={12} sm={12} md={{span: 10, offset: 1, order: 6}} lg={{span: 12, offset: 0, order: 6}} style={{marginTop: 30}}>
                                                        <Typography align="left" variant="body2"><u>Closes on {utils.dateTimeInReadableFormat(project.PrimaryOffer.expiredDate)}.</u>
                                                        </Typography>
                                                    </Col>
                                                    :
                                                    <Col xs={12} sm={12} md={{span: 10, offset: 1, order: 6}} lg={{span: 12, offset: 0, order: 6}} style={{marginTop: 30}}>

                                                        {
                                                            student.type === DB_CONST.TYPE_INVESTOR
                                                            && !investorSelfCertificationAgreement
                                                                ?
                                                                <Button style={{marginBottom: 14}} className={css(sharedStyles.no_text_transform)} fullWidth variant="outlined" color="primary" size="medium"
                                                                    disabled={
                                                                        student.type === DB_CONST.TYPE_INVESTOR
                                                                        && !investorSelfCertificationAgreement
                                                                    }
                                                                >
                                                                    Pledge now
                                                                </Button>
                                                                :
                                                                <NavLink
                                                                    to={{
                                                                        pathname: courseStudent
                                                                            ?
                                                                            ROUTES.PLEDGE.replace(":courseStudent", courseStudent)
                                                                            :
                                                                            ROUTES.PLEDGE_INVEST_WEST_SUPER
                                                                        ,
                                                                        search: `?project=${project.id}`
                                                                    }}
                                                                    className={css(sharedStyles.nav_link_hover)}
                                                                >
                                                                    <Button style={{marginBottom: 14}} className={css(sharedStyles.no_text_transform)} fullWidth variant="outlined" color="primary" size="medium">Pledge now</Button>
                                                                </NavLink>
                                                        }

                                                        {
                                                            this.renderInvestorSelfCertifyReminder()
                                                        }

                                                        <Typography align="left" variant="body2" style={{marginTop: 15}}>
                                                            <u>Closes on {utils.dateTimeInReadableFormat(project.PrimaryOffer.expiredDate)}.</u></Typography>
                                                    </Col>
                                            )
                                    )
                            }
                        </Row>
                    </Col>
                </Row>

                {/** Sections bar */}
                <Row noGutters className={css(styles.sticky_body_sections_bar)}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider/>
                    </Col>

                    <Col style={{padding: 10}} xs={{span: 12, offset: 0}} sm={{span: 12, offset: 0}} md={{span: 12, offset: 0}} lg={{span: 8, offset: 2}}>
                        <FlexView hAlignContent="center">
                            <Tabs value={mainBody} onChange={this.onTabChanged} indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="on">
                                {
                                    // student is a super teacher
                                    // or a course teacher that owns the project
                                    (student.type === DB_CONST.TYPE_PROF
                                        && (student.superTeacher || (!student.superTeacher && student.anid === project.anid))
                                    )
                                    // project is not a draft
                                    && !utils.isDraftProject(project)
                                        ?
                                        <Tab value={MAIN_BODY_TEACHER_OFFER_STATES} className={css(sharedStyles.tab_title)} fullWidth label="Control phases"
                                         style={{
                                                color:
                                                    !courseProperties
                                                        ?
                                                        colors.secondaryColor
                                                        :
                                                        courseProperties.settings.secondaryColor
                                            }}
                                        />
                                        :
                                        null
                                }
                                {/*{*/}
                                {/*    // student is a super teacher*/}
                                {/*    // or a course teacher that owns the project*/}
                                {/*    (student.type === DB_CONST.TYPE_PROF*/}
                                {/*        && (student.superTeacher || (!student.superTeacher && student.anid === project.anid))*/}
                                {/*    )*/}
                                {/*    // student is the Teacher that owns the project*/}
                                {/*    || (student.type === DB_CONST.TYPE_TEACHER && student.id === project.teacherID)*/}
                                {/*        ?*/}
                                {/*        <Tab*/}
                                {/*            value={MAIN_BODY_INVESTORS_PLEDGED}*/}
                                {/*            className={css(sharedStyles.tab_title)}*/}
                                {/*            fullWidth*/}
                                {/*            label="Pledges"*/}
                                {/*            style={{*/}
                                {/*                color:*/}
                                {/*                    !courseProperties*/}
                                {/*                        ?*/}
                                {/*                        colors.secondaryColor*/}
                                {/*                        :*/}
                                {/*                        courseProperties.settings.secondaryColor*/}
                                {/*            }}*/}
                                {/*        />*/}
                                {/*        :*/}
                                {/*        null*/}
                                {/*}*/}
                                <Tab value={MAIN_BODY_CAMPAIGN} className={css(sharedStyles.tab_title)} fullWidth label="Campaign"/>
                                <Tab value={MAIN_BODY_DOCUMENTS} className={css(sharedStyles.tab_title)} fullWidth label="Documents"/>
                                <Tab value={MAIN_BODY_COMMENTS} className={css(sharedStyles.tab_title)} fullWidth label="Investor comments"/>
                                <Tab value={MAIN_BODY_NOTES} className={css(sharedStyles.tab_title)} fullWidth label="Extra information"/>
                            </Tabs>
                        </FlexView>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider/>
                    </Col>
                </Row>

                {/** Main body */}
                <Row noGutters className={css(styles.main_body_section)}>
                    {/** Offer states (only visible to Teacher) */}
                    {
                        mainBody !== MAIN_BODY_TEACHER_OFFER_STATES
                            ?
                            null
                            :
                            <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                                <FlexView column marginTop={30}>
                                    <Typography variant="h5"> Control phases</Typography>

                                    <Row>
                                        <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 8, order: 0}} lg={{span: 8, order: 0}}>
                                            <Stepper nonLinear orientation="vertical" activeStep={teacherOfferStatesActiveStep} style={{marginTop: 15}}>
                                                {/** Publish pitch step */}
                                                <Step key={TEACHER_OFFER_STATES_PUBLISH_PITCH} completed={!utils.isProjectWaitingToGoLive(project)}>
                                                    <StepButton onClick={() => this.onTeacherOfferStatesStepClick(TEACHER_OFFER_STATES_PUBLISH_PITCH)}>
                                                        <StepLabel>Publish pitch</StepLabel>
                                                    </StepButton>
                                                    <StepContent>
                                                        {
                                                            utils.isProjectWaitingToGoLive(project)
                                                                ?
                                                                <FlexView column width="100%" marginTop={20} className={css(styles.teacher_state_control_box)}>
                                                                    <Typography variant="body1" align="left" paragraph>
                                                                        Please check this offer
                                                                        carefully
                                                                        before publishing as this action cannot be
                                                                        reversed. You
                                                                        can control who can see this investment
                                                                        opportunity
                                                                        using the options below.
                                                                    </Typography>

                                                                    <Divider style={{marginTop: 25, marginBottom: 20}}/>

                                                                    {/** Select project visibility before publishing pitch */}
                                                                    <SelectPitchVisibility/>

                                                                    <Divider style={{marginTop: 35, marginBottom: 25}}/>

                                                                    {
                                                                        !addingRejectFeedback
                                                                            ?
                                                                            null
                                                                            :
                                                                            <FlexView column>
                                                                                <TextField
                                                                                    label="Feedback"
                                                                                    placeholder="Feedback for teacher"
                                                                                    name="rejectFeedback"
                                                                                    value={rejectFeedback}
                                                                                    fullWidth
                                                                                    margin="normal"
                                                                                    variant="outlined"
                                                                                    required
                                                                                    multiline
                                                                                    rows={5}
                                                                                    rowsMax={5}
                                                                                    onChange={this.onTextChanged}
                                                                                />

                                                                                <FlexView width="100%" hAlignContent="right" marginTop={10}>
                                                                                    <FlexView marginRight={6}>
                                                                                        <Button fullWidth color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={rejectFeedback.trim().length === 0} onClick={() => this.sendProjectBackToTeacher()}>
                                                                                            {
                                                                                                sendingProjectBack
                                                                                                    ?
                                                                                                    "Sending..."
                                                                                                    :
                                                                                                    "Send"
                                                                                            }
                                                                                        </Button>
                                                                                    </FlexView>
                                                                                    <FlexView marginLeft={6}>
                                                                                        <Button fullWidth color="secondary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => this.toggleRejectFeedback()}>Cancel</Button>
                                                                                    </FlexView>
                                                                                </FlexView>
                                                                            </FlexView>
                                                                    }

                                                                    {
                                                                        addingRejectFeedback
                                                                            ?
                                                                            null
                                                                            :
                                                                            isProjectCreatedByCourseTeacher(project)
                                                                                ?
                                                                                <Button fullWidth color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={student.superTeacher} onClick={() => this.onMakeProjectGoLiveDecision({decision: true, projectVisibilitySetting})}>Publish pitch</Button>
                                                                                :
                                                                                <FlexView>
                                                                                    <FlexView grow marginRight={10}>
                                                                                        <Button fullWidth color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={student.superTeacher} onClick={() => this.onMakeProjectGoLiveDecision({decision: true, projectVisibilitySetting})}>Publish pitch</Button>
                                                                                    </FlexView>
                                                                                    <FlexView grow marginLeft={10}>
                                                                                        <Button fullWidth color="secondary" variant="outlined" className={css(sharedStyles.no_text_transform)} disabled={student.superTeacher} onClick={() => this.toggleRejectFeedback()}>Send back to teacher</Button>
                                                                                    </FlexView>
                                                                                </FlexView>
                                                                    }

                                                                    {
                                                                        !student.superTeacher
                                                                            ?
                                                                            null
                                                                            :
                                                                            <Typography variant="body1" color="error" align="left" style={{marginTop: 20}}>Only course teacher can do this.</Typography>
                                                                    }
                                                                </FlexView>
                                                                :
                                                                <FlexView column width="100%" marginTop={20}>
                                                                    <Typography
                                                                        color={
                                                                            isProjectRejectedToGoLive(project)
                                                                                ?
                                                                                "secondary"
                                                                                :
                                                                                "primary"
                                                                        }
                                                                        align="left"
                                                                        variant="body1"
                                                                    >
                                                                        {
                                                                            isProjectRejectedToGoLive(project)
                                                                                ?
                                                                                "This offer has been rejected."
                                                                                :
                                                                                isDraftProject(project)
                                                                                    ?
                                                                                    "This offer is in draft phase."
                                                                                    :
                                                                                    "This offer has been published."
                                                                        }
                                                                    </Typography>
                                                                </FlexView>
                                                        }

                                                    </StepContent>
                                                </Step>

                                                {/** Move Pitch to Pledge step */}
                                                <Step
                                                    key={TEACHER_OFFER_STATES_MOVE_TO_PLEDGE}
                                                    disabled={
                                                        isProjectWaitingToGoLive(project)
                                                        || isProjectRejectedToGoLive(project)
                                                    }
                                                    completed={
                                                        isProjectSuccessful(project)
                                                        || isProjectFailed(project)
                                                        || isProjectInLivePledgePhase(project)
                                                        || isProjectWaitingForPledgeToBeCreated(project)
                                                        || isProjectWaitingForPledgeToBeChecked(project)
                                                    }
                                                >
                                                    <StepButton onClick={() => this.onTeacherOfferStatesStepClick(TEACHER_OFFER_STATES_MOVE_TO_PLEDGE)}>
                                                        {/*<StepLabel*/}
                                                        {/*    error={utils.isProjectRejectedToGoLive(project)}*/}
                                                        {/*>*/}
                                                        {/*    Move pitch to pledge phase*/}
                                                        {/*</StepLabel>*/}
                                                        <StepLabel error={utils.isProjectRejectedToGoLive(project)}>Make decision for expired pitch</StepLabel>
                                                    </StepButton>
                                                    <StepContent>
                                                        {
                                                            (isProjectInLivePitchPhase(project)
                                                                || isProjectPitchExpiredWaitingForTeacherToCheck(project))
                                                            && !isProjectWaitingForPledgeToBeCreated(project)
                                                            && !isProjectWaitingForPledgeToBeChecked(project)
                                                                ?
                                                                <FlexView
                                                                    column
                                                                >
                                                                    {
                                                                        !isProjectPitchExpiredWaitingForTeacherToCheck(project)
                                                                            ?
                                                                            null
                                                                            :
                                                                            <FlexView column width="100%" marginTop={20} marginBottom={20} className={css(styles.teacher_state_control_box)}>
                                                                                <Typography align="left" variant="body1" style={{marginBottom: 35}}>This pitch has expired. You can bring it back to live by updating the expiry date or close it.</Typography>

                                                                                <KeyboardDatePicker
                                                                                    autoOk
                                                                                    fullWidth
                                                                                    variant="dialog"
                                                                                    inputVariant="outlined"
                                                                                    label="Update expiry date for this pitch"
                                                                                    format="dd/MM/yyyy"
                                                                                    minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                                                                    value={changedPitchExpiryDate}
                                                                                    InputAdornmentProps={{position: "start"}}
                                                                                    onChange={this.onDateChanged}
                                                                                />

                                                                                <Button variant="contained" color="primary" className={css(sharedStyles.no_text_transform)}
                                                                                    disabled={
                                                                                        !changedPitchExpiryDate
                                                                                        || isNaN(changedPitchExpiryDate)
                                                                                        || changedPitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0)
                                                                                    }
                                                                                    style={{marginTop: 25}} onClick={this.bringPitchBackToLive}>Make pitch live again</Button>

                                                                                <FlexView column marginTop={100}>
                                                                                    <Button fullWidth color="secondary" className={css(sharedStyles.no_text_transform)} variant="contained" disabled={student.superTeacher} onClick={() => this.onMakeProjectGoToPledgePhaseDecision(false)}>Close pitch</Button>

                                                                                    <Typography align="center" variant="body2" style={{marginTop: 12}}>
                                                                                        <b>
                                                                                            <u>
                                                                                                Please do it carefully
                                                                                                as you cannot
                                                                                                reverse
                                                                                                your action.
                                                                                            </u>
                                                                                        </b>
                                                                                    </Typography>
                                                                                </FlexView>
                                                                            </FlexView>
                                                                    }

                                                                    {/*<FlexView*/}
                                                                    {/*    column*/}
                                                                    {/*    width="100%"*/}
                                                                    {/*    marginTop={20}*/}
                                                                    {/*    className={css(styles.teacher_state_control_box)}*/}
                                                                    {/*>*/}
                                                                    {/*    <Typography*/}
                                                                    {/*        align="left"*/}
                                                                    {/*        variant="body1"*/}
                                                                    {/*        paragraph*/}
                                                                    {/*    >*/}
                                                                    {/*        This offer is currently in the*/}
                                                                    {/*        pitch*/}
                                                                    {/*        phase. You can now move it to the pledge*/}
                                                                    {/*        phase.*/}
                                                                    {/*        The*/}
                                                                    {/*        teacher will be notified and prompted to*/}
                                                                    {/*        create*/}
                                                                    {/*        their*/}
                                                                    {/*        pledge page.*/}
                                                                    {/*    </Typography>*/}

                                                                    {/*    <Typography*/}
                                                                    {/*        align="left"*/}
                                                                    {/*        variant="body1"*/}
                                                                    {/*    >*/}
                                                                    {/*        <b>*/}
                                                                    {/*            <u>*/}
                                                                    {/*                Please do it carefully as you cannot*/}
                                                                    {/*                reverse*/}
                                                                    {/*                your action.*/}
                                                                    {/*            </u>*/}
                                                                    {/*        </b>*/}
                                                                    {/*    </Typography>*/}

                                                                    {/*    <Divider*/}
                                                                    {/*        style={{*/}
                                                                    {/*            marginTop: 30,*/}
                                                                    {/*            marginBottom: 30*/}
                                                                    {/*        }}*/}
                                                                    {/*    />*/}

                                                                    {/*    <FlexView>*/}
                                                                    {/*        <FlexView*/}
                                                                    {/*            grow*/}
                                                                    {/*            marginRight={10}*/}
                                                                    {/*        >*/}
                                                                    {/*            <Button*/}
                                                                    {/*                fullWidth*/}
                                                                    {/*                color="primary"*/}
                                                                    {/*                className={css(sharedStyles.no_text_transform)}*/}
                                                                    {/*                variant="outlined"*/}
                                                                    {/*                disabled={student.superTeacher}*/}
                                                                    {/*                onClick={() => this.onMakeProjectGoToPledgePhaseDecision(true)}*/}
                                                                    {/*            >*/}
                                                                    {/*                Move to pledge phase*/}
                                                                    {/*            </Button>*/}
                                                                    {/*        </FlexView>*/}
                                                                    {/*        <FlexView*/}
                                                                    {/*            grow*/}
                                                                    {/*            marginLeft={10}*/}
                                                                    {/*        >*/}
                                                                    {/*            <Button*/}
                                                                    {/*                fullWidth*/}
                                                                    {/*                color="secondary"*/}
                                                                    {/*                className={css(sharedStyles.no_text_transform)}*/}
                                                                    {/*                variant="outlined"*/}
                                                                    {/*                disabled={student.superTeacher}*/}
                                                                    {/*                onClick={() => this.onMakeProjectGoToPledgePhaseDecision(false)}*/}
                                                                    {/*            >*/}
                                                                    {/*                Close pitch*/}
                                                                    {/*            </Button>*/}
                                                                    {/*        </FlexView>*/}
                                                                    {/*    </FlexView>*/}

                                                                    {/*    {*/}
                                                                    {/*        !student.superTeacher*/}
                                                                    {/*            ?*/}
                                                                    {/*            null*/}
                                                                    {/*            :*/}
                                                                    {/*            <Typography*/}
                                                                    {/*                variant="body1"*/}
                                                                    {/*                color="error"*/}
                                                                    {/*                align="left"*/}
                                                                    {/*                style={{*/}
                                                                    {/*                    marginTop: 20*/}
                                                                    {/*                }}*/}
                                                                    {/*            >*/}
                                                                    {/*                Only course teacher can do this.*/}
                                                                    {/*            </Typography>*/}
                                                                    {/*    }*/}
                                                                    {/*</FlexView>*/}
                                                                </FlexView>
                                                                :
                                                                <FlexView column width="100%" marginTop={20}>
                                                                    <Typography
                                                                        color={
                                                                            utils.isProjectFailed(project)
                                                                                ?
                                                                                "secondary"
                                                                                :
                                                                                "primary"
                                                                        }
                                                                        align="left"
                                                                        variant="body1"
                                                                    >
                                                                        {
                                                                            utils.isProjectFailed(project)
                                                                                ?
                                                                                "This offer has been rejected."
                                                                                :
                                                                                project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
                                                                                    ?
                                                                                    project.hasOwnProperty('createdByCourseTeacher')
                                                                                    && project.createdByCourseTeacher
                                                                                    && (courseProperties && project.anid === courseProperties.anid)
                                                                                        ?
                                                                                        "You can create a pledge page for this offer now."
                                                                                        :
                                                                                        "The teacher has been prompted to create their pledge page. You will then be able to check the pledge before publishing."
                                                                                    :
                                                                                    "This offer has moved to the pledge phase."
                                                                        }
                                                                    </Typography>
                                                                    {
                                                                        project.hasOwnProperty('createdByCourseTeacher')
                                                                        && project.createdByCourseTeacher
                                                                        && (courseProperties && project.anid === courseProperties.anid)
                                                                        && project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
                                                                            ?
                                                                            <FlexView marginTop={20}>
                                                                                <Button color="primary" variant="outlined" size="medium"
                                                                                    className={css(sharedStyles.no_text_transform)}
                                                                                    onClick={() => {
                                                                                        createPledgeDialog_toggleDialog();
                                                                                        createPledgeDialog_setProject(project);
                                                                                        selectProjectVisibility_setProject(project);
                                                                                    }}>
                                                                                    Create pledge
                                                                                </Button>
                                                                            </FlexView>
                                                                            :
                                                                            null
                                                                    }
                                                                </FlexView>
                                                        }
                                                    </StepContent>
                                                </Step>

                                                {/*/!** Publish Pledge step *!/*/}
                                                {/*<Step*/}
                                                {/*    key={TEACHER_OFFER_STATES_PUBLISH_PLEDGE}*/}
                                                {/*    disabled={*/}
                                                {/*        isProjectWaitingToGoLive(project)*/}
                                                {/*        || isProjectRejectedToGoLive(project)*/}
                                                {/*        || isProjectInLivePitchPhase(project)*/}
                                                {/*        || isProjectPitchExpiredWaitingForTeacherToCheck(project)*/}
                                                {/*        || isProjectFailed(project)*/}
                                                {/*    }*/}
                                                {/*    completed={*/}
                                                {/*        isProjectFailed(project)*/}
                                                {/*        || isProjectSuccessful(project)*/}
                                                {/*        || isProjectInLivePledgePhase(project)*/}
                                                {/*    }*/}
                                                {/*>*/}
                                                {/*    <StepButton*/}
                                                {/*        onClick={() => this.onTeacherOfferStatesStepClick(TEACHER_OFFER_STATES_PUBLISH_PLEDGE)}*/}
                                                {/*    >*/}
                                                {/*        <StepLabel*/}
                                                {/*            error={*/}
                                                {/*                isProjectFailed(project)*/}
                                                {/*                || isProjectRejectedToGoLive(project)*/}
                                                {/*            }*/}
                                                {/*        >*/}
                                                {/*            Publish pledge*/}
                                                {/*        </StepLabel>*/}
                                                {/*    </StepButton>*/}
                                                {/*    <StepContent>*/}
                                                {/*        {*/}
                                                {/*            project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED*/}
                                                {/*                ?*/}
                                                {/*                <FlexView*/}
                                                {/*                    column*/}
                                                {/*                    width="100%"*/}
                                                {/*                    marginTop={20}*/}
                                                {/*                    className={css(styles.teacher_state_control_box)}*/}
                                                {/*                >*/}
                                                {/*                    <Typography*/}
                                                {/*                        align="left"*/}
                                                {/*                        variant="body1"*/}
                                                {/*                        paragraph*/}
                                                {/*                    >*/}
                                                {/*                        The teacher has now created their pledge page.*/}
                                                {/*                        Please*/}
                                                {/*                        check this carefully before publishing as you*/}
                                                {/*                        cannot*/}
                                                {/*                        reverse this action. You can also control who*/}
                                                {/*                        can see*/}
                                                {/*                        this pledge using the options below.*/}
                                                {/*                    </Typography>*/}

                                                {/*                    <Divider*/}
                                                {/*                        style={{*/}
                                                {/*                            marginTop: 25,*/}
                                                {/*                            marginBottom: 20*/}
                                                {/*                        }}*/}
                                                {/*                    />*/}

                                                {/*                    /!** Select project visibility before publishing pledge *!/*/}
                                                {/*                    <SelectPledgeVisibility/>*/}

                                                {/*                    <Divider*/}
                                                {/*                        style={{*/}
                                                {/*                            marginTop: 35,*/}
                                                {/*                            marginBottom: 25*/}
                                                {/*                        }}*/}
                                                {/*                    />*/}

                                                {/*                    <FlexView*/}
                                                {/*                        marginTop={20}*/}
                                                {/*                    >*/}
                                                {/*                        <FlexView*/}
                                                {/*                            grow*/}
                                                {/*                            marginRight={10}*/}
                                                {/*                        >*/}
                                                {/*                            <Button*/}
                                                {/*                                fullWidth*/}
                                                {/*                                color="primary"*/}
                                                {/*                                className={css(sharedStyles.no_text_transform)}*/}
                                                {/*                                variant="outlined"*/}
                                                {/*                                disabled={student.superTeacher}*/}
                                                {/*                                onClick={() => this.onMakeProjectPledgeGoLiveDecision({*/}
                                                {/*                                    decision: true,*/}
                                                {/*                                    projectVisibilitySetting*/}
                                                {/*                                })}*/}
                                                {/*                            >*/}
                                                {/*                                Publish pledge*/}
                                                {/*                            </Button>*/}
                                                {/*                        </FlexView>*/}
                                                {/*                        <FlexView*/}
                                                {/*                            grow*/}
                                                {/*                            marginLeft={10}*/}
                                                {/*                        >*/}
                                                {/*                            <Button*/}
                                                {/*                                fullWidth*/}
                                                {/*                                color="secondary"*/}
                                                {/*                                className={css(sharedStyles.no_text_transform)}*/}
                                                {/*                                variant="outlined"*/}
                                                {/*                                disabled={student.superTeacher}*/}
                                                {/*                                onClick={() => this.onMakeProjectPledgeGoLiveDecision({decision: false})}*/}
                                                {/*                            >*/}
                                                {/*                                Close pledge*/}
                                                {/*                            </Button>*/}
                                                {/*                        </FlexView>*/}
                                                {/*                    </FlexView>*/}

                                                {/*                    {*/}
                                                {/*                        !student.superTeacher*/}
                                                {/*                            ?*/}
                                                {/*                            null*/}
                                                {/*                            :*/}
                                                {/*                            <Typography*/}
                                                {/*                                variant="body1"*/}
                                                {/*                                color="error"*/}
                                                {/*                                align="left"*/}
                                                {/*                                style={{*/}
                                                {/*                                    marginTop: 20*/}
                                                {/*                                }}*/}
                                                {/*                            >*/}
                                                {/*                                Only course teacher can do this.*/}
                                                {/*                            </Typography>*/}
                                                {/*                    }*/}
                                                {/*                </FlexView>*/}
                                                {/*                :*/}
                                                {/*                <FlexView*/}
                                                {/*                    column*/}
                                                {/*                    width="100%"*/}
                                                {/*                    marginTop={20}*/}
                                                {/*                >*/}
                                                {/*                    <Typography*/}
                                                {/*                        color={*/}
                                                {/*                            isProjectFailed(project)*/}
                                                {/*                                ?*/}
                                                {/*                                "secondary"*/}
                                                {/*                                :*/}
                                                {/*                                "primary"*/}
                                                {/*                        }*/}
                                                {/*                        align="left"*/}
                                                {/*                        variant="body1"*/}
                                                {/*                    >*/}
                                                {/*                        {*/}
                                                {/*                            isProjectFailed(project)*/}
                                                {/*                                ?*/}
                                                {/*                                "This offer has been rejected."*/}
                                                {/*                                :*/}
                                                {/*                                "This offer has been published."*/}
                                                {/*                        }*/}
                                                {/*                    </Typography>*/}
                                                {/*                </FlexView>*/}
                                                {/*        }*/}
                                                {/*    </StepContent>*/}
                                                {/*</Step>*/}
                                            </Stepper>
                                        </Col>

                                        <Col xs={{span: 12, order: 0}} sm={{span: 12, order: 0}} md={{span: 4, order: 1}} lg={{span: 4, order: 1}}>
                                            {
                                                !isProjectLive(project)
                                                    ?
                                                    null
                                                    :
                                                    <FlexView column marginTop={30}>
                                                        <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}
                                                            onClick={() => realtimeDBUtils.toggleProjectLivelinessTemporarily(student, JSON.parse(JSON.stringify(project)))}
                                                            disabled={
                                                                student.type !== DB_CONST.TYPE_PROF
                                                                || (
                                                                    student.type === DB_CONST.TYPE_PROF
                                                                    && student.anid !== project.anid
                                                                )
                                                            }
                                                        >
                                                            {
                                                                isProjectTemporarilyClosed(project)
                                                                    ?
                                                                    "Open again"
                                                                    :
                                                                    "Close temporarily"
                                                            }
                                                        </Button>
                                                        {
                                                            !student.superTeacher
                                                                ?
                                                                null
                                                                :
                                                                <Typography variant="body2" align="left" color="error" style={{marginTop: 12}}>Only course teachers can do this.</Typography>
                                                        }
                                                        <Typography variant="body2" align="left" style={{marginTop: 15}}>
                                                            {
                                                                isProjectTemporarilyClosed(project)
                                                                    ?
                                                                    "This offer will be opened again."
                                                                    :
                                                                    "This offer will be closed temporarily and it will no longer be visible to any investors until you open it again."
                                                            }
                                                        </Typography>
                                                    </FlexView>
                                            }
                                        </Col>
                                    </Row>
                                </FlexView>
                            </Col>
                    }

                    {/** Main presentation (Campaign) */}
                    {
                        mainBody !== MAIN_BODY_CAMPAIGN
                            ?
                            null
                            :
                            this.shouldHideInformation()
                                ?
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                                    {
                                        student.type === DB_CONST.TYPE_PROF
                                            ?
                                            <FlexView column marginTop={30} hAlignContent="center">
                                                <Typography align="center" variant="h5">Restricted to {project.course.displayName} members.
                                                </Typography>
                                            </FlexView>
                                            :
                                            <FlexView column marginTop={30}>
                                                <Typography align="left" variant="h5">Restricted to {project.course.displayName} members.
                                                </Typography>
                                                <NavLink
                                                    to={
                                                        courseStudent
                                                            ?
                                                            ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", project.course.courseStudent)
                                                            :
                                                            ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", project.course.courseStudent)
                                                    }
                                                    style={{marginTop: 10}}>
                                                    <Typography variant="body1"> Request access</Typography>
                                                </NavLink>
                                            </FlexView>
                                    }
                                </Col>
                                :
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>

                                    {
                                        // pitch deck
                                        !project.Pitch.presentationDocument
                                            ?
                                            null
                                            :
                                            <FlexView column marginTop={30}>
                                                <Typography variant="h5">Pitch deck</Typography>
                                                <DocumentsDownload documents={project.Pitch.presentationDocument} shouldShowRiskWarningOnDownload={true}/>
                                                <Divider style={{marginTop: 10}}/>
                                            </FlexView>
                                    }

                                    {
                                        // pitch presentation text
                                        !project.Pitch.presentationText
                                            ?
                                            null
                                            :
                                            <FlexView column dangerouslySetInnerHTML={{__html: utils.convertQuillDeltaToHTML(project.Pitch.presentationText.ops)}} marginTop={30}/>
                                    }
                                </Col>
                    }

                    {/*/!** Investors pledged (only available when the primary offer expired and there are investors pledging the offer) *!/*/}
                    {/*{*/}
                    {/*    mainBody !== MAIN_BODY_INVESTORS_PLEDGED*/}
                    {/*        ?*/}
                    {/*        null*/}
                    {/*        :*/}
                    {/*        <Col*/}
                    {/*            xs={12}*/}
                    {/*            sm={12}*/}
                    {/*            md={12}*/}
                    {/*            lg={{span: 6, offset: 3}}*/}
                    {/*        >*/}
                    {/*            <FlexView*/}
                    {/*                column*/}
                    {/*                marginTop={30}*/}
                    {/*            >*/}
                    {/*                <Typography*/}
                    {/*                    variant="h5"*/}
                    {/*                    align="left"*/}
                    {/*                    paragraph*/}
                    {/*                >*/}
                    {/*                    Pledges from investors*/}
                    {/*                </Typography>*/}

                    {/*                /!** Pledges table *!/*/}
                    {/*                <PledgesTable/>*/}
                    {/*            </FlexView>*/}
                    {/*        </Col>*/}
                    {/*}*/}

                    {/** Comments */}
                    {
                        mainBody !== MAIN_BODY_COMMENTS
                            ?
                            null
                            :
                            this.shouldHideInformation()
                                ?
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                                    {
                                        student.type === DB_CONST.TYPE_PROF
                                            ?
                                            <FlexView column marginTop={30} hAlignContent="center">
                                                <Typography align="center" variant="h5">Restricted to {project.course.displayName} members.
                                                </Typography>
                                            </FlexView>
                                            :
                                            <FlexView column marginTop={30}>
                                                <Typography align="left" variant="h5">Restricted to {project.course.displayName} members.
                                                </Typography>
                                                <NavLink
                                                    to={
                                                        courseStudent
                                                            ?
                                                            ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", project.course.courseStudent)
                                                            :
                                                            ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", project.course.courseStudent)
                                                    }
                                                    style={{marginTop: 10}}>
                                                    <Typography variant="body1">Request access</Typography>
                                                </NavLink>
                                            </FlexView>
                                    }
                                </Col>
                                :
                                <Col xs={12} sm={12} md={12} lg={{span: 8, offset: 2}}>
                                    <Row>
                                        <Col xs={{span: 12, order: 2}} sm={{span: 12, order: 2}} md={{span: 8, order: 1}} lg={{span: 8, order: 1}} style={{marginTop: 40}}>
                                            {
                                                student.type === DB_CONST.TYPE_INVESTOR
                                                    ?
                                                    null
                                                    :
                                                    <Typography align="center" style={{padding: 15, backgroundColor: colors.kick_starter_background_color_1, marginBottom: 30}} variant="body2" color="inherit">Only investors can post comments.</Typography>
                                            }

                                            {
                                                !commentsLoaded
                                                    ?
                                                    // comments not loaded yet --> load them and wait for them to be loaded
                                                    <FlexView marginTop={30} hAlignContent="center" width="100%">
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
                                                    :
                                                    (
                                                        sortedComments.length > 0
                                                            ?
                                                            (
                                                                <FlexView className={css(styles.border_box)} style={{padding: 15, backgroundColor: colors.kick_starter_background_color}} column>
                                                                    {
                                                                        sortedComments.map(comment => (
                                                                            (
                                                                                // if the comment is from the current student
                                                                                comment.commentedBy === student.id
                                                                                    ?
                                                                                    <FlexView key={comment.id} column marginTop={12} marginBottom={12} className={css(styles.border_box)} style={{backgroundColor: colors.white, width: "100%"}}>
                                                                                        <Typography style={{marginTop: 15, marginBottom: 10}} variant="body1" className={css(styles.gray_text)} align="left">Update your comment</Typography>
                                                                                        <InputBase name="currentCommentText" onChange={this.onTextChanged} value={currentCommentText} fullWidth rows={5} multiline className={css(styles.border_box)}/>
                                                                                        <FlexView marginTop={25} width="100%" hAlignContent="right">
                                                                                            <Button size="small" color="default" variant="text" onClick={this.onCancelUpdateCurrentComment}>Cancel</Button>
                                                                                            <Button style={{marginLeft: 15}} size="small" color="inherit" variant="outlined" disabled={(currentComment && currentComment.comment === currentCommentText) || currentCommentText.trim().length === 0} onClick={this.onSubmitUpdateCurrentComment}>Update</Button>
                                                                                        </FlexView>

                                                                                        {/** Replies */}
                                                                                        {
                                                                                            comment.replies.map(reply => (
                                                                                                <FlexView key={reply.id} height="100%" width="100%" marginLeft={24} marginTop={35}>
                                                                                                    <Divider style={{backgroundColor: styles.gray_text, height: "auto", width: 6}}/>
                                                                                                    <FlexView column marginLeft={10} marginRight={24} width="100%">
                                                                                                        {/** Date */}
                                                                                                        <Typography variant="body2" className={css(styles.gray_text)} align="left">
                                                                                                            {
                                                                                                                reply.status === DB_CONST.COMMENT_REPLY_STATUS_POSTED
                                                                                                                    ?
                                                                                                                    `Posted: ${utils.dateTimeInReadableFormat(reply.repliedDate)}`
                                                                                                                    :
                                                                                                                    `Edited: ${utils.dateTimeInReadableFormat(reply.repliedDate)}`
                                                                                                            }
                                                                                                        </Typography>

                                                                                                        {/** Reply author */}
                                                                                                        <NavLink
                                                                                                            to={
                                                                                                                reply.author.type === DB_CONST.TYPE_PROF
                                                                                                                    ?
                                                                                                                    courseStudent
                                                                                                                        ?
                                                                                                                        ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", reply.author.anid)
                                                                                                                        :
                                                                                                                        ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", reply.author.anid)
                                                                                                                    :
                                                                                                                    courseStudent
                                                                                                                        ?
                                                                                                                        ROUTES.STUDENT_PROFILE
                                                                                                                            .replace(":courseStudent", courseStudent)
                                                                                                                            .replace(":studentID", reply.author.id)
                                                                                                                        :
                                                                                                                        ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER
                                                                                                                            .replace(":studentID", reply.author.id)
                                                                                                            }
                                                                                                        >
                                                                                                            <Typography variant="body2" color="textSecondary" align="left">
                                                                                                                {
                                                                                                                    reply.author.type === DB_CONST.TYPE_PROF
                                                                                                                        ?
                                                                                                                        student.type === DB_CONST.TYPE_PROF
                                                                                                                        && student.superTeacher
                                                                                                                            ?
                                                                                                                            `by course teacher - ${reply.author.email}`
                                                                                                                            :
                                                                                                                            "by course teacher"
                                                                                                                        :
                                                                                                                        `by ${reply.author.firstName} ${reply.author.lastName}`
                                                                                                                }
                                                                                                            </Typography>
                                                                                                        </NavLink>

                                                                                                        {/** Reply text */}
                                                                                                        <Typography variant="body2" align="left" style={{marginTop: 12}}>{reply.text}</Typography>
                                                                                                    </FlexView>
                                                                                                </FlexView>
                                                                                            ))
                                                                                        }
                                                                                    </FlexView>
                                                                                    :
                                                                                    <FlexView key={comment.id} className={css(styles.border_box)} style={{backgroundColor: colors.white}} column marginTop={12} marginBottom={12}>
                                                                                        {/** Date */}
                                                                                        <Typography variant="body2" className={css(styles.gray_text)} align="left">
                                                                                            {
                                                                                                comment.status === DB_CONST.COMMENT_STATUS_POSTED
                                                                                                    ?
                                                                                                    `Posted: ${utils.dateTimeInReadableFormat(comment.commentedDate)}`
                                                                                                    :
                                                                                                    `Edited: ${utils.dateTimeInReadableFormat(comment.commentedDate)}`
                                                                                            }
                                                                                        </Typography>

                                                                                        {/** Comment author */}
                                                                                        {
                                                                                            student.type === DB_CONST.TYPE_PROF
                                                                                            && student.superTeacher
                                                                                                ?
                                                                                                <NavLink
                                                                                                    to={
                                                                                                        courseStudent
                                                                                                            ?
                                                                                                            ROUTES.STUDENT_PROFILE
                                                                                                                .replace(":courseStudent", courseStudent)
                                                                                                                .replace(":studentID", comment.author.id)
                                                                                                            :
                                                                                                            ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER
                                                                                                                .replace(":studentID", comment.author.id)
                                                                                                    }
                                                                                                >
                                                                                                    <Typography variant="body2" color="textSecondary" align="left">by {comment.author.firstName} {comment.author.lastName}</Typography>
                                                                                                </NavLink>
                                                                                                :
                                                                                                null
                                                                                        }

                                                                                        {/** Comment text */}
                                                                                        <Typography style={{marginTop: 12}} variant="body1" align="left">{comment.comment}</Typography>

                                                                                        {/** Reply button */}
                                                                                        {
                                                                                            (student.type === DB_CONST.TYPE_TEACHER
                                                                                                && student.id === projectTeacher.id)
                                                                                            || (
                                                                                                student.type === DB_CONST.TYPE_PROF
                                                                                                && project.hasOwnProperty('createdByCourseTeacher')
                                                                                                && student.anid === project.anid
                                                                                            )
                                                                                                ?
                                                                                                <FlexView marginTop={25}>
                                                                                                    <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)}
                                                                                                        disabled={
                                                                                                            replyingToComment !== null
                                                                                                            && replyingToComment.id === comment.id
                                                                                                            && replyEdited === null
                                                                                                        }
                                                                                                        onClick={() => this.onToggleReplyToComment(comment, null)}
                                                                                                    >Reply</Button>
                                                                                                </FlexView>
                                                                                                :
                                                                                                null
                                                                                        }

                                                                                        {/** Reply input area */}
                                                                                        {
                                                                                            replyingToComment !== null
                                                                                            && replyingToComment.id === comment.id
                                                                                            && replyEdited === null
                                                                                                ?
                                                                                                <CommentReplyInputArea replyText={replyText} replyEdited={replyEdited} onToggleReplyToComment={this.onToggleReplyToComment} onSubmitCommentReply={this.onSubmitCommentReply} onTextChanged={this.onTextChanged}/>
                                                                                                :
                                                                                                null
                                                                                        }

                                                                                        {/** Replies */}
                                                                                        {
                                                                                            comment.replies.map(reply => (
                                                                                                <FlexView key={reply.id} height="100%" width="100%" marginLeft={24} marginTop={35}>
                                                                                                    <Divider style={{backgroundColor: styles.gray_text, height: "auto", width: 6}}/>
                                                                                                    <FlexView column marginLeft={10} marginRight={24} width="100%">
                                                                                                        {/** Date */}
                                                                                                        <Typography variant="body2" className={css(styles.gray_text)} align="left">
                                                                                                            {
                                                                                                                reply.status === DB_CONST.COMMENT_REPLY_STATUS_POSTED
                                                                                                                    ?
                                                                                                                    `Posted: ${utils.dateTimeInReadableFormat(reply.repliedDate)}`
                                                                                                                    :
                                                                                                                    `Edited: ${utils.dateTimeInReadableFormat(reply.repliedDate)}`
                                                                                                            }
                                                                                                        </Typography>

                                                                                                        {/** Reply author */}
                                                                                                        <NavLink
                                                                                                            to={
                                                                                                                reply.author.type === DB_CONST.TYPE_PROF
                                                                                                                    ?
                                                                                                                    courseStudent
                                                                                                                        ?
                                                                                                                        ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", reply.author.anid)
                                                                                                                        :
                                                                                                                        ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", reply.author.anid)
                                                                                                                    :
                                                                                                                    courseStudent
                                                                                                                        ?
                                                                                                                        ROUTES.STUDENT_PROFILE
                                                                                                                            .replace(":courseStudent", courseStudent)
                                                                                                                            .replace(":studentID", reply.author.id)
                                                                                                                        :
                                                                                                                        ROUTES.STUDENT_PROFILE_INVEST_WEST_SUPER
                                                                                                                            .replace(":studentID", reply.author.id)
                                                                                                            }
                                                                                                        >
                                                                                                            <Typography variant="body2" color="textSecondary" align="left">
                                                                                                                {
                                                                                                                    reply.author.type === DB_CONST.TYPE_PROF
                                                                                                                        ?
                                                                                                                        student.type === DB_CONST.TYPE_PROF
                                                                                                                        && student.superTeacher
                                                                                                                            ?
                                                                                                                            `by course teacher - ${reply.author.email}`
                                                                                                                            :
                                                                                                                            "by course teacher"
                                                                                                                        :
                                                                                                                        `by ${reply.author.firstName} ${reply.author.lastName}`
                                                                                                                }
                                                                                                            </Typography>
                                                                                                        </NavLink>

                                                                                                        {/** Reply text */}
                                                                                                        <Typography variant="body2" align="left" style={{marginTop: 12}}>
                                                                                                            {reply.text}
                                                                                                        </Typography>

                                                                                                        {/** Delete/edit a reply */}
                                                                                                        {
                                                                                                            // allow course teachers that created this project,
                                                                                                            // and teacher that created this project and owns this reply
                                                                                                            // to edit/delete this reply
                                                                                                            (
                                                                                                                student.type === DB_CONST.TYPE_TEACHER
                                                                                                                || (student.type === DB_CONST.TYPE_PROF && !student.superTeacher)
                                                                                                            )
                                                                                                            && student.id === projectTeacher.id
                                                                                                            && student.id === reply.repliedBy
                                                                                                                ?
                                                                                                                <FlexView marginTop={16}>
                                                                                                                    <Button variant="outlined" className={css(sharedStyles.no_text_transform)} size="small" color="secondary" onClick={() => this.onDeleteCommentReply(reply)} style={{marginRight: 10}}>Delete<DeleteIcon fontSize="small" style={{marginLeft: 6}}/>
                                                                                                                    </Button>
                                                                                                                    <Button variant="outlined" className={css(sharedStyles.no_text_transform)} size="small" color="primary" onClick={() => this.onToggleReplyToComment(comment, reply)}>Edit<EditIcon fontSize="small" style={{marginLeft: 6}}/></Button>
                                                                                                                </FlexView>
                                                                                                                :
                                                                                                                null
                                                                                                        }

                                                                                                        {/** Reply input area to edit a reply */}
                                                                                                        {
                                                                                                            replyingToComment !== null
                                                                                                            && replyingToComment.id === comment.id
                                                                                                            && replyEdited !== null
                                                                                                            && replyEdited.id === reply.id
                                                                                                                ?
                                                                                                                <CommentReplyInputArea replyText={replyText} replyEdited={replyEdited} onToggleReplyToComment={this.onToggleReplyToComment} onSubmitCommentReply={this.onSubmitCommentReply} onTextChanged={this.onTextChanged}/>
                                                                                                                :
                                                                                                                null
                                                                                                        }
                                                                                                    </FlexView>
                                                                                                </FlexView>
                                                                                            ))
                                                                                        }
                                                                                    </FlexView>
                                                                            )
                                                                        ))
                                                                    }
                                                                </FlexView>
                                                            )
                                                            :
                                                            student.type !== DB_CONST.TYPE_INVESTOR
                                                                ?
                                                                <FlexView hAlignContent="center" vAlignContent="center" column style={{padding: 30, backgroundColor: colors.kick_starter_background_color}}>
                                                                    <Typography variant="body2">No comments yet</Typography>
                                                                </FlexView>
                                                                :
                                                                <FlexView hAlignContent="center" vAlignContent="center" column style={{padding: 30, backgroundColor: colors.kick_starter_background_color}}>
                                                                    <Typography variant="body2">No comments yet</Typography>
                                                                    <FlexView marginTop={25} column hAlignContent="center">
                                                                        <div>
                                                                            <Button size="small" onClick={this.onPostACommentClick} variant="outlined" color="inherit" fullWidth={false}
                                                                                disabled={
                                                                                    utils.isProjectLive(project)
                                                                                    && student.type === DB_CONST.TYPE_INVESTOR
                                                                                    && !investorSelfCertificationAgreement
                                                                                }
                                                                            >Post a comment</Button>
                                                                        </div>

                                                                        {
                                                                            this.renderInvestorSelfCertifyReminder()
                                                                        }
                                                                    </FlexView>
                                                                </FlexView>
                                                    )
                                            }
                                        </Col>

                                        <Col xs={{span: 12, order: 1}} sm={{span: 12, order: 1}} md={{span: 4, order: 2}} lg={{span: 4, order: 2}} style={{marginTop: 40}}>

                                            {
                                                student.type === DB_CONST.TYPE_INVESTOR
                                                    ?
                                                    (
                                                        comments.filter(comment => comment.commentedBy === student.id).length === 0
                                                            ?
                                                            <FlexView column>
                                                                <Typography variant="subtitle1" align="left" style={{marginBottom: 25}}>This is your space to offer support and feedback to the teacher. Your identity will not be shared.</Typography>

                                                                {/** Post a comment - right hand side column - displayed only if there is at least one comment */}
                                                                {
                                                                    commentsLoaded && comments.length > 0
                                                                        ?
                                                                        <div>
                                                                            <Button size="small" onClick={this.onPostACommentClick} variant="outlined" color="inherit"fullWidth={false}
                                                                                disabled={
                                                                                    utils.isProjectLive(project)
                                                                                    && student.type === DB_CONST.TYPE_INVESTOR
                                                                                    && !investorSelfCertificationAgreement
                                                                                }
                                                                            >Post a comment</Button>
                                                                        </div>
                                                                        :
                                                                        null
                                                                }

                                                                {/** Check investor's self certification status - right hand side column - displayed only if there is at least one comment */}
                                                                {
                                                                    commentsLoaded && comments.length > 0
                                                                        ?
                                                                        this.renderInvestorSelfCertifyReminder()
                                                                        :
                                                                        null
                                                                }
                                                            </FlexView>
                                                            :
                                                            <Typography variant="subtitle1" align="left">You have already commented on this investment opportunity. You can only edit your comment.</Typography>
                                                    )
                                                    :
                                                    <Typography variant="subtitle1" align="left">All the comments from investors are displayed anonymously here.</Typography>
                                            }

                                        </Col>
                                    </Row>
                                </Col>
                    }

                    {/** Documents */}
                    {
                        mainBody !== MAIN_BODY_DOCUMENTS
                            ?
                            null
                            :
                            this.shouldHideInformation()
                                ?
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                                    {
                                        student.type === DB_CONST.TYPE_PROF
                                            ?
                                            <FlexView column marginTop={30} hAlignContent="center">
                                                <Typography align="center" variant="h5">Restricted to {project.course.displayName} members.</Typography>
                                            </FlexView>
                                            :
                                            <FlexView column marginTop={30}>
                                                <Typography align="left" variant="h5">Restricted to {project.course.displayName} members.</Typography>
                                                <NavLink
                                                    to={
                                                        courseStudent
                                                            ?
                                                            ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", project.course.courseStudent)
                                                            :
                                                            ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", project.course.courseStudent)
                                                    }
                                                    style={{marginTop: 10}}>
                                                    <Typography variant="body1">Request access</Typography>
                                                </NavLink>
                                            </FlexView>
                                    }
                                </Col>
                                :
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                    <Typography variant="h5" color="inherit">Supporting documents</Typography>

                                    {
                                        project.Pitch.supportingDocuments && project.Pitch.supportingDocuments.findIndex(document => !document.hasOwnProperty('removed')) !== -1
                                            ?
                                            <DocumentsDownload documents={project.Pitch.supportingDocuments} shouldShowRiskWarningOnDownload={true}/>
                                            :
                                            <Typography variant="body1" color="textSecondary" style={{marginTop: 35}}>No supporting documents uploaded.</Typography>
                                    }
                                </Col>
                    }

                    {/** Notes */}
                    {
                        mainBody !== MAIN_BODY_NOTES
                            ?
                            null
                            :
                            this.shouldHideInformation()
                                ?
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                                    {
                                        student.type === DB_CONST.TYPE_PROF
                                            ?
                                            <FlexView column marginTop={30} hAlignContent="center">
                                                <Typography align="center" variant="h5">Restricted to {project.course.displayName} members.</Typography>
                                            </FlexView>
                                            :
                                            <FlexView column marginTop={30}>
                                                <Typography align="left" variant="h5">Restricted to {project.course.displayName} members.
                                                </Typography>
                                                <NavLink
                                                    to={
                                                        courseStudent
                                                            ?
                                                            ROUTES.VIEW_COURSE_DETAILS.replace(":courseStudent", courseStudent).replace(":courseID", project.course.courseStudent)
                                                            :
                                                            ROUTES.VIEW_COURSE_DETAILS_INVEST_WEST_SUPER.replace(":courseID", project.course.courseStudent)
                                                    }
                                                    style={{marginTop: 10}}>
                                                    <Typography variant="body1">Request access</Typography>
                                                </NavLink>
                                            </FlexView>
                                    }
                                </Col>
                                :
                                <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                    <Typography variant="h5" color="inherit">Extra information</Typography>

                                    {/** Financial round */}
                                    {
                                        !project.Pitch.hasOwnProperty('financialRound')
                                            ?
                                            null
                                            :
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Financial round the company is looking for:&nbsp;&nbsp;
                                                    <b>
                                                        {project.Pitch.financialRound}
                                                    </b>
                                                </Typography>
                                            </FlexView>
                                    }

                                    {/** Prior investment */}
                                    <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={40} vAlignContent="center">
                                        <Typography variant="body1" align="left">Prior investment raised:&nbsp;&nbsp;<b>
                                                {
                                                    project.Pitch.amountRaised === 0
                                                        ?
                                                        "none"
                                                        :
                                                        `£${Number(project.Pitch.amountRaised.toFixed(2)).toLocaleString()}`
                                                }
                                            </b>
                                        </Typography>

                                        {/*{*/}
                                        {/*    project.Pitch.amountRaised === 0*/}
                                        {/*        ?*/}
                                        {/*        null*/}
                                        {/*        :*/}
                                        {/*        <Typography*/}
                                        {/*            style={{marginTop: 30}}*/}
                                        {/*            variant="body1"*/}
                                        {/*            align="left"*/}
                                        {/*        >*/}
                                        {/*            Investors publicly committed:*/}
                                        {/*            {*/}
                                        {/*                !project.Pitch.investorsCommitted*/}
                                        {/*                    ?*/}
                                        {/*                    <b>&nbsp;&nbsp; Not provided.</b>*/}
                                        {/*                    :*/}
                                        {/*                    <b>&nbsp;&nbsp; {project.Pitch.investorsCommitted}</b>*/}
                                        {/*            }*/}
                                        {/*        </Typography>*/}
                                        {/*}*/}
                                    </FlexView>

                                    {/** How fund is being raised */}
                                    {
                                        !project.Pitch.hasOwnProperty('howFundIsBeingRaised')
                                            ?
                                            null
                                            :
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">How does the company plan to raise funds:  {project.Pitch.howFundIsBeingRaised}</Typography>
                                            </FlexView>
                                    }

                                   
                                        
                                            
                                    {
                                        project.Pitch.hasSEIS === "Yes"
                                            ?
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Does this pitch have a SEIS badge: <b> {project.Pitch.hasSEIS}</b></Typography>
                                            </FlexView>
                                            :
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Does this pitch have a SEIS badge: <b> No </b></Typography>
                                            </FlexView>
                                    }
                                            
                                    

                                    
                                    {
                                        project.Pitch.hasEIS === "Yes"
                                            ?
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Does this pitch have a EIS badge: <b> {project.Pitch.hasEIS}</b></Typography>
                                            </FlexView>
                                            :
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Does this pitch have a EIS badge: <b> No </b></Typography>
                                            </FlexView>

                                    }
                                    

                                    
                                    

                                    {/** Details about earlier fundraising rounds */}
                                    {
                                        !project.Pitch.hasOwnProperty('detailsAboutEarlierFundraisingRounds')
                                            ?
                                            null
                                            :
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Details about earlier fundraising rounds:<br/><br/> {project.Pitch.detailsAboutEarlierFundraisingRounds}</Typography>
                                            </FlexView>
                                    }

                                    {/** QIB - special news */}
                                    {
                                        project.Pitch.hasOwnProperty('qibSpecialNews')
                                        && (
                                            (
                                                (
                                                    courseProperties
                                                    && courseProperties.courseStudent === "qib"
                                                )
                                                && (
                                                    (student.type === DB_CONST.TYPE_PROF
                                                        && student.anid === courseProperties.anid)
                                                    || (student.type === DB_CONST.TYPE_TEACHER
                                                        && student.id === project.teacherID)
                                                )
                                            )
                                            ||
                                            (
                                                !courseProperties
                                                && student.type === DB_CONST.TYPE_PROF
                                                && student.superTeacher
                                            )
                                        )
                                            ?
                                            <FlexView className={css(styles.border_box)} style={{backgroundColor: colors.kick_starter_background_color}} column marginTop={30} vAlignContent="center">
                                                <Typography variant="body1" align="left">Special news that Briony should talk about:
                                                    <br/><br/>
                                                    {project.Pitch.qibSpecialNews}
                                                </Typography>
                                            </FlexView>
                                            :
                                            null
                                    }
                                </Col>
                    }
                </Row>

                {/** Risk warning footer */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={12} lg={{span: 6, offset: 3}}>
                        <RiskWarning/>
                    </Col>
                </Row>
            </Container>
        );
    };

    /**
     * Prevent the investors from interacting with the offer if they have not self-certified
     *
     * @returns {*}
     */
    renderInvestorSelfCertifyReminder = () => {
        const {
            courseStudent,
            student,
            investorSelfCertificationAgreement,
            project
        } = this.props;

        if (student.type !== DB_CONST.TYPE_INVESTOR) {
            return null;
        }

        return (
            utils.isProjectLive(project)
            && !investorSelfCertificationAgreement
                ?
                <FlexView column marginTop={20}>
                    <Typography align="left" variant="body2" color="textSecondary">You cannot interact with this offer as you have not completed your self certification.</Typography>
                    <NavLink
                        to={
                            courseStudent
                                ?
                                `${ROUTES.DASHBOARD_INVESTOR.replace(":courseStudent", courseStudent)}?tab=Profile`
                                :
                                `${ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Profile`
                        }
                        style={{
                            marginTop: 4
                        }}
                    >
                        <Typography variant="body2"><u>Self certify</u></Typography>
                    </NavLink>
                </FlexView>
                :
                null
        );
    }

    render() {
        return (
            <Container fluid style={{padding: 0}}>
                {
                    this.renderPageContent()
                }
            </Container>
        );
    }

    /**
     * Function to decide if information should be hidden or not
     */
    shouldHideInformation = () => {
        const {
            project,
            student,
            coursesStudentIsIn
        } = this.props;

        // student is an teacher
        if (student.type === DB_CONST.TYPE_PROF) {
            // student is a super teacher
            if (student.superTeacher) {
                return false;
            }

            // student is a course teacher and is the course that owns the project
            if (student.anid === project.anid) {
                return false;
            }

            // other course teachers must go through the checks of project's visibility
            switch (project.visibility) {
                case DB_CONST.PROJECT_VISIBILITY_PUBLIC:
                    return false;
                case DB_CONST.PROJECT_VISIBILITY_RESTRICTED:
                    return true;
                case DB_CONST.PROJECT_VISIBILITY_PRIVATE:
                    return true;
                default:
                    return true;
            }
        }
        // student is not an teacher
        else {
            // should not hide any information if the student is an teacher that created this offer
            if (student.type === DB_CONST.TYPE_TEACHER && student.id === project.teacherID) {
                return false;
            }

            // if somehow coursesStudentIsIn is null, information must be hidden
            if (!coursesStudentIsIn) {
                return true;
            }

            // if the project is not a restricted one, should not hide any information
            if (project.visibility !== DB_CONST.PROJECT_VISIBILITY_RESTRICTED) {
                return false;
            }

            // student is not the member of the course that posted this offer --> hide information
            // otherwise, should not hide information
            return coursesStudentIsIn.findIndex(course => course.anid === project.anid) === -1;
        }
    };

    /**
     * Render the status for this project
     */
    renderProjectStatus = () => {
        const {
            project
        } = this.props;

        let stt = {text: '', color: ''};

        if (utils.isProjectWaitingToGoLive(project)
            || utils.isProjectRejectedToGoLive(project)
            || utils.isProjectSuccessful(project)
            || utils.isProjectFailed(project)
        ) {
            return (
                <FlexView marginTop={30} marginBottom={30}>
                    <Typography variant="body1" color="error" align="left">
                        {
                            utils.isProjectWaitingToGoLive(project)
                                ?
                                "Offer is being checked."
                                :
                                utils.isProjectRejectedToGoLive(project)
                                    ?
                                    "Offer has been rejected."
                                    :
                                    "Offer closed."
                        }
                    </Typography>
                </FlexView>
            );
        }

        if (project.PrimaryOffer) {
            switch (project.PrimaryOffer.status) {
                case DB_CONST.PRIMARY_OFFER_STATUS_ON_GOING:
                    return (
                        <FlexView column marginTop={30} marginBottom={30}>
                            <Typography variant="body2" color="primary" align="left">Offer is in pledge phase</Typography>
                            <Typography variant="h5" color="textPrimary" align="left">{utils.dateDiff(project.PrimaryOffer.expiredDate)}</Typography>
                            <Typography variant="body2" color="textSecondary" align="left">days remaining</Typography>
                        </FlexView>
                    );
                case DB_CONST.PRIMARY_OFFER_STATUS_EXPIRED:
                    stt.text = "Pledge has expired.";
                    stt.color = "primary";
                    break;
                default:
                    break;
            }
        } else {
            switch (project.Pitch.status) {
                case DB_CONST.PITCH_STATUS_ON_GOING:
                    return (
                        <FlexView column marginTop={30} marginBottom={30}>
                            <Typography variant="body2" color="primary" align="left">Offer is in pitch phase
                            </Typography>
                            <Typography variant="h5" color="textPrimary" align="left">{utils.dateDiff(project.Pitch.expiredDate)}</Typography>
                            <Typography variant="body2" color="textSecondary" align="left"
                            >days remaining</Typography>
                        </FlexView>
                    );
                case DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER:
                    stt.text = "Awaiting pledge page to be created.";
                    stt.color = "textSecondary";
                    break;
                case DB_CONST.PITCH_STATUS_REJECTED:
                    stt.text = "Offer failed as its pitch was rejected.";
                    stt.color = "error";
                    break;
                case DB_CONST.PITCH_STATUS_WAITING_FOR_TEACHER:
                    stt.text = "Pitch expired. Awaiting Course Teacher review.";
                    stt.color = "textSecondary";
                    break;
                default:
                    break;
            }
        }

        return (
            <FlexView marginTop={30} marginBottom={30}>
                <Typography align="left" variant="body1" color={stt.color}>{stt.text}</Typography>
            </FlexView>
        );
    };

    /**
     * Check whether voting should be disabled or not
     */
    shouldVoteDisabled = () => {
        const {
            project,
            student,
            coursesStudentIsIn,
            investorSelfCertificationAgreement
        } = this.props;

        // do not let the owner of the pitch vote for themselves
        // also, do not let the teacher vote the pitch
        if (project.teacherID === firebase.auth().currentStudent.uid
            || student.type === DB_CONST.TYPE_PROF
        ) {
            return true;
        }

        if (!coursesStudentIsIn) {
            return true;
        }

        // student is not in the course that posted the offer
        if (project.visibility !== DB_CONST.PROJECT_VISIBILITY_PUBLIC
            && coursesStudentIsIn.findIndex(course => course.anid === project.anid) === -1
        ) {
            return true;
        }

        // do not let investors who haven't uploaded self-certification vote
        if (student.type === DB_CONST.TYPE_INVESTOR) {
            if (!investorSelfCertificationAgreement) {
                return true;
            }
        }

        // do not let teachers vote
        if (student.type === DB_CONST.TYPE_TEACHER) {
            return true;
        }

        // do not allow investors to vote when the Pitch has expired
        if (project.Pitch.status !== DB_CONST.PITCH_STATUS_ON_GOING) {
            return true;
        }
    };

    /**
     * Displaying votes (number or percentage depending on the type of student who is viewing it)
     *
     * If an investor is viewing it, percentage should be displayed.
     *
     * If an teacher or teacher is viewing it, number should be displayed.
     */
    displayVote = type => {
        const {
            // student,
            votes
        } = this.props;

        let yesVotes = 0;
        let noVotes = 0;

        votes.forEach(vote => {
            const voted = vote.voted;
            if (voted !== '') {
                if (voted) {
                    yesVotes += 1;
                } else {
                    noVotes += 1;
                }
            }
        });

        if (type) {
            return yesVotes;
        } else {
            return noVotes
        }
    };
}

/**
 * Get investor vote
 *
 * @param votes
 * @param student
 * @returns {null|*}
 */
const getInvestorVote = (votes, student) => {
    if (votes.length === 0) {
        return null;
    }

    let investorVoteIndex = votes.findIndex(vote => vote.investorID === student.id);
    // investor has voted
    if (investorVoteIndex !== -1) {
        return votes[investorVoteIndex];
    }

    return null;
};

/**
 * Comment dialog - displayed when the Investor clicks on the Comment button
 */
class CommentDialog extends Component {

    onClose = () => {
        this.props.onClose();
    };

    onCommentTextChanged = event => {
        this.props.onCommentTextChanged(event);
    };

    onSubmitCommentClick = () => {
        this.props.onSubmitCommentClick();
    };

    render() {
        const {
            open,
            project,
            commentText,
            commentSubmitClick
        } = this.props;

        if (!project) {
            return null;
        }

        return (
            <Dialog fullWidth open={open} onClose={this.onClose}>
                <DialogTitle>Make a comment</DialogTitle>
                <DialogContent>
                    <DialogContentText align="left">Please enter your comment here.</DialogContentText>
                    <InputBase error={commentText.trim().length === 0 && commentSubmitClick} name="commentText" value={commentText} onChange={this.onCommentTextChanged} rows={5} fullWidth multiline className={css(styles.border_box)}/>
                </DialogContent>
                <DialogActions style={{paddingTop: 20, paddingBottom: 20, paddingRight: 24}}>
                    <Button size="small" color="default" variant="text" onClick={this.onClose}>Cancel</Button>
                    <Button disabled={commentText.trim().length > 0 && commentSubmitClick} style={{marginLeft: 15}} size="small" color="inherit" variant="outlined" onClick={this.onSubmitCommentClick}>Post comment</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

/**
 * Reply input area
 */
class CommentReplyInputArea extends Component {

    onToggleReplyToComment = (comment, replyEdited) => {
        this.props.onToggleReplyToComment(comment, replyEdited);
    }

    onSubmitCommentReply = () => {
        this.props.onSubmitCommentReply();
    }

    onTextChanged = event => {
        this.props.onTextChanged(event);
    }

    render() {
        const {
            replyText
        } = this.props;

        return (
            <FlexView column marginTop={30} width="auto">
                <InputBase name="replyText" value={replyText} onChange={this.onTextChanged} rows={5} fullWidth multiline className={css(styles.border_box)}/>
                <FlexView marginTop={18} width="100%" hAlignContent="right">
                    <Button size="small" color="default" variant="text" className={css(sharedStyles.no_text_transform)} onClick={() => this.onToggleReplyToComment(null, null)}>Cancel</Button>
                    <Button disabled={replyText.trim().length === 0} style={{marginLeft: 15}} size="small" color="inherit" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={this.onSubmitCommentReply}>Submit</Button>
                </FlexView>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDetailsMain);


const styles = StyleSheet.create({
    gray_text: {
        color: colors.gray_700
    },

    faq_box: {
        border: `1px solid ${colors.kick_starter_gray_box_border}`,
        boxShadow: 'none',
        backgroundColor: colors.white,
        marginBottom: 12,
        ':hover': {
            backgroundColor: colors.gray_50
        }
    },

    border_box: {
        border: `1px solid ${colors.kick_starter_gray_box_border}`,
        padding: 14
    },

    teacher_state_control_box: {
        border: `1px solid ${colors.kick_starter_gray_box_border}`,
        padding: 24,
        backgroundColor: colors.gray_100
    },

    sticky_body_sections_bar: {
        position: "sticky",
        top: 0,
        backgroundColor: colors.white,
        zIndex: 1
    },

    main_body_section: {
        minHeight: 600,
        padding: 15,
        backgroundColor: colors.white
    },

    black_text: {
        color: colors.black
    }
});