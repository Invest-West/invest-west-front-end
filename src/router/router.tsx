import React, { Suspense } from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {colors} from "@material-ui/core";
import ErrorBoundary from './ErrorBoundary';
import Routes from "./routes";
import GroupRoute from "./GroupRoute";
import {
    PageLoader,
    LazyIssuerDashboard,
    LazyInvestorDashboard,
    LazyAdminDashboard,
    LazyCreateProject,
    LazyUserProfile,
    LazyProjectDetails,
    LazyPrivacyPolicyPage,
    LazyTermsOfUsePage,
    LazyRiskWarningPage,
    LazyCreatePitchTermsAndConditionsPage,
    LazyContactUs,
    LazyHelpPage,
    LazyGroupDetails,
    LazyMarketingPreferencesPage,
    LazyProfilePageEditable,
    LazyFront,
    LazySignIn,
    LazyPageNotFound,
    LazyResetPassword,
    LazyResourceDetail,
    LazySignUp
} from "./LazyComponents";

/**
 * Parameters in the url
 */
export interface RouteParams {
    groupUserName: string;

    [params: string]: string;
}

/**
 * Helper function to wrap a lazy component with Suspense.
 * This ensures code-split chunks load with a loading indicator.
 */
const withSuspense = (LazyComponent: React.LazyExoticComponent<any>, props: any) => (
    <Suspense fallback={<PageLoader />}>
        <LazyComponent {...props} />
    </Suspense>
);

const AppRouter = () => (
    <BrowserRouter>
    <ErrorBoundary>
        <Switch>
            <Route path={Routes.groupSignUp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazySignUp, props)}/>}/>

            <Route path={Routes.nonGroupSignUp} exact
                            // @ts-ignore
                            render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                                // @ts-ignore
                                                            component={withSuspense(LazySignUp, props)}/>}/>

            <Route path={Routes.nonGroupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={withSuspense(LazyFront, props)}/>}/>
            <Route path={Routes.groupFront} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false} component={withSuspense(LazyFront, props)}/>}/>

            <Route path={Routes.nonGroupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazySignIn, props)}/>}/>
            <Route path={Routes.groupSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazySignIn, props)}/>}/>
            <Route path={Routes.superAdminSignIn} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazySignIn, props)}/>}/>

            <Route path={Routes.nonGroupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={withSuspense(LazyAdminDashboard, props)}/>}/>
            <Route path={Routes.groupAdminDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={withSuspense(LazyAdminDashboard, props)}/>}/>

            <Route path={Routes.groupIssuerDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={withSuspense(LazyIssuerDashboard, props)}/>}/>

            <Route path={Routes.groupInvestorDashboard} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={false}
                                                component={withSuspense(LazyInvestorDashboard, props)}/>}/>

            <Route path={Routes.nonGroupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyProjectDetails, props)}/>}/>
            <Route path={Routes.groupViewOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyProjectDetails, props)}/>}/>

            <Route path={Routes.nonGroupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyCreateProject, props)}/>}/>
            <Route path={Routes.groupCreateOffer} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyCreateProject, props)}/>}/>

            <Route path={Routes.nonGroupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazyGroupDetails, props)}/>}/>
            <Route path={Routes.groupViewGroup} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true} backgroundColor={colors.grey["200"]}
                       // @ts-ignore
                                                component={withSuspense(LazyGroupDetails, props)}/>}/>

            <Route path={Routes.nonGroupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyUserProfile, props)}/>}/>
            <Route path={Routes.groupViewUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyUserProfile, props)}/>}/>

            <Route path={Routes.nonGroupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyResourceDetail, props)}/>}/>
            <Route path={Routes.groupViewResourceDetail} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyResourceDetail, props)}/>}/>

            <Route path={Routes.nonGroupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyProfilePageEditable, props)}/>}/>
            <Route path={Routes.groupEditUserProfile} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyProfilePageEditable, props)}/>}/>

            <Route path={Routes.groupHelp} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyHelpPage, props)}/>}/>

            <Route path={Routes.nonGroupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyContactUs, props)}/>}/>
            <Route path={Routes.groupContactUs} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyContactUs, props)}/>}/>



            <Route path={Routes.nonGroupPrivacyPolicy} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyPrivacyPolicyPage, props)}/>}/>

            <Route path={Routes.nonGroupTermsOfUse} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyTermsOfUsePage, props)}/>}/>

            <Route path={Routes.nonGroupRiskWarning} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyRiskWarningPage, props)}/>}/>

            <Route path={Routes.nonGroupCreatePitchTermsAndConditions} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyCreatePitchTermsAndConditionsPage, props)}/>}/>

            <Route path={Routes.nonGroupMarketingPreferences} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyMarketingPreferencesPage, props)}/>}/>

            <Route path={Routes.nonGroupAuthAction} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                       // @ts-ignore
                                                component={withSuspense(LazyResetPassword, props)}/>}/>

            <Route path={Routes.error404} exact
                // @ts-ignore
                   render={props => <GroupRoute {...props} showHeader={true}
                                                component={withSuspense(LazyPageNotFound, props)}/>}/>

            {/** Handle undefined paths */}
            <Route
                // @ts-ignore
                render={props => <GroupRoute {...props} showHeader={true}
                                             component={withSuspense(LazyPageNotFound, props)}/>}/>

        </Switch>
        </ErrorBoundary>
    </BrowserRouter>
);

export default AppRouter;
