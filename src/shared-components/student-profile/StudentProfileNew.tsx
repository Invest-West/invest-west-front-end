import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box} from "@material-ui/core";
import PersonalDetails from "./components/personal-details/PersonalDetails";
import EditStudentImageDialog from "./components/edit-image-dialog/StudentEditImageDialog";
import FeedbackSnackbarNew from "../feedback-snackbar/FeedbackSnackbarNew";
import BusinessProfile from "./components/uni-profile/UniProfile";
import {hasInitiallySetCopiedStudent, StudentProfileState} from "./StudentProfileReducer";
import {StudentAuthenticationState, successfullyStudentAuthenticated} from "../../redux-store/reducers/studentAuthenticationReducer";
import Student from "../../models/student";
import {setCopiedStudent} from "./StudentProfileActions";

interface StudentProfileProps {
    // this must be set when an admin is viewing a student's profile
    thirdViewStudent?: Student;
    StudentAuthenticationState: StudentAuthenticationState;
    StudentProfileLocalState: StudentProfileState;
    setCopiedStudent: (student: Student | null, firstTimeSetCopiedStudent?: true) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        StudentAuthenticationState: state.StudentAuthenticationState,
        StudentProfileLocalState: state.StudentProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setCopiedStudent: (student: Student | null, firstTimeSetCopiedStudent?: true) => dispatch(setCopiedStudent(student, firstTimeSetCopiedStudent)),
    }
}

class StudentProfileNew extends Component<StudentProfileProps, any> {

    componentDidMount() {
        this.setCopiedStudentForTheFirstTime();
    }

    componentDidUpdate(prevProps: Readonly<StudentProfileProps>, prevState: Readonly<any>, snapshot?: any) {
        this.setCopiedStudentForTheFirstTime();
    }

    setCopiedStudentForTheFirstTime = () => {
        const {
            thirdViewStudent,
            StudentAuthenticationState,
            StudentProfileLocalState,
            setCopiedStudent
        } = this.props;

        if (!hasInitiallySetCopiedStudent(StudentProfileLocalState)) {
            if (thirdViewStudent) {
                setCopiedStudent(thirdViewStudent, true);
            } else if (successfullyStudentAuthenticated(StudentAuthenticationState)) {
                const currentStudent: Student = StudentAuthenticationState.currentStudent as Student;
                setCopiedStudent(currentStudent, true);
            }
        }
    }

    render() {
        const {
            StudentProfileLocalState
        } = this.props;

        const copiedStudent: Student | undefined = StudentProfileLocalState.copiedStudent;

        if (!copiedStudent) {
            return null;
        }

        return <Box>
            <FeedbackSnackbarNew/>
            <PersonalDetails/>
            <BusinessProfile/>
            <EditStudentImageDialog/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfileNew);