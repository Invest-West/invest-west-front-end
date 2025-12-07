import React, { Suspense, lazy, ComponentType } from 'react';
import { BarLoader } from 'react-spinners';
import { Box } from '@material-ui/core';

/**
 * Loading fallback component displayed while lazy-loaded components are being fetched.
 * Uses the same BarLoader as GroupRoute for visual consistency.
 */
export const PageLoader: React.FC<{ color?: string }> = ({ color = '#1976d2' }) => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        minHeight="200px"
        paddingTop="50px"
    >
        <BarLoader color={color} width={200} />
    </Box>
);

/**
 * Higher-order component that wraps a lazy component with Suspense.
 * This ensures consistent loading behavior across all lazy-loaded routes.
 */
export const withSuspense = <P extends object>(
    LazyComponent: ComponentType<P>,
    fallback: React.ReactNode = <PageLoader />
): React.FC<P> => {
    return (props: P) => (
        <Suspense fallback={fallback}>
            <LazyComponent {...props} />
        </Suspense>
    );
};

// =============================================================================
// LAZY-LOADED PAGE COMPONENTS
// =============================================================================
// These components are loaded on-demand when the user navigates to their route.
// This significantly reduces the initial bundle size.

// Dashboard components (heavy - contain tables, charts, and complex logic)
export const LazyIssuerDashboard = lazy(() =>
    import(/* webpackChunkName: "issuer-dashboard" */ '../pages/dashboard-issuer/IssuerDashboard')
);

export const LazyInvestorDashboard = lazy(() =>
    import(/* webpackChunkName: "investor-dashboard" */ '../pages/dashboard-investor/InvestorDashboard')
);

export const LazyAdminDashboard = lazy(() =>
    import(/* webpackChunkName: "admin-dashboard" */ '../pages/admin/AdminDashboard')
);

// Authentication components
export const LazySignIn = lazy(() =>
    import(/* webpackChunkName: "auth" */ '../pages/signin/SignInNew')
);

export const LazySignUp = lazy(() =>
    import(/* webpackChunkName: "auth-signup" */ '../pages/signup/SignUpNew')
);

export const LazyResetPassword = lazy(() =>
    import(/* webpackChunkName: "auth" */ '../pages/reset-password/ResetPassword')
);

// Landing and public pages
export const LazyFront = lazy(() =>
    import(/* webpackChunkName: "front" */ '../pages/front/Front')
);

export const LazyGroupDetails = lazy(() =>
    import(/* webpackChunkName: "group-details" */ '../pages/group-details/GroupDetails')
);

// Project/Offer components (contain rich text editor and media players)
export const LazyCreateProject = lazy(() =>
    import(/* webpackChunkName: "create-project" */ '../pages/create-project/CreateProject')
);

export const LazyProjectDetails = lazy(() =>
    import(/* webpackChunkName: "project-details" */ '../pages/project-details/ProjectDetails')
);

// Profile components
export const LazyUserProfile = lazy(() =>
    import(/* webpackChunkName: "profile" */ '../pages/profile/ProfilePageViewOnly')
);

export const LazyProfilePageEditable = lazy(() =>
    import(/* webpackChunkName: "profile" */ '../pages/profile/ProfilePageEditable')
);

// Resource pages
export const LazyResourceDetail = lazy(() =>
    import(/* webpackChunkName: "resources" */ '../pages/resources/pages/ResourceDetail')
);

// System/Static pages (grouped together as they're lightweight)
export const LazyPrivacyPolicyPage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/PrivacyPolicyPage')
);

export const LazyTermsOfUsePage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/TermsOfUsePage')
);

export const LazyRiskWarningPage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/RiskWarningPage')
);

export const LazyCreatePitchTermsAndConditionsPage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/CreatePitchTermsAndConditionsPage')
);

export const LazyContactUs = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/ContactUs')
);

export const LazyHelpPage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/HelpPage')
);

export const LazyMarketingPreferencesPage = lazy(() =>
    import(/* webpackChunkName: "system-pages" */ '../pages/system-public-pages/MarketingPreferencesPage')
);

// Error pages
export const LazyPageNotFound = lazy(() =>
    import(/* webpackChunkName: "error-pages" */ '../shared-components/page-not-found/PageNotFoundNew')
);

// =============================================================================
// PRE-WRAPPED COMPONENTS WITH SUSPENSE
// =============================================================================
// These are ready-to-use components that include Suspense boundaries.
// Use these in router.tsx for cleaner code.

export const SuspenseIssuerDashboard = withSuspense(LazyIssuerDashboard);
export const SuspenseInvestorDashboard = withSuspense(LazyInvestorDashboard);
export const SuspenseAdminDashboard = withSuspense(LazyAdminDashboard);
export const SuspenseSignIn = withSuspense(LazySignIn);
export const SuspenseSignUp = withSuspense(LazySignUp);
export const SuspenseResetPassword = withSuspense(LazyResetPassword);
export const SuspenseFront = withSuspense(LazyFront);
export const SuspenseGroupDetails = withSuspense(LazyGroupDetails);
export const SuspenseCreateProject = withSuspense(LazyCreateProject);
export const SuspenseProjectDetails = withSuspense(LazyProjectDetails);
export const SuspenseUserProfile = withSuspense(LazyUserProfile);
export const SuspenseProfilePageEditable = withSuspense(LazyProfilePageEditable);
export const SuspenseResourceDetail = withSuspense(LazyResourceDetail);
export const SuspensePrivacyPolicyPage = withSuspense(LazyPrivacyPolicyPage);
export const SuspenseTermsOfUsePage = withSuspense(LazyTermsOfUsePage);
export const SuspenseRiskWarningPage = withSuspense(LazyRiskWarningPage);
export const SuspenseCreatePitchTermsAndConditionsPage = withSuspense(LazyCreatePitchTermsAndConditionsPage);
export const SuspenseContactUs = withSuspense(LazyContactUs);
export const SuspenseHelpPage = withSuspense(LazyHelpPage);
export const SuspenseMarketingPreferencesPage = withSuspense(LazyMarketingPreferencesPage);
export const SuspensePageNotFound = withSuspense(LazyPageNotFound);
