import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {css} from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import {StudentTitles} from "../../../models/student";
import {AuthenticationState, isAuthenticating} from "../../../redux-store/reducers/authenticationReducer";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../../router/router";
import {createStudentAccount, handleInputFieldChanged, loadInvitedStudent} from "./StudentSignUpActions";
import {
    hasErrorCreatingAccount,
    hasErrorLoadingInvitedStudent,
    isCreatingAccount,
    isLoadingInvitedStudent,
    notFoundInvitedStudent,
    StudentSignUpState
} from "./StudentSignUpReducer";
import {getCourseRouteTheme, ManageCourseUrlState} from "../../../redux-store/reducers/manageCourseUrlReducer";
import {BarLoader} from "react-spinners";
import Routes from "../../../router/routes";
import CustomLink from "../../../shared-js-css-styles/CustomLink";
import {TYPE_STUDENT, TYPE_TEACHER} from "../../../firebase/databaseConsts";
import {MediaQueryState} from "../../../redux-store/reducers/mediaQueryReducer";
import HashLoader from "react-spinners/HashLoader";
import {hasRegistered} from "../../../models/invited_student";
import Footer from "../../../shared-components/footer/Footer";

interface SignUpProps {
    ManageCourseUrlState: ManageCourseUrlState;
    MediaQueryState: MediaQueryState;
    AuthenticationState: AuthenticationState;
    StudentSignUpLocalState: StudentSignUpState;
    loadInvitedStudent: (invitedStudentID: string) => any;
    handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    createStudentAccount: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageCourseUrlState: state.ManageCourseUrlState,
        MediaQueryState: state.MediaQueryState,
        AuthenticationState: state.AuthenticationState,
        StudentSignUpLocalState: state.StudentSignUpLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadInvitedStudent: (invitedStudentID: string) => dispatch(loadInvitedStudent(invitedStudentID)),
        handleInputFieldChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(event)),
        createStudentAccount: () => dispatch(createStudentAccount())
    }
}

class StudentSignUp extends Component<SignUpProps & Readonly<RouteComponentProps<RouteParams>>, {}> {
    // invited Student id (optional parameter from the url)
    // if invitedStudentId = undefined --> public registration
    private invitedStudentId: string | undefined;

    componentDidMount() {
        const {
            loadInvitedStudent
        } = this.props;

        this.invitedStudentId = this.props.match.params.id;
        if (this.invitedStudentId) {
            loadInvitedStudent(this.invitedStudentId);
        }
    }

    render() {
        const {
            ManageCourseUrlState,
            AuthenticationState,
            MediaQueryState,
            StudentSignUpLocalState,
            handleInputFieldChanged,
            createStudentAccount
        } = this.props;

        // invited Student ID is specified in the url
        if (this.invitedStudentId) {
            // loading invited Student
            if (isLoadingInvitedStudent(StudentSignUpLocalState)) {
                return (
                    <Box>
                        <BarLoader
                            color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                            width="100%"
                            height={4}
                        />
                    </Box>
                );
            }

            // error loading invited Student (network error or not found)
            // OR Student has already signed up
            if (hasErrorLoadingInvitedStudent(StudentSignUpLocalState)
                || (StudentSignUpLocalState.invitedStudent && hasRegistered(StudentSignUpLocalState.invitedStudent))
            ) {
                return <Box
                    marginTop="30px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Typography
                        variant="h6"
                        color="error"
                    >
                        {
                            // invalid invitedStudentID
                            notFoundInvitedStudent(StudentSignUpLocalState)
                                ? "This registration URL is not valid."
                                // Student has already signed up
                                : StudentSignUpLocalState.invitedStudent && hasRegistered(StudentSignUpLocalState.invitedStudent)
                                ? "You have already registered. Please sign in."
                                // other error
                                : `${StudentSignUpLocalState.errorLoadingInvitedStudent?.detail}`
                        }
                    </Typography>
                    <Box
                        height="20px"
                    />
                    <Button
                        className={css(sharedStyles.no_text_transform)}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            // invalid invitedStudentID
                            if (notFoundInvitedStudent(StudentSignUpLocalState)) {
                                this.props.history.replace(
                                    Routes.constructSignUpRoute(ManageCourseUrlState.courseNameFromUrl ?? "")
                                );
                                window.location.reload();
                                return;
                            }

                            // Student has already signed up
                            if (StudentSignUpLocalState.invitedStudent && hasRegistered(StudentSignUpLocalState.invitedStudent)) {
                                this.props.history.push(Routes.constructSignInRoute(this.props.match.params));
                                return;
                            }

                            // other error
                            window.location.reload();
                        }}
                    >
                        {
                            // invalid invitedStudentID
                            notFoundInvitedStudent(StudentSignUpLocalState)
                                ? "Go to public registration"
                                // Student has already signed up
                                : StudentSignUpLocalState.invitedStudent && hasRegistered(StudentSignUpLocalState.invitedStudent)
                                ? "Sign in"
                                // other error
                                : "Retry"
                        }

                        {/** Error message */}
                        {
                            hasErrorCreatingAccount(StudentSignUpLocalState)
                                ? <Box marginY="20px">
                                    <Typography align="center" variant="body1" color="error">
                                        {StudentSignUpLocalState.errorCreatingAccount?.detail}
                                    </Typography>
                                    {console.error("Error creating account:", StudentSignUpLocalState.errorCreatingAccount)}
                                </Box>
                                : null
                        }
                    </Button>
                </Box>;
            }
        }

        return <Box>
            {/** Sign up card */}
            <Row noGutters>
                <Col
                    xs={{span: 12, offset: 0}}
                    sm={{span: 12, offset: 0}}
                    md={{span: 8, offset: 2}}
                    lg={{span: 4, offset: 4}}
                >
                    <Box
                        display="flex"
                        width="100%"
                        justifyContent="center"
                        paddingX={MediaQueryState.isMobile ? "10px" : "0px"}
                        paddingY={MediaQueryState.isMobile ? "20px" : "60px"}
                    >
                        <Paper
                            elevation={0}
                            square
                            className={css(sharedStyles.kick_starter_border_box)}
                            style={{
                                width: 650,
                                padding: MediaQueryState.isMobile ? 20 : 30
                            }}
                        >
                            <Typography
                                align="center"
                                variant="h5"
                                color="primary"
                            >
                                {`Welcome to ${ManageCourseUrlState.course?.displayName}`}
                            </Typography>

                            <Box
                                height="20px"
                            />

                            {/** Hash loader */}
                            {
                                isCreatingAccount(StudentSignUpLocalState) || isAuthenticating(AuthenticationState)
                                    ? <Box
                                        display="flex"
                                        marginY="20px"
                                        justifyContent="center"
                                    >
                                        <HashLoader
                                            color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                        />
                                    </Box>
                                    : null
                            }

                            {/** Error message */}
                            {
                                !hasErrorCreatingAccount(StudentSignUpLocalState)
                                    ? <Box
                                        marginY="20px"
                                    >
                                        <Typography
                                            align="center"
                                            variant="body1"
                                            color="error"
                                        >
                                            {StudentSignUpLocalState.errorCreatingAccount?.detail}
                                        </Typography>
                                    </Box>
                                    : null
                            }

                            {/** Student type */}
                            <FormControl
                                required
                                fullWidth
                                disabled={this.invitedStudentId !== undefined}
                            >
                                <InputLabel>
                                    <Typography
                                        variant="body1"
                                        color="primary"
                                    >
                                        What would you like to do?
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="studentType"
                                    value={StudentSignUpLocalState.studentType}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value={-1}
                                    >
                                        Please select
                                    </MenuItem>
                                    <MenuItem
                                        key={TYPE_STUDENT}
                                        value={TYPE_STUDENT}
                                    >
                                        Invest
                                    </MenuItem>
                                    <MenuItem
                                        key={TYPE_TEACHER}
                                        value={TYPE_TEACHER}
                                    >
                                        Raise funds
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Box
                                height="30px"
                            />

                            {/** Title */}
                            <FormControl
                                required
                                fullWidth
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
                                    value={StudentSignUpLocalState.title}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value="-1"
                                    >
                                        Please select
                                    </MenuItem>
                                    {
                                        StudentTitles.map((title, index) => (
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

                            <Box
                                height="25px"
                            />

                            {/** Names */}
                            <Box
                                marginBottom="18px"
                            >
                                {/** First name */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="First name"
                                        name="firstName"
                                        value={StudentSignUpLocalState.firstName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Last name */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Last name"
                                        name="lastName"
                                        value={StudentSignUpLocalState.lastName}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>
                            </Box>

                            {/** Emails */}
                            <Box
                                marginBottom="18px"
                            >
                                {/** Email */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Email"
                                        name="email"
                                        value={StudentSignUpLocalState.email}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        disabled={this.invitedStudentId !== undefined}
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Confirmed email */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Re-enter email"
                                        name="confirmedEmail"
                                        value={StudentSignUpLocalState.confirmedEmail}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>
                            </Box>

                            {/** Passwords */}
                            <Box>
                                {/** Password */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Password"
                                        name="password"
                                        value={StudentSignUpLocalState.password}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>

                                {/** Confirmed password */}
                                <FormControl
                                    required
                                    fullWidth
                                >
                                    <TextField
                                        required
                                        label="Confirm password"
                                        name="confirmedPassword"
                                        value={StudentSignUpLocalState.confirmedPassword}
                                        fullWidth
                                        variant="outlined"
                                        margin="dense"
                                        type="password"
                                        onChange={handleInputFieldChanged}
                                    />
                                </FormControl>


                                {/** How did you hear about us */}
                                <Box marginTop="28px"/>
                                <FormControl fullWidth>
                                <InputLabel>
                                    <Typography variant="body1" color="primary">
                                        How did you hear about us?
                                    </Typography>
                                </InputLabel>
                                <Select
                                    name="discover"
                                    value={StudentSignUpLocalState.discover}
                                    // @ts-ignore
                                    onChange={handleInputFieldChanged}
                                    margin="dense"
                                    style={{
                                        marginTop: 25
                                    }}
                                >
                                    <MenuItem
                                        key="-1"
                                        value="-1"
                                    >
                                        Please select
                                    </MenuItem>
                                    {
                                        StudentTitles.map((discover, index) => (
                                            <MenuItem
                                                key={index}
                                                value={discover}
                                            >
                                                {discover}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            </Box>

                            {/** Marketing preferences checkbox */}
                            <Box
                                marginTop="28px"
                            >
                                <FormControl>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                    >
                                        <Checkbox
                                            name="acceptMarketingPreferences"
                                            color="primary"
                                            checked={StudentSignUpLocalState.acceptMarketingPreferences}
                                            onChange={handleInputFieldChanged}
                                        />
                                        <Typography
                                            variant="body1"
                                        >
                                            Accept&nbsp;
                                            <CustomLink
                                                url={Routes.nonCourseMarketingPreferences}
                                                target="_blank"
                                                color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                                activeColor="none"
                                                activeUnderline
                                                component="a"
                                                childComponent={
                                                    "marketing preferences"
                                                }
                                            />
                                            .
                                        </Typography>
                                    </Box>
                                </FormControl>
                            </Box>

                            {/** T&Cs */}
                            <Box
                                marginTop="25px"
                            >
                                <Typography
                                    variant="body1"
                                    align="center"
                                >
                                    By signing up, you agree to our&nbsp;
                                    <CustomLink
                                        url={Routes.nonCourseTermsOfUse}
                                        target="_blank"
                                        color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="a"
                                        childComponent={
                                            "Terms of use"
                                        }
                                    />
                                    &nbsp;and&nbsp;
                                    <CustomLink
                                        url={Routes.nonCoursePrivacyPolicy}
                                        target="_blank"
                                        color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="a"
                                        childComponent={
                                            "Privacy policy"
                                        }
                                    />
                                    .
                                </Typography>
                            </Box>

                            {/** Create Account button */}
                            <Box
                                marginTop="40px"
                                display="flex"
                                justifyContent="center"
                            >
                                <Button
                                    className={css(sharedStyles.no_text_transform)}
                                    color="primary"
                                    variant="contained"
                                    disabled={
                                        StudentSignUpLocalState.studentType === -1
                                        || StudentSignUpLocalState.title === "-1"
                                        || StudentSignUpLocalState.firstName.trim().length === 0
                                        || StudentSignUpLocalState.lastName.trim().length === 0
                                        || StudentSignUpLocalState.email.trim().length === 0
                                        || StudentSignUpLocalState.confirmedEmail.trim().length === 0
                                        || StudentSignUpLocalState.password.trim().length === 0
                                        || StudentSignUpLocalState.confirmedPassword.trim().length === 0
                                    }
                                    onClick={() => createStudentAccount()}
                                >
                                    Create account
                                </Button>
                            </Box>

                            {/** Sign in if have an account */}
                            <Box
                                marginTop="20px"
                            >
                                <Typography
                                    variant="body2"
                                    align="center"
                                >
                                    Already have an Invest West account?&nbsp;
                                    <CustomLink
                                        url={Routes.constructSignInRoute(this.props.match.params)}
                                        color={getCourseRouteTheme(ManageCourseUrlState).palette.primary.main}
                                        activeColor="none"
                                        activeUnderline
                                        component="nav-link"
                                        childComponent={
                                            "Sign in"
                                        }
                                    />
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Col>
            </Row>

            {/** Footer */}
            <Row
                noGutters
            >
                <Col
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                >
                    <Footer/>
                </Col>
            </Row>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentSignUp);