import Api, {ApiRoutes} from "../Api";

export interface FetchCoursesParams {
    groupIds?: string[];
    name?: string;
}

export default class GroupRepository {

    /**
     * Get group
     *
     * @param groupUserName
     */
    public async getGroup(groupUserName: string) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.retrieveGroup.replace(":groupUserName", groupUserName)
            );
    }

    /**
     * Fetch groups
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
     * Fetch group members
     *
     * @param groupID
     */
    public async fetchGroupMembers(groupID: string | "system") {
        return await new Api()
            .request(
                "get",
                ApiRoutes.listGroupMembers.replace(":group", groupID)
            );
    }
}