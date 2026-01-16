import Api, { ApiRoutes } from '../../api/Api';

// Action types
export const EMAIL_TEMPLATES_LOADING = 'EMAIL_TEMPLATES_LOADING';
export const EMAIL_TEMPLATES_LOADED = 'EMAIL_TEMPLATES_LOADED';
export const EMAIL_TEMPLATES_ERROR = 'EMAIL_TEMPLATES_ERROR';
export const EMAIL_TEMPLATE_SAVED = 'EMAIL_TEMPLATE_SAVED';
export const EMAIL_TEMPLATE_DELETED = 'EMAIL_TEMPLATE_DELETED';
export const EMAIL_SETTINGS_LOADING = 'EMAIL_SETTINGS_LOADING';
export const EMAIL_SETTINGS_LOADED = 'EMAIL_SETTINGS_LOADED';
export const EMAIL_SETTINGS_SAVED = 'EMAIL_SETTINGS_SAVED';
export const EMAIL_CONNECTION_TESTED = 'EMAIL_CONNECTION_TESTED';
export const EMAIL_TEMPLATE_INFO_LOADED = 'EMAIL_TEMPLATE_INFO_LOADED';
export const EMAIL_TEMPLATES_SEEDED = 'EMAIL_TEMPLATES_SEEDED';

/**
 * Load all email templates
 */
export const loadEmailTemplates = () => {
    return async (dispatch) => {
        dispatch({ type: EMAIL_TEMPLATES_LOADING });
        try {
            const response = await new Api().request('get', ApiRoutes.emailTemplatesRoute);
            dispatch({
                type: EMAIL_TEMPLATES_LOADED,
                templates: response.data.templates || []
            });
        } catch (error) {
            console.error('Error loading email templates:', error);
            dispatch({
                type: EMAIL_TEMPLATES_ERROR,
                error: error.message
            });
        }
    };
};

/**
 * Save (create or update) an email template
 */
export const saveEmailTemplate = (template) => {
    return async (dispatch) => {
        try {
            const response = await new Api().request('post', ApiRoutes.emailTemplatesRoute, {
                requestBody: template,
                queryParameters: null
            });
            dispatch({
                type: EMAIL_TEMPLATE_SAVED,
                template: response.data.template
            });
            return { success: true, template: response.data.template };
        } catch (error) {
            console.error('Error saving email template:', error);
            return { success: false, error: error.message };
        }
    };
};

/**
 * Delete an email template
 */
export const deleteEmailTemplate = (templateId) => {
    return async (dispatch) => {
        try {
            const route = ApiRoutes.emailTemplateByIdRoute.replace(':id', templateId);
            await new Api().request('delete', route);
            dispatch({
                type: EMAIL_TEMPLATE_DELETED,
                templateId
            });
            return { success: true };
        } catch (error) {
            console.error('Error deleting email template:', error);
            return { success: false, error: error.message };
        }
    };
};

/**
 * Load email SMTP settings
 */
export const loadEmailSettings = () => {
    return async (dispatch) => {
        dispatch({ type: EMAIL_SETTINGS_LOADING });
        try {
            const response = await new Api().request('get', ApiRoutes.emailSettingsRoute);
            dispatch({
                type: EMAIL_SETTINGS_LOADED,
                settings: response.data.settings
            });
        } catch (error) {
            console.error('Error loading email settings:', error);
            dispatch({
                type: EMAIL_SETTINGS_LOADED,
                settings: null
            });
        }
    };
};

/**
 * Save email SMTP settings
 */
export const saveEmailSettings = (settings) => {
    return async (dispatch) => {
        try {
            await new Api().request('post', ApiRoutes.emailSettingsRoute, {
                requestBody: settings,
                queryParameters: null
            });
            dispatch({
                type: EMAIL_SETTINGS_SAVED,
                settings
            });
            return { success: true };
        } catch (error) {
            console.error('Error saving email settings:', error);
            return { success: false, error: error.message };
        }
    };
};

/**
 * Test SMTP connection
 */
export const testEmailConnection = () => {
    return async (dispatch) => {
        try {
            const response = await new Api().request('post', ApiRoutes.emailTestConnectionRoute);
            dispatch({
                type: EMAIL_CONNECTION_TESTED,
                connected: response.data.connected
            });
            return response.data.connected;
        } catch (error) {
            console.error('Error testing email connection:', error);
            dispatch({
                type: EMAIL_CONNECTION_TESTED,
                connected: false
            });
            return false;
        }
    };
};

/**
 * Send a test email
 */
export const sendTestEmail = (templateSlug, testEmail, testData) => {
    return async () => {
        try {
            await new Api().request('post', ApiRoutes.emailSendTestRoute, {
                requestBody: { templateSlug, testEmail, testData },
                queryParameters: null
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending test email:', error);
            return { success: false, error: error.message };
        }
    };
};

/**
 * Seed default email templates
 */
export const seedDefaultTemplates = () => {
    return async (dispatch) => {
        try {
            const response = await new Api().request('post', ApiRoutes.emailSeedTemplatesRoute);
            dispatch({
                type: EMAIL_TEMPLATES_SEEDED,
                count: response.data.count
            });
            // Reload templates after seeding
            dispatch(loadEmailTemplates());
            return { success: true, count: response.data.count };
        } catch (error) {
            console.error('Error seeding email templates:', error);
            return { success: false, error: error.message };
        }
    };
};

/**
 * Load template info (slugs, variables, names)
 */
export const loadTemplateInfo = () => {
    return async (dispatch) => {
        try {
            const response = await new Api().request('get', ApiRoutes.emailTemplateInfoRoute);
            dispatch({
                type: EMAIL_TEMPLATE_INFO_LOADED,
                slugs: response.data.slugs,
                variables: response.data.variables,
                names: response.data.names
            });
        } catch (error) {
            console.error('Error loading template info:', error);
        }
    };
};
