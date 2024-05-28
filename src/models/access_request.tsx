/**
 * Access request interface
 *
 * --> User requests to access a group
 */
import User from "./user";
import GroupProperties from "./group_properties";
import Student from "./student";
import CourseProperties from "./course_properties";

export default interface AccessRequest {
    id: string;
    userID: string;
    groupToJoin: string;
    requestedDate: number;
}

export default interface AccessStudentRequest {
    id: string;
    studentID: string;
    courseToJoin: string;
    requestedDate: number;
}

export interface AccessRequestInstance {
    request: AccessRequest;
    user: User;
    group: GroupProperties;
}

export interface AccessStudentRequestInstance {
    request: AccessRequest;
    student: Student;
    course: CourseProperties;
}