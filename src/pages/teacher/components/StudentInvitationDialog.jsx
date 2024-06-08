import React, {Component} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    MenuItem,
    OutlinedInput,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';

import {connect} from 'react-redux';
import * as studentInvitationDialogActions from '../../../redux-store/actions/studentInvitationDialogActions';

import * as DB_CONST from '../../../firebase/databaseConsts';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';

export const SEND_STUDENT_INVITATION_NONE = 0;
export const SEND_STUDENT_INVITATION_PROCESSING = 1;
export const SEND_STUDENT_INVITATION_INVITED_BEFORE = 2;
export const SEND_STUDENT_INVITATION_STUDENT_CANNOT_BE_INVITED = 3; // student is an teacher in another group or an admin
export const SEND_STUDENT_INVITATION_ERROR_HAPPENED = 4;
export const SEND_STUDENT_INVITATION_SUCCESS = 5;

const mapStateToProps = state => {
    return {
        invitationDialogOpen: state.manageStudentInvitationDialog.invitationDialogOpen,
        title: state.manageStudentInvitationDialog.title,
        firstName: state.manageStudentInvitationDialog.firstName,
        lastName: state.manageStudentInvitationDialog.lastName,
        email: state.manageStudentInvitationDialog.email,
        studentType: state.manageStudentInvitationDialog.studentType,
        sendButtonClick: state.manageStudentInvitationDialog.sendButtonClick,
        sendResult: state.manageStudentInvitationDialog.sendResult,
        sendStatusExtraInfo: state.manageStudentInvitationDialog.sendStatusExtraInfo
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleInputChanged: (event) => dispatch(studentInvitationDialogActions.handleInputChanged(event)),
        toggleStudentInvitationDialog: () => dispatch(studentInvitationDialogActions.toggleStudentInvitationDialog()),
        sendInvitation: () => dispatch(studentInvitationDialogActions.sendInvitation())
    }
};

class StudentInvitationDialog extends Component {

    render() {
        const {
            forwardedRef,
            invitationDialogOpen,
            title,
            firstName,
            lastName,
            email,
            studentType,
            sendButtonClick,
            sendResult,
            sendStatusExtraInfo,
            toggleStudentInvitationDialog,
            handleInputChanged,
            sendInvitation,
            ...other
        } = this.props;

        return (
            <Dialog ref={forwardedRef} open={invitationDialogOpen} fullWidth maxWidth="md" onClose={toggleStudentInvitationDialog} {...other}>
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">Send invitation email</Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleStudentInvitationDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent style={{ marginTop: 10}}>
                    <FormControl required error={sendButtonClick && title === DB_CONST.STUDENT_TITLES[0]}>
                        <FormLabel>Title</FormLabel>
                        <Select name="title" value={title} margin="dense" input={<OutlinedInput/>} onChange={handleInputChanged}>
                            {
                                DB_CONST.STUDENT_TITLES.map((title, id) => (
                                    <MenuItem
                                        key={id}
                                        value={title}
                                    >
                                        {title}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    <TextField
                        label="First name"
                        placeholder="Write first name here ..."
                        name="firstName"
                        value={firstName}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                        error={sendButtonClick && firstName.length === 0}
                        onChange={handleInputChanged}/>

                    <TextField
                        label="Last name"
                        placeholder="Write last name here ..."
                        name="lastName"
                        value={lastName}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                        error={sendButtonClick && lastName.length === 0}
                        onChange={handleInputChanged}/>

                    <TextField
                        label="Email"
                        placeholder="Write email here ..."
                        name="email"
                        value={email}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                        error={sendButtonClick && email.length === 0}
                        onChange={handleInputChanged}/>

                    <FlexView marginTop={20}>
                        <FormControl required error={sendButtonClick && studentType.length === 0}>
                            <FormLabel>Student type</FormLabel>
                            <RadioGroup row name="studentType" value={studentType} onChange={handleInputChanged}>
                                <FormControlLabel value={DB_CONST.TYPE_TEACHER.toString()} control={<Radio color='primary'/>} label="Teacher"/>
                                <FormControlLabel value={DB_CONST.TYPE_STUDENT.toString()} control={<Radio color='primary'/>} label="Student"/>
                            </RadioGroup>
                        </FormControl>
                    </FlexView>
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} hAlignContent="right" vAlignContent="center">
                        {
                            this.renderRespondCode()
                        }
                        <Button variant="outlined" color="primary" onClick={sendInvitation} size="medium" className={css(sharedStyles.no_text_transform)} style={{marginLeft: 35}}>Send
                            <SendIcon fontSize="small" style={{marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Render send result
     *
     * @returns {null|*}
     */
    renderRespondCode = () => {
        const {
            sendResult,
            sendStatusExtraInfo
        } = this.props;

        let res = {
            msg: '',
            color: ''
        };

        switch (sendResult) {
            case SEND_STUDENT_INVITATION_NONE:
                return null;
            case SEND_STUDENT_INVITATION_PROCESSING:
                res.msg = "Checking...";
                res.color = "primary";
                break;
            case SEND_STUDENT_INVITATION_INVITED_BEFORE:
                res.msg =
                    sendStatusExtraInfo.hasOwnProperty('officialStudentID')
                        ?
                        `This student is already an ${sendStatusExtraInfo.type === DB_CONST.TYPE_STUDENT ? 'student' : 'teacher'} in your group.`
                        :
                        `You have invited this student as an ${sendStatusExtraInfo.type === DB_CONST.TYPE_STUDENT ? 'student' : 'teacher'} before.`;
                res.color = "error";
                break;
            case SEND_STUDENT_INVITATION_STUDENT_CANNOT_BE_INVITED:
                res.msg = "Student is an admin or an teacher of another group.";
                res.color = "error";
                break;
            case SEND_STUDENT_INVITATION_ERROR_HAPPENED:
                res.msg = "Error happened. Couldn't invite this student.";
                res.color = "error";
                break;
            case SEND_STUDENT_INVITATION_SUCCESS:
                res.msg = "Invitation has been sent to this student.";
                res.color = "primary";
                break;
            default:
                break;
        }

        return (
            <Typography
                color={res.color}
                variant="subtitle1"
            >
                {res.msg}
            </Typography>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    React.forwardRef((props, ref) => <StudentInvitationDialog {...props} forwardedRef={ref}/>)
);