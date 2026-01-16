import * as emailTemplateActions from '../actions/emailTemplateActions';

const initState = {
    templates: [],
    settings: null,
    loading: false,
    settingsLoading: false,
    error: null,
    connectionStatus: null,
    templateInfo: {
        slugs: {},
        variables: {},
        names: {}
    }
};

const emailTemplateReducer = (state = initState, action) => {
    switch (action.type) {
        case emailTemplateActions.EMAIL_TEMPLATES_LOADING:
            return {
                ...state,
                loading: true,
                error: null
            };

        case emailTemplateActions.EMAIL_TEMPLATES_LOADED:
            return {
                ...state,
                loading: false,
                templates: action.templates,
                error: null
            };

        case emailTemplateActions.EMAIL_TEMPLATES_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };

        case emailTemplateActions.EMAIL_TEMPLATE_SAVED:
            // Check if template already exists
            const existingIndex = state.templates.findIndex(t => t.id === action.template.id);
            let updatedTemplates;

            if (existingIndex >= 0) {
                // Update existing template
                updatedTemplates = state.templates.map((t, index) =>
                    index === existingIndex ? action.template : t
                );
            } else {
                // Add new template
                updatedTemplates = [...state.templates, action.template];
            }

            return {
                ...state,
                templates: updatedTemplates
            };

        case emailTemplateActions.EMAIL_TEMPLATE_DELETED:
            return {
                ...state,
                templates: state.templates.filter(t => t.id !== action.templateId)
            };

        case emailTemplateActions.EMAIL_SETTINGS_LOADING:
            return {
                ...state,
                settingsLoading: true
            };

        case emailTemplateActions.EMAIL_SETTINGS_LOADED:
            return {
                ...state,
                settingsLoading: false,
                settings: action.settings
            };

        case emailTemplateActions.EMAIL_SETTINGS_SAVED:
            return {
                ...state,
                settings: action.settings
            };

        case emailTemplateActions.EMAIL_CONNECTION_TESTED:
            return {
                ...state,
                connectionStatus: action.connected
            };

        case emailTemplateActions.EMAIL_TEMPLATE_INFO_LOADED:
            return {
                ...state,
                templateInfo: {
                    slugs: action.slugs,
                    variables: action.variables,
                    names: action.names
                }
            };

        case emailTemplateActions.EMAIL_TEMPLATES_SEEDED:
            // Templates will be reloaded by the action creator
            return state;

        default:
            return state;
    }
};

export default emailTemplateReducer;
