/**
 * Admin interface
 */
import Student from "./student";

export default interface Teacher {
    id: string;
    anid: string;
    email: string;
    superTeacher: boolean;
    superCourseAdmin: boolean;
    type: number;
    isInvestWest: boolean;
    dateAdded?: number; // superAdmin doesn't have this field
}

/**
 * Check if a user is an admin
 *
 * @param student
 */
export const isProf = (student: Student | Teacher): Teacher | null => {
    if ("anid" in student) {
        return JSON.parse(JSON.stringify(student));
    }
    return null;
}