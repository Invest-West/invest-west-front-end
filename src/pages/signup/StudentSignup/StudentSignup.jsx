import React, {Component} from "react";
import FlexView from "react-flexview/lib";
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {css} from "aphrodite";
import {Col, Container, Row} from "react-bootstrap";
import {HashLoader} from "react-spinners";
import {NavLink} from "react-router-dom";

import {connect} from "react-redux";
import * as manageCourseFromParamsActions from "../../../redux-store/actions/manageCourseFromParamsActions";
import * as authActions from "../../../redux-store/actions/authActions";
import PageNotFoundWhole from "../../../shared-components/page-not-found/PageNotFoundWhole";
import StudentNotAbleToRegisterOrJoin from "./components/StudentNotAbleToRegisterOrJoin";

import * as colors from "../../../values/colors";
import * as realtimeDBUtils from "../../../firebase/realtimeDBUtils";
import * as DB_CONST from "../../../firebase/databaseConsts";
import firebase from "../../../firebase/firebaseApp";
import * as utils from "../../../utils/utils";
import * as ROUTES from "../../../router/routes";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import {ApiRoutes} from "../../../api/Api.tsx";
import Api from "../../../api/Api";

const ERROR_NONE = 0;
const ERROR_MISSING_FIELD = 1;
const ERROR_INVALID_EMAIL_ADDRESS = 2;
const ERROR_PASSWORDS_NOT_MATCH = 3;
const ERROR_PASSWORD_NOT_STRONG_ENOUGH = 4;
const ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH = 5;

const mapStateToProps = state => {
    return {
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        clubAttributes: state.manageClubAttributes.clubAttributes
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setCourseStudentNameFromParams: (courseStudentName) => dispatch(manageCourseFromParamsActions.setCourseStudentNameFromParams(courseStudentName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageCourseFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageCourseFromParamsActions.loadAngelNetwork()),

        togglePreventValidatingStudentWhenSigningUp: (shouldPrevent) => dispatch(authActions.togglePreventValidatingStudentWhenSigningUp(shouldPrevent)),
        getStudentProfileAndValidateStudent: (uid) => dispatch(authActions.getStudentProfileAndValidateStudent(uid))
    }
};

class Signup extends Component {

    constructor(props) {
        super(props);

        this.state = {
            dataLoaded: false,
            loadingData: false,

            publicRegistration: false,
            publicRegistrationType: null,
            publicRegistrationStudent: null,

            // the invited Student object that is loaded using the invited id specified in the URL
            invitedStudentWithSpecifiedInvitedID: null,
            // the invited Students array that is loaded using the email obtained from the invited Student object above
            invitedStudentsWithTheEmailObtained: null,

            studentWelcomeName: '',

            password: '',
            confirmPassword: '',
            marketingPreferencesChecked: false,

            // check if the Create account (register of new student) button
            // or the Join (registered student to join in another angel network) button is pressed
            submitted: false,
            // process the Signup or the Join event
            processingSubmission: false,
            // error status
            errorStatus: ERROR_NONE
        };

        this.firebaseAuth = firebase.auth();
        this.firebaseDB = firebase.database();
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
        setExpectedAndCurrentPathsForChecking(match.params.hasOwnProperty('courseStudentName') ? ROUTES.SIGN_UP : ROUTES.SIGN_UP_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            coursePropertiesLoaded,
            shouldLoadOtherData,

            loadAngelNetwork
        } = this.props;

        loadAngelNetwork();

        if (coursePropertiesLoaded && shouldLoadOtherData) {
            this.loadData();
        }
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            dataLoaded,
            loadingData
        } = this.state;

        const invitedID = this.props.match.params.id;

        if (!dataLoaded && !loadingData) {
            if (invitedID === "student" || invitedID === "teacher") {
                this.setState({
                    dataLoaded: true,
                    loadingData: false,
                    publicRegistration: true,
                    publicRegistrationType:
                        invitedID === "student"
                            ?
                            DB_CONST.TYPE_STUDENT
                            :
                            invitedID === "teacher"
                                ?
                                DB_CONST.TYPE_TEACHER
                                :
                                null
                    ,
                    publicRegistrationStudent: {
                        email: '',
                        confirmedEmail: '',
                        title: DB_CONST.STUDENT_TITLES[0],
                        firstName: '',
                        lastName: ''
                    }
                });
            } else {
                this.setState({
                    loadingData: true
                });

                // load the invited Student that is specified by the invited id in the URL
                realtimeDBUtils
                    .getInvitedStudentBasedOnIDOrEmail(invitedID, realtimeDBUtils.GET_INVITED_STUDENT_BASED_ON_INVITED_ID)
                    .then(invitedStudentsByInvitedID => {
                        // set the obtained invited Student to state
                        this.setState({
                            invitedStudentWithSpecifiedInvitedID: invitedStudentsByInvitedID[0],
                            studentWelcomeName: invitedStudentsByInvitedID[0].firstName
                        });

                        // load the invited Students that share the same email
                        // --> check if the Student has been invited by other angel networks
                        realtimeDBUtils
                            .getInvitedStudentBasedOnIDOrEmail(invitedStudentsByInvitedID[0].email, realtimeDBUtils.GET_INVITED_STUDENT_BASED_ON_EMAIL)
                            .then(invitedStudentsByEmail => {
                                // set the obtained invited students to state
                                this.setState({
                                    invitedStudentsWithTheEmailObtained: invitedStudentsByEmail,
                                    dataLoaded: true,
                                    loadingData: false
                                });
                            })
                            .catch(error => {
                                // no invited Students found with the email specified
                                // --> the Student was only invited by one angel network
                                this.setState({
                                    dataLoaded: true,
                                    loadingData: false
                                });
                            });
                    })
                    .catch(error => {
                        // no invited Student found with the invited id
                        this.setState({
                            dataLoaded: true,
                            loadingData: false
                        });
                    });
            }
        }
    };

    /**
     * Sign up for new Student functions
     */

    /**
     * Handle when input changed in the SignupForNewStudent component
     *
     * @param event
     */
    handleSignupForNewStudentInputChanged = event => {
        const {
            publicRegistration
        } = this.state;

        const target = event.target;
        const name = target.name;

        switch (target.type) {
            case 'text':
                if (!publicRegistration) {
                    this.setState({
                        invitedStudentWithSpecifiedInvitedID: {
                            ...this.state.invitedStudentWithSpecifiedInvitedID,
                            [name]: target.value
                        }
                    });
                } else {
                    this.setState({
                        publicRegistrationStudent: {
                            ...this.state.publicRegistrationStudent,
                            [name]: target.value
                        }
                    });
                }
                return;
            case 'password':
                this.setState({
                    [name]: target.value
                });
                return;
            case 'checkbox':
                this.setState({
                    [name]: target.checked
                });
                return;
            default:
                if (!publicRegistration) {
                    this.setState({
                        invitedStudentWithSpecifiedInvitedID: {
                            ...this.state.invitedStudentWithSpecifiedInvitedID,
                            [name]: target.value
                        }
                    });
                } else {
                    this.setState({
                        publicRegistrationStudent: {
                            ...this.state.publicRegistrationStudent,
                            [name]: target.value
                        }
                    });
                }
                return;
        }
    };

    /**
     * Handle when the Create account button is presses
     */
    handleSignupForNewStudentClick = async () => {
        const {
            courseStudentName,
            courseProperties
        } = this.props;

        const {
            publicRegistration,
            publicRegistrationType,
            publicRegistrationStudent,

            invitedStudentWithSpecifiedInvitedID,
            password,
            confirmPassword,
            marketingPreferencesChecked
        } = this.state;

        this.setState({
            submitted: true
        });

        if ((!publicRegistration
                && invitedStudentWithSpecifiedInvitedID !== null
                && invitedStudentWithSpecifiedInvitedID !== undefined
                && invitedStudentWithSpecifiedInvitedID.title !== DB_CONST.Student_TITLES[0]
                && invitedStudentWithSpecifiedInvitedID.firstName.trim().length > 0
                && invitedStudentWithSpecifiedInvitedID.lastName.trim().length > 0
                && invitedStudentWithSpecifiedInvitedID.email.trim().length > 0

                && password.trim().length > 0
                && confirmPassword.trim().length > 0
            )
            || (
                publicRegistration
                && publicRegistrationStudent.title !== DB_CONST.Student_TITLES[0]
                && publicRegistrationStudent.firstName.trim().length > 0
                && publicRegistrationStudent.lastName.trim().length > 0
                && publicRegistrationStudent.email.trim().length > 0
                && publicRegistrationStudent.confirmedEmail.trim().length > 0

                && password.trim().length > 0
                && confirmPassword.trim().length > 0
            )
        ) {
            // public registration
            if (publicRegistration) {
                if (publicRegistrationStudent.email.trim().toLowerCase() !== publicRegistrationStudent.confirmedEmail.trim().toLowerCase()) {
                    this.setState({
                        errorStatus: ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH
                    });
                    return;
                }

                // check if email is valid
                if (!utils.isValidEmailAddress(publicRegistrationStudent.email)) {
                    this.setState({
                        errorStatus: ERROR_INVALID_EMAIL_ADDRESS
                    });
                    return;
                }
            }

            // check if email is valid for non-public registration
            if (!publicRegistration
                && invitedStudentWithSpecifiedInvitedID
                && !utils.isValidEmailAddress(invitedStudentWithSpecifiedInvitedID.email)
            ) {
                this.setState({
                    errorStatus: ERROR_INVALID_EMAIL_ADDRESS
                });
                return;
            }

            // check if passwords are matched
            if (password !== confirmPassword) {
                this.setState({
                    errorStatus: ERROR_PASSWORDS_NOT_MATCH
                });
                return;
            }

            // check the strength of password
            const passwordStrength = utils.checkPasswordStrength(password);
            if (passwordStrength === utils.PASSWORD_VERY_WEAK) {
                this.setState({
                    errorStatus: ERROR_PASSWORD_NOT_STRONG_ENOUGH
                });
                return;
            }

            this.setState({
                submitted: false,
                processingSubmission: true,
                errorStatus: ERROR_NONE
            });

            let data = {};

            // public registration
            if (publicRegistration) {
                data = {
                    isPublicRegistration: true,
                    studentProfile: {
                        id: "",
                        email: publicRegistrationStudent.email,
                        firstName: publicRegistrationStudent.firstName,
                        lastName: publicRegistrationStudent.lastName,
                        title: publicRegistrationStudent.title,
                        type: publicRegistrationType
                    },
                    password: password,
                    courseID: courseProperties.anid
                };
            }
            // register via invitation email
            else {
                // ensure invitedStudentWithSpecifiedInvitedID !== null
                if (invitedStudentWithSpecifiedInvitedID) {
                    data = {
                        isPublicRegistration: false,
                        invitedStudentID: invitedStudentWithSpecifiedInvitedID.id,
                        studentProfile: {
                            id: "",
                            email: invitedStudentWithSpecifiedInvitedID.email,
                            firstName: invitedStudentWithSpecifiedInvitedID.firstName,
                            lastName: invitedStudentWithSpecifiedInvitedID.lastName,
                            title: invitedStudentWithSpecifiedInvitedID.title,
                            type: invitedStudentWithSpecifiedInvitedID.type
                        },
                        password: password,
                        courseID: invitedStudentWithSpecifiedInvitedID.Invitor.anid
                    };
                }
            }

            try {
                await new Api().request(
                    "post",
                    ApiRoutes.createStudent,
                    {
                        queryParameters: null,
                        requestBody: data
                    }
                );

                this.firebaseAuth
                    .signInWithEmailAndPassword(
                        !publicRegistration
                            ?
                            invitedStudentWithSpecifiedInvitedID.email.trim().toLowerCase()
                            :
                            publicRegistrationStudent.email.trim().toLowerCase()
                        ,
                        password
                    )
                    .then(auth => {
                        const id = this.firebaseDB
                            .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                            .push()
                            .key;
                        // create a node in MarketingPreferences to keep track of the student's preferences
                        this.firebaseDB
                            .ref(DB_CONST.MARKETING_PREFERENCES_CHILD)
                            .child(id)
                            .set({
                                id,
                                studentID: auth.student.uid,
                                date: utils.getCurrentDate(),
                                accepted: marketingPreferencesChecked
                            })
                            .then(() => {
                                if (!publicRegistration) {
                                    if (invitedStudentWithSpecifiedInvitedID.type === DB_CONST.TYPE_STUDENT) {
                                        this.props.history.push(
                                            courseStudentName
                                                ?
                                                `${ROUTES.DASHBOARD_STUDENT.replace(":courseStudentName", courseStudentName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_STUDENT_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    } else {
                                        this.props.history.push(
                                            courseStudentName
                                                ?
                                                `${ROUTES.DASHBOARD_TEACHER.replace(":courseStudentName", courseStudentName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_TEACHER_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    }
                                } else {
                                    if (publicRegistrationType === DB_CONST.TYPE_STUDENT) {
                                        this.props.history.push(
                                            courseStudentName
                                                ?
                                                `${ROUTES.DASHBOARD_STUDENT.replace(":courseStudentName", courseStudentName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_STUDENT_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    } else {
                                        this.props.history.push(
                                            courseStudentName
                                                ?
                                                `${ROUTES.DASHBOARD_TEACHER.replace(":courseStudentName", courseStudentName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_TEACHER_INVEST_WEST_SUPER}?tab=Home`
                                        );
                                    }
                                }
                            });
                    });
            } catch (error) {
                this.setState({
                    errorStatus: error.toString(),
                    processingSubmission: false
                });
            }
        } else {
            this.setState({
                errorStatus: ERROR_MISSING_FIELD
            });
        }
    };

    /**
     * ///--------------------------------------------------------------------------------------------------------------
     */

    /**
     * Join functions
     */

    /**
     * Handle when the student clicks on the Decline button
     */
    handleDeclineToJoinTheAngelNetwork = () => {
        const {
            invitedStudentWithSpecifiedInvitedID
        } = this.state;

        this.firebaseDB
            .ref(DB_CONST.INVITED_STUDENTS_CHILD)
            .child(invitedStudentWithSpecifiedInvitedID.id)
            .update({
                id: invitedStudentWithSpecifiedInvitedID.id,
                status: DB_CONST.INVITED_STUDENT_DECLINED_TO_REGISTER
            })
            .then(() => {
                // don't need to have a listener here, simply update the state after changing the status
                this.setState({
                    invitedStudentWithSpecifiedInvitedID: {
                        ...this.state.invitedStudentWithSpecifiedInvitedID,
                        status: DB_CONST.INVITED_STUDENT_DECLINED_TO_REGISTER
                    }
                });
            })
            .catch(error => {
                // handle error
            });
    };

    /**
     * Handle when the Student clicks on the Agree button
     */
    handleAgreeToJoinTheAngelNetwork = () => {
        const {
            invitedStudentWithSpecifiedInvitedID,
            invitedStudentsWithTheEmailObtained
        } = this.state;

        const invitedStudentsByEmailThatHaveRegisteredIndex = invitedStudentsWithTheEmailObtained.findIndex(
            invitedStudentByEmail =>
                invitedStudentByEmail.id !== invitedStudentWithSpecifiedInvitedID.id && invitedStudentByEmail.hasOwnProperty('officialStudentID'));

        // Student has already registered (joined) before
        if (invitedStudentsByEmailThatHaveRegisteredIndex !== -1) {
            const studentOfficialID = invitedStudentsWithTheEmailObtained[invitedStudentsByEmailThatHaveRegisteredIndex].id;
            const updatedInvitedStudent = {
                id: invitedStudentWithSpecifiedInvitedID.id,
                email: invitedStudentWithSpecifiedInvitedID.email.toLowerCase(),
                status: DB_CONST.INVITED_STUDENT_STATUS_ACTIVE,
                officialStudentID: studentOfficialID,
                joinedDate: utils.getCurrentDate(),
                type: invitedStudentWithSpecifiedInvitedID.type,
                invitedBy: invitedStudentWithSpecifiedInvitedID.invitedBy,
                invitedDate: invitedStudentWithSpecifiedInvitedID.invitedDate
            };

            this.firebaseDB
                .ref(DB_CONST.INVITED_STUDENTS_CHILD)
                .child(invitedStudentWithSpecifiedInvitedID.id)
                .update(updatedInvitedStudent)
                .then(() => {
                    // don't need to have a listener here, simply update the state after changing the status
                    this.setState({
                        invitedStudentWithSpecifiedInvitedID: {
                            ...this.state.invitedStudentWithSpecifiedInvitedID,
                            status: DB_CONST.INVITED_STUDENT_DECLINED_TO_REGISTER
                        }
                    });
                })
                .catch(error => {
                    // handle error
                });
        }
        // Student has not registered (joined) before
        else {
            // do nothing because if the Student has not registered before, the register form should show up
        }
    };

    /**
     * ///--------------------------------------------------------------------------------------------------------------
     */

    render() {
        const {
            courseStudentName,
            courseProperties,
            coursePropertiesLoaded,
            shouldLoadOtherData
        } = this.props;

        const {
            dataLoaded,
            loadingData,

            publicRegistration,
            publicRegistrationType,
            publicRegistrationStudent,

            invitedStudentWithSpecifiedInvitedID,
            invitedStudentsWithTheEmailObtained,

            studentWelcomeName,

            password,
            confirmPassword,
            marketingPreferencesChecked,

            submitted,
            processingSubmission,
            errorStatus
        } = this.state;

        if (!coursePropertiesLoaded) {
            return (
                <FlexView
                    marginTop={30}
                    hAlignContent="center"
                >
                    <HashLoader
                        color={colors.primaryColor}
                    />
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        if (loadingData && !dataLoaded) {
            return (
                <FlexView
                    marginTop={30}
                    hAlignContent="center"
                >
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

        // courseProperties = null means super teacher site,
        // the Student must not be allowed to signup on super teacher site
        // also, if the invitedID is not relating to any invited Student in the db, display Page not found.
        if (!courseProperties || (!publicRegistration && !invitedStudentWithSpecifiedInvitedID)) {
            return <PageNotFoundWhole/>;
        }

        // if the URL is not for public registration,
        // check if the Student is opening the page under the correct course url.
        // if not, display Page not found.
        if (!publicRegistration
            && invitedStudentWithSpecifiedInvitedID.invitedBy !== courseProperties.anid
        ) {
            return <PageNotFoundWhole/>;
        }

        // the invited Student of this angel network has already registered
        if (!publicRegistration
            && (invitedStudentWithSpecifiedInvitedID.hasOwnProperty('officialStudentID')
                || invitedStudentWithSpecifiedInvitedID.status !== DB_CONST.INVITED_STUDENT_NOT_REGISTERED
            )
        ) {
            return (
                <StudentNotAbleToRegisterOrJoin
                    invitedStudent={invitedStudentWithSpecifiedInvitedID}
                />
            );
        }

        let invitedStudentsByEmailThatHaveRegistered = [];

        if (!publicRegistration) {
            invitedStudentsByEmailThatHaveRegistered = invitedStudentsWithTheEmailObtained.filter(
                invitedStudentByEmail =>
                    invitedStudentByEmail.id !== invitedStudentWithSpecifiedInvitedID.id && invitedStudentByEmail.hasOwnProperty('officialStudentID'));
        }

        return (
            <Container
                fluid
                style={{
                    padding: 0,
                    height: "100%",
                    minHeight: "100vh",
                    backgroundColor: colors.gray_200,
                    overflow: "auto"
                }}
            >
                {
                    // the invited Student has not joined any angel network before
                    invitedStudentsByEmailThatHaveRegistered.length === 0
                        ?
                        <SignupForNewStudent
                            publicRegistration={publicRegistration}
                            publicRegistrationType={publicRegistrationType}
                            publicRegistrationStudent={publicRegistrationStudent}
                            courseStudentName={courseStudentName}
                            courseProperties={courseProperties}
                            invitedStudent={invitedStudentWithSpecifiedInvitedID}
                            studentWelcomeName={studentWelcomeName}
                            password={password}
                            confirmPassword={confirmPassword}
                            marketingPreferencesChecked={marketingPreferencesChecked}
                            submitted={submitted}
                            processingSubmission={processingSubmission}
                            errorStatus={errorStatus}
                            handleInputChanged={this.handleSignupForNewStudentInputChanged}
                            handleSignupClick={this.handleSignupForNewStudentClick}
                        />
                        :
                        <SignupForRegisteredStudent
                            courseProperties={courseProperties}
                            invitedStudent={invitedStudentWithSpecifiedInvitedID}
                            handleDeclineClick={this.handleDeclineToJoinTheAngelNetwork}
                            handleAgreeClick={this.handleAgreeToJoinTheAngelNetwork}
                        />
                }
            </Container>
        );
    }
}

/**
 * Signup component for a new Student
 */
class SignupForNewStudent extends Component {

    handleInputChanged = event => {
        this.props.handleInputChanged(event);
    };

    handleSignupClick = () => {
        this.props.handleSignupClick();
    };

    render() {
        const {
            publicRegistration,
            publicRegistrationType,
            publicRegistrationStudent,

            courseStudentName,
            courseProperties,

            invitedStudent,

            studentWelcomeName,

            password,
            confirmPassword,
            marketingPreferencesChecked,

            submitted,
            processingSubmission
        } = this.props;

        return (
            <Row
                noGutters
            >
                <Col
                    xs={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                    style={{
                        paddingLeft: 18,
                        paddingRight: 18,
                    }}
                >
                    <Paper
                        elevation={0}
                        square
                        className={css(sharedStyles.kick_starter_border_box)}
                        style={{
                            marginTop: 70,
                            marginBottom: 100
                        }}
                    >
                        {/** Registration title */}
                        <FlexView
                            style={{
                                padding: 20,
                                backgroundColor: colors.kick_starter_signup_background
                            }}
                        >
                            <Typography
                                variant="h5"
                            >
                                {
                                    publicRegistrationType === null
                                        ?
                                        "Sign up"
                                        :
                                        publicRegistrationType === DB_CONST.TYPE_STUDENT
                                            ?
                                            "Student sign up"
                                            :
                                            "Teacher sign up"
                                }
                            </Typography>
                        </FlexView>

                        {/** Divider */}
                        <Divider/>

                        {/** Welcome text */}
                        <FlexView
                            column
                            style={{
                                padding: 20
                            }}
                        >
                            <Typography
                                align="left"
                                variant="h6"
                                color="primary"
                            >
                                {
                                    !publicRegistration
                                        ?
                                        `Welcome ${studentWelcomeName}`
                                        :
                                        `Welcome to ${courseProperties.displayName}`
                                }
                            </Typography>

                            {/** QIB teacher registration text */}
                            {
                                courseStudentName === "qib"
                                && (
                                    (publicRegistration && publicRegistrationType === DB_CONST.TYPE_TEACHER)
                                    || (!publicRegistration && invitedStudent.type === DB_CONST.TYPE_TEACHER)
                                )
                                    ?
                                    <Typography
                                        align="justify"
                                        variant="body1"
                                        style={{
                                            marginTop: 10,
                                            marginBottom: 20
                                        }}
                                    >
                                        The Quarterly Investment Briefing is an event run by TechSPARK for Students to
                                        network, share and learn. Investment opportunities and one pagers added to this
                                        platform will be shared by the event host verbally and circulated via this
                                        password protected website to c. 300+ Students and enablers of investment
                                        (lawyers, accountants etc.) who have expressed interest in the region and
                                        investment opportunities here.
                                    </Typography>
                                    :
                                    null
                            }

                            {/** Invitation registration text */}
                            {
                                !publicRegistration
                                    ?
                                    <Typography
                                        align="left"
                                        variant="subtitle1"
                                        color="primary"
                                        paragraph
                                        style={{
                                            marginTop: 8
                                        }}
                                    >
                                        You have been invited to join the {invitedStudent.Invitor.displayName} members
                                        area.
                                    </Typography>
                                    :
                                    null
                            }

                            {/** Title */}
                            <FormControl
                                required
                                fullWidth
                                error={
                                    !publicRegistration
                                        ?
                                        invitedStudent.title === DB_CONST.STUDENT_TITLES[0] && submitted
                                        :
                                        publicRegistrationStudent.title === DB_CONST.STUDENT_TITLES[0] && submitted
                                }
                                style={{
                                    marginBottom: 15,
                                    marginTop: 15
                                }}
                            >
                                <InputLabel>
                                    <Typography
                                        variant="body1"
                                        color="primary"
                                    >
                                        Title
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="title"
                                    value={
                                        !publicRegistration
                                            ?
                                            invitedStudent.title
                                            :
                                            publicRegistrationStudent.title
                                    }
                                    onChange={this.handleInputChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    {
                                        DB_CONST.STUDENT_TITLES.map((title, index) => (
                                            <MenuItem
                                                key={index}
                                                value={title}
                                            >
                                                {title}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>

                            {/** Names */}
                            <FlexView>
                                <FlexView
                                    grow
                                    marginRight={10}
                                >
                                    <TextField
                                        required
                                        label="First name"
                                        name="firstName"
                                        value={
                                            !publicRegistration
                                                ?
                                                invitedStudent.firstName
                                                :
                                                publicRegistrationStudent.firstName
                                        }
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        error={
                                            !publicRegistration
                                                ?
                                                invitedStudent.firstName.length === 0 && submitted
                                                :
                                                publicRegistrationStudent.firstName.length === 0 && submitted
                                        }
                                        onChange={this.handleInputChanged}
                                    />
                                </FlexView>
                                <FlexView
                                    grow
                                    marginLeft={10}
                                >
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={
                                            !publicRegistration
                                                ?
                                                invitedStudent.lastName
                                                :
                                                publicRegistrationStudent.lastName
                                        }
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        error={
                                            !publicRegistration
                                                ?
                                                invitedStudent.lastName.length === 0 && submitted
                                                :
                                                publicRegistrationStudent.lastName.length === 0 && submitted
                                        }
                                        onChange={this.handleInputChanged}
                                    />
                                </FlexView>
                            </FlexView>

                            {/** Email */}
                            <FormControl
                                fullWidth
                            >
                                <TextField
                                    required
                                    label="Email"
                                    name="email"
                                    value={
                                        !publicRegistration
                                            ?
                                            invitedStudent.email
                                            :
                                            publicRegistrationStudent.email
                                    }
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    error={
                                        !publicRegistration
                                            ?
                                            invitedStudent.email.trim().length === 0 && submitted
                                            :
                                            publicRegistrationStudent.email.trim().length === 0 && submitted
                                    }
                                    disabled={!publicRegistration}
                                    onChange={!publicRegistration ? null : this.handleInputChanged}
                                    style={{
                                        marginTop: 10
                                    }}
                                />
                            </FormControl>

                            {
                                !publicRegistration
                                    ?
                                    null
                                    :
                                    // Confirmed email
                                    <FormControl
                                        fullWidth
                                    >
                                        <TextField
                                            required
                                            label="Re-enter email"
                                            name="confirmedEmail"
                                            value={publicRegistrationStudent.confirmedEmail}
                                            fullWidth
                                            variant="outlined"
                                            margin="dense"
                                            error={publicRegistrationStudent.confirmedEmail.trim().length === 0 && submitted}
                                            onChange={!publicRegistration ? null : this.handleInputChanged}
                                            style={{
                                                marginTop: 10
                                            }}
                                        />
                                    </FormControl>
                            }

                            <FlexView
                                column
                                marginTop={20}
                            >
                                {/** Password */}
                                <TextField
                                    required
                                    label="Password"
                                    name="password"
                                    value={password}
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    type="password"
                                    error={password.length === 0 && submitted}
                                    onChange={this.handleInputChanged}
                                    style={{marginTop: 10}}
                                />

                                {/** Confirm */}
                                <TextField
                                    required
                                    label="Confirm password"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    type="password"
                                    error={confirmPassword.length === 0 && submitted}
                                    onChange={this.handleInputChanged}
                                    style={{marginTop: 10}}
                                />
                            </FlexView>

                            <FlexView
                                vAlignContent="center"
                                marginTop={8}
                            >
                                <Checkbox
                                    name="marketingPreferencesChecked"
                                    color="primary"
                                    checked={marketingPreferencesChecked}
                                    onChange={this.handleInputChanged}
                                />
                                <Typography
                                    variant="body2"
                                >
                                    Accept&nbsp;
                                    <NavLink
                                        to={ROUTES.MARKETING_PREFERENCES}
                                        target="_blank"
                                        className={css(sharedStyles.nav_link_hover)}
                                        style={{
                                            color:
                                                !courseProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    courseProperties.settings.primaryColor
                                        }}
                                    >
                                        <b>
                                            marketing preferences
                                        </b>
                                    </NavLink>
                                </Typography>
                            </FlexView>

                            {
                                this.renderError()
                            }

                            {
                                !processingSubmission
                                    ?
                                    null
                                    :
                                    <FlexView
                                        hAlignContent="center"
                                        marginTop={15}
                                    >
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
                            }

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={processingSubmission}
                                onClick={this.handleSignupClick}
                                className={css(sharedStyles.no_text_transform)}
                                style={{
                                    marginTop: 30,
                                    marginBottom: 14
                                }}
                            >
                                {
                                    publicRegistrationType === null
                                        ?
                                        "Create account"
                                        :
                                        publicRegistrationType === DB_CONST.TYPE_TEACHER
                                            ?
                                            "Create Student account"
                                            :
                                            "Create teacher account"
                                }
                            </Button>

                            <Typography
                                variant="body2"
                                align="center"
                            >
                                By signing up, you agree to our
                                <NavLink
                                    to={ROUTES.TERMS_OF_USE}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Terms of use&nbsp;
                                    </b>
                                </NavLink>
                                and
                                <NavLink
                                    to={ROUTES.PRIVACY_POLICY}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Privacy policy.
                                    </b>
                                </NavLink>
                            </Typography>

                            <FlexView
                                hAlignContent="center"
                                marginTop={20}
                            >
                                <Typography
                                    variant="body1"
                                    align="center"
                                >
                                    Already have an account?&nbsp;&nbsp;
                                    <NavLink
                                        to={
                                            courseStudentName
                                                ? ROUTES.SIGN_IN.replace(":courseStudentName", courseStudentName)
                                                :
                                                ROUTES.SIGN_IN_INVEST_WEST_SUPER
                                        }
                                        className={css(sharedStyles.nav_link_hover)}
                                        style={{
                                            color:
                                                !courseProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    courseProperties.settings.primaryColor
                                        }}
                                    >
                                        Sign in
                                    </NavLink>
                                </Typography>
                            </FlexView>
                        </FlexView>
                    </Paper>
                </Col>
            </Row>
        );
    }

    /**
     * Render error feedback
     *
     * @returns {null|*}
     */
    renderError = () => {
        const {
            errorStatus
        } = this.props;

        let errorMessage = '';

        switch (errorStatus) {
            case ERROR_NONE:
                return null;
            case ERROR_MISSING_FIELD:
                errorMessage = 'Please fill in all the fields.';
                break;
            case ERROR_INVALID_EMAIL_ADDRESS:
                errorMessage = 'Please use a valid email address.';
                break;
            case ERROR_PASSWORDS_NOT_MATCH:
                errorMessage = 'Passwords do not match.';
                break;
            case ERROR_PASSWORD_NOT_STRONG_ENOUGH:
                errorMessage = 'Password is too weak. Please select a stronger password.';
                break;
            case ERROR_PUBLIC_REGISTRATION_EMAILS_NOT_MATCH:
                errorMessage = 'Emails do not match.';
                break;
            default:
                errorMessage = errorStatus;
                break;
        }
        return (
            <FlexView
                marginTop={30}
                hAlignContent="center"
                width="100%"
            >
                <Typography
                    variant="body2"
                    align="center"
                    color="error"
                >
                    {errorMessage}
                </Typography>
            </FlexView>
        );
    }
}

/**
 * Signup component (or exactly Join component) for a registered Student who is already a member of an angel network
 * but was also invited by other angel networks to join in their courses.
 */
class SignupForRegisteredStudent extends Component {

    render() {
        const {
            courseProperties,

            invitedStudent,

            handleDeclineClick,
            handleAgreeClick
        } = this.props;

        return (
            <Row
                noGutters
            >
                <Col
                    xs={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                    style={{
                        paddingLeft: 18,
                        paddingRight: 18,
                    }}
                >
                    <Paper
                        elevation={0}
                        square
                        className={css(sharedStyles.kick_starter_border_box)}
                        style={{
                            marginTop: 70,
                            marginBottom: 100
                        }}
                    >
                        <FlexView
                            style={{
                                padding: 20,
                                backgroundColor: colors.kick_starter_signup_background
                            }}
                        >
                            <Typography
                                variant="h5"
                            >
                                Join {invitedStudent.Invitor.displayName}
                            </Typography>

                        </FlexView>

                        <Divider/>

                        <FlexView
                            column
                            style={{
                                padding: 20
                            }}
                        >
                            <Typography
                                align="center"
                                variant="h6"
                                style={{
                                    marginTop: 10,
                                    marginBottom: 10
                                }}
                            >
                                {`${invitedStudent.Invitor.displayName} invited you to join their course as an ${invitedStudent.type === DB_CONST.TYPE_STUDENT ? 'student' : 'teacher'}. Do you want to join their course?`}
                            </Typography>

                            <FlexView
                                width="100%"
                                marginTop={25}
                                marginBottom={30}
                            >
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    className={css(sharedStyles.no_text_transform)}
                                    onClick={handleDeclineClick}
                                    style={{
                                        marginRight: 6
                                    }}
                                >
                                    Decline
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    className={css(sharedStyles.no_text_transform)}
                                    onClick={handleAgreeClick}
                                    style={{
                                        marginLeft: 6
                                    }}
                                >
                                    Agree
                                </Button>
                            </FlexView>

                            <Typography
                                variant="body2"
                                align="center"
                            >
                                By clicking Agree, you also agree to our
                                <NavLink
                                    to={ROUTES.TERMS_OF_USE}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Terms of use&nbsp;
                                    </b>
                                </NavLink>
                                and
                                <NavLink
                                    to={ROUTES.PRIVACY_POLICY}
                                    target="_blank"
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{
                                        color:
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                    }}
                                >
                                    <b>
                                        &nbsp;Privacy policy.
                                    </b>
                                </NavLink>
                            </Typography>
                        </FlexView>
                    </Paper>
                </Col>
            </Row>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);