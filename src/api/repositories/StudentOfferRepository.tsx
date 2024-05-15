import Api, {ApiRoutes} from "../Api";

export enum FetchStudentProjectsOrderByOptions {
    Visibility = "visibility",
    Course = "course",
    Student = "student",
    Teacher = "Teacher",
    Sector = "sector",
    Phase = "phase"
}

export enum FetchStudentProjectsPhaseOptions {
    Any = "Any",
    Live = "Live",
    TemporarilyClosed = "TemporarilyClosed",
    Successful = "Successful",
    Failed = "Failed",
    LivePitch = "LivePitch",
    ExpiredPitch = "ExpiredPitch"
}

export interface FetchStudentProjectsOptions {
    search?: string; // filter projects by either name, course name, or issuer company name
    name?: string; // filter projects by name
    visibility?: number | "all"; // filter projects by their visibility: PRIVATE, RESTRICTED, or PUBLIC
    course?: string | "all"; // filter projects by course id
    courseName?: string; // filter projects by course name
    investor?: string | "all"; // filter projects by investor id
    issuer?: string | "all"; // filter projects by issuer id
    issuerCompanyName?: string; // filter projects by issuer company name
    sector?: string | "all"; // filter projects by sector
    phase?: string | number | "all"; // filter projects by status
    orderBy?: FetchStudentProjectsOrderByOptions; // mode to use orderByChild
}

export default class StudentOfferRepository {

    /**
     * Fetch offers
     *
     * @param options
     */
    public async fetchStudentOffers(options: FetchStudentProjectsOptions) {
        //console.log("Fetching offers with options:", options);
        const fetchOptions = { ...options, orderBy: options.orderBy || FetchStudentProjectsOrderByOptions.Phase };
        try {
            const response = await new Api().request(
                "get",
                ApiRoutes.listProjectsRoute,
                {
                    requestBody: null,
                    queryParameters: fetchOptions
                }
            );
            //console.log("API response:", response);
            return response;
        } catch (error) {
            //console.error("Error fetching offers:", error);
            throw error;
        }
    }

    /**
     * Export to csv
     *
     * @param options
     */
    public async exportCsv(options?: FetchStudentProjectsOptions) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const response = await new Api()
                    .request(
                        "get",
                        ApiRoutes.exportProjectsToCsvRoute,
                        {
                            requestBody: null,
                            queryParameters: options ?? null
                        }
                    );

                // create a file from the csv returned by the server
                const blob = new Blob([response.data], {type: "text/csv;charset=utf-8;"});
                const link = document.createElement("a");
                if (link.download !== undefined) {
                    // create a download url
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", "offers_data.csv");
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                return resolve();
            } catch (error) {
                return reject(error);
            }
        });
    }
}