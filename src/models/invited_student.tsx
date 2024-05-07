/**
 * Invited user interface
 */
import Student from "./student";
import CourseProperties from "./course_properties";
import StudentProject from "./studentProject";
import CourseOfMembership from "./course_of_membership";
import Pledge from "./pledge";

export default interface InvitedStudent {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    discover: string;
    type: number;
    status: number;

    /**
     * id of the course that the user is in
     */
    invitedBy: string;

    /**
     * can be number (date in milliseconds) or string ("none")
     *
     * --> date (milliseconds):
     *      - indicates the date an unregistered user was invited by [invitedBy] group.
     *          --> [requestedToJoin] = false and [requestedToJoinDate] = "none"
     *
     *      - indicates the date an unregistered user used PUBLIC URL to registered to [invitedBy] group
     *          --> [requestedToJoin] = false and [requestedToJoinDate] = date in milliseconds
     *
     * --> "none": the user who requested to join the [invitedBy] group from their home group
     */
    invitedDate: number | "none";

    /**
     * this field only exists when the user is a registered user and [officialUserID] must map to a valid User profile
     */
    officialStudentID?: string;

    /**
     * the date the user joined a group either
     *
     * - by invitation (an unregistered user was invited by a group admin)
     *
     * - or by registering via the PUBLIC URL (an unregistered registered to group a group via its public url)
     *
     * - or by requesting to access (the user must send a request access which has to be accepted by the group admins)
     */
    joinedDate?: number;

    /**
     * can be true or false
     *
     * --> true: the user to requested to join a group from their home group
     *
     * --> false: the other cases specified above
     */
    requestedToJoin?: boolean;

    /**
     * can be number (date in milliseconds) or string ("none")
     *
     * --> date (milliseconds): the user to requested to join a group from their home group or registered to a group
     * via its PUBLIC URL
     *
     * --> "none": the user was invited to a group
     */
    requestedToJoinDate?: number | "none";
}

/**
 * Invited user with official profile
 */
export interface InvitedStudentWithProfile extends InvitedStudent {
    profile?: Student;
    uniGroup: CourseProperties;
    coursesOfMembership: CourseOfMembership[];
    offersCreated?: StudentProject[]; // for issuers
    pledges?: Pledge[]; // for investors
}

/**
 * An interface that specifies the format of a user in csv
 */
export interface InvitedStudentCsv {
    name: string; // student's official profile --> title + first name + last name
    email: string;
    eduType: "student" | "teacher";
    memberType: "home" | "platform";
    uniGroup?: string; // specified only when exporting to csv for super admins
    statusInUni: "unregistered" | "active"; // this list will be expanded more in the future
    joinedDate: string | undefined;
    offersCreated: string | "none" | "not applicable"; // none if the issuer has not created any offers, not applicable if the student is not an issuer
    pledges: number | "not applicable"; // number of pledges for investor, not applicable if the student is not an issuer
}

/**
 * Check if an invited user a home member in a group
 *
 * @param student
 */
export const isHomeStudent = (student: InvitedStudent | InvitedStudentWithProfile) => {
    // if either of these 2 fields is undefined, it means the invited student has been invited
    // by a group and not yet registered
    if (student.requestedToJoin === undefined || student.requestedToJoinDate === undefined) {
        return true;
    }

    // student was invited
    if (student.invitedDate !== "none" && !student.requestedToJoin && student.requestedToJoinDate === "none") {
        return true;
    }

    // student registered via the public url
    if (student.invitedDate !== "none" && !student.requestedToJoin && student.requestedToJoinDate !== "none") {
        return true;
    }

    // in other cases, the student is not a home member of the group
    return false;
}

/**
 * Check if an invited user has registered or not
 *
 * @param student
 */
export const hasRegistered = (student: InvitedStudent | InvitedStudentWithProfile) => {
    return student.officialStudentID !== undefined;
}