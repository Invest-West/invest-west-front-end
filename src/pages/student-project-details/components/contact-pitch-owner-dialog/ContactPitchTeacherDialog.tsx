import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from "@material-ui/core";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {ContactPitchTeacherDialogState, isSendingContactEmail} from "./ContactPitchTeacherDialogReducer";
import {AnyAction} from "redux";
import {sendContactEmail, toggleContactPitchTeacherDialog} from "./ContactPitchTeacherDialogActions";

interface ContactPitchTeacherDialogProps {
    ContactPitchTeacherDialogLocalState: ContactPitchTeacherDialogState;
    toggleContactDialog: () => any;
    sendContactEmail: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ContactPitchTeacherDialogLocalState: state.ContactPitchTeacherDialogLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleContactDialog: () => dispatch(toggleContactPitchTeacherDialog()),
        sendContactEmail: () => dispatch(sendContactEmail())
    }
}

class ContactPitchTeacherDialog extends Component<ContactPitchTeacherDialogProps, any> {
    render() {
        const {
            ContactPitchTeacherDialogLocalState,
            toggleContactDialog,
            sendContactEmail
        } = this.props;

        return <Dialog
            open={ContactPitchTeacherDialogLocalState.contactDialogOpen}
            onClose={() => toggleContactDialog()}
        >
            <DialogContent>
                <Box display="flex" flexDirection="column">
                    <Typography variant="body1" align="left">{`We will let the pitch owner know that you would like to find out more.`}</Typography>
                    <Box height="20px"/>
                    <Typography variant="body1" align="left">{`Are you happy for us to share your email address?`}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                {
                    isSendingContactEmail(ContactPitchTeacherDialogLocalState)
                        ? null
                        : <Button
                            onClick={() => toggleContactDialog()}
                            className={css(sharedStyles.no_text_transform)}
                        >Cancel</Button>
                }
                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={isSendingContactEmail(ContactPitchTeacherDialogLocalState)} onClick={() => sendContactEmail()}>
                    {
                        isSendingContactEmail(ContactPitchTeacherDialogLocalState)
                            ? `Sending email to ${ContactPitchTeacherDialogLocalState.studentProjectTeacherEmail} ...`
                            : "Yes"
                    }
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactPitchTeacherDialog);