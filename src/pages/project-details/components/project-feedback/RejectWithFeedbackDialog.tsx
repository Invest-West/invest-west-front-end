import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress
} from "@material-ui/core";
import {css, StyleSheet} from "aphrodite";
import Api, {ApiRoutes} from "../../../../api/Api";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import * as colors from "../../../../values/colors";

/**
 * Aphrodite styles
 */
const styles = StyleSheet.create({
    dialog_content: {
        paddingTop: 8
    },
    character_count: {
        textAlign: "right" as const,
        marginTop: 4,
        color: colors.gray_500
    }
});

/**
 * Component state interface
 */
interface RejectWithFeedbackDialogState {
    feedback: string;
    isSending: boolean;
}

/**
 * Props interface
 */
interface RejectWithFeedbackDialogProps {
    projectID: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;

    // Redux actions
    showSnackbar: (type: FeedbackSnackbarTypes, message: string) => void;
}

/**
 * Map dispatch to props
 */
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => ({
    showSnackbar: (type: FeedbackSnackbarTypes, message: string) =>
        dispatch(openFeedbackSnackbar(type, message))
});

/**
 * Maximum character limit for feedback
 */
const MAX_FEEDBACK_LENGTH = 2000;

/**
 * RejectWithFeedbackDialog Component
 *
 * Dialog for admins to send a project back to the issuer with feedback.
 * Requires feedback text before allowing submission.
 */
class RejectWithFeedbackDialog extends Component<RejectWithFeedbackDialogProps, RejectWithFeedbackDialogState> {

    state: RejectWithFeedbackDialogState = {
        feedback: "",
        isSending: false
    };

    handleFeedbackChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value.length <= MAX_FEEDBACK_LENGTH) {
            this.setState({feedback: value});
        }
    };

    handleSend = async () => {
        const {projectID, onClose, onSuccess, showSnackbar} = this.props;
        const {feedback} = this.state;

        if (feedback.trim().length === 0) {
            return;
        }

        this.setState({isSending: true});

        try {
            await new Api().request(
                "post",
                ApiRoutes.sendProjectBackToIssuerRoute,
                {
                    requestBody: {
                        projectID: projectID,
                        feedback: feedback
                    },
                    queryParameters: null
                }
            );

            showSnackbar(FeedbackSnackbarTypes.Success, "Project sent back to issuer with feedback.");
            this.setState({feedback: "", isSending: false});
            onClose();
            onSuccess();
        } catch (error) {
            showSnackbar(FeedbackSnackbarTypes.Error, "Failed to send feedback. Please try again.");
            this.setState({isSending: false});
        }
    };

    handleClose = () => {
        if (!this.state.isSending) {
            this.setState({feedback: ""});
            this.props.onClose();
        }
    };

    render() {
        const {open} = this.props;
        const {feedback, isSending} = this.state;

        const feedbackLength = feedback.length;
        const isValid = feedback.trim().length > 0;

        return (
            <Dialog
                open={open}
                onClose={this.handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Send Back to Issuer</DialogTitle>

                <DialogContent className={css(styles.dialog_content)}>
                    <Typography variant="body1" paragraph>
                        Provide feedback explaining why this project needs revisions. The issuer will receive this feedback and can make changes before resubmitting.
                    </Typography>

                    <TextField
                        label="Feedback"
                        placeholder="Explain what needs to be changed or improved..."
                        value={feedback}
                        onChange={this.handleFeedbackChange}
                        fullWidth
                        multiline
                        rows={5}
                        variant="outlined"
                        required
                        disabled={isSending}
                        error={feedbackLength > 0 && !isValid}
                        helperText={feedbackLength > 0 && !isValid ? "Feedback cannot be empty or whitespace only" : ""}
                    />

                    <Typography
                        variant="caption"
                        className={css(styles.character_count)}
                    >
                        {feedbackLength} / {MAX_FEEDBACK_LENGTH}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={this.handleClose}
                        disabled={isSending}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleSend}
                        disabled={!isValid || isSending}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        {isSending ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress size={16} style={{marginRight: 8}} color="inherit" />
                                Sending...
                            </Box>
                        ) : (
                            "Send Feedback"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(null, mapDispatchToProps)(RejectWithFeedbackDialog);
