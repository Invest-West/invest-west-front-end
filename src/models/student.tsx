/**
 * Student interface
 *
 * "none" means this user profile doesn't actually exist
 */
import {TYPE_STUDENT, TYPE_TEACHER} from "../firebase/databaseConsts";
import Teacher from "./teacher";
import Address from "./address";

export const StudentTitles = ["Ms.", "Mrs.", "Miss", "Mr.", "Dr.", "Prof."];

export default interface Student {
    id: string | "none";
    email: string;
    linkedin?: string;
    firstName: string | "none";
    lastName: string | "none";
    title: string | "none";
    discover: string | "none";
    profilePicture?: StudentProfileImage[];
    uniCourseProfile?: uniCourseProfile;
    type: number;
}

export interface uniCourseProfile {
    uniCourse: string;
    degree: string;
    registrationNo: string;
    sector: string;
    tradingAddress: Address;
    logo: StudentProfileImage[];
    video?: StudentProfileVideo[];
}

export interface StudentProfileImage {
    storageID: number;
    url: string;
    removed?: boolean;
}

export interface StudentProfileVideo {
    storageID: number;
    dateUploaded: number;
    url: string;
    removed?: boolean;
}

export const isStudent = (student: Student | Teacher) => {
    return student.type === TYPE_STUDENT;
}

export const isTeacher = (student: Student | Teacher) => {
    return student.type === TYPE_TEACHER;
}

export const hasuniCourseProfile = (student: Student) => {
    return student.uniCourseProfile !== undefined;
}

/*
export const isTradingAddressSameAsRegisteredOffice = (student: Student) => {
    return student.uniCourseProfile?.registeredOffice.postcode === student.uniCourseProfile?.tradingAddress.postcode
        && student.uniCourseProfile?.registeredOffice.address1 === student.uniCourseProfile?.tradingAddress.address1
        && student.uniCourseProfile?.registeredOffice.townCity === student.uniCourseProfile?.tradingAddress.townCity
}

*/

export const getStudentProfilePicture = (student: Student): string | null => {
    if (!student.profilePicture) {
        return null;
    }

    const index: number = student.profilePicture.findIndex((profilePicture: StudentProfileImage) =>
        profilePicture.removed === undefined);

    if (index === -1) {
        return null;
    }
    return student.profilePicture[index].url;
}