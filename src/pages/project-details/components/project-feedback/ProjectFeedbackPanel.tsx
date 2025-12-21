import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Button,
    CircularProgress,
    Badge
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FeedbackIcon from "@material-ui/icons/Feedback";
import {css, StyleSheet} from "aphrodite";
import {AppState} from "../../../../redux-store/reducers";
import {ProjectFeedbackState, getPendingFeedbackCount} from "./ProjectFeedbackReducer";
import {
    fetchProjectFeedbacks,
    toggleFeedbackPanel,
    toggleResubmitDialog,
    clearFeedbackState
} from "./ProjectFeedbackActions";
import FeedbackItem from "./FeedbackItem";
import ResubmitConfirmDialog from "./ResubmitConfirmDialog";
import {ProjectRejectFeedback} from "../../../../models/project";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import * as colors from "../../../../values/colors";

/**
 * Aphrodite styles
 */
const styles = StyleSheet.create({
    panel: {
        marginBottom: 16,
        borderRadius: 4,
        overflow: "hidden"
    },
    panel_header: {
        display: "flex",
        alignItems: "center",
        width: "100%"
    },
    panel_title: {
        display: "flex",
        alignItems: "center",
        gap: 8
    },
    feedback_icon: {
        marginRight: 8,
        color: colors.gray_600
    },
    feedback_list: {
        width: "100%",
        flexDirection: "column" as const
    },
    loading_container: {
        display: "flex",
        justifyContent: "center",
        padding: 24,
        width: "100%"
    },
    empty_message: {
        padding: 16,
        textAlign: "center" as const,
        width: "100%"
    },
    resubmit_button_container: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 16,
        width: "100%"
    }
});

/**
 * Props interface
 */
interface ProjectFeedbackPanelProps {
    projectID: string;
    isIssuer: boolean;
    isRejected: boolean;
    showFeedbackFromUrl?: boolean;

    // Redux state
    ProjectFeedbackLocalState: ProjectFeedbackState;

    // Redux actions
    fetchFeedbacks: (projectID: string) => void;
    togglePanel: (expanded?: boolean) => void;
    toggleResubmitDialog: () => void;
    clearState: () => void;
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
    fetchFeedbacks: (projectID: string) => dispatch(fetchProjectFeedbacks(projectID)),
    togglePanel: (expanded?: boolean) => dispatch(toggleFeedbackPanel(expanded)),
    toggleResubmitDialog: () => dispatch(toggleResubmitDialog()),
    clearState: () => dispatch(clearFeedbackState())
});

/**
 * ProjectFeedbackPanel Component
 *
 * Collapsible accordion panel that displays all feedback for a project.
 * Shows a badge with pending feedback count and allows issuers to resubmit.
 */
class ProjectFeedbackPanel extends Component<ProjectFeedbackPanelProps> {

    componentDidMount() {
        const {projectID, fetchFeedbacks, showFeedbackFromUrl, togglePanel} = this.props;

        // Fetch feedbacks on mount
        fetchFeedbacks(projectID);

        // Auto-expand if URL has ?showFeedback=true
        if (showFeedbackFromUrl) {
            togglePanel(true);
        }
    }

    componentWillUnmount() {
        this.props.clearState();
    }

    handlePanelChange = (_event: React.ChangeEvent<{}>, expanded: boolean) => {
        this.props.togglePanel(expanded);
    };

    render() {
        const {
            projectID,
            isIssuer,
            isRejected,
            ProjectFeedbackLocalState
        } = this.props;

        const {
            feedbacks,
            isLoading,
            isLoaded,
            isPanelExpanded
        } = ProjectFeedbackLocalState;

        const pendingCount = getPendingFeedbackCount(ProjectFeedbackLocalState);

        // Don't render if no feedbacks and not loading
        if (isLoaded && feedbacks.length === 0) {
            return null;
        }

        return (
            <>
                <Accordion
                    className={css(styles.panel)}
                    expanded={isPanelExpanded}
                    onChange={this.handlePanelChange}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box className={css(styles.panel_header)}>
                            <Badge
                                badgeContent={pendingCount}
                                color="error"
                                invisible={pendingCount === 0}
                            >
                                <Box className={css(styles.panel_title)}>
                                    <FeedbackIcon className={css(styles.feedback_icon)} />
                                    <Typography variant="h6">
                                        Approval Feedback
                                    </Typography>
                                </Box>
                            </Badge>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails className={css(styles.feedback_list)}>
                        {isLoading ? (
                            <Box className={css(styles.loading_container)}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : feedbacks.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                className={css(styles.empty_message)}
                            >
                                No feedback available.
                            </Typography>
                        ) : (
                            <>
                                {feedbacks.map((feedback: ProjectRejectFeedback) => (
                                    <FeedbackItem
                                        key={feedback.id}
                                        feedback={feedback}
                                    />
                                ))}

                                {/* Resubmit button for issuers on rejected projects */}
                                {isIssuer && isRejected && pendingCount > 0 && (
                                    <Box className={css(styles.resubmit_button_container)}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={this.props.toggleResubmitDialog}
                                        >
                                            Resubmit for Approval
                                        </Button>
                                    </Box>
                                )}
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>

                <ResubmitConfirmDialog projectID={projectID} />
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectFeedbackPanel);
