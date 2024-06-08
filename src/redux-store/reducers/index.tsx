import {combineReducers} from "redux";
import authReducer from './authReducer';
import createBusinessProfileReducer from './createBusinessProfileReducer';
import editUserReducer from './editUserReducer';
import editStudentReducer from "./editStudentReducer";
import editImageReducer from './editImageReducer';
import editVideoReducer from './editVideoReducer';
import uploadFilesReducer from './uploadFilesReducer';
import uploadingStatusReducer from './uploadingStatusReducer';
import changePasswordReducer from './changePasswordReducer';
import clubAttributesReducer from './clubAttributesReducer';
import forumsReducer from './forumsReducer';
import notificationsReducer from './notificationsReducer';
import dashboardSidebarReducer from './dashboardSidebarReducer';
import mediaQueryReducer, {MediaQueryState} from './mediaQueryReducer';
import superAdminSettingsReducer from './superAdminSettingsReducer';
import superTeacherSettingsReducer from "./superTeacherSettingsReducer";
import groupAdminSettingsReducer from './groupAdminSettingsReducer';
import courseTeacherSettingsReducer from "./courseTeacherSettingsReducer";
import legalDocumentsReducer from './legalDocumentsReducer';
import invitedUsersReducer from './invitedUsersReducer';
import invitedStudentsReducer from "./invitedStudentReducer";
import invitationDialogReducer from './invitationDialogReducer';
import addAngelNetworkDialogReducer from './addAngelNetworkDialogReducer';
import manageGroupFromParamsReducer from './manageGroupFromParamsReducer';
import manageCourseFromParamsReducer from "./manageCourseFromParamsReducer";
import investorSelfCertificationAgreementsReducer from './investorSelfCertificationAgreementsReducer';
import angelNetworksReducer from './angelNetworksReducer';
import studentNetworksReducer from "./studentNetworksReducer";
import manageJoinRequestsReducer from './manageJoinRequestsReducer';
import pledgesTableReducer from './pledgesTableReducer';
import feedbackSnackbarReducer from './feedbackSnackbarReducer';
import activitiesTableReducer from './activitiesTableReducer';
import manageJSONCompareChangesDialogReducer from './manageJSONCompareChangesDialogReducer';
import groupAdminsTableReducer from './groupAdminsTableReducer';
import courseTeachersTableReducer from "./courseTeachersTableReducer";
import createPledgeDialogReducer from './createPledgeDialogReducer';
import selectProjectVisibilityReducer from './selectProjectVisiblityReducer';
import manageSystemGroupsReducer from './manageSystemGroupsReducer';
import manageSystemCoursesReducer from './manageSystemCoursesReducer';
import manageMarketingPreferencesReducer from './manageMarketingPreferencesReducer';
import createProjectReducer from './createProjectReducer';
import createStudentProjectReducer from "./createStudentProjectReducer";
import manageGroupUrlReducer, {ManageGroupUrlState} from "./manageGroupUrlReducer";
import manageCourseUrlReducer, {ManageCourseUrlState} from "./manageCourseUrlReducer";
import signInReducer, {SignInState} from "../../pages/signin/SignInReducer";
import studentSignInReducer, {StudentSignInState} from "../../pages/signin/studentSignIn/StudentSignInReducer";
import authenticationReducer, {AuthenticationState} from "./authenticationReducer";
import studentAuthenticationReducer, {StudentAuthenticationState} from "./studentAuthenticationReducer";
import manageSystemAttributesReducer, {ManageSystemAttributesState} from "./manageSystemAttributesReducer";
import exploreOffersReducer, {ExploreOffersState} from "../../shared-components/explore-offers/ExploreOffersReducer";
import offersTableReducer, {OffersTableStates} from "../../shared-components/offers-table/OffersTableReducer";
import {ExploreGroupsState} from "../../shared-components/explore-groups/ExploreGroupsReducer";
import {ExploreCoursesState} from "../../shared-components/explore-courses/ExploreCoursesReducer";
import newExploreGroupsReducer from "../../shared-components/explore-groups/ExploreGroupsReducer";
import newExploreCoursesReducer from "../../shared-components/explore-courses/ExploreCoursesReducer";
import groupDetailsReducer, {GroupDetailsState} from "../../pages/group-details/GroupDetailsReducer";
import courseDetailsReducer, {CourseDetailsState} from "../../pages/course-details/CourseDetailsReducer";
import manageSystemIdleTimeReducer, {ManageSystemIdleTimeState} from "./manageSystemIdleTimeReducer";
import resetPasswordReducer, {ResetPasswordState} from "../../pages/reset-password/ResetPasswordReducer";
import resourcesReducer, {ResourcesState} from "../../pages/resources/ResourcesReducer";
import feedbackSnackbarReducerNew, {FeedbackSnackbarState} from "../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import documentsDownloadReducer, {DocumentsDownloadState} from "../../shared-components/documents-download/DocumentsDownloadReducer";
import contactPitchOwnerDialogReducer, {ContactPitchOwnerDialogState} from "../../pages/project-details/components/contact-pitch-owner-dialog/ContactPitchOwnerDialogReducer";
import contactPitchTeacherDialogReducer, {ContactPitchTeacherDialogState} from "../../pages/student-project-details/components/contact-pitch-owner-dialog/ContactPitchTeacherDialogReducer";
import profileReducer, {ProfileState} from "../../shared-components/profile/ProfileReducer";
import studentProfileReducer, {StudentProfileState} from "../../shared-components/student-profile/StudentProfileReducer";
import signUpReducer, {SignUpState} from "../../pages/signup/SignUpReducer";
import studentSignUpReducer, {StudentSignUpState} from "../../pages/signup/StudentSignup/StudentSignUpReducer";
import manageSectorsReducer, {ManageSectorsState} from "../../pages/admin/components/manage-sectors/ManageSectorsReducer";

export interface AppState {
    MediaQueryState: MediaQueryState;
    ManageSystemIdleTimeState: ManageSystemIdleTimeState;
    ManageGroupUrlState: ManageGroupUrlState;
    ManageCourseUrlState: ManageCourseUrlState;
    AuthenticationState: AuthenticationState;
    ManageSystemAttributesState: ManageSystemAttributesState;

    StudentAuthenticationState: StudentAuthenticationState;

    SignInLocalState: SignInState;
    StudentInLocalState: StudentSignInState;
    SignUpLocalState: SignUpState;
    StudentSignUpLocalState: StudentSignUpState;
    ExploreOffersLocalState: ExploreOffersState;
    OffersTableLocalState: OffersTableStates;
    ExploreGroupsLocalState: ExploreGroupsState;
    ExploreCoursesLocalState: ExploreCoursesState;
    GroupDetailsLocalState: GroupDetailsState;
    CourseDetailsLocalState: CourseDetailsState;
    ResetPasswordLocalState: ResetPasswordState;
    ResourcesLocalState: ResourcesState;

    FeedbackSnackbarLocalState: FeedbackSnackbarState;
    DocumentsDownloadLocalState: DocumentsDownloadState;
    ContactPitchOwnerDialogLocalState: ContactPitchOwnerDialogState;

    ContactPitchTeacherDialogLocalState: ContactPitchTeacherDialogState;

    ManageSectorsLocalState: ManageSectorsState;

    ProfileLocalState: ProfileState;

    StudentLocalState: StudentProfileState;

    // mitigation plan for the old states of old reducers
    [oldReducers: string]: any;
}

const rootReducer = combineReducers<AppState>({
    MediaQueryState: mediaQueryReducer,
    ManageSystemIdleTimeState: manageSystemIdleTimeReducer,
    ManageGroupUrlState: manageGroupUrlReducer,
    ManageCourseUrlState: manageCourseUrlReducer,
    AuthenticationState: authenticationReducer,
    ManageSystemAttributesState: manageSystemAttributesReducer,

    StudentAuthenticationState: studentAuthenticationReducer,

    SignInLocalState: signInReducer,
    StudentInLocalState: studentSignInReducer,
    StudentSignUpLocalState: studentSignUpReducer,
    SignUpLocalState: signUpReducer,
    ExploreOffersLocalState: exploreOffersReducer,
    OffersTableLocalState: offersTableReducer,
    ExploreGroupsLocalState: newExploreGroupsReducer,
    ExploreCoursesLocalState: newExploreCoursesReducer,
    GroupDetailsLocalState: groupDetailsReducer,
    CourseDetailsLocalState: courseDetailsReducer,
    ResetPasswordLocalState: resetPasswordReducer,
    ResourcesLocalState: resourcesReducer,

    FeedbackSnackbarLocalState: feedbackSnackbarReducerNew,
    DocumentsDownloadLocalState: documentsDownloadReducer,
    ContactPitchOwnerDialogLocalState: contactPitchOwnerDialogReducer,

    ContactPitchTeacherDialogLocalState: contactPitchTeacherDialogReducer,

    ManageSectorsLocalState: manageSectorsReducer,

    ProfileLocalState: profileReducer,

    StudentLocalState: studentProfileReducer,

    // Old reducers --------------------------
    auth: authReducer,
    createBusinessProfile: createBusinessProfileReducer,
    editUser: editUserReducer,
    editStudent: editStudentReducer,
    editImage: editImageReducer,
    editVideo: editVideoReducer,
    uploadFiles: uploadFilesReducer,
    uploadingStatus: uploadingStatusReducer,
    changePassword: changePasswordReducer,
    manageClubAttributes: clubAttributesReducer,
    manageForums: forumsReducer,
    manageNotifications: notificationsReducer,
    dashboardSidebar: dashboardSidebarReducer,
    superAdminSettings: superAdminSettingsReducer,
    superTeacherSettings: superTeacherSettingsReducer,
    groupAdminSettings: groupAdminSettingsReducer,
    courseTeacherSettings: courseTeacherSettingsReducer,
    legalDocuments: legalDocumentsReducer,
    invitedUsers: invitedUsersReducer,
    invitedStudents: invitedStudentsReducer,
    manageInvitationDialog: invitationDialogReducer,
    manageAddAngelNetworkDialog: addAngelNetworkDialogReducer,
    manageGroupFromParams: manageGroupFromParamsReducer,
    manageCourseFromParams: manageCourseFromParamsReducer,
    manageInvestorSelfCertificationAgreement: investorSelfCertificationAgreementsReducer,
    manageAngelNetworks: angelNetworksReducer,
    manageStudentNetworks: studentNetworksReducer,
    manageJoinRequests: manageJoinRequestsReducer,
    managePledgesTable: pledgesTableReducer,
    manageFeedbackSnackbar: feedbackSnackbarReducer,
    manageActivitiesTable: activitiesTableReducer,
    manageJSONCompareChangesDialog: manageJSONCompareChangesDialogReducer,
    manageGroupAdminsTable: groupAdminsTableReducer,
    manageCourseTeachersTable: courseTeachersTableReducer,
    manageCreatePledgeDialog: createPledgeDialogReducer,
    manageSelectProjectVisibility: selectProjectVisibilityReducer,
    manageSystemGroups: manageSystemGroupsReducer,
    manageSystemCourses: manageSystemCoursesReducer,
    manageMarketingPreferences: manageMarketingPreferencesReducer,
    manageCreateProject: createProjectReducer,
    manageCreateStudentProject: createStudentProjectReducer,
});

export default rootReducer;