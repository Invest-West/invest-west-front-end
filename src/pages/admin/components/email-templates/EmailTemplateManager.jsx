import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
    CircularProgress,
    Box,
    Paper,
    IconButton,
    Tooltip
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';
import RefreshIcon from '@material-ui/icons/Refresh';
import Editor from '@monaco-editor/react';
import Handlebars from 'handlebars';
import * as emailTemplateActions from '../../../../redux-store/actions/emailTemplateActions';
import { StyleSheet, css } from 'aphrodite';

// Email template info - defines available templates and their variables
const EMAIL_TEMPLATE_INFO = {
    'enquiry': {
        name: 'Enquiry Email',
        variables: ['senderEmail', 'senderName', 'senderPhone', 'subject', 'description']
    },
    'user-invitation': {
        name: 'User Invitation',
        variables: ['groupName', 'groupLogo', 'groupWebsite', 'groupContactUs', 'userName', 'userType', 'signupURL']
    },
    'pitch-published': {
        name: 'Pitch Published',
        variables: ['projectName', 'projectUrl', 'groupName', 'groupLogo']
    },
    'new-pitch-submitted': {
        name: 'New Pitch Submitted',
        variables: ['projectUrl', 'groupName', 'groupLogo']
    },
    'project-feedback': {
        name: 'Project Feedback',
        variables: ['project', 'feedback', 'groupName', 'groupLogo']
    },
    'welcome-user': {
        name: 'Welcome User',
        variables: ['userName', 'groupName', 'groupLogo', 'groupWebsite', 'groupContactUs', 'signInURL']
    },
    'reset-password': {
        name: 'Reset Password',
        variables: ['resetPasswordLink']
    },
    'super-admin-invitation': {
        name: 'Super Admin Invitation',
        variables: ['groupName', 'groupLogo', 'email', 'password', 'website']
    },
    'group-admin-invitation': {
        name: 'Group Admin Invitation',
        variables: ['groupName', 'groupLogo', 'email', 'password', 'website']
    },
    'contact-resource': {
        name: 'Contact Resource',
        variables: ['userName', 'userCompanyName', 'message', 'senderName', 'senderEmail']
    },
    'contact-pitch-owner': {
        name: 'Contact Pitch Owner',
        variables: ['userName', 'projectName', 'message', 'senderName', 'senderEmail']
    }
};

class EmailTemplateManager extends Component {
    state = {
        selectedTemplate: null,
        editDialogOpen: false,
        testDialogOpen: false,
        previewHtml: '',
        testEmail: '',
        testData: {},
        saving: false,
        testing: false,
        seeding: false
    };

    componentDidMount() {
        this.props.loadEmailTemplates();
        this.props.loadTemplateInfo();
    }

    handleTemplateSelect = (template) => {
        this.setState({
            selectedTemplate: { ...template },
            editDialogOpen: true
        });
        this.updatePreview(template.htmlTemplate, this.getSampleData(template.slug));
    };

    handleCreateTemplate = (slug) => {
        const info = EMAIL_TEMPLATE_INFO[slug];
        const newTemplate = {
            name: info.name,
            slug,
            subject: '',
            htmlTemplate: this.getDefaultTemplateHtml(info.name),
            description: '',
            variables: info.variables,
            isActive: true
        };
        this.setState({
            selectedTemplate: newTemplate,
            editDialogOpen: true
        });
        this.updatePreview(newTemplate.htmlTemplate, this.getSampleData(slug));
    };

    getDefaultTemplateHtml = (name) => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .content { padding: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px 0; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${name}</h1>
        </div>
        <div class="content">
            <p>Your email content goes here.</p>
            <p>Use {{variableName}} syntax for dynamic content.</p>
        </div>
        <div class="footer">
            <p>This is an automated message.</p>
        </div>
    </div>
</body>
</html>`;
    };

    getSampleData = (slug) => {
        const info = EMAIL_TEMPLATE_INFO[slug];
        if (!info) return {};

        const sampleData = {};
        info.variables.forEach(v => {
            sampleData[v] = `[${v}]`;
        });
        return sampleData;
    };

    updatePreview = (htmlTemplate, data) => {
        try {
            const compiled = Handlebars.compile(htmlTemplate || '');
            this.setState({ previewHtml: compiled(data) });
        } catch (error) {
            this.setState({ previewHtml: '<p style="color: red;">Error rendering preview: ' + error.message + '</p>' });
        }
    };

    handleTemplateChange = (field, value) => {
        const { selectedTemplate } = this.state;
        const updatedTemplate = { ...selectedTemplate, [field]: value };
        this.setState({ selectedTemplate: updatedTemplate });

        if (field === 'htmlTemplate') {
            this.updatePreview(value, this.getSampleData(selectedTemplate.slug));
        }
    };

    handleSave = async () => {
        const { selectedTemplate } = this.state;
        this.setState({ saving: true });

        const result = await this.props.saveEmailTemplate(selectedTemplate);

        this.setState({ saving: false });

        if (result.success) {
            this.setState({ editDialogOpen: false });
        } else {
            alert('Failed to save template: ' + (result.error || 'Unknown error'));
        }
    };

    handleOpenTestDialog = (template) => {
        this.setState({
            selectedTemplate: template,
            testDialogOpen: true,
            testEmail: '',
            testData: this.getSampleData(template.slug)
        });
    };

    handleSendTest = async () => {
        const { selectedTemplate, testEmail, testData } = this.state;

        if (!testEmail) {
            alert('Please enter a test email address');
            return;
        }

        this.setState({ testing: true });

        const result = await this.props.sendTestEmail(
            selectedTemplate.slug,
            testEmail,
            testData
        );

        this.setState({ testing: false });

        if (result.success) {
            alert('Test email sent successfully!');
            this.setState({ testDialogOpen: false });
        } else {
            alert('Failed to send test email: ' + (result.error || 'Unknown error'));
        }
    };

    handleSeedTemplates = async () => {
        if (!window.confirm('This will create default templates for any missing template types. Continue?')) {
            return;
        }

        this.setState({ seeding: true });

        const result = await this.props.seedDefaultTemplates();

        this.setState({ seeding: false });

        if (result.success) {
            alert(`Successfully created ${result.count} default templates`);
        } else {
            alert('Failed to seed templates: ' + (result.error || 'Unknown error'));
        }
    };

    render() {
        const { templates, loading } = this.props;
        const {
            selectedTemplate,
            editDialogOpen,
            testDialogOpen,
            previewHtml,
            testEmail,
            testData,
            saving,
            testing,
            seeding
        } = this.state;

        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                    <CircularProgress />
                    <Typography style={{ marginLeft: 16 }}>Loading templates...</Typography>
                </Box>
            );
        }

        return (
            <div className={css(styles.container)}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">Email Templates</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => this.props.loadEmailTemplates()}
                            style={{ marginRight: 10 }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleSeedTemplates}
                            disabled={seeding}
                        >
                            {seeding ? 'Seeding...' : 'Seed Default Templates'}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {Object.entries(EMAIL_TEMPLATE_INFO).map(([slug, info]) => {
                        const template = templates.find(t => t.slug === slug);
                        return (
                            <Grid item xs={12} md={6} key={slug}>
                                <Paper className={css(styles.templateCard)}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <div>
                                            <Typography variant="h6">{info.name}</Typography>
                                            <Chip
                                                label={template ? (template.isActive ? 'Active' : 'Inactive') : 'Not Created'}
                                                color={template?.isActive ? 'primary' : 'default'}
                                                size="small"
                                                className={css(styles.statusChip)}
                                            />
                                        </div>
                                        <div>
                                            {template ? (
                                                <>
                                                    <Tooltip title="Edit Template">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => this.handleTemplateSelect(template)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Send Test Email">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => this.handleOpenTestDialog(template)}
                                                        >
                                                            <SendIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => this.handleCreateTemplate(slug)}
                                                >
                                                    Create
                                                </Button>
                                            )}
                                        </div>
                                    </Box>
                                    <Typography variant="body2" color="textSecondary" className={css(styles.variablesList)}>
                                        Variables: {info.variables.join(', ')}
                                    </Typography>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Edit Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => this.setState({ editDialogOpen: false })}
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogTitle>{selectedTemplate?.name || 'Edit Template'}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Subject Line"
                                    fullWidth
                                    value={selectedTemplate?.subject || ''}
                                    onChange={(e) => this.handleTemplateChange('subject', e.target.value)}
                                    helperText="Use {{variableName}} for dynamic content"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={selectedTemplate?.isActive ?? true}
                                            onChange={(e) => this.handleTemplateChange('isActive', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Template Active"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={selectedTemplate?.description || ''}
                                    onChange={(e) => this.handleTemplateChange('description', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Available variables: {selectedTemplate?.variables?.join(', ') || 'None'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>HTML Template</Typography>
                                <div className={css(styles.editorContainer)}>
                                    <Editor
                                        height="400px"
                                        language="html"
                                        value={selectedTemplate?.htmlTemplate || ''}
                                        onChange={(value) => this.handleTemplateChange('htmlTemplate', value)}
                                        options={{
                                            minimap: { enabled: false },
                                            wordWrap: 'on',
                                            fontSize: 12
                                        }}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                                <Paper className={css(styles.previewContainer)}>
                                    <iframe
                                        title="Email Preview"
                                        srcDoc={previewHtml}
                                        className={css(styles.previewIframe)}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ editDialogOpen: false })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={this.handleSave}
                            color="primary"
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Template'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Test Email Dialog */}
                <Dialog
                    open={testDialogOpen}
                    onClose={() => this.setState({ testDialogOpen: false })}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Send Test Email - {selectedTemplate?.name}</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Test Email Address"
                            fullWidth
                            value={testEmail}
                            onChange={(e) => this.setState({ testEmail: e.target.value })}
                            margin="normal"
                            placeholder="Enter email address to receive test"
                        />
                        <Typography variant="subtitle2" style={{ marginTop: 16 }} gutterBottom>
                            Test Data (JSON)
                        </Typography>
                        <div className={css(styles.testDataEditor)}>
                            <Editor
                                height="200px"
                                language="json"
                                value={JSON.stringify(testData, null, 2)}
                                onChange={(value) => {
                                    try {
                                        this.setState({ testData: JSON.parse(value) });
                                    } catch (e) {
                                        // Ignore parse errors while typing
                                    }
                                }}
                                options={{
                                    minimap: { enabled: false },
                                    wordWrap: 'on',
                                    fontSize: 12
                                }}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ testDialogOpen: false })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={this.handleSendTest}
                            color="primary"
                            variant="contained"
                            disabled={testing || !testEmail}
                        >
                            {testing ? 'Sending...' : 'Send Test Email'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    templateCard: {
        padding: 16,
        height: '100%'
    },
    statusChip: {
        marginTop: 8
    },
    variablesList: {
        marginTop: 12,
        fontSize: 12
    },
    editorContainer: {
        border: '1px solid #ccc',
        borderRadius: 4
    },
    previewContainer: {
        height: 400,
        overflow: 'hidden',
        border: '1px solid #ccc'
    },
    previewIframe: {
        width: '100%',
        height: '100%',
        border: 'none'
    },
    testDataEditor: {
        border: '1px solid #ccc',
        borderRadius: 4
    }
});

const mapStateToProps = (state) => ({
    templates: state.emailTemplates.templates,
    loading: state.emailTemplates.loading,
    templateInfo: state.emailTemplates.templateInfo
});

const mapDispatchToProps = {
    loadEmailTemplates: emailTemplateActions.loadEmailTemplates,
    saveEmailTemplate: emailTemplateActions.saveEmailTemplate,
    sendTestEmail: emailTemplateActions.sendTestEmail,
    seedDefaultTemplates: emailTemplateActions.seedDefaultTemplates,
    loadTemplateInfo: emailTemplateActions.loadTemplateInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateManager);
