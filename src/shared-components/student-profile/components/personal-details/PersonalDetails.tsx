import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import {StudentProfileState} from "../../StudentProfileReducer";
import {handleInputFieldChanged, InputCategories} from "../../StudentProfileActions";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import Student, {getStudentProfilePicture, StudentTitles} from "../../../../models/student";
import LetterAvatar from "../../../avatars/LetterAvatar";
import {Col, Image, Row} from "react-bootstrap";
import {StudentAuthenticationState} from "../../../../redux-store/reducers/studentAuthenticationReducer";
import Teacher, {isProf} from "../../../../models/teacher";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import * as utils from "../../../../utils/utils";
import {toggleDialog} from "../edit-image-dialog/StudentEditImageDialogActions";

interface StudentPersonalDetailsProps {
    StudentAuthenticationState: StudentAuthenticationState;
    StudentProfileLocalState: StudentProfileState;
    handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => any;
    toggleUpdateProfilePhotoDialog: (image?: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        StudentAuthenticationState: state.StudentAuthenticationState,
        StudentProfileLocalState: state.StudentProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(inputCategory, event)),
        toggleUpdateProfilePhotoDialog: (image?: string) => dispatch(toggleDialog(image))
    }
}

class StudentPersonalDetails extends Component<StudentPersonalDetailsProps, any> {

    onInputFieldChanged = (inputCategory: InputCategories) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.handleInputFieldChanged(inputCategory, event);
    }

    render() {
        const {
            StudentAuthenticationState,
            StudentProfileLocalState,
            toggleUpdateProfilePhotoDialog
        } = this.props;

        const currentStudent: Student | Teacher | null = StudentAuthenticationState.currentStudent;
        if (!currentStudent) {
            return null;
        }

        const currentTeacher: Teacher | null = isProf(currentStudent);

        const copiedStudent: Student | undefined = StudentProfileLocalState.copiedStudent;

        if (!copiedStudent) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Section title */}
            <Box>
                <Typography variant="h6" color="primary">Personal details</Typography>
            </Box>
            <Box height="25px"/>
            <Box display="flex" flexDirection="row">
                <Row noGutters style={{ width: "100%" }} >
                    {/** Profile picture */}
                    <Col xs={12} sm={12} md={6} lg={4} >
                        <Box display="flex" flexDirection="column" >
                            {/** Display profile picture */}
                            {
                                getStudentProfilePicture(copiedStudent) === null
                                    ? <LetterAvatar firstName={copiedStudent.firstName} lastName={copiedStudent.lastName} width={196} height={196} textVariant="h5" />
                                    : <Image roundedCircle thumbnail src={getStudentProfilePicture(copiedStudent) ?? ""} width={256} height={256} style={{ objectFit: "contain" }} />
                            }

                            {/** Button to update profile picture (not available when current student is an admin) */}
                            {
                                currentTeacher
                                    ? null
                                    : <Box marginY="20px" >
                                        <Button size="small" className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" onClick={() => toggleUpdateProfilePhotoDialog(getStudentProfilePicture(copiedStudent) ?? undefined)}>Update profile photo</Button>
                                    </Box>
                            }
                        </Box>
                    </Col>

                    {/** Personal information */}
                    <Col xs={12} sm={12} md={6} lg={4}>
                        <Box display="flex" flexDirection="column">
                            {/** Title */}
                            <FormControl fullWidth>
                                <FormLabel> <b>Title</b> </FormLabel>
                                <Select
                                    name="title"
                                    value={copiedStudent.title}
                                    defaultValue="-1"
                                    // @ts-ignore
                                    onChange={this.onInputFieldChanged(InputCategories.StudentPersonalDetails)}
                                    input={ <OutlinedInput/> }
                                    margin="dense"
                                >
                                    <MenuItem key="-1" value="-1">Please select</MenuItem>
                                    {
                                        StudentTitles.map(title => (
                                            <MenuItem key={title} value={title}>{title}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>

                            <Box height="22px"/>

                            {/** First name */}
                            <FormControl fullWidth>
                                <FormLabel><b>First name</b></FormLabel>
                                <TextField name="firstName" placeholder="Enter first name" value={copiedStudent.firstName} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.StudentPersonalDetails)} error={copiedStudent.firstName.trim().length === 0} />
                            </FormControl>

                            <Box height="22px"/>

                            {/** Last name */}
                            <FormControl fullWidth>
                                <FormLabel><b>Last name</b></FormLabel>
                                <TextField name="lastName" placeholder="Enter last name" value={copiedStudent.lastName} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.StudentPersonalDetails)} error={copiedStudent.lastName.trim().length === 0}/>
                            </FormControl>
                            <Box height="22px"/>

                            {/** Email */}
                            <FormControl fullWidth>
                                <FormLabel><b>Email</b></FormLabel>
                                <TextField name="email" placeholder="Enter email" value={copiedStudent.email} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.StudentPersonalDetails)} disabled={true} error={copiedStudent.email.trim().length === 0} />
                            </FormControl>
                            <Box height="22px"/>

                            {/** LinkedIn */}
                            <FormControl fullWidth>
                                <FormLabel><b>LinkedIn</b></FormLabel>
                                <TextField name="linkedin" placeholder="Enter your LinkedIn profile" value={copiedStudent.linkedin ?? ""} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.StudentPersonalDetails)} error={!utils.isValidLinkedInURL(copiedStudent.linkedin)}/>
                            </FormControl>
                        </Box>
                    </Col>
                </Row>
            </Box>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentPersonalDetails);