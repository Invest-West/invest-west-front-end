import * as DB_CONST from "../firebase/databaseConsts";
import {
    FILE_TYPE_IMAGE,
    FILE_TYPE_VIDEO,
    STUDENT_PROJECT_VISIBILITY_PRIVATE,
    STUDENT_PROJECT_VISIBILITY_PUBLIC,
    STUDENT_PROJECT_VISIBILITY_RESTRICTED
} from "../firebase/databaseConsts";
import StudentProjectAgreement from "./create_pitch_agreement";
import GroupProperties from "./group_properties";
import Student, {isStudent} from "./student";
import Pledge from "./pledge";
import Teacher, {isProf} from "./teacher";
import CourseOfMembership from "./course_of_membership";

/**
 * Project interface
 */
export default interface StudentProject {
    id: string;
    anid: string;
    teacherID: string;
    visibility: number;
    status: number;
    studentProjectName?: string; // optional for draft projects only
    description?: string; // optional for draft projects only
    subject?: string; // optional for draft projects only
    edited?: number;
    temporarilyClosed?: boolean;

    /**
     * This field contains the studnet id of the group admin who
     * - created the project on their own
     *      --> [teacherID] = studnet id of the group admin as well
     *
     * - created the project on behalf of an issuer
     *      --> [teacherID] = studnet id of the issuer whom the group admin created the project for
     */
    createdByGroupAdmin?: string;

    Pitch: StudentProjectPitch;
    PrimaryOffer?: StudentProjectPledge;
}

/**
 * Instance of project at load time that contains extra information from other collections
 */
export interface StudentProjectInstance {
    studentProjectDetail: StudentProject;
    group: GroupProperties;
    Teacher: Student | Teacher;
    pledges: Pledge[];
    studentRejectFeedbacks: StudentProjectRejectFeedback[];
    agreement: StudentProjectAgreement | null;
}

/**
 * An interface that specifies the format of a project in csv
 */
export interface StudentProjectCsv {
    visibility: "public" | "restricted" | "private";
    projectName: string | undefined;
    description: string | undefined;
    sector: string | undefined;
    postedDate: number | undefined; // = pitch postedDate

    investorsCommitted: string | undefined; // = pitch investorsCommitted
    coverURL: string | undefined; // = active pitch cover
    mainDocument: string | undefined; // = active pitch presentationDocument
    mainText: string | undefined; // = pitch presentationPlainText
    supportingDocuments: string | undefined; // = active pitch supportingDocuments

    pitchExpiryDate: string | undefined; // = pitch expiredDate

    // this field is only available for QIB group

    agreedToShareRaisePublicly?: "yes" | "no" | undefined;
}

/**
 * Project - pitch interface
 */
export interface StudentProjectPitch {
    postedDate: number;
    status: number;
    expiredDate?: number;
    cover?: PitchCover[];
    investorsCommitted?: string;
    presentationDocument?: PitchDocument[];
    supportingDocuments?: PitchDocument[];
    presentationText?: any;
    presentationPlainText?: string; // a text-only version of the presentationText which is a Quill object
}


/**
 * Project - pledge interface
 */
export interface StudentProjectPledge {
    expiredDate: number;
    status: number;
    extraNotes?: string;
    postMoneyValuation?: number;
}

/**
 * Project reject feedback
 */
export interface StudentProjectRejectFeedback {
    projectID: string;
    sentBy: string;
    date: number;
    feedback: string;
}

/**
 * Project - pitch cover interface
 */
export interface PitchCover {
    fileExtension: string;
    fileType: number;
    storageID: number;
    url: string;
    removed?: boolean;
}

/**
 * Project - pitch document interface
 */
export interface PitchDocument {
    fileName: string;
    readableSize: string;
    storageID: number;
    downloadURL: string;
    removed?: boolean;
}

/**
 * Check if a project is live
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectLive = (studentProject: StudentProject) => {
    return isStudentProjectInLivePitchPhase(studentProject) || isStudentProjectInLivePledgePhase(studentProject);
};

/**
 * Check if a project is a draft
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentDraftProject = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_DRAFT;
};

/**
 * Check if a draft project to submitted to the group admin for review
 *
 * @param studentProject
 */
export const isDraftStudentProjectNotSubmitted = (studentProject: StudentProject) => {
    return isStudentDraftProject(studentProject) && studentProject.Pitch.status === DB_CONST.STUDENT_PROJECT_STATUS_DRAFT;
}

/**
 * Check if a project is waiting to go live
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectWaitingToGoLive = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_BEING_CHECKED;
};

/**
 * Check if a project is rejected to go live
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectRejectedToGoLive = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_REJECTED;
};

/**
 * Check if a project is in live pitch phase
 *
 * @param project
 * @returns {boolean}
 */
export const isStudentProjectInLivePitchPhase = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PITCH_PHASE
        && studentProject.Pitch.status === DB_CONST.STUDENT_PITCH_STATUS_ON_GOING;
};

/**
 * Check if the pitch has expired and waiting for admin to make decision
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectPitchExpiredWaitingForAdminToCheck = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
        && studentProject.Pitch.status === DB_CONST.STUDENT_PITCH_STATUS_WAITING_FOR_ADMIN;
};

/**
 * Check if a project has been moved to pledge phase and waiting for the pledge page to be created
 *
 * @param studentProject
 * @returns {boolean|boolean}
 */
export const isStudentProjectWaitingForPledgeToBeCreated = (studentProject: StudentProject) => {
    return (studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
            && studentProject.Pitch.status === DB_CONST.STUDENT_PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        )
        || (
            studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PITCH_PHASE
            && studentProject.Pitch.status === DB_CONST.STUDENT_PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        );
}

/**
 * Check if a project's pledge is waiting to be checked
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectWaitingForPledgeToBeChecked = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED;
}

/**
 * Check if a project is in live pledge phase
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectInLivePledgePhase = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_PRIMARY_OFFER_PHASE;
};

/**
 * Check if a project has ended with at least 1 pledge
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectSuccessful = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_SUCCESSFUL;
};

/**
 * Check if a project has ended with no pledges
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectFailed = (studentProject: StudentProject) => {
    return studentProject.status === DB_CONST.STUDENT_PROJECT_STATUS_FAILED;
};

/**
 * Check if a project is temporarily closed
 *
 * @param studentProject
 * @returns {boolean}
 */
export const isStudentProjectTemporarilyClosed = (studentProject: StudentProject) => {
    return studentProject.temporarilyClosed !== undefined && studentProject.temporarilyClosed;
};

/**
 * Check if a project has reject feedbacks
 *
 * @param StudentProjectInstance
 */
export const doesStudentProjectHaveRejectFeedbacks = (StudentProjectInstance: StudentProjectInstance) => {
    return StudentProjectInstance.studentRejectFeedbacks.length > 0;
}

/**
 * Check if a project is created by an admin
 *
 * @param studentProject
 */
export const isStudentProjectCreatedByGroupTeacher = (studentProject: StudentProject) => {
    return studentProject.createdByGroupAdmin !== undefined && studentProject.createdByGroupAdmin !== null;
}

/**
 * Set a project to draft
 *
 * @param studentProject
 */
export const setStudentProjectToDraft = (studentProject: StudentProject): StudentProject => {
    studentProject.Pitch.status = DB_CONST.STUDENT_PITCH_STATUS_ON_GOING;
    studentProject.status = DB_CONST.STUDENT_PROJECT_STATUS_DRAFT;
    return studentProject;
}

export const getPitchCover = (studentProject: StudentProject) => {
    if (studentProject.Pitch.cover === undefined) {
        return null;
    }
    const index = studentProject.Pitch.cover.findIndex(cover => cover.removed === undefined || !cover.removed);
    if (index === -1) {
        return null;
    }
    return studentProject.Pitch.cover[index];
}

export const isImagePitchCover = (pitchCover: PitchCover) => {
    return pitchCover.fileType === FILE_TYPE_IMAGE;
}

export const isVideoPitchCover = (pitchCover: PitchCover) => {
    return pitchCover.fileType === FILE_TYPE_VIDEO;
}

export const isStudentProjectPublic = (studentProject: StudentProject) => {
    return studentProject.visibility === STUDENT_PROJECT_VISIBILITY_PUBLIC;
}

export const isStudentProjectRestricted = (studentProject: StudentProject) => {
    return studentProject.visibility === STUDENT_PROJECT_VISIBILITY_RESTRICTED;
}

export const isStudentProjectPrivate = (studentProject: StudentProject) => {
    return studentProject.visibility === STUDENT_PROJECT_VISIBILITY_PRIVATE;
}

/**
 * Should hide project information from a studnet
 *
 * --> true: hide
 * --> false: not hide
 *
 * @param studnet
 * @param coursesOfMembership
 * @param studentProject
 */
export const shouldHideProjectInformationFromStudent = (studnet: Student | Teacher, coursesOfMembership: CourseOfMembership[], studentProject: StudentProject) => {
    const teacher: Teacher | null = isProf(studnet);
    // studnet is an teacher
    if (teacher) {
        // studnet is a super teacher
        if (teacher.superTeacher) {
            return false;
        }

        // studnet is a group teacher and is the group that owns the project
        if (teacher.anid === studentProject.anid) {
            return false;
        }

        // other group teachers must go through the checks of project's visibility
        switch (studentProject.visibility) {
            case STUDENT_PROJECT_VISIBILITY_PUBLIC:
                return false;
            case STUDENT_PROJECT_VISIBILITY_RESTRICTED:
                return true;
            case STUDENT_PROJECT_VISIBILITY_PRIVATE:
                return true;
            default:
                return true;
        }
    }
    // studnet is not an teacher
    else {
        // should not hide any information if the studnet is an issuer that created this offer
        if (isStudent(studnet) && studnet.id === studentProject.teacherID) {
            return false;
        }

        // studnet is a member of the course that owns this offer
        if (coursesOfMembership.findIndex(courseOfMembership => courseOfMembership.course.anid === studentProject.anid) !== -1) {
            return false;
        }

        // other course admins must go through the checks of project's visibility
        switch (studentProject.visibility) {
            case STUDENT_PROJECT_VISIBILITY_PUBLIC:
                return false;
            case STUDENT_PROJECT_VISIBILITY_RESTRICTED:
                return true;
            case STUDENT_PROJECT_VISIBILITY_PRIVATE:
                return true;
            default:
                return true;
        }
    }
}

/**
 * Check if a studnet is the owner of a project
 *
 * @param studnet
 * @param studentProject
 */
export const isProjectOwner = (studnet: Student | Teacher, studentProject: StudentProject) => {
    const teacher: Teacher | null = isProf(studnet);
    // super admin does not own a project
    if (teacher && teacher.superTeacher) {
        return false;
    }

    if (teacher) {
        return teacher.anid === studentProject.anid;
    } else {
        return studnet.id === studentProject.teacherID;
    }
}