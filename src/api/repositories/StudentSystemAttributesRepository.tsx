import Api, {ApiRoutes} from "../Api";
import {StudentSystemAttributes} from "../../models/system_attributes";

export default class StudentSystemAttributesRepository {

    /**
     * Fetch system attributes
     */
    public async getStudentSystemAttributes() {
        return await new Api()
            .request("get", ApiRoutes.retrieveStudentSystemAttributesRoute);
    }

    /**
     * Update system attributes
     */
    public async updateStudentSystemAttributes(studentSystemAttributes: StudentSystemAttributes) {
        return await new Api()
            .request(
                "put",
                ApiRoutes.updateStudentSystemAttributesRoute,
                {
                    requestBody: studentSystemAttributes,
                    queryParameters: null
                }
            );
    }
}