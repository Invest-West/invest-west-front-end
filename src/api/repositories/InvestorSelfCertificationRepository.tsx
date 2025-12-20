import Api, {ApiRoutes} from "../Api";

export interface CreateSelfCertificationParams {
    userID: string;
    agreedDate: string;
    type: number;
    selfCertificationTimestamp?: number;
}

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

    /**
     * Create or update investor self certification
     *
     * @param params
     */
    public async createInvestorSelfCertification(params: CreateSelfCertificationParams) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.createInvestorSelfCertificationRoute,
                {
                    requestBody: {
                        userID: params.userID,
                        agreedDate: params.agreedDate,
                        type: params.type,
                        selfCertificationTimestamp: params.selfCertificationTimestamp || Date.now()
                    },
                    queryParameters: null
                }
            );
    }
}