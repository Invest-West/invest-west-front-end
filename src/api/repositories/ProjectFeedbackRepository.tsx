import Api, {ApiRoutes} from "../Api";
import {ProjectRejectFeedback} from "../../models/project";

/**
 * Options for resubmitting a project
 */
export interface ResubmitProjectOptions {
    projectID: string;
    addressedFeedbackIds: string[];
}

/**
 * Options for updating feedback status
 */
export interface UpdateFeedbackOptions {
    projectID: string;
    feedbackID: string;
    status: 'addressed' | 'resolved';
    adminResponse?: string;
}

/**
 * Repository for project feedback operations
 */
export default class ProjectFeedbackRepository {

    /**
     * Fetch all feedbacks for a project
     *
     * @param projectID The project ID to fetch feedbacks for
     */
    public async fetchFeedbacks(projectID: string): Promise<ProjectRejectFeedback[]> {
        const route = ApiRoutes.projectFeedbacksRoute.replace(":projectID", projectID);
        try {
            const response = await new Api().request(
                "get",
                route,
                {
                    requestBody: null,
                    queryParameters: null
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Resubmit a project for approval
     *
     * @param options Resubmit options including project ID and addressed feedback IDs
     */
    public async resubmitProject(options: ResubmitProjectOptions): Promise<void> {
        const route = ApiRoutes.projectResubmitRoute.replace(":projectID", options.projectID);
        try {
            await new Api().request(
                "post",
                route,
                {
                    requestBody: {
                        addressedFeedbackIds: options.addressedFeedbackIds
                    },
                    queryParameters: null
                }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update feedback status
     *
     * @param options Update options including project ID, feedback ID, status, and optional admin response
     */
    public async updateFeedbackStatus(options: UpdateFeedbackOptions): Promise<void> {
        const route = ApiRoutes.updateProjectFeedbackRoute
            .replace(":projectID", options.projectID)
            .replace(":feedbackID", options.feedbackID);
        try {
            await new Api().request(
                "put",
                route,
                {
                    requestBody: {
                        status: options.status,
                        adminResponse: options.adminResponse
                    },
                    queryParameters: null
                }
            );
        } catch (error) {
            throw error;
        }
    }
}
