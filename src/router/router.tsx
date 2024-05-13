import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import IssuerDashboard from "../pages/dashboard-issuer/IssuerDashboard";
import InvestorDashboard from "../pages/dashboard-investor/InvestorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreatePitchPage from "../pages/create-project/CreateProject";
import UserProfile from "../pages/profile/ProfilePageViewOnly";
import ProjectDetails from "../pages/project-details/ProjectDetails";
import PrivacyPolicyPage from "../pages/system-public-pages/PrivacyPolicyPage";
import TermsOfUsePage from "../pages/system-public-pages/TermsOfUsePage";
import RiskWarningPage from "../pages/system-public-pages/RiskWarningPage";
import CreatePitchTermsAndConditionsPage from "../pages/system-public-pages/CreatePitchTermsAndConditionsPage";
import ContactUs from "../pages/system-public-pages/ContactUs";
import HelpPage from "../pages/system-public-pages/HelpPage";
import GroupDetails from "../pages/group-details/GroupDetails";
import MarketingPreferencesPage from "../pages/system-public-pages/MarketingPreferencesPage";
import ProfilePageEditable from "../pages/profile/ProfilePageEditable";

import Front from "../pages/front/Front";
import SignIn from "../pages/signin/SignInNew";
import PageNotFound from "../shared-components/page-not-found/PageNotFoundNew";
import ErrorBoundary from './ErrorBoundary';
import Routes from "./routes";
import GroupRoute from "./GroupRoute";
import CourseRoute from "./CourseRoute";
import ResetPassword from "../pages/reset-password/ResetPassword";
import ResourceDetail from "../pages/resources/pages/ResourceDetail";
import SignUpNew from "../pages/signup/SignUpNew";
import SignUpStudentNew from "../pages/signup/StudentSignup/StudentSignUpNew";

import {colors} from "@material-ui/core";

/**
 * Parameters in the url
 */
export interface RouteParams {
    groupUserName: string;

    [params: string]: string;
}

const AppRouter = () => (
    <BrowserRouter>
    <ErrorBoundary>
        <Switch>
            <Route path={Routes.groupSignUp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignUp} exact
                            // @ts-ignore
                            render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                                // @ts-ignore
                                                            component={<SignUpNew {...props}/>}/>}/>

            <Route path={Routes.nonGroupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.groupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>

            <Route path={Routes.nonGroupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.groupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.superAdminSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>

            <Route path={Routes.nonGroupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>
            <Route path={Routes.groupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<AdminDashboard {...props}/>}/>}/>

            <Route path={Routes.groupIssuerDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<IssuerDashboard {...props}/>}/>}/>

            <Route path={Routes.groupInvestorDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={<InvestorDashboard {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>
            <Route path={Routes.groupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>

            <Route path={Routes.nonGroupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>
            <Route path={Routes.groupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<GroupDetails {...props}/>}/>}/>
            <Route path={Routes.groupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<GroupDetails {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>
            <Route path={Routes.groupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<UserProfile {...props}/>}/>}/>

            <Route path={Routes.nonGroupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>
            <Route path={Routes.groupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>

            <Route path={Routes.nonGroupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>
            <Route path={Routes.groupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>

            <Route path={Routes.groupHelp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<HelpPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>
            <Route path={Routes.groupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>



            <Route path={Routes.nonGroupPrivacyPolicy} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<PrivacyPolicyPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupTermsOfUse} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<TermsOfUsePage {...props}/>}/>}/>

            <Route path={Routes.nonGroupRiskWarning} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<RiskWarningPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupCreatePitchTermsAndConditions} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<CreatePitchTermsAndConditionsPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupMarketingPreferences} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<MarketingPreferencesPage {...props}/>}/>}/>

            <Route path={Routes.nonGroupAuthAction} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                       // @ts-ignore
                                                component={<ResetPassword {...props}/>}/>}/>

            <Route path={Routes.error404} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={<PageNotFound {...props}/>}/>}/>

            {/** Handle undefined paths */}
            <Route
                // @ts-ignore
                render={props => <GroupRoute {...props} showHeader={true}
                                             component={<PageNotFound {...props}/>}/>}/>

            <Route path={Routes.courseSignUp} exact
                            // @ts-ignore
                            render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                                // @ts-ignore
                                                            component={<SignUpStudentNew {...props}/>}/>}/>

            <Route path={Routes.nonCourseSignUp} exact
                            // @ts-ignore
                            render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                                // @ts-ignore
                                                            component={<SignUpStudentNew {...props}/>}/>}/>

            <Route path={Routes.nonCourseFront} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>
            <Route path={Routes.courseFront} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false} component={<Front {...props}/>}/>}/>

            <Route path={Routes.nonCourseSignIn} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.courseSignIn} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>
            <Route path={Routes.superAdminSignIn} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<SignIn {...props}/>}/>}/>

            <Route path={Routes.nonCourseTeacherDashboard} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false}
                                                component={<TeacherDashboard {...props}/>}/>}/>
            <Route path={Routes.courseTeacherDashboard} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false}
                                                component={<TeacherDashboard {...props}/>}/>}/>

            <Route path={Routes.courseStudentDashboard} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false}
                                                component={<StudentDashboard {...props}/>}/>}/>

            <Route path={Routes.courseStudentViewerDashboard} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={false}
                                                component={<StudentViewerDashboard {...props}/>}/>}/>

            <Route path={Routes.nonCourseViewOffer} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>
            <Route path={Routes.courseViewOffer} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ProjectDetails {...props}/>}/>}/>

            <Route path={Routes.nonCourseCreateOffer} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>
            <Route path={Routes.courseCreateOffer} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<CreatePitchPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseViewCourse} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<CourseDetails {...props}/>}/>}/>
            <Route path={Routes.courseViewCourse} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={<CourseDetails {...props}/>}/>}/>

            <Route path={Routes.nonCourseViewStudentProfile} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<StudentProfile {...props}/>}/>}/>
            <Route path={Routes.courseViewStudentProfile} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<StudentProfile {...props}/>}/>}/>

            <Route path={Routes.nonCourseViewResourceDetail} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>
            <Route path={Routes.courseViewResourceDetail} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ResourceDetail {...props}/>}/>}/>

            <Route path={Routes.nonCourseEditUserProfile} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>
            <Route path={Routes.courseEditUserProfile} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ProfilePageEditable {...props}/>}/>}/>

            <Route path={Routes.courseHelp} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<HelpPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseContactUs} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>
            <Route path={Routes.courseContactUs} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<ContactUs {...props}/>}/>}/>



            <Route path={Routes.nonCoursePrivacyPolicy} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<PrivacyPolicyPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseTermsOfUse} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<TermsOfUsePage {...props}/>}/>}/>

            <Route path={Routes.nonCourseRiskWarning} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<RiskWarningPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseCreatePitchTermsAndConditions} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<CreatePitchTermsAndConditionsPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseMarketingPreferences} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                                                component={<MarketingPreferencesPage {...props}/>}/>}/>

            <Route path={Routes.nonCourseAuthAction} exact
                // @ts-ignore
                   render={props => <CourseRoute {...props} showHeader={true}
                       // @ts-ignore
                                                component={<ResetPassword {...props}/>}/>}/>

        </Switch>
        </ErrorBoundary>
    </BrowserRouter>
);

export default AppRouter;
