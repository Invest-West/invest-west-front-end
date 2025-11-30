import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../redux-store/reducers";
import {
    getGroupRouteTheme,
    isValidatingGroupUrl,
    ManageGroupUrlState,
    successfullyValidatedGroupUrl
} from "../redux-store/reducers/manageGroupUrlReducer";
import {RouteComponentProps} from "react-router-dom";
import Routes from "./routes";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {validateGroupUrl} from "../redux-store/actions/manageGroupUrlActions";
import {
    AuthenticationState,
    authIsNotInitialized,
    isAuthenticating,
    successfullyAuthenticated
} from "../redux-store/reducers/authenticationReducer";
import {Col, Container, Row} from "react-bootstrap";
import Header from "../shared-components/header/Header";
import {signIn, signOut} from "../redux-store/actions/authenticationActions";
import firebase from "../firebase/firebaseApp";
import {RouteParams} from "./router";
import {Box} from "@material-ui/core";
import {
    isLoadingSystemAttributes,
    ManageSystemAttributesState
} from "../redux-store/reducers/manageSystemAttributesReducer";
import {loadSystemAttributes} from "../redux-store/actions/manageSystemAttributesActions";
import User, {isInvestor, isIssuer} from "../models/user";
import Admin, {isAdmin} from "../models/admin";
import GroupOfMembership from "../models/group_of_membership";
import {BarLoader} from "react-spinners";
import { safeSetItem } from "../utils/browser";

interface GroupRouteProps extends GroupRouteLocalProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    loadSystemAttributes: () => any;
    validateGroupUrl: (path: string, groupUserName: string | null) => any;
    signIn: (email?: string, password?: string, forceReAuth?: boolean) => any;
    signOut: () => any;
}

interface GroupRouteLocalProps {
    showHeader: boolean;
    backgroundColor?: string;
    component: React.ReactNode;
}

interface GroupRouteState {
    navigatingFromSignInOrSignUpToDashboard: boolean;
    navigatingToSignIn: boolean;
    navigatingToError: boolean;
}

const initialState: GroupRouteState = {
    navigatingFromSignInOrSignUpToDashboard: false,
    navigatingToSignIn: false,
    navigatingToError: false
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        loadSystemAttributes: () => dispatch(loadSystemAttributes()),
        validateGroupUrl: (path: string, groupUserName: string | null) => dispatch(validateGroupUrl(path, groupUserName)),
        signIn: (email?: string, password?: string, forceReAuth?: boolean) => dispatch(signIn(email, password, forceReAuth)),
        signOut: () => dispatch(signOut())
    }
}

class GroupRoute extends Component<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>, GroupRouteState> {
    private authListener: firebase.default.Unsubscribe | null;
    private routePath: string;
    private routeParams: any;

    constructor(props: GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>) {
        super(props);
        this.authListener = null;
        this.routePath = this.props.match.path;
        this.routeParams = this.props.match.params;
        this.state = {
            ...initialState
        }
    }

    componentDidMount() {
        this.validateRouteAndAuthentication();
    }

    componentDidUpdate(prevProps: Readonly<GroupRouteProps & Readonly<RouteComponentProps<RouteParams>>>, prevState: Readonly<GroupRouteState>, snapshot?: any) {
        this.validateRouteAndAuthentication();

        // system attributes are being loaded
        if (isLoadingSystemAttributes(this.props.ManageSystemAttributesState)) {
            return;
        }

        // group url is being validated
        if (isValidatingGroupUrl(this.props.ManageGroupUrlState)) {
            return;
        }

        // invalid group url --> redirect to 404 page
        if (!successfullyValidatedGroupUrl(this.props.ManageGroupUrlState) && !this.state.navigatingToError) {
            this.setState({
                navigatingToError: true
            });
            this.props.history.push(Routes.error404);
            return;
        }

        // redirect an unauthenticated user to the sign in route if they try to access protected routes
        if (Routes.isProtectedRoute(this.routePath)
            && !authIsNotInitialized(this.props.AuthenticationState)
            && !isAuthenticating(this.props.AuthenticationState)
            && !successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingToSignIn
        ) {
            const { location } = this.props;

            safeSetItem('redirectToAfterAuth', `${location.pathname}${location?.search}`);

            this.setState({
                navigatingToSignIn: true
            });
            this.props.history.push(Routes.constructSignInRoute(this.routeParams));
        }

        // redirect the user to their dashboard if they are on the sign in/up route and are successfully authenticated
        if ((Routes.isSignInRoute(this.routePath) || Routes.isSignUpRoute(this.routePath))
            && successfullyAuthenticated(this.props.AuthenticationState)
            && !this.state.navigatingFromSignInOrSignUpToDashboard
        ) {
            const dashboardRoute: string = Routes.constructDashboardRoute(this.routeParams, this.props.ManageGroupUrlState, this.props.AuthenticationState);
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: true
            });
            this.props.history.push(dashboardRoute);
            return; // Exit early to prevent further processing during navigation
        }

        // Skip permission checks if still authenticating - prevents false 404s during account switch
        if (isAuthenticating(this.props.AuthenticationState)) {
            return;
        }

        // redirect the user to 404 page if they are trying to access routes that are not meant for them
        if (successfullyAuthenticated(this.props.AuthenticationState)) {
            const currentUser: User | Admin | null = this.props.AuthenticationState.currentUser;
            if (currentUser) {
                const currentAdmin: Admin | null = isAdmin(currentUser);
                let shouldRedirectToError: boolean = false;

                if (Routes.isRouteReservedForSuperAdmin(this.routePath)) {
                    if (!currentAdmin || (currentAdmin && !currentAdmin.superAdmin)) {
                        // Non-super-admin trying to access super admin route
                        // Redirect to their correct dashboard instead of 404
                        const correctDashboard = Routes.constructDashboardRoute(
                            this.routeParams,
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    }
                } else if (Routes.isGroupAdminRoute(this.routePath)) {
                    if (!currentAdmin) {
                        // Non-admin trying to access admin route
                        // Redirect to their correct dashboard instead of 404
                        const correctDashboard = Routes.constructDashboardRoute(
                            this.routeParams,
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    } else {
                        const adminGroup: GroupOfMembership | undefined = this.props.AuthenticationState.groupsOfMembership[0];
                        if (!adminGroup || adminGroup.group.groupUserName !== this.routeParams.groupUserName) {
                            // Admin accessing wrong group - redirect to their correct admin dashboard
                            const correctDashboard = Routes.constructDashboardRoute(
                                {}, // Don't pass invalid groupUserName
                                this.props.ManageGroupUrlState,
                                this.props.AuthenticationState
                            );
                            this.props.history.replace(correctDashboard);
                            return;
                        }
                    }
                } else if (Routes.isIssuerDashboardRoute(this.routePath)) {
                    if (!isIssuer(currentUser)) {
                        // User is not an issuer but trying to access issuer dashboard
                        // Redirect to correct dashboard instead of 404
                        const correctDashboard = Routes.constructDashboardRoute(
                            this.routeParams,
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        // User is issuer but not member of this group - redirect to their correct group
                        const correctDashboard = Routes.constructDashboardRoute(
                            {}, // Don't pass the invalid groupUserName
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    }
                } else if (Routes.isInvestorDashboardRoute(this.routePath)) {
                    if (!isInvestor(currentUser)) {
                        // User is not an investor but trying to access investor dashboard
                        // Redirect to correct dashboard instead of 404
                        const correctDashboard = Routes.constructDashboardRoute(
                            this.routeParams,
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    } else if (this.props.AuthenticationState.groupsOfMembership
                        .filter(groupOfMembership =>
                            groupOfMembership.group.groupUserName === this.routeParams.groupUserName).length === 0
                    ) {
                        // User is investor but not member of this group - redirect to their correct group
                        const correctDashboard = Routes.constructDashboardRoute(
                            {}, // Don't pass the invalid groupUserName
                            this.props.ManageGroupUrlState,
                            this.props.AuthenticationState
                        );
                        this.props.history.replace(correctDashboard);
                        return;
                    }
                }

                if (shouldRedirectToError && !this.state.navigatingToError) {
                    this.setState({
                        navigatingToError: true
                    });
                    this.props.history.push(Routes.error404);
                    return;
                }
            }
        }

        if (!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath) && this.state.navigatingFromSignInOrSignUpToDashboard) {
            this.setState({
                navigatingFromSignInOrSignUpToDashboard: false
            });
        }

        if (Routes.isSignInRoute(this.routePath) && this.state.navigatingToSignIn) {
            this.setState({
                navigatingToSignIn: false
            });
        }

        if (Routes.isErrorRoute(this.routePath) && this.state.navigatingToError) {
            this.setState({
                navigatingToError: false
            });
        }
    }

    componentWillUnmount() {
        this.detachAuthListener();
    }

    render() {
        const {
            ManageSystemAttributesState,
            ManageGroupUrlState,
            AuthenticationState,
            showHeader,
            backgroundColor
        } = this.props;

        this.updateRouteAndParams();

        if (isLoadingSystemAttributes(ManageSystemAttributesState)
            || isValidatingGroupUrl(ManageGroupUrlState)
            || (successfullyValidatedGroupUrl(ManageGroupUrlState) && authIsNotInitialized(AuthenticationState))
            || ((!Routes.isSignInRoute(this.routePath) && !Routes.isSignUpRoute(this.routePath))
                && isAuthenticating(AuthenticationState))
        ) {
            return (
                <Box>
                    <BarLoader
                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                        width="100%"
                        height={4}
                    />
                </Box>
            );
        }

        if (successfullyValidatedGroupUrl(ManageGroupUrlState)) {
            return (
                <Container
                    fluid
                    style={{
                        padding: 0,
                        height: backgroundColor !== undefined ? "100%" : "none",
                        minHeight: backgroundColor !== undefined ? "100vh" : "none",
                        backgroundColor: backgroundColor ?? "none"
                    }}
                >
                    {
                        !showHeader
                            ? null
                            : <Row
                                noGutters
                            >
                                <Col
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                >
                                    <Header
                                        routePath={this.routePath}
                                        homUrl={Routes.constructHomeRoute(this.routeParams, ManageGroupUrlState, AuthenticationState)}
                                        dashboardUrl={Routes.constructDashboardRoute(this.routeParams, ManageGroupUrlState, AuthenticationState)}
                                        signInUrl={Routes.constructSignInRoute(this.routeParams)}
                                    />
                                </Col>
                            </Row>
                    }

                    <Row
                        noGutters
                    >
                        <Box
                            width="100%"
                            height="100%"
                        >
                            {
                                this.props.component
                            }
                        </Box>
                    </Row>
                </Container>
            );
        }

        return null;
    }

    validateRouteAndAuthentication = () => {
        this.updateRouteAndParams();

        this.props.loadSystemAttributes();

        this.props.validateGroupUrl(
            this.routePath, this.routeParams.hasOwnProperty("groupUserName")
                ? this.routeParams.groupUserName : null
        );

        this.attachAuthListener();
    }

    updateRouteAndParams = () => {
        this.routePath = this.props.match.path;
        this.routeParams = this.props.match.params;
    }

    attachAuthListener = () => {
        const {
            ManageGroupUrlState
        } = this.props;

        if (successfullyValidatedGroupUrl(ManageGroupUrlState) && !this.authListener) {
            this.authListener = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
                const { AuthenticationState } = this.props;
                const currentReduxUserId = AuthenticationState.currentUser?.id;

                if (firebaseUser) {
                    const firebaseUserId = firebaseUser.uid;
                    const isDifferentUser = currentReduxUserId && currentReduxUserId !== firebaseUserId;

                    if (isDifferentUser) {
                        // Different user detected - sign out first, then sign in
                        // This ensures clean state transition between accounts
                        await this.props.signOut();
                        // Force re-authentication for the new user
                        this.props.signIn(undefined, undefined, true);
                    } else {
                        // Same user or no previous user - normal sign in
                        this.props.signIn();
                    }
                } else {
                    this.props.signOut();
                }
            });
        }
    }

    detachAuthListener = () => {
        if (this.authListener) {
            this.authListener();
            this.authListener = null;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupRoute);