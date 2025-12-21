import React from "react";
import {
    Box,
    Chip,
    Paper,
    Typography,
    Checkbox,
    FormControlLabel
} from "@material-ui/core";
import {css, StyleSheet} from "aphrodite";
import {ProjectRejectFeedback, ProjectRejectFeedbackStatus} from "../../../../models/project";
import * as colors from "../../../../values/colors";

/**
 * Props for FeedbackItem component
 */
interface FeedbackItemProps {
    feedback: ProjectRejectFeedback;
    showCheckbox?: boolean;
    isChecked?: boolean;
    onCheckChange?: (feedbackId: string, checked: boolean) => void;
}

/**
 * Aphrodite styles
 */
const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 12,
        borderLeft: `4px solid ${colors.gray_400}`
    },
    card_pending: {
        borderLeftColor: "#FFA726" // amber/warning
    },
    card_addressed: {
        borderLeftColor: "#42A5F5" // blue/info
    },
    card_resolved: {
        borderLeftColor: "#66BB6A" // green/success
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8
    },
    chip_pending: {
        backgroundColor: "#FFF3E0",
        color: "#E65100"
    },
    chip_addressed: {
        backgroundColor: "#E3F2FD",
        color: "#1565C0"
    },
    chip_resolved: {
        backgroundColor: "#E8F5E9",
        color: "#2E7D32"
    },
    feedback_text: {
        marginTop: 8,
        marginBottom: 8,
        whiteSpace: "pre-wrap" as const
    },
    admin_response: {
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.gray_100,
        borderRadius: 4
    },
    checkbox_container: {
        marginTop: 12
    }
});

/**
 * Get status label for display
 */
const getStatusLabel = (status: ProjectRejectFeedbackStatus): string => {
    switch (status) {
        case 'pending':
            return 'Pending';
        case 'addressed':
            return 'Addressed';
        case 'resolved':
            return 'Resolved';
        default:
            return status;
    }
};

/**
 * Format timestamp to readable date
 */
const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get card class based on status
 */
const getCardClass = (status: ProjectRejectFeedbackStatus): string => {
    switch (status) {
        case 'pending':
            return css(styles.card, styles.card_pending);
        case 'addressed':
            return css(styles.card, styles.card_addressed);
        case 'resolved':
            return css(styles.card, styles.card_resolved);
        default:
            return css(styles.card);
    }
};

/**
 * Get chip class based on status
 */
const getChipClass = (status: ProjectRejectFeedbackStatus): string => {
    switch (status) {
        case 'pending':
            return css(styles.chip_pending);
        case 'addressed':
            return css(styles.chip_addressed);
        case 'resolved':
            return css(styles.chip_resolved);
        default:
            return "";
    }
};

/**
 * FeedbackItem Component
 *
 * Displays a single feedback item with status badge, admin info, and feedback text.
 * Optionally shows a checkbox for marking as addressed.
 */
const FeedbackItem: React.FC<FeedbackItemProps> = ({
    feedback,
    showCheckbox = false,
    isChecked = false,
    onCheckChange
}) => {
    const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onCheckChange) {
            onCheckChange(feedback.id, event.target.checked);
        }
    };

    return (
        <Paper className={getCardClass(feedback.status)} elevation={1}>
            <Box className={css(styles.header)}>
                <Typography variant="caption" color="textSecondary">
                    {formatDate(feedback.date)}
                    {feedback.adminName && ` - ${feedback.adminName}`}
                </Typography>
                <Chip
                    label={getStatusLabel(feedback.status)}
                    size="small"
                    className={getChipClass(feedback.status)}
                />
            </Box>

            <Typography
                variant="body1"
                className={css(styles.feedback_text)}
            >
                {feedback.feedback}
            </Typography>

            {feedback.adminResponse && (
                <Box className={css(styles.admin_response)}>
                    <Typography variant="caption" color="textSecondary">
                        Admin Response:
                    </Typography>
                    <Typography variant="body2">
                        {feedback.adminResponse}
                    </Typography>
                </Box>
            )}

            {showCheckbox && feedback.status === 'pending' && (
                <Box className={css(styles.checkbox_container)}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isChecked}
                                onChange={handleCheckChange}
                                color="primary"
                            />
                        }
                        label="I have addressed this feedback"
                    />
                </Box>
            )}
        </Paper>
    );
};

export default FeedbackItem;
