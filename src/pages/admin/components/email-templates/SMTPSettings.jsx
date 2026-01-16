import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Card,
    CardContent,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
    Chip,
    Box,
    CircularProgress,
    Divider
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import * as emailTemplateActions from '../../../../redux-store/actions/emailTemplateActions';
import { StyleSheet, css } from 'aphrodite';

class SMTPSettings extends Component {
    state = {
        settings: {
            provider: 'custom',
            host: '',
            port: 587,
            secure: false,
            auth: {
                user: '',
                pass: ''
            },
            fromEmail: '',
            fromName: ''
        },
        testing: false,
        saving: false,
        hasChanges: false
    };

    componentDidMount() {
        this.props.loadEmailSettings();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.settings !== this.props.settings && this.props.settings) {
            this.setState({
                settings: { ...this.props.settings },
                hasChanges: false
            });
        }
    }

    handleProviderChange = (provider) => {
        const settings = { ...this.state.settings, provider };

        if (provider === 'google') {
            settings.host = 'smtp.gmail.com';
            settings.port = 587;
            settings.secure = false;
        }

        this.setState({ settings, hasChanges: true });
    };

    handleFieldChange = (field, value) => {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                [field]: value
            },
            hasChanges: true
        }));
    };

    handleAuthChange = (field, value) => {
        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                auth: {
                    ...prevState.settings.auth,
                    [field]: value
                }
            },
            hasChanges: true
        }));
    };

    handleSave = async () => {
        const { settings } = this.state;

        // Validation
        if (!settings.host || !settings.port || !settings.auth.user || !settings.fromEmail) {
            alert('Please fill in all required fields: Host, Port, Username, and From Email');
            return;
        }

        this.setState({ saving: true });

        const result = await this.props.saveEmailSettings(settings);

        this.setState({ saving: false });

        if (result.success) {
            this.setState({ hasChanges: false });
            alert('SMTP settings saved successfully!');
        } else {
            alert('Failed to save settings: ' + (result.error || 'Unknown error'));
        }
    };

    handleTestConnection = async () => {
        this.setState({ testing: true });

        const connected = await this.props.testEmailConnection();

        this.setState({ testing: false });

        if (connected) {
            alert('Connection successful! SMTP server is reachable.');
        } else {
            alert('Connection failed. Please check your SMTP settings.');
        }
    };

    render() {
        const { connectionStatus, settingsLoading } = this.props;
        const { settings, testing, saving, hasChanges } = this.state;

        if (settingsLoading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                    <CircularProgress size={24} />
                    <Typography style={{ marginLeft: 16 }}>Loading settings...</Typography>
                </Box>
            );
        }

        return (
            <Card className={css(styles.card)}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            SMTP Settings
                        </Typography>
                        {connectionStatus !== null && (
                            <Chip
                                icon={connectionStatus ? <CheckCircleIcon /> : <ErrorIcon />}
                                label={connectionStatus ? 'Connected' : 'Disconnected'}
                                color={connectionStatus ? 'primary' : 'secondary'}
                                size="small"
                            />
                        )}
                    </Box>

                    <Divider style={{ marginBottom: 20 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Provider</InputLabel>
                                <Select
                                    value={settings.provider}
                                    onChange={(e) => this.handleProviderChange(e.target.value)}
                                    label="Provider"
                                >
                                    <MenuItem value="google">Google SMTP (Gmail)</MenuItem>
                                    <MenuItem value="custom">Custom SMTP</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {settings.provider === 'google' && (
                            <Grid item xs={12}>
                                <Box className={css(styles.infoBox)}>
                                    <Typography variant="body2" color="textSecondary">
                                        For Google SMTP, you need to use an App Password instead of your regular Gmail password.
                                        This requires 2-Factor Authentication to be enabled on your Google account.
                                    </Typography>
                                    <Typography variant="body2" style={{ marginTop: 8 }}>
                                        <a
                                            href="https://support.google.com/accounts/answer/185833"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Learn how to create an App Password
                                        </a>
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={8}>
                            <TextField
                                label="SMTP Host"
                                fullWidth
                                variant="outlined"
                                value={settings.host}
                                onChange={(e) => this.handleFieldChange('host', e.target.value)}
                                disabled={settings.provider === 'google'}
                                required
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                label="Port"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={settings.port}
                                onChange={(e) => this.handleFieldChange('port', parseInt(e.target.value) || 587)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.secure}
                                        onChange={(e) => this.handleFieldChange('secure', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Use SSL/TLS (Secure Connection)"
                            />
                            <Typography variant="caption" color="textSecondary" display="block">
                                Usually disabled for port 587 (STARTTLS), enabled for port 465
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider style={{ margin: '10px 0' }} />
                            <Typography variant="subtitle2" gutterBottom>Authentication</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Username / Email"
                                fullWidth
                                variant="outlined"
                                value={settings.auth.user}
                                onChange={(e) => this.handleAuthChange('user', e.target.value)}
                                required
                                helperText="Usually your email address"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Password / App Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={settings.auth.pass}
                                onChange={(e) => this.handleAuthChange('pass', e.target.value)}
                                required
                                helperText={settings.provider === 'google' ? 'Use App Password, not your Google password' : 'SMTP password'}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider style={{ margin: '10px 0' }} />
                            <Typography variant="subtitle2" gutterBottom>Sender Information</Typography>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="From Email"
                                fullWidth
                                variant="outlined"
                                value={settings.fromEmail}
                                onChange={(e) => this.handleFieldChange('fromEmail', e.target.value)}
                                required
                                helperText="The email address that will appear as the sender"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="From Name"
                                fullWidth
                                variant="outlined"
                                value={settings.fromName}
                                onChange={(e) => this.handleFieldChange('fromName', e.target.value)}
                                helperText="The name that will appear as the sender (e.g., 'InvestWest Support')"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider style={{ margin: '10px 0 20px' }} />
                            <Box display="flex" gap={2}>
                                <Button
                                    variant="outlined"
                                    onClick={this.handleTestConnection}
                                    disabled={testing || !settings.host || !settings.auth.user}
                                >
                                    {testing ? (
                                        <>
                                            <CircularProgress size={16} style={{ marginRight: 8 }} />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test Connection'
                                    )}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.handleSave}
                                    disabled={saving || !hasChanges}
                                >
                                    {saving ? (
                                        <>
                                            <CircularProgress size={16} style={{ marginRight: 8 }} />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Settings'
                                    )}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 20
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 4,
        borderLeft: '4px solid #2196f3'
    }
});

const mapStateToProps = (state) => ({
    settings: state.emailTemplates.settings,
    settingsLoading: state.emailTemplates.settingsLoading,
    connectionStatus: state.emailTemplates.connectionStatus
});

const mapDispatchToProps = {
    loadEmailSettings: emailTemplateActions.loadEmailSettings,
    saveEmailSettings: emailTemplateActions.saveEmailSettings,
    testEmailConnection: emailTemplateActions.testEmailConnection
};

export default connect(mapStateToProps, mapDispatchToProps)(SMTPSettings);
