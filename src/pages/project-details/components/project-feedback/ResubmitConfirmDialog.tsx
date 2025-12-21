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
    Typography,
    Box,
    CircularProgress
} from "@material-ui/core";
import {css} from "aphrodite";
import {AppState} from "../../../../redux-store/reducers";
import {ProjectFeedbackState, getPendingFeedbacks} from "./ProjectFeedbackReducer";
import {
    toggleResubmitDialog,
    resubmitProject,
    markFeedbackAddressed
} from "./ProjectFeedbackActions";
import FeedbackItem from "./FeedbackItem";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";

/**
 * Props interface
 */
interface ResubmitConfirmDialogProps {
    projectID: string;

    // Redux state
    ProjectFeedbackLocalState: ProjectFeedbackState;

    // Redux actions
    toggleDialog: () => void;
    resubmit: (projectID: string, addressedFeedbackIds: string[]) => void;
    markAddressed: (feedbackId: string, addressed: boolean) => void;
}

/**
 * Map state to props
 */
const mapStateToProps = (state: AppState) => ({
    ProjectFeedbackLocalState: state.ProjectFeedbackLocalState
});

/**
 * Map dispatch to props
 */
const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => ({
    toggleDialog: () => dispatch(toggleResubmitDialog()),
    resubmit: (projectID: string, addressedFeedbackIds: string[]) =>
        dispatch(resubmitProject({projectID, addressedFeedbackIds})),
    markAddressed: (feedbackId: string, addressed: boolean) =>
        dispatch(markFeedbackAddressed(feedbackId, addressed))
});

/**
 * ResubmitConfirmDialog Component
 *
 * Dialog for issuers to confirm they have addressed all feedback before resubmitting.
 * Requires all pending feedback items to be checked before allowing submission.
 */
class ResubmitConfirmDialog extends Component<ResubmitConfirmDialogProps> {

    handleResubmit = () => {
        const {projectID, ProjectFeedbackLocalState, resubmit} = this.props;
        resubmit(projectID, ProjectFeedbackLocalState.addressedFeedbackIds);
    };

    handleClose = () => {
        const {ProjectFeedbackLocalState, toggleDialog} = this.props;
        if (!ProjectFeedbackLocalState.isResubmitting) {
            toggleDialog();
        }
    };

    render() {
        const {
            ProjectFeedbackLocalState,
            markAddressed
        } = this.props;

        const {
            isResubmitDialogOpen,
            isResubmitting,
            addressedFeedbackIds
        } = ProjectFeedbackLocalState;

        const pendingFeedbacks = getPendingFeedbacks(ProjectFeedbackLocalState);
        const allAddressed = pendingFeedbacks.length > 0 &&
            addressedFeedbackIds.length === pendingFeedbacks.length;

        return (
            <Dialog
                open={isResubmitDialogOpen}
                onClose={this.handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Resubmit Project for Approval</DialogTitle>

                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Please review the feedback below and confirm that you have addressed each item before resubmitting.
                    </Typography>

                    <Box marginTop={2}>
                        {pendingFeedbacks.map((feedback) => (
                            <FeedbackItem
                                key={feedback.id}
                                feedback={feedback}
                                showCheckbox={true}
                                isChecked={addressedFeedbackIds.includes(feedback.id)}
                                onCheckChange={markAddressed}
                            />
                        ))}
                    </Box>

                    {pendingFeedbacks.length === 0 && (
                        <Typography variant="body2" color="textSecondary">
                            No pending feedback to address.
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={this.handleClose}
                        disabled={isResubmitting}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleResubmit}
                        disabled={!allAddressed || isResubmitting}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        {isResubmitting ? (
                            <Box display="flex" alignItems="center">
                                <CircularProgress size={16} style={{marginRight: 8}} color="inherit" />
                                Resubmitting...
                            </Box>
                        ) : (
                            "Confirm Resubmit"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResubmitConfirmDialog);
