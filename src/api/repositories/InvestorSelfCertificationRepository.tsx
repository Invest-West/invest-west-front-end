import Api, {ApiRoutes} from "../Api";

export default class InvestorSelfCertificationRepository {

    /**
     * Get investor self certification
     *
     * @param userID
     */
    public async getInvestorSelfCertification(userID: string) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.retrieveInvestorSelfCertificationRoute,
                {
                    requestBody: null,
                    queryParameters: {
                        userID
                    }
                }
            );
    }
}