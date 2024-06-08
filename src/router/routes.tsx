import Admin, {isAdmin} from "../models/admin";
import Teacher, {isProf} from "../models/teacher";
import GroupOfMembership, {getHomeGroup} from "../models/group_of_membership";
import CourseOfMembership, {getHomeCourse} from "../models/course_of_membership";
import {AuthenticationState} from "../redux-store/reducers/authenticationReducer";
import {StudentAuthenticationState} from "../redux-store/reducers/studentAuthenticationReducer";
import {ManageCourseUrlState} from "../redux-store/reducers/manageCourseUrlReducer";
import {ManageGroupUrlState} from "../redux-store/reducers/manageGroupUrlReducer";
import User, {isInvestor} from "../models/user";
import Student, {isStudent} from "../models/student";

export interface CreateProjectRouteParams {
    edit?: string;
    admin?: string;
    issuer?: string;
}

export interface CreateStudentProjectRouteParams {
    edit?: string;
    teacher?: string;
    studentOffer?: string;
}

export default class Routes {
    static baseGroup: string = "/groups/:groupUserName";

    static baseCourse: string = "/courses/:courseName";

    static nonGroupFront: string = "/";
    static groupFront: string = `${Routes.baseGroup}`;

    static nonCourseFront: string = "/courses";
    static courseFront: string = `${Routes.baseCourse}`;

    static nonGroupSignIn: string = "/groups/invest-west/signin";
    static groupSignIn: string = `${Routes.baseGroup}/signin`;
    static superAdminSignIn: string = "/signin/super-admin";

    static nonCourseSignIn: string = "/courses/default/signin";
    static courseSignIn: string = `${Routes.baseCourse}/signin`;
    static superTeacherSignIn: string = "/signin/super-teacher";

    static nonGroupSignUp:string = "/groups/invest-west/signup";
    static groupSignUp: string = `${Routes.baseGroup}/signup/:id?`;

    static nonCourseSignUp: string = "/courses/signup";
    static courseSignUp: string = `${Routes.baseCourse}/signup/:id?`;

    static nonGroupAdminDashboard: string = "/admin";
    static groupAdminDashboard: string = `${Routes.baseGroup}/admin`;

    static nonCourseTeacherDashboard: string = "/teacher";
    static courseTeacherDashboard: string = `${Routes.baseCourse}/teacher`;

    static groupIssuerDashboard: string = `${Routes.baseGroup}/dashboard/issuer`;
    static courseStudentDashboard: string = `${Routes.baseCourse}/dashboard/student`;

    static groupInvestorDashboard: string = `${Routes.baseGroup}/dashboard/investor`;
    static courseStudentViewerDashboard: string = `${Routes.baseCourse}/dashboard/student-viewer`;

    static nonGroupViewUserProfile: string = "/view-profile/:userID";
    static groupViewUserProfile: string = `${Routes.baseGroup}/view-profile/:userID`;

    static nonCourseViewStudentProfile: string = "/view-profile/:studentID";
    static courseViewStudentProfile: string = `${Routes.baseCourse}/view-profile/:studentID`;

    static nonGroupEditUserProfile: string = "/edit-profile/:userID";
    static groupEditUserProfile: string = `${Routes.baseGroup}/edit-profile/:userID`;

    static nonCourseEditStudentProfile: string = "/edit-profile/:studentID";
    static courseEditStudentProfile: string = `${Routes.baseCourse}/edit-profile/:studentID`;

    static nonGroupCreateOffer: string = "/create-offer";
    static groupCreateOffer: string = `${Routes.baseGroup}/create-offer`;

    static nonCourseCreateOffer: string = "/create-offer";
    static courseCreateOffer: string = `${Routes.baseCourse}/create-offer`;

    static nonGroupViewOffer: string = "/projects/:projectID";
    static groupViewOffer: string = `${Routes.baseGroup}/projects/:projectID`;

    static nonCourseViewOffer: string = "/projects/:projectID";
    static courseViewOffer: string = `${Routes.baseCourse}/projects/:projectID`;

    static nonGroupViewPledge: string = "/pledge";
    static groupViewPledge: string = `${Routes.baseGroup}/pledge`;

    static nonCourseViewPledge: string = "/student-pledge";
    static courseViewPledge: string = `${Routes.baseCourse}/student-pledge`;

    static nonGroupViewGroup: string = "/view-group-details/:viewedGroupUserName";
    static groupViewGroup: string = `${Routes.baseGroup}/view-group-details/:viewedGroupUserName`;

    static nonCourseViewCourse: string = "/view-course-details/:viewedCourseStudentName";
    static courseViewCourse: string = `${Routes.baseCourse}/view-course-details/:viewedCourseStudentName`;

    static nonGroupViewResourceDetail: string = "/resources/:resourceName";
    static groupViewResourceDetail: string = `${Routes.baseGroup}/resources/:resourceName`;

    static nonCourseViewResourceDetail: string = "/resources/:resourceStudent";
    static courseViewResourceDetail: string = `${Routes.baseCourse}/resources/:resourceStudent`;

    static nonGroupContactUs: string = "/contact-us";
    static groupContactUs: string = `${Routes.baseGroup}/contact-us`;

    static nonCourseContactUs: string = "/contact-us-student";
    static courseContactUs: string = `${Routes.baseCourse}/contact-us-student`;

    static groupHelp: string = `${Routes.baseGroup}/help`;
    static courseHelp: string = `${Routes.baseCourse}/help`;

    static nonGroupTermsOfUse: string = "/terms-of-use";
    static nonGroupPrivacyPolicy: string = "/privacy-policy";
    static nonGroupRiskWarning: string = "/risk-warning-footer";
    static nonGroupCreatePitchTermsAndConditions: string = "/create-project-terms-and-conditions";
    static nonGroupMarketingPreferences: string = "/marketing-preferences";

    static nonCourseTermsOfUse: string = "/student-terms-of-use";
    static nonCoursePrivacyPolicy: string = "/student-privacy-policy";
    static nonCourseRiskWarning: string = "/student-risk-warning-footer";
    static nonCourseCreatePitchTermsAndConditions: string = "/student-create-project-terms-and-conditions";
    static nonCourseMarketingPreferences: string = "/student-marketing-preferences";

    static nonGroupAuthAction: string = "/auth/action";
    static nonCourseAuthAction: string = "/student-auth/action";

    static error404: string = "/error/404";

    /**
     * Check if a route is a protected one
     *
     * @param route
     */
    public static isProtectedRoute = (route: string) => {
        return route !== Routes.nonGroupFront
            && route !== Routes.groupFront
            && route !== Routes.nonGroupSignIn
            && route !== Routes.groupSignIn
            && route !== Routes.nonGroupSignUp
            && route !== Routes.groupSignUp
            && route !== Routes.nonGroupContactUs
            && route !== Routes.groupContactUs
            && route !== Routes.nonGroupPrivacyPolicy
            && route !== Routes.nonGroupTermsOfUse
            && route !== Routes.nonGroupRiskWarning
            && route !== Routes.nonGroupCreatePitchTermsAndConditions
            && route !== Routes.nonGroupMarketingPreferences
            && route !== Routes.nonGroupAuthAction
            && route !== Routes.nonCourseFront
            && route !== Routes.courseFront
            && route !== Routes.nonCourseSignIn
            && route !== Routes.courseSignIn
            && route !== Routes.nonCourseSignUp
            && route !== Routes.courseSignUp
            && route !== Routes.nonCourseContactUs
            && route !== Routes.courseContactUs
            && route !== Routes.nonCoursePrivacyPolicy
            && route !== Routes.nonCourseTermsOfUse
            && route !== Routes.nonCourseRiskWarning
            && route !== Routes.nonCourseCreatePitchTermsAndConditions
            && route !== Routes.nonCourseMarketingPreferences
            && route !== Routes.nonCourseAuthAction
            && route !== Routes.error404;
    }

    /**
     * Check if a route is reserved just for super admin
     *
     * @param route
     */
    public static isRouteReservedForSuperAdmin = (route: string) => {
        return route === Routes.nonGroupAdminDashboard
            || route === Routes.nonGroupViewUserProfile
            || route === Routes.nonGroupEditUserProfile
            || route === Routes.nonGroupCreateOffer
            || route === Routes.nonGroupViewOffer
            || route === Routes.nonGroupViewPledge
            || route === Routes.nonGroupViewGroup
            || route === Routes.nonCourseViewStudentProfile
            || route === Routes.nonCourseEditStudentProfile
            || route === Routes.nonCourseCreateOffer
            || route === Routes.nonCourseViewOffer
            || route === Routes.nonCourseViewPledge
            || route === Routes.nonCourseViewCourse;
    }

    /**
     * Check if a route is dedicated for a group admin
     *
     * @param route
     */
    public static isGroupAdminRoute = (route: string) => {
        return route === Routes.groupAdminDashboard;
    }

    /**
     * Check if a route is dedicated for a course teacher
     *
     * @param route
     */
    public static isCourseTeacherRoute = (route: string) => {
        return route === Routes.courseTeacherDashboard;
    }

    /**
     * Check if a route is dedicated for an issuer
     *
     * @param route
     */
    public static isIssuerDashboardRoute = (route: string) => {
        return route === Routes.groupIssuerDashboard;
    }

    /**
     * Check if a route is dedicated for an Teacher
     *
     * @param route
     */
    public static isTeacherDashboardRoute = (route: string) => {
        return route === Routes.courseTeacherDashboard;
    }

    /**
     * Check  if a route is dedicated for an investor
     *
     * @param route
     */
    public static isInvestorDashboardRoute = (route: string) => {
        return route === Routes.groupInvestorDashboard;
    }

    /**
     * Check  if a route is dedicated for an student
     *
     * @param route
     */
    public static isStudentDashboardRoute = (route: string) => {
        return route === Routes.courseStudentDashboard;
    }

    /**
     * Check if a route is a sign in route
     *
     * @param route
     */
    public static isSignInRoute = (route: string) => {
        return route === Routes.nonGroupSignIn || route === Routes.groupSignIn || route === Routes.superAdminSignIn;
    }

    /**
     * Check if a route is a sign in route
     *
     * @param route
     */
    public static isStudentSignInRoute = (route: string) => {
        return route === Routes.nonCourseSignIn || route === Routes.courseSignIn || route === Routes.superTeacherSignIn;
    }

    /**
     * Check if a route is a super admin sign in route
     *
     * @param route
     */
    public static isSuperAdminSignInRoute = (route: string) => {
        return route === Routes.superAdminSignIn;
    }

    /**
     * Check if a route is a super admin sign in route
     *
     * @param route
     */
    public static isSuperTeacherSignInRoute = (route: string) => {
        return route === Routes.superTeacherSignIn;
    }

    /**
     * Check if a route is a sign up route
     *
     * @param route
     */
    public static isSignUpRoute = (route: string) => {
        return route === Routes.nonGroupSignUp || route === Routes.groupSignUp;
    }

    /**
     * Check if a route is a student sign up route
     *
     * @param route
     */
    public static isStudentSignUpRoute = (route: string) => {
        return route === Routes.nonCourseSignUp || route === Routes.courseSignUp;
    }

    /**
     * Check if a route is an error route
     *
     * @param route
     */
    public static isErrorRoute = (route: string) => {
        return route === Routes.error404;
    }

    /**
     * Check if a route is a system public route
     *
     * @param route
     */
    public static isSystemPublicRoute = (route: string) => {
        return route === Routes.nonGroupPrivacyPolicy
            || route === Routes.nonGroupRiskWarning
            || route === Routes.nonGroupTermsOfUse
            || route === Routes.nonGroupCreatePitchTermsAndConditions
            || route === Routes.nonGroupMarketingPreferences
            || route === Routes.nonCoursePrivacyPolicy
            || route === Routes.nonCourseRiskWarning
            || route === Routes.nonCourseTermsOfUse
            || route === Routes.nonCourseCreatePitchTermsAndConditions
            || route === Routes.nonCourseMarketingPreferences;
    }

    /**
     * Construct public route
     *
     * @param route
     */
    public static constructPublicRoute = (route: "privacyPolicy" | "riskWarning" | "termsOfUse" | "createPitchTermsAndConditions" | "marketingPreferences") => {
        switch (route) {
            case "privacyPolicy":
                return Routes.nonGroupPrivacyPolicy;
            case "riskWarning":
                return Routes.nonGroupRiskWarning;
            case "termsOfUse":
                return Routes.nonGroupTermsOfUse;
            case "createPitchTermsAndConditions":
                return Routes.nonGroupCreatePitchTermsAndConditions;
            case "marketingPreferences":
                return Routes.nonGroupMarketingPreferences;
        }
    }

    /**
     * Construct home route (navigate to Front page)
     *
     * @param routeParams
     * @param ManageGroupUrlState
     * @param AuthenticationState
     */
    public static constructHomeRoute = (routeParams: any, ManageGroupUrlState: ManageGroupUrlState,
                                        AuthenticationState: AuthenticationState) => {
        let route: string = "";

        if (!AuthenticationState.currentUser) {
            if (!routeParams.groupUserName) {
                return Routes.nonGroupFront;
            } else {
                return Routes.groupFront.replace(":groupUserName", routeParams.groupUserName);
            }
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        // an admin MUST use the correct sign in page to sign in
        if (currentAdmin) {
            // current admin is a super admin
            if (currentAdmin.superAdmin) {
                route = Routes.nonGroupFront;
            }
            // current admin is not a super admin
            else {
                if (AuthenticationState.groupsOfMembership.length === 1) {
                    const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                    route = Routes.groupFront.replace(":groupUserName", adminGroup.group.groupUserName);
                }
            }
        }
            // an investor or an issuer can use any sign in page (group sign in page) to sign in,
        // except the Invest West sign in page (with no group parameter) as it is reserved for the super admins only
        else {
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (routeParams.groupUserName) {
                if (AuthenticationState.groupsOfMembership
                    .filter(groupOfMembership =>
                        groupOfMembership.group.groupUserName === routeParams.groupUserName).length > 0
                ) {
                    route = Routes.groupFront.replace(":groupUserName", routeParams.groupUserName);
                } else if (homeGroup) {
                    route = Routes.groupFront.replace(":groupUserName", homeGroup.group.groupUserName);
                }
            } else if (homeGroup) {
                route = Routes.groupFront.replace(":groupUserName", homeGroup.group.groupUserName);
            }
        }

        if (!route) {
            return Routes.nonGroupFront;
        }

        return route;
    }

    /**
     * Construct student home route (navigate to Front page)
     *
     * @param routeParams
     * @param ManageCourseUrlState
     * @param StudentAuthenticationState
     */
    public static constructStudentHomeRoute = (routeParams: any, ManageCourseUrlState: ManageCourseUrlState,
        StudentAuthenticationState: StudentAuthenticationState) => {
        let route: string = "";

        if (!StudentAuthenticationState.currentStudent) {
            if (!routeParams.courseUserName) {
                return Routes.nonCourseFront;
            } else {
                return Routes.courseFront.replace(":courseUserName", routeParams.courseUserName);
            }
        }

        const currentTeacher: Teacher | null = isProf(StudentAuthenticationState.currentStudent);
        // an admin MUST use the correct sign in page to sign in
        if (currentTeacher) {
        // current admin is a super admin
        if (currentTeacher.superTeacher) {
            route = Routes.nonCourseFront;
        }
        // current admin is not a super admin
        else {
                if (StudentAuthenticationState.coursesOfMembership.length === 1) {
                    const adminCourse: CourseOfMembership = StudentAuthenticationState.coursesOfMembership[0];
                    route = Routes.courseFront.replace(":courseUserName", adminCourse.course.courseUserName);
                }
            }
        }
        // an investor or an issuer can use any sign in page (course sign in page) to sign in,
        // except the Invest West sign in page (with no course parameter) as it is reserved for the super admins only
        else {
            const uniCourse: CourseOfMembership | null = getHomeCourse(StudentAuthenticationState.coursesOfMembership);
            if (routeParams.courseUserName) {
            if (StudentAuthenticationState.coursesOfMembership
            .filter(courseOfMembership =>
                courseOfMembership.course.courseUserName === routeParams.courseUserName).length > 0
            ) {
                route = Routes.courseFront.replace(":courseUserName", routeParams.courseUserName);
            } else if (uniCourse) {
                route = Routes.courseFront.replace(":courseUserName", uniCourse.course.courseUserName);
            }
            } else if (uniCourse) {
                route = Routes.courseFront.replace(":courseUserName", uniCourse.course.courseUserName);
            }
        }

        if (!route) {
            return Routes.nonCourseFront;
        }

            return route;
        }

    /**
     * Construct sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructSignInRoute = (routeParams: any) => {
        if (routeParams.groupUserName) {
            return Routes.groupSignIn.replace(":groupUserName", routeParams.groupUserName);
        } else {
            return Routes.nonGroupSignIn;
        }
    }

    /**
     * Construct student sign in route (navigate to Sign course in page)
     *
     * @param routeParams
     */
    public static constructStudentSignInRoute = (routeParams: any) => {
        if (routeParams.courseUserName) {
            return Routes.courseSignIn.replace(":courseUserName", routeParams.courseUserName);
        } else {
            return Routes.nonGroupSignIn;
        }
    }

    /**
     * Construct sign up route + with a default value of IW group
     *
     * @param groupUserName
     * @param invitedUserID
     */
    public static constructSignUpRoute = (groupUserName: string, invitedUserID?: string) => {
        if (groupUserName) {
            return Routes.groupSignUp
                .replace(":groupUserName", groupUserName)
                .replace(invitedUserID ? ":id?" : "/:id?", invitedUserID ?? "");
        } else {
            return Routes.nonGroupSignUp;
        }
    }

    /**
     * Construct student sign up route + with a default value of IW group
     *
     * @param courseUserName
     * @param invitedStudentID
     */
    public static constructStudentSignUpRoute = (courseUserName: string, invitedStudentID?: string) => {
        if (courseUserName) {
            return Routes.courseSignUp
                .replace(":courseUserName", courseUserName)
                .replace(invitedStudentID ? ":id?" : "/:id?", invitedStudentID ?? "");
        } else {
            return Routes.nonGroupSignUp;
        }
    }

    /**
     * Construct sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructContactUsRoute = (routeParams: any) => {
        if (routeParams.groupUserName) {
            return Routes.groupContactUs.replace(":groupUserName", routeParams.groupUserName);
        } else {
            return Routes.nonGroupContactUs;
        }
    }

    /**
     * Construct student sign in route (navigate to Sign in page)
     *
     * @param routeParams
     */
    public static constructStudentContactUsRoute = (routeParams: any) => {
        if (routeParams.courseUserName) {
            return Routes.courseContactUs.replace(":courseUserName", routeParams.courseUserName);
        } else {
            return Routes.nonCourseContactUs;
        }
    }


    /**
     * Construct dashboard route (navigate to Dashboard page)
     *
     * @param routeParams
     * @param ManageGroupUrlState
     * @param AuthenticationState
     */
    public static constructDashboardRoute = (routeParams: any, ManageGroupUrlState: ManageGroupUrlState,
                                             AuthenticationState: AuthenticationState) => {
        let route: string = "";

        if (!AuthenticationState.currentUser) {
            return Routes.constructSignInRoute(routeParams);
        }

        const currentAdmin: Admin | null = isAdmin(AuthenticationState.currentUser);
        // an admin MUST use the correct sign in page to sign in
        if (currentAdmin) {
            // current admin is a super admin
            // --> redirect to super admin dashboard
            if (currentAdmin.superAdmin) {
                route = Routes.nonGroupAdminDashboard;
            }
                // current admin is not a super admin
            // --> redirect to group admin dashboard
            else {
                if (AuthenticationState.groupsOfMembership.length === 1) {
                    const adminGroup: GroupOfMembership = AuthenticationState.groupsOfMembership[0];
                    route = Routes.groupAdminDashboard.replace(":groupUserName", adminGroup.group.groupUserName);
                }
            }
        }
            // an investor or an issuer can use any sign in page (group sign in page) to sign in,
        // except the Invest West sign in page (with no group parameter) as it is reserved for the super admins only
        else {
            const homeGroup: GroupOfMembership | null = getHomeGroup(AuthenticationState.groupsOfMembership);
            if (routeParams.groupUserName) {
                if (AuthenticationState.groupsOfMembership
                    .filter(groupOfMembership =>
                        groupOfMembership.group.groupUserName === routeParams.groupUserName).length > 0
                ) {
                    if (isInvestor(AuthenticationState.currentUser as User)) {
                        route = Routes.groupInvestorDashboard.replace(":groupUserName", routeParams.groupUserName);
                    } else {
                        route = Routes.groupIssuerDashboard.replace(":groupUserName", routeParams.groupUserName);
                    }
                } else if (homeGroup) {
                    if (isInvestor(AuthenticationState.currentUser as User)) {
                        route = Routes.groupInvestorDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                    } else {
                        route = Routes.groupIssuerDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                    }
                }
            } else if (homeGroup) {
                if (isInvestor(AuthenticationState.currentUser as User)) {
                    route = Routes.groupInvestorDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                } else {
                    route = Routes.groupIssuerDashboard.replace(":groupUserName", homeGroup.group.groupUserName);
                }
            }
        }

        if (route === "") {
            return Routes.constructSignInRoute(routeParams);
        }
        route += "?tab=Home";
        return route;
    }

    /**
     * Construct student dashboard route (navigate to Dashboard page)
     *
     * @param routeParams
     * @param ManageCourseUrlState
     * @param StudentAuthenticationState
     */
    public static constructStudentDashboardRoute = (routeParams: any, ManageCourseUrlState: ManageCourseUrlState,
                                             StudentAuthenticationState: StudentAuthenticationState) => {
        let route: string = "";

        if (!StudentAuthenticationState.currentStudent) {
            return Routes.constructSignInRoute(routeParams);
        }

        const currentTeacher: Teacher | null = isProf(StudentAuthenticationState.currentStudent);
        // an teacher MUST use the correct sign in page to sign in
        if (currentTeacher) {
            // current teacher is a super teacher
            // --> redirect to super teacher dashboard
            if (currentTeacher.superTeacher) {
                route = Routes.nonCourseTeacherDashboard;
            }
                // current teacher is not a super teacher
            // --> redirect to course teacher dashboard
            else {
                if (StudentAuthenticationState.coursesOfMembership.length === 1) {
                    const teacherCourse: CourseOfMembership = StudentAuthenticationState.coursesOfMembership[0];
                    route = Routes.courseTeacherDashboard.replace(":courseUserName", teacherCourse.course.courseUserName);
                }
            }
        }
            // an investor or an issuer can use any sign in page (course sign in page) to sign in,
        // except the student sign in page (with no course parameter) as it is reserved for the super admins only
        else {
            const uniCourse: CourseOfMembership | null = getHomeCourse(StudentAuthenticationState.coursesOfMembership);
            if (routeParams.courseUserName) {
                if (StudentAuthenticationState.coursesOfMembership
                    .filter(courseOfMembership =>
                        courseOfMembership.course.courseUserName === routeParams.courseUserName).length > 0
                ) {
                    if (isStudent(StudentAuthenticationState.currentStudent as Student)) {
                        route = Routes.courseStudentDashboard.replace(":courseUserName", routeParams.courseUserName);
                    } else {
                        route = Routes.courseTeacherDashboard.replace(":courseUserName", routeParams.courseUserName);
                    }
                } else if (uniCourse) {
                    if (isStudent(StudentAuthenticationState.currentStudent as Student)) {
                        route = Routes.courseStudentDashboard.replace(":courseUserName", uniCourse.course.courseUserName);
                    } else {
                        route = Routes.courseTeacherDashboard.replace(":courseUserName", uniCourse.course.courseUserName);
                    }
                }
            } else if (uniCourse) {
                if (isStudent(StudentAuthenticationState.currentStudent as Student)) {
                    route = Routes.courseStudentDashboard.replace(":courseUserName", uniCourse.course.courseUserName);
                } else {
                    route = Routes.courseTeacherDashboard.replace(":courseUserName", uniCourse.course.courseUserName);
                }
            }
        }

        if (route === "") {
            return Routes.constructStudentSignInRoute(routeParams);
        }
        route += "?tab=Home";
        return route;
    }

    /**
     * Construct view project (offer) route
     *
     * @param groupUserName
     * @param projectID
     */
    public static constructProjectDetailRoute = (groupUserName: string | null, projectID: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewOffer.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupViewOffer;
        }
        route = route.replace(":projectID", projectID);
        return route;
    }

    /**
     * Construct view student project (offer) route
     *
     * @param courseUserName
     * @param studentProjectID
     */
    public static constructStudentProjectDetailRoute = (courseUserName: string | null, studentProjectID: string) => {
        let route;
        if (courseUserName) {
            route = Routes.courseViewOffer.replace(":courseUserName", courseUserName);
        } else {
            route = Routes.nonGroupViewOffer;
        }
        route = route.replace(":studentProjectID", studentProjectID);
        return route;
    }

    /**
     * Construct create project (offer) route
     *
     * @param groupUserName
     * @param params
     */
    public static constructCreateProjectRoute = (groupUserName: string | null, params?: CreateProjectRouteParams) => {
        let route;
        if (groupUserName) {
            route = Routes.groupCreateOffer.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupCreateOffer;
        }

        if (params !== undefined) {
            // edit an offer
            if (params.edit) {
                route += `?edit=${params.edit}`;
            }
            // group admin creates an offer on behalf of an issuer
            else if (params.admin && params.issuer) {
                route += `?admin=${params.admin}&issuer=${params.issuer}`;
            }
        }

        return route;
    }

    /**
     * Construct create student project (offer) route
     *
     * @param courseUserName
     * @param params
     */
    public static constructCreateStudentProjectRoute = (courseUserName: string | null, params?: CreateStudentProjectRouteParams) => {
        let route;
        if (courseUserName) {
            route = Routes.courseCreateOffer.replace(":courseUserName", courseUserName);
        } else {
            route = Routes.nonCourseCreateOffer;
        }

        if (params !== undefined) {
            // edit an offer
            if (params.edit) {
                route += `?edit=${params.edit}`;
            }
            // course admin creates an offer on behalf of an issuer
            else if (params.teacher && params.studentOffer) {
                route += `?teacher=${params.teacher}&student=${params.studentOffer}`;
            }
        }

        return route;
    }

    /**
     * Construct view group route
     *
     * @param groupUserName
     * @param viewedGroupUserName
     */
    public static constructGroupDetailRoute = (groupUserName: string | null, viewedGroupUserName: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewGroup.replace(":groupUserName", groupUserName);
        } else {
            route = Routes.nonGroupViewGroup;
        }
        route = route.replace(":viewedGroupUserName", viewedGroupUserName);
        return route;
    }

    /**
     * Construct student view course route
     *
     * @param courseUserName
     * @param viewedCourseStudentName
     */
    public static constructCourseDetailRoute = (courseUserName: string | null, viewedCourseStudentName: string) => {
        let route;
        if (courseUserName) {
            route = Routes.courseViewCourse.replace(":courseUserName", courseUserName);
        } else {
            route = Routes.nonCourseViewCourse;
        }
        route = route.replace(":viewedCourseStudentName", viewedCourseStudentName);
        return route;
    }

    /**
     * Construct view resource detail route
     *
     * @param groupUserName
     * @param resourceName
     */
    public static constructViewResourceDetailRoute = (groupUserName: string | null, resourceName: string) => {
        let route;
        if (groupUserName) {
            route = Routes.groupViewResourceDetail
                .replace(":groupUserName", groupUserName)
                .replace(":resourceName", resourceName);
        } else {
            route = Routes.nonGroupViewResourceDetail.replace(":resourceName", resourceName);
        }
        return route;
    }

    /**
     * Construct student view resource detail route
     *
     * @param courseUserName
     * @param resourceName
     */
    public static constructStudentViewResourceDetailRoute = (courseUserName: string | null, resourceName: string) => {
        let route;
        if (courseUserName) {
            route = Routes.courseViewResourceDetail
                .replace(":courseUserName", courseUserName)
                .replace(":resourceName", resourceName);
        } else {
            route = Routes.nonGroupViewResourceDetail.replace(":resourceName", resourceName);
        }
        return route;
    }
}


//------------------- OLD ROUTES ---------------------------------------------------------------------------------------
export const ORIGINAL_WEB_URL = "https://investwest.online";

// angel network path INCLUDING Invest West angel network
export const GROUP_PATH = "/groups/:groupUserName";

// network path for Courses
export const COURSE_PATH = "/courses/:courseName";

// front with angel network logo
export const FRONT = GROUP_PATH;

// front with student new logo
export const FRONT_STUDENT = COURSE_PATH;

// front with Invest West page --> Only for Invest West super admins
export const FRONT_INVEST_WEST_SUPER = "/";

// front with Student only for default
export const FRONT_STUDENT_DEFAULT = "/";

// sign in with angel network logo --> only allow admins and users belong to this angel network to login
export const SIGN_IN = `${GROUP_PATH}/signin`;
// sign in with Invest West logo --> only allow Invest West super admins to login
export const SIGN_IN_INVEST_WEST_SUPER = "/signin";

// sign in with Student logo --> only allow students to login
export const SIGN_IN_STUDENT = `${COURSE_PATH}/signin`;

// sign in with Student logo --> only allow students super admins to login
export const SIGN_IN_STUDENT_SUPER = "/signin";

// admin dashboard of an angel network --> only allow admins of the angel network to interact
export const ADMIN = `${GROUP_PATH}/admin`;
// issuer dashboard of Invest West --> only allow Invest West super admins to interact
export const ADMIN_INVEST_WEST_SUPER = "/admin";

// Teacher dashboard only allow admins
export const TEACHER = `${COURSE_PATH}/teacher`;
// Teacher dashboard only allow admins
export const TEACHER_STUDENT_SUPER = "/teacher";

// issuer dashboard of an angel network --> only allow issuers of the angel network to interact
export const DASHBOARD_ISSUER = `${GROUP_PATH}/dashboard/issuer`;
// issuer dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_ISSUER_INVEST_WEST_SUPER = "/dashboard/issuer";

// student dashboard of an angel network --> only allow students of the angel network to interact
export const DASHBOARD_STUDENT = `${COURSE_PATH}/dashboard/student`;
// student dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_STUDENT_INVEST_WEST_SUPER = "/dashboard/student";

// investor dashboard of an angel network --> only allow investors of the angel network to interact
export const DASHBOARD_INVESTOR = `${GROUP_PATH}/dashboard/investor`;
// investor dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_INVESTOR_INVEST_WEST_SUPER = "/dashboard/investor";

// student viewer dashboard of an angel network --> only allow students of the angel network to interact
export const DASHBOARD_STUDENT_VIEWER = `${COURSE_PATH}/dashboard/student-viewer`;
// student viewer dashboard of Invest West --> only allow Invest West super admins to interact
export const DASHBOARD_STUDENT_VIEWER_INVEST_WEST_SUPER = "/dashboard/student-viewer";

// sign up page for an angel network --> only users who have been invited by this angel network can see
export const SIGN_UP = `${GROUP_PATH}/signup/:id`;
// sign up page for Invest West --> only Invest West super admins can interact
export const SIGN_UP_INVEST_WEST_SUPER = "/signup/:id";

// sign up page for a student --> only students can interact
export const SIGN_UP_STUDENT = `${COURSE_PATH}/signup/:id`;
// sign up page for a student --> only students super admins can interact
export const SIGN_UP_STUDENT_SUPER = "/signup/:id";

// view a user's profile while logged in under an angel network
export const USER_PROFILE = `${GROUP_PATH}/view-profile/:userID`;
// view a user's profile while logged in under Invest West super admins
export const USER_PROFILE_INVEST_WEST_SUPER = "/view-profile/:userID";

// view a student's profile while not logged in
export const STUDENT_PROFILE = `${COURSE_PATH}/view-profile/:userID`;
// view a student's profile while not logged in
export const STUDENT_PROFILE_STUDENT_SUPER = "/view-profile/:userID";

// edit a user's profile for group admins
export const EDIT_USER_PROFILE = `${GROUP_PATH}/edit-profile/:userID`;
// edit a user's profile for super admins
export const EDIT_USER_PROFILE_INVEST_WEST_SUPER = "/edit-profile/:userID";

// edit a student's profile for group admins
export const EDIT_STUDENT_PROFILE = `${COURSE_PATH}/edit-profile/:userID`;
// edit a student's profile for super admins
export const EDIT_STUDENT_PROFILE_STUDENT_SUPER = "/edit-profile/:userID";

// pledge under an angel network
export const PLEDGE = `${GROUP_PATH}/pledge`;
// pledge under Invest West Invest West super admins
export const PLEDGE_INVEST_WEST_SUPER = "/pledge";

//  pledge under a course
export const PLEDGE_STUDENT = `${COURSE_PATH}/pledge`;
//  pledge under a course
export const PLEDGE_STUDENT_SUPER = "/pledge";

// create an offer under an angel network
export const CREATE_OFFER = `${GROUP_PATH}/create-offer`;
export const EDIT_OFFER = `${CREATE_OFFER}?edit=:projectID`;
export const GROUP_ADMIN_CREATE_OFFER_ON_BEHALF_OF_ISSUER = `${CREATE_OFFER}?admin=:adminID&issuer=:issuerID`;
// create an offer under Invest West super admins
export const CREATE_OFFER_INVEST_WEST_SUPER = "/create-offer";
export const EDIT_OFFER_INVEST_WEST_SUPER = `${CREATE_OFFER_INVEST_WEST_SUPER}?edit=:projectID`;

// create an offer under a course
export const CREATE_OFFER_STUDENT = `${COURSE_PATH}/create-offer`;
export const EDIT_OFFER_STUDENT = `${CREATE_OFFER_STUDENT}?edit=:studentProjectID`;
export const COURSE_TEACHER_CREATE_OFFER_ON_BEHALF_OF_TEACHER = `${CREATE_OFFER_STUDENT}?teacher=:teacherID&teacher=:teacherID`;
// create an offer under Invest West super admins
export const CREATE_OFFER_STUDENT_SUPER = "/create-offer";
export const EDIT_OFFER_STUDENT_SUPER = `${CREATE_OFFER_STUDENT_SUPER}?edit=:projectID`;

// view offer's details under an angel network
export const PROJECT_DETAILS = `${GROUP_PATH}/projects/:projectID`;
// view offer's details under Invest West super admins
export const PROJECT_DETAILS_INVEST_WEST_SUPER = "/projects/:projectID";

export const STUDENT_PROJECT_DETAILS = `${COURSE_PATH}/projects/:studentProjectID`;

export const STUDENT_PROJECT_DETAILS_INVEST_WEST_SUPER = "/projects/:studentProjectID";

// view offer's details under a course
export const PROJECT_COURSE_DETAILS = `${COURSE_PATH}/projects/:projectID`;
// view offer's details under a course admins
export const PROJECT_COURSE_DETAILS_STUDENT_SUPER = "/projects/:projectID";

export const VIEW_GROUP_DETAILS = `${GROUP_PATH}/view-group-details/:groupID`;
export const VIEW_GROUP_DETAILS_INVEST_WEST_SUPER = "/view-group-details/:groupID";

// view resource details under an course
export const VIEW_COURSE_DETAILS = `${COURSE_PATH}/view-course-details/:courseID`;
export const VIEW_COURSE_DETAILS_STUDENT_SUPER = "/view-course-details/:courseID";

export const CONTACT_US = `${GROUP_PATH}/contact-us`;
export const CONTACT_US_INVEST_WEST_SUPER = "/contact-us";

export const CONTACT_US_2 = `${GROUP_PATH}/contact-us-2`;
export const CONTACT_US_INVEST_WEST_SUPER_2 = "/contact-us-2";

export const CONTACT_US_STUDENT = `${COURSE_PATH}/contact-us`;
export const CONTACT_US_STUDENT_SUPER = "/contact-us";

export const HELP = `${GROUP_PATH}/help`;
export const HELP_INVEST_WEST_SUPER = "/help";

export const TERMS_OF_USE = "/terms-of-use";
export const PRIVACY_POLICY = "/privacy-policy";
export const RISK_WARNING = "/risk-warning-footer";
export const CREATE_PITCH_TERMS_AND_CONDITIONS = "/create-project-terms-and-conditions";
export const CREATE_STUDENT_PROJECT_TERMS_AND_CONDITIONS = "/create-student-project-terms-and-conditions";
export const ABOUT_US = "/about-us";
export const MARKETING_PREFERENCES = "/marketing-preferences";

export const ERROR_404 = "/error/404";