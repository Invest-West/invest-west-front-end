import Student, {StudentProfileImage, StudentProfileVideo} from "../../models/student";
import Api, {ApiRoutes} from "../Api";

export interface UpdateStudentData {
    updatedStudent: Student;
    newProfilePicture?: StudentProfileImage;
    newLogo?: StudentProfileImage;
    newVideo?: StudentProfileVideo;
    removeProfilePicture?: true;
}

export interface StudentSignUpData {
    isPublicRegistration: boolean;
    invitedStudentID?: string;
    studentProfile: Partial<Student>;
    password: string;
    courseID: string;
    acceptMarketingPreferences: boolean;
}

    export default class StudentRepository {

    /**
     * Sign up
     *
     * @param data
     */
    public async signUp(data: StudentSignUpData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createStudent,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * Retrieve student
     *
     * @param uid
     */
    public async retrieveStudent(uid: string) {
        return await new Api().request("get",
            ApiRoutes.retrieveStudent.replace(":uid", uid));
    }

    /**
     * Retrieve invited student
     *
     * @param invitedStudentID
     */
    public async retrieveInvitedStudent(invitedStudentID: string) {
        return await new Api().request("get",
            ApiRoutes.retrieveInvitedStudent.replace(":invitedStudentID", invitedStudentID));
    }

    /**
     * Update student
     *
     * @param data
     */
    public async updateStudent(data: UpdateStudentData) {
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateStudent,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }

    /**
     * List courses of membership
     *
     * @param uid
     */
    public async listCoursesOfMembership(uid: string) {
        return await new Api().request("get",
            ApiRoutes.listCoursesOfMembership.replace(":uid", uid));
    }
}