import Api, {ApiRoutes} from "../Api";

export enum ClientEmailTypes {
    EnquiryEmail,
    InvitationEmail,
    PitchPublished,
    NewPitchSubmitted,
    ContactResource,
    ContactPitchTeacher
}

export interface EmailData {
    emailType: number;
    emailInfo: EmailInfo;
}

export interface EmailInfo {
    receiver: string | string[];
    sender?: string;

    [others: string]: any;
}

export interface StudentInvitationEmailData extends EmailInfo {
    courseName: string;
    courseLogo: string;
    courseWebsite: string;
    courseContactUs: string;
    studentType: string;
    studentSignupURL: string;
}

export interface EnquiryEmailData extends EmailInfo {
    isAuthenticatedRequest: boolean;
    subject: string;
    description: string;
    senderName: string;
    senderPhone: string;
}

export interface PitchPublishedEmailData extends EmailInfo {
    projectID: string;
}

export interface NewPitchSubmittedEmailData extends EmailInfo {
    projectID: string;
}

export interface ContactResourceEmailData extends EmailInfo {
    userName: string;
    userCompanyName?: string;
}

export interface ContactPitchTeacherEmailData extends EmailInfo {
    studentName: string;
    studentProjectName: string;
}

export interface ContactPitchTeacherEmailData extends EmailInfo {
    studentName: string;
    studentProjectName: string;
}

export default class StudentEmailRepository {

    /**
     * Send email
     *
     * @param data
     */
    public async sendEmail(data: EmailData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.sendEmailRoute,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }
}