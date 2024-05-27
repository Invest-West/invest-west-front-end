import Api, {ApiRoutes} from "../Api";

export interface FetchAccessStudentRequestsOptions {
    student?: string;
    course?: string;
    orderBy: "student" | "course";
}

export default class AccessStudentRequestRepository {

    /**
     * Fetch access requests
     */
    public async fetchStudentAccessRequests(options?: FetchAccessStudentRequestsOptions) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listAccessRequestsRoute,
                {
                    requestBody: null,
                    queryParameters: options ?? null
                }
            );
    }

    /**
     * Create access request
     *
     * @param studentID
     * @param courseID
     */
    public async createAccessRequest(studentID: string, courseID: string) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        studentID,
                        courseID
                    }
                }
            );
    }

    /**
     * Remove access request
     *
     * @param requestID
     */
    public async removeAccessRequest(requestID: string) {
        return await new Api()
            .request(
                "delete",
                ApiRoutes.RemoveStudentAccessRequestRoute,
                {
                    queryParameters: null,
                    requestBody: {
                        requestID
                    }
                }
            );
    }
}