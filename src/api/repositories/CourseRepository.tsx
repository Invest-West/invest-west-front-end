import Api, {ApiRoutes} from "../Api";

export interface FetchCoursesParams {
    courseIds?: string[];
    name?: string;
}

export default class CourseRepository {

    /**
     * Get course
     *
     * @param courseStudent
     */
    public async getCourse(courseStudent: string) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.retrieveCourse.replace(":courseStudent", courseStudent)
            );
    }

    /**
     * Fetch courses
     *
     * @param params
     */
    public async fetchCourses(params?: FetchCoursesParams) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listCourses,
                {
                    requestBody: null,
                    queryParameters: params
                }
            );
    }

    /**
     * Fetch course members
     *
     * @param courseID
     */
    public async fetchCourseMembers(courseID: string | "system") {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listCourseMembers.replace(":course", courseID)
            );
    }
}