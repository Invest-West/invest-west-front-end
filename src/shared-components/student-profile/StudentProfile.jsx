import React, {Component} from 'react';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/Info';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import PublicIcon from '@material-ui/icons/Public';
import {Col, Container, Image, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import ReactPlayer from 'react-player';

import LetterAvatar from './StudentLetterAvatar';
import ActivitiesTable from '../activities-components/ActivitiesTable';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';
import Routes from '../../router/routes';

import {connect} from 'react-redux';
import * as createuniCourseProfileActions from '../../redux-store/actions/createuniCourseProfileActions';
import * as editStudentActions from '../../redux-store/actions/editStudentActions';
import * as editImageActions from '../../redux-store/actions/editImageActions';
import * as editVideoActions from '../../redux-store/actions/editVideoActions';
import * as uploadFilesActions from '../../redux-store/actions/uploadFilesActions';
import * as legalDocumentsActions from '../../redux-store/actions/legalDocumentsActions';

import {
    UPLOAD_LOGO_FIRST_TIME_MODE,
    UPLOAD_LOGO_MODE,
    UPLOAD_PROFILE_PICTURE_MODE,
    UPLOAD_VIDEO_FIRST_TIME_MODE,
    UPLOAD_VIDEO_MODE
} from '../uploading-dialog/UploadingDialog';
import {HashLoader} from 'react-spinners';
import StudentOffersTable from "../student-offers-table/StudentOffersTable";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Footer from "../footer/Footer";

const mapStateToProps = state => {
    return {
        // -- old states -----------------------------------------------------------------------------------------------
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,

        currentStudent: state.auth.student,

        clubAttributes: state.manageClubAttributes.clubAttributes,

        // Create new uni profile state ----------------------------------------------------------------------------
        createuniCourseProfile: state.createuniCourseProfile,
        //--------------------------------------------------------------------------------------------------------------

        // Edit student's profile state ------------------------------------------------------------------------------------
        originalStudent: state.editStudent.originalStudent,
        studentEdited: state.editStudent.studentEdited,
        allowEditing: state.editStudent.allowEditing,
        //--------------------------------------------------------------------------------------------------------------

        // Investor self-certification agreement (for investor only) ----------------------------------------------------
        investorSelfCertificationAgreement_studentID: state.manageInvestorSelfCertificationAgreement.studentID,
        investorSelfCertificationAgreement: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreement,
        investorSelfCertificationAgreementLoaded: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreementLoaded,
        investorSelfCertificationAgreementBeingLoaded: state.manageInvestorSelfCertificationAgreement.investorSelfCertificationAgreementBeingLoaded,
        investorSelfCertificationAgreementCheckBox1Checked: state.manageInvestorSelfCertificationAgreement.checkBox1Ticked,
        investorSelfCertificationAgreementCheckBox2Checked: state.manageInvestorSelfCertificationAgreement.checkBox2Ticked,
        investorSelfCertificationAgreementCheckBox3Checked: state.manageInvestorSelfCertificationAgreement.checkBox3Ticked,
        investorSelfCertificationAgreementStatementType: state.manageInvestorSelfCertificationAgreement.statementType,
        //--------------------------------------------------------------------------------------------------------------

        // Student's legal documents (for issuer only) --------------------------------------------------------------------
        legalDocuments_studentID: state.legalDocuments.studentID,
        studentLegalDocuments: state.legalDocuments.legalDocuments,
        studentLegalDocumentsLoaded: state.legalDocuments.legalDocumentsLoaded,
        studentLegalDocumentsBeingLoaded: state.legalDocuments.legalDocumentsBeingLoaded,
        //--------------------------------------------------------------------------------------------------------------

        // Upload documents state --------------------------------------------------------------------------------------
        toBeUploadedLegalDocuments: state.uploadFiles.filesToBeUploaded.legalDocuments,
        fileUploadErrorMessage: state.uploadFiles.fileUploadErrorMessage,
        fileUploadErrorSnackbarOpen: state.uploadFiles.fileUploadErrorSnackbarOpen,
        //--------------------------------------------------------------------------------------------------------------

        // These states can be also be used when creating uni profile ***********
        addNewDirector: state.editStudent.addNewDirector,
        newDirectorText: state.editStudent.newDirectorText
        //***************************************************************************
        //--------------------------------------------------------------------------------------------------------------
    }
};

const mapDispatchToProps = dispatch => {
    return {
        // Create new uni profile functions ------------------------------------------------------------------------
        handleCreateuniCourseProfileTextChanged: (fieldType, event) => dispatch(createuniCourseProfileActions.handleTextChanged(fieldType, event)),
        searchAddress: (mode) => dispatch(createuniCourseProfileActions.searchAddresses(mode)),
        toggleEnterAddressManually: (field) => dispatch(createuniCourseProfileActions.toggleEnterAddressManually(field)),
        resetCreatinguniCourseProfile: () => dispatch(createuniCourseProfileActions.clearAllFields()),
        handleRecommendedAddressSelected: (field, index) => dispatch(createuniCourseProfileActions.handleRecommendedAddressSelected(field, index)),
        toggleExpandUniProfileFillingForStudent: () => dispatch(createuniCourseProfileActions.toggleExpandUniProfileFillingForStudent()),
        uploadUniProfile: () => dispatch(createuniCourseProfileActions.uploadUniProfile()),
        //--------------------------------------------------------------------------------------------------------------

        // Edit student's profile functions --------------------------------------------------------------------------------
        editStudentLocally: (type, edit) => dispatch(editStudentActions.editStudentLocally(type, edit)),
        toggleAddNewDirector: () => dispatch(editStudentActions.toggleAddNewDirector()),
        addNewDirectorTemporarily: (isEditingExistinguniCourseProfile) => dispatch(editStudentActions.addNewDirectorTemporarily(isEditingExistinguniCourseProfile)),
        deleteDirectorTemporarily: (index, isEditingExistinguniCourseProfile) => dispatch(editStudentActions.deleteDirectorTemporarily(index, isEditingExistinguniCourseProfile)),
        cancelEditingStudent: (type) => dispatch(editStudentActions.cancelEditingStudent(type)),
        commitStudentProfileChanges: (type) => dispatch(editStudentActions.commitStudentProfileChanges(type)),
        //--------------------------------------------------------------------------------------------------------------

        // Investor self-certification agreement functions --------------------------------------------------------------
        /*
        investorSelfCertificationAgreement_setStudent: (uid) => dispatch(investorSelfCertificationAgreementsActions.setStudent(uid)),
        loadInvestorSelfCertificationAgreement: () => dispatch(investorSelfCertificationAgreementsActions.loadInvestorSelfCertificationAgreement()),
        setInvestorSelfCertificationAgreement: () => dispatch(investorSelfCertificationAgreementsActions.setInvestorSelfCertificationAgreement()),
        investorSelfCertificationAgreement_handleCheckBoxChanged: (event) => dispatch(investorSelfCertificationAgreementsActions.handleTickBoxChanged(event)),
        investorSelfCertificationAgreement_handleStatementTypeChanged: (event) => dispatch(investorSelfCertificationAgreementsActions.handleStatementTypeChanged(event)),
        */
        //--------------------------------------------------------------------------------------------------------------


        // Student's legal documents functions ----------------------------------------------------------------------------
        legalDocuments_setStudentID: (studentID) => dispatch(legalDocumentsActions.setStudentID(studentID)),
        getStudentLegalDocuments: () => dispatch(legalDocumentsActions.getLegalDocuments()),
        startListeningForLegalDocumentsChanged: () => dispatch(legalDocumentsActions.startListeningForLegalDocumentsChanged()),
        stopListeningForLegalDocumentsChanged: () => dispatch(legalDocumentsActions.stopListeningForLegalDocumentsChanged()),
        //--------------------------------------------------------------------------------------------------------------

        // Upload documents functions ----------------------------------------------------------------------------------
        handleFilesChanged: (mode, files, student, project) => dispatch(uploadFilesActions.handleFilesChanged(mode, files, student, project)),
        handleFileError: (error, file) => dispatch(uploadFilesActions.handleFileError(error, file)),
        closeFileUploadSnackbarError: () => dispatch(uploadFilesActions.closeErrorSnackbar()),
        resetErrorMessageWhenFileUploadSnackbarExited: () => dispatch(uploadFilesActions.resetErrorMessageWhenSnackbarExited()),
        deleteToBeUploadedFile: (mode, index) => dispatch(uploadFilesActions.deleteToBeUploadedFile(mode, index)),
        deleteUploadedFile: (mode, index, student, project) => dispatch(uploadFilesActions.deleteUploadedFile(mode, index, student, project)),
        uploadFiles: (mode, student, project) => dispatch(uploadFilesActions.uploadFiles(mode, student, project)),
        //--------------------------------------------------------------------------------------------------------------

        // Open edit image dialog --------------------------------------------------------------------------------------
        toggleEditImageDialog: (mode) => dispatch(editImageActions.toggleEditImageDialog(mode)),
        //--------------------------------------------------------------------------------------------------------------

        // Open video image dialog -------------------------------------------------------------------------------------
        toggleEditVideoDialog: (mode) => dispatch(editVideoActions.toggleEditVideoDialog(mode))
        //--------------------------------------------------------------------------------------------------------------
    }
};

class StudentProfile extends Component {

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            studentLegalDocumentsLoaded,

            startListeningForLegalDocumentsChanged
        } = this.props;

        this.loadData();

        if (studentLegalDocumentsLoaded) {
            startListeningForLegalDocumentsChanged();
        }
    }

    componentWillUnmount() {
        const {
            stopListeningForLegalDocumentsChanged
        } = this.props;

        stopListeningForLegalDocumentsChanged();
    }

    renderSelfCertificationForm() {
        return (
          <div>
            {/* Your self-certification form JSX elements here */}
          </div>
        );
      }

    /**
     * Load data
     *
     * @returns {null|*}
     */
    loadData = () => {
        const {
            originalStudent,

            legalDocuments_studentID,
            studentLegalDocumentsLoaded,
            studentLegalDocumentsBeingLoaded,

            investorSelfCertificationAgreement_studentID,
            investorSelfCertificationAgreementLoaded,
            investorSelfCertificationAgreementBeingLoaded,

            legalDocuments_setStudentID,
            getStudentLegalDocuments,
            investorSelfCertificationAgreement_setStudent,
            loadInvestorSelfCertificationAgreement
        } = this.props;

        // if student has been set
        if (originalStudent) {
            // if student id for reference in legal documents has not been set
            if (!legalDocuments_studentID && originalStudent.type === DB_CONST.TYPE_TEACHER) {
                legalDocuments_setStudentID(originalStudent.id);
            }
        }

        // if student id for reference in legal documents has been set
        if (legalDocuments_studentID) {
            // if legal documents for issuer have not been loaded
            if (!studentLegalDocumentsLoaded && !studentLegalDocumentsBeingLoaded && originalStudent.type === DB_CONST.TYPE_TEACHER) {
                getStudentLegalDocuments();
            }
        }
    };

    /**
     * Handle text changed when editing student's profile
     */
    handleEditStudent = type => event => {
        this.props.editStudentLocally(type, {property: event.target.name, value: event.target.value});
    };

    /**
     * Handle text changed when creating a new uni profile
     */
    handleCreateuniCourseProfileTextChanged = fieldType => event => {
        this.props.handleCreateuniCourseProfileTextChanged(fieldType, event);
    };

    /**
     * Handle files changed when uploading legal documents
     */
    handleFilesChanged = (mode, student) => files => {
        this.props.handleFilesChanged(mode, files, student, null);
    };

    /**
     * Handle delete a to-be-uploaded file
     *
     * @param mode
     * @returns {Function}
     */
    deleteToBeUploadedFile = mode => index => {
        this.props.deleteToBeUploadedFile(mode, index);
    };

    /**
     * Handle delete an uploaded file
     *
     * @param mode
     * @param student
     * @returns {Function}
     */
    deleteUploadedFile = (mode, student) => index => {
        this.props.deleteUploadedFile(mode, index, student, null);
    };

    /**
     * Handle upload legal documents
     */
    uploadFiles = (mode, student) => {
        this.props.uploadFiles(mode, student, null);
    };

    //----------------------------------------------------------------------------------------------------------

    render() {
        const {
            courseStudentName,
            coursePropertiesLoaded,

            currentStudent,
            originalStudent,
            studentEdited,
            allowEditing
        } = this.props;

        if (!coursePropertiesLoaded) {
            return null;
        }

        // these students will be set in the componentDidMount (happens after render) of the main component
        // therefore, without this check it may lead to a crash due to null objects
        if (!currentStudent || !originalStudent || !studentEdited) {
            return null;
        }

        return (
            <Container fluid style={{ padding: 0 }} >
                <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                    <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 20 }} >
                        <FlexView hAlignContent="right" vAlignContent="center" >
                            <NavLink
                                to={
                                    courseStudentName
                                        ?
                                        ROUTES.STUDENT_PROFILE.replace(":courseStudentName", courseStudentName).replace(":studentID", studentEdited.id)
                                        :
                                        ROUTES.STUDENT_PROFILE_STUDENT_SUPER.replace(":studentID", studentEdited.id)
                                }
                                target={currentStudent.id === originalStudent.id ? "" : "_blank"}
                                className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                            >
                                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" >
                                    <PublicIcon style={{ marginRight: 8 }} />
                                    {
                                        currentStudent.type === DB_CONST.TYPE_PROF
                                            ?
                                            "View profile"
                                            :
                                            "View my profile"
                                    }
                                </Button>
                            </NavLink>
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                placement="bottom"
                                flip
                                overlay={
                                    <Tooltip id={`tooltip-bottom`} >
                                        {
                                            currentStudent.type === DB_CONST.TYPE_PROF
                                                ?
                                                "See how this student looks to other members. Since you are a course teacher, you can see more information about this student than the other ordinary members."
                                                :
                                                "See how you look to other members."
                                        }
                                    </Tooltip>
                                }>
                                <InfoIcon fontSize="small" style={{ marginLeft: 15, color: colors.gray_600 }} />
                            </OverlayTrigger>
                        </FlexView>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Personal details */}
                <Row noGutters style={{ backgroundColor: colors.white }} >
                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                        <FlexView column >
                            <Typography variant="h6" color="primary" >Personal details</Typography>

                            <Row noGutters style={{ marginTop: 20 }} >
                                {/** StudentProfile picture */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <FlexView column hAlignContent="center" style={{ padding: 10 }} >
                                        {
                                            !originalStudent.profilePicture
                                            || (
                                                originalStudent.profilePicture
                                                && originalStudent.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed')) === -1
                                            )
                                                ?
                                                <LetterAvatar firstName={originalStudent.firstName} lastName={originalStudent.lastName} width={196} height={196} textVariant="h5" />
                                                :
                                                <FlexView width={256} height={256} >
                                                    <Image
                                                        roundedCircle
                                                        thumbnail
                                                        src={
                                                            originalStudent.profilePicture[
                                                                originalStudent.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed'))
                                                                ].url
                                                        }
                                                        style={{ width: "100%", maxHeight: 256, objectFit: "contain" }}
                                                    />
                                                </FlexView>
                                        }
                                        {
                                            currentStudent.type === DB_CONST.TYPE_PROF
                                                ?
                                                null
                                                :
                                                <FlexView marginTop={20} marginBottom={20} >
                                                    <Button size="small" className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" onClick={() => this.props.toggleEditImageDialog(UPLOAD_PROFILE_PICTURE_MODE)} style={{ width: 256 }} >Update profile picture</Button>
                                                </FlexView>
                                        }
                                    </FlexView>
                                </Col>
                                {/** Personal info */}
                                <Col xs={12} sm={12} md={6} lg={8} >
                                    <Row>
                                        {/** Title */}
                                        <Col xs={12} md={12} lg={{span: 6, order: 1}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Title</b></FormLabel>
                                                <Select name="title" value={studentEdited.title} onChange={this.handleEditStudent(editStudentActions.EDIT_PERSONAL_INFORMATION)} input={ <OutlinedInput/> } margin="dense" >
                                                    {
                                                        DB_CONST.STUDENT_TITLES.map((title, index) => (
                                                            <MenuItem key={index} value={title}>{title}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Col>

                                        {/** Empty column to reserve empty space */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 2}} >
                                            {/** Empty column to reserve empty space */}
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 3}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** First name */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 4}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>First name</b></FormLabel>
                                                <TextField name="firstName" placeholder="Enter first name" value={studentEdited.firstName} margin="dense" variant="outlined" onChange={this.handleEditStudent(editStudentActions.EDIT_PERSONAL_INFORMATION)} error={studentEdited.firstName.trim().length === 0} />
                                            </FormControl>
                                        </Col>

                                        {/** Last name */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 5}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Last name</b></FormLabel>
                                                <TextField name="lastName" placeholder="Enter last name" value={studentEdited.lastName} margin="dense" variant="outlined" onChange={this.handleEditStudent(editStudentActions.EDIT_PERSONAL_INFORMATION)} error={studentEdited.lastName.trim().length === 0} />
                                            </FormControl>
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 6}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** Email */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 7}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Email</b></FormLabel>
                                                <TextField
                                                    name="email"
                                                    placeholder="Enter email"
                                                    value={studentEdited.email}
                                                    margin="dense"
                                                    variant="outlined"
                                                    onChange={this.handleEditStudent(editStudentActions.EDIT_PERSONAL_INFORMATION)}
                                                    disabled={true} // --> do not allow the students (including the teachers) to change the email field for now.
                                                    error={studentEdited.email.trim().length === 0}
                                                />
                                            </FormControl>
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 7}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** LinkedIn */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 8}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>LinkedIn</b></FormLabel>
                                                <TextField
                                                    name="linkedin"
                                                    placeholder="Enter your LinkedIn profile"
                                                    value={studentEdited.hasOwnProperty('linkedin') ? studentEdited.linkedin : ''}
                                                    margin="dense"
                                                    variant="outlined"
                                                    onChange={this.handleEditStudent(editStudentActions.EDIT_PERSONAL_INFORMATION)}
                                                    error={!utils.isValidLinkedInURL(studentEdited.linkedin)}
                                                />
                                            </FormControl>
                                            {
                                                utils.isValidLinkedInURL(studentEdited.linkedin)
                                                    ?
                                                    null
                                                    :
                                                    <FormHelperText className={css(sharedStyles.error_text)} >Invalid LinkedIn URL</FormHelperText>
                                            }
                                        </Col>
                                    </Row>

                                    <FlexView hAlignContent="right" marginTop={30} >
                                        <FlexView marginRight={20} >
                                            <Button variant="outlined" color="primary" onClick={() => this.props.cancelEditingStudent(editStudentActions.RESET_STUDENT_PERSONAL_INFORMATION)} >Cancel</Button>
                                        </FlexView>
                                        <FlexView>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={
                                                    (
                                                        currentStudent.type === DB_CONST.TYPE_PROF
                                                        && !currentStudent.superTeacher
                                                        && !allowEditing
                                                    )
                                                    ||
                                                    studentEdited.firstName.trim().length === 0
                                                    || studentEdited.lastName.trim().length === 0
                                                    ||
                                                    (
                                                        studentEdited.title === originalStudent.title
                                                        && studentEdited.firstName === originalStudent.firstName
                                                        && studentEdited.lastName === originalStudent.lastName
                                                        && studentEdited.email === originalStudent.email
                                                        && (
                                                            (originalStudent.linkedin && studentEdited.linkedin && studentEdited.linkedin === originalStudent.linkedin)
                                                            ||
                                                            (!studentEdited.linkedin && !originalStudent.linkedin)
                                                            ||
                                                            (studentEdited.linkedin && !originalStudent.linkedin && !utils.isValidLinkedInURL(studentEdited.linkedin))
                                                            ||
                                                            (studentEdited.linkedin && originalStudent.linkedin && !utils.isValidLinkedInURL(studentEdited.linkedin))
                                                        )
                                                    )
                                                }
                                                onClick={() => this.props.commitStudentProfileChanges(editStudentActions.COMMIT_STUDENT_PERSONAL_INFORMATION_CHANGES)}
                                            >
                                                Save
                                            </Button>
                                        </FlexView>
                                    </FlexView>
                                    {
                                        currentStudent.type === DB_CONST.TYPE_PROF
                                        && !currentStudent.superTeacher
                                        && !allowEditing
                                            ?
                                            <Typography variant="body1" color="error" align="right" style={{ marginTop: 25 }} >This student is not a home member of your course. So, you cannot edit their profile.</Typography>
                                            :
                                            null
                                    }
                                </Col>
                            </Row>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12} style={{ marginTop: 20 }} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Uni profile */}
                <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                        {
                            this.renderuniCourseProfile()
                        }
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Investor self-certification agreement */}
                {
                    originalStudent.type !== DB_CONST.TYPE_INVESTOR
                        ?
                        null
                        :
                        <Row noGutters style={{ backgroundColor: colors.white }} >
                            <Col xs={12} sm={12} md={12} lg={12} style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 35 }} >
                                {
                                    this.renderSelfCertificationAgreement()
                                }
                            </Col>

                            {/** Divider */}
                            <Col xs={12} md={12} lg={12} >
                                <Divider/>
                            </Col>
                        </Row>
                }

                {/** Fundraising summary - only available for super student who is viewing the profile of an issuer or an investor */}
                {
                    currentStudent.type !== DB_CONST.TYPE_PROF
                        ?
                        null
                        :
                        <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                            {
                                originalStudent.type !== DB_CONST.TYPE_TEACHER
                                    ?
                                    null
                                    :
                                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                                        <FlexView column >
                                            <Typography variant="h6" color="primary" >Fundraising summary</Typography>

                                            <FlexView column marginTop={20} >
                                                <StudentOffersTable directTableStudent={originalStudent} />
                                            </FlexView>
                                        </FlexView>
                                    </Col>
                            }

                            {
                                originalStudent.type !== DB_CONST.TYPE_TEACHER
                                    ?
                                    null
                                    :
                                    <Col xs={12} md={12} lg={12} style={{ marginTop: 20 }} >
                                        <Divider/>
                                    </Col>
                            }
                        </Row>
                }

                {/** Student's activities - only available for teachers */}
                {
                    currentStudent.type !== DB_CONST.TYPE_PROF
                        ?
                        null
                        :
                        <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                            <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                                <FlexView column >
                                    <Typography variant="h6" color="primary" >Activities</Typography>
                                </FlexView>

                                <FlexView column marginTop={20} >
                                    <ActivitiesTable/>
                                </FlexView>
                            </Col>
                        </Row>
                }

                <Row noGutters >
                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Footer position="relative" />
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Render uni profile section
     *
     * @returns {*}
     */
    renderuniCourseProfile = () => {
        const {
            currentStudent,

            originalStudent,
            studentEdited,
            allowEditing,

            clubAttributes,

            createuniCourseProfile,
            addNewDirector,
            newDirectorText,

            resetCreatinguniCourseProfile,

            toggleExpandUniProfileFillingForStudent,
            uploadUniProfile
        } = this.props;

        // student has already uploaded their uni profile
        if (originalStudent.uniCourseProfile) {
            return (
                /** Uni profile has been uploaded */
                <FlexView column >
                    <Typography variant="h6" color="primary">Uni profile</Typography>
                    <Row noGutters style={{ marginTop: 20 }} >
                        <Col xs={12} sm={12} md={6} lg={4} style={{ padding: 10, width: "100%" }} >
                            <FlexView column hAlignContent="center" >
                                <FlexView column width="100%" hAlignContent="center" >
                                    {
                                        !originalStudent.uniCourseProfile.hasOwnProperty('logo')
                                        || (
                                            originalStudent.uniCourseProfile.hasOwnProperty('logo')
                                            && originalStudent.uniCourseProfile.logo.findIndex(logoItem => !logoItem.hasOwnProperty('removed')) === -1
                                        )
                                            ?
                                            <Typography
                                                align="center"
                                                color="textSecondary"
                                                variant="body1">
                                                {
                                                    currentStudent.type !== DB_CONST.TYPE_PROF
                                                        ?
                                                        "You haven't uploaded your company logo"
                                                        :
                                                        "This student hasn't uploaded company logo"
                                                }
                                            </Typography>
                                            :
                                            <FlexView width={256} height={256} >
                                                <Image
                                                    roundedCircle
                                                    thumbnail
                                                    src={
                                                        originalStudent.uniCourseProfile.logo[originalStudent.uniCourseProfile.logo.findIndex(logoItem => !logoItem.hasOwnProperty('removed'))].url
                                                    }
                                                    style={{ width: "100%", maxHeight: 256, objectFit: "contain" }}
                                                />
                                            </FlexView>
                                    }
                                    {
                                        currentStudent.type === DB_CONST.TYPE_PROF
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20} >
                                                <Button
                                                    size="small"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    variant="outlined"
                                                    color="primary"
                                                    fullWidth
                                                    onClick={() => this.props.toggleEditImageDialog(UPLOAD_LOGO_MODE)}
                                                    style={{ width: 256 }}
                                                >Update logo
                                                </Button>
                                            </FlexView>
                                    }
                                </FlexView>

                                <FlexView column marginTop={80} marginBottom={20} width="100%" hAlignContent="center" style={{ paddingLeft: 25, paddingRight: 25 }} >
                                    {
                                        !originalStudent.uniCourseProfile.hasOwnProperty('video')
                                        || (
                                            originalStudent.uniCourseProfile.hasOwnProperty('video')
                                            && originalStudent.uniCourseProfile.video.findIndex(videoItem => !videoItem.hasOwnProperty('removed')) === -1
                                        )
                                            ?
                                            <Typography
                                                align="center"
                                                color="textSecondary"
                                                variant="body1">
                                                {
                                                    currentStudent.type !== DB_CONST.TYPE_PROF
                                                        ?
                                                        "You have no introduction video"
                                                        :
                                                        "This student has no introduction video"
                                                }
                                            </Typography>
                                            :
                                            <ReactPlayer
                                                url={
                                                    originalStudent.uniCourseProfile.video[
                                                        originalStudent.uniCourseProfile.video.findIndex(videoItem => !videoItem.hasOwnProperty('removed'))
                                                        ].url
                                                }
                                                width="100%"
                                                height="100%"
                                                controls={true}
                                                playing={false}
                                            />
                                    }

                                    {
                                        currentStudent.type === DB_CONST.TYPE_PROF
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    color="primary"
                                                    onClick={() => this.props.toggleEditVideoDialog(UPLOAD_VIDEO_MODE)}
                                                    style={{ width: 256 }}
                                                >Update introduction video
                                                </Button>
                                            </FlexView>
                                    }
                                </FlexView>
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={8} >
                            {/** Student project name */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel><b>Student project name</b></FormLabel>
                                    <TextField
                                        name="companyName"
                                        placeholder="Enter company name"
                                        value={studentEdited.uniCourseProfile.hasOwnProperty('companyName') ? studentEdited.uniCourseProfile.companyName : ''}
                                        margin="dense"
                                        variant="outlined"
                                        fullWidth
                                        onChange={this.handleEditStudent(editStudentActions.EDIT_ORDINARY_UNI_PROFILE_INFORMATION)}
                                        error={studentEdited.uniCourseProfile.hasOwnProperty('companyName') && studentEdited.uniCourseProfile.companyName.trim().length === 0}
                                    />
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Trading address */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel><b>Trading address</b></FormLabel>
                                    <FormGroup>
                                        <FlexView column>
                                            <TextField
                                                name="address1"
                                                placeholder="Address 1"
                                                value={
                                                    studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        studentEdited.uniCourseProfile.tradingAddress.address1
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditStudent(editStudentActions.EDIT_TRADING_ADDRESS_UNI_PROFILE)}
                                                error={
                                                    studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                    && studentEdited.uniCourseProfile.tradingAddress.address1.trim().length === 0
                                                }
                                            />
                                            <TextField
                                                name="address2"
                                                placeholder="Address 2"
                                                value={
                                                    studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        studentEdited.uniCourseProfile.tradingAddress.address2
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditStudent(editStudentActions.EDIT_TRADING_ADDRESS_UNI_PROFILE)}
                                            />
                                            <TextField
                                                name="address3"
                                                placeholder="Address 3"
                                                value={
                                                    studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        studentEdited.uniCourseProfile.tradingAddress.address3
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditStudent(editStudentActions.EDIT_TRADING_ADDRESS_UNI_PROFILE)}
                                            />
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="townCity"
                                                        placeholder="Town/City"
                                                        value={
                                                            studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                                ?
                                                                studentEdited.uniCourseProfile.tradingAddress.townCity
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditStudent(editStudentActions.EDIT_TRADING_ADDRESS_UNI_PROFILE)}
                                                        error={
                                                            studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                            && studentEdited.uniCourseProfile.tradingAddress.townCity.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="postcode"
                                                        placeholder="Postcode"
                                                        value={
                                                            studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                                ?
                                                                studentEdited.uniCourseProfile.tradingAddress.postcode.toUpperCase()
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditStudent(editStudentActions.EDIT_TRADING_ADDRESS_UNI_PROFILE)}
                                                        error={
                                                            studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress')
                                                            && studentEdited.uniCourseProfile.tradingAddress.postcode.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </FlexView>
                                    </FormGroup>
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {
                                !clubAttributes
                                    ?
                                    null
                                    :
                                    (
                                        <FlexView>
                                            <FormControl fullWidth >
                                                <FormLabel><b>Sector</b></FormLabel>
                                                <Select
                                                    name="sector"
                                                    value={
                                                        studentEdited.uniCourseProfile.hasOwnProperty('sector')
                                                            ?
                                                            studentEdited.uniCourseProfile.sector
                                                            :
                                                            ''
                                                    }
                                                    onChange={this.handleEditStudent(editStudentActions.EDIT_ORDINARY_UNI_PROFILE_INFORMATION)}
                                                    input={<OutlinedInput/>}
                                                    margin="dense"
                                                >

                                                    {
                                                        clubAttributes.Sectors.map((sector, index) => (
                                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </FlexView>
                                    )
                            }

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Directors */}
                            <FlexView column>
                                <FormControl
                                    error={
                                        studentEdited.uniCourseProfile.hasOwnProperty('directors')
                                        && studentEdited.uniCourseProfile.directors.length === 0
                                    }
                                >
                                    <FormLabel>
                                        <b>Directors</b>
                                    </FormLabel>

                                    <Row noGutters>
                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            {
                                                !studentEdited.uniCourseProfile.hasOwnProperty('directors')
                                                    ?
                                                    null
                                                    :
                                                    <List>
                                                        {
                                                            studentEdited.uniCourseProfile.directors.map((director, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                >
                                                                    <ListItemText>
                                                                        {director}
                                                                    </ListItemText>
                                                                    <ListItemSecondaryAction>
                                                                        <IconButton onClick={() => this.props.deleteDirectorTemporarily(index, true)} >
                                                                            <CloseIcon/>
                                                                        </IconButton>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            ))
                                                        }
                                                    </List>
                                            }

                                            {
                                                !studentEdited.uniCourseProfile.hasOwnProperty('directors')
                                                || (studentEdited.uniCourseProfile.hasOwnProperty('directors') && studentEdited.uniCourseProfile.directors.length === 0)
                                                    ?
                                                    null
                                                    :
                                                    <Divider style={{ marginTop: 10, marginBottom: 16 }} />
                                            }
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6} >
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            {
                                                !addNewDirector
                                                    ?
                                                    <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} >
                                                        <AddIcon fontSize="small" style={{ marginRight: 4 }} />
                                                        Add director
                                                    </Button>
                                                    :
                                                    <FlexView column >
                                                        <TextField
                                                            placeholder="Enter director's name"
                                                            name="newDirectorText"
                                                            value={newDirectorText}
                                                            fullWidth
                                                            variant="outlined"
                                                            onChange={this.handleEditStudent(editStudentActions.ADDING_NEW_DIRECTOR)}
                                                            margin="dense"
                                                        />

                                                        <FlexView marginTop={8} hAlignContent="right" >
                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} style={{ marginRight: 8 }} >Cancel</Button>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                className={css(sharedStyles.no_text_transform)}
                                                                onClick={() => this.props.addNewDirectorTemporarily(true)}
                                                                disabled={newDirectorText.trim().length === 0}
                                                            >
                                                                Add
                                                            </Button>
                                                        </FlexView>
                                                    </FlexView>
                                            }
                                        </Col>
                                    </Row>
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                            {/** Website */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel>
                                        <b>Company website</b>
                                    </FormLabel>
                                    <TextField
                                        name="companyWebsite"
                                        placeholder="Enter company website"
                                        value={
                                            studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                                ?
                                                studentEdited.uniCourseProfile.companyWebsite
                                                :
                                                ''
                                        }
                                        margin="dense"
                                        variant="outlined"
                                        fullWidth
                                        onChange={this.handleEditStudent(editStudentActions.EDIT_ORDINARY_UNI_PROFILE_INFORMATION)}
                                        error={
                                            (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                                && studentEdited.uniCourseProfile.companyWebsite.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                                && studentEdited.uniCourseProfile.companyWebsite.trim().length > 0
                                                && !utils.isValidWebURL(studentEdited.uniCourseProfile.companyWebsite)
                                            )
                                        }
                                    />
                                </FormControl>
                                {
                                    !studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                    || (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                        && studentEdited.uniCourseProfile.companyWebsite.trim().length === 0
                                    )
                                    || (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                        && studentEdited.uniCourseProfile.companyWebsite.trim().length > 0
                                        && utils.isValidWebURL(studentEdited.uniCourseProfile.companyWebsite)
                                    )
                                        ?
                                        null
                                        :
                                        <Typography variant="body2" color="error" align="left" > Invalid website URL </Typography>
                                }
                            </FlexView>

                            <FlexView hAlignContent="right" marginTop={30} >
                                <FlexView marginRight={20} >
                                    <Button variant="outlined" color="primary" onClick={() => this.props.cancelEditingStudent(editStudentActions.RESET_UNI_PROFILE)}>Cancel</Button>
                                </FlexView>
                                <FlexView>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            (
                                                currentStudent.type === DB_CONST.TYPE_PROF
                                                && !currentStudent.superTeacher
                                                && !allowEditing
                                            )
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('companyName') && studentEdited.uniCourseProfile.companyName.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('registeredOffice') && studentEdited.uniCourseProfile.registeredOffice.address1.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('registeredOffice') && studentEdited.uniCourseProfile.registeredOffice.townCity.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('registeredOffice') && studentEdited.uniCourseProfile.registeredOffice.postcode.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress') && studentEdited.uniCourseProfile.tradingAddress.address1.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress') && studentEdited.uniCourseProfile.tradingAddress.townCity.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('tradingAddress') && studentEdited.uniCourseProfile.tradingAddress.postcode.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('directors') && studentEdited.uniCourseProfile.directors.length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite') && studentEdited.uniCourseProfile.companyWebsite.trim().length === 0)
                                            || (studentEdited.uniCourseProfile.hasOwnProperty('companyWebsite')
                                                && studentEdited.uniCourseProfile.companyWebsite.trim().length > 0
                                                && !utils.isValidWebURL(studentEdited.uniCourseProfile.companyWebsite)
                                            )
                                            || JSON.stringify(originalStudent.uniCourseProfile) === JSON.stringify(studentEdited.uniCourseProfile)
                                        }
                                        onClick={() => this.props.commitStudentProfileChanges(editStudentActions.COMMIT_UNI_PROFILE_CHANGES)}
                                    >
                                        Save
                                    </Button>
                                </FlexView>
                            </FlexView>
                            {
                                currentStudent.type === DB_CONST.TYPE_PROF
                                && !currentStudent.superTeacher
                                && !allowEditing
                                    ?
                                    <Typography variant="body1" color="error" align="right" style={{ marginTop: 25 }}>This student is not a home member of your course. So, you cannot edit their profile.</Typography>
                                    :
                                    null
                            }
                        </Col>
                    </Row>
                </FlexView>
            );
        }
        // student has not uploaded their uni profile yet
        else {
            // if the student is not a super student
            if (currentStudent.type !== DB_CONST.TYPE_PROF) {
                return (
                    // student has not uploaded Uni profile yet
                    <FlexView column >
                        <FlexView column >
                            <Typography variant="h6" color="primary" style={{ marginBottom: 4 }} >Uni profile</Typography>
                            {
                                originalStudent.type === DB_CONST.TYPE_TEACHER
                                    ?
                                    null
                                    :
                                    <Row noGutters >
                                        <Col xs={12} sm={12} md={{span: 6, offset: 3}} lg={{span: 4, offset: 4}} >
                                            <Button
                                                fullWidth
                                                className={css(sharedStyles.no_text_transform)}
                                                color={
                                                    !createuniCourseProfile.expanduniCourseProfileFilling
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                variant="outlined"
                                                size="medium"
                                                onClick={toggleExpandUniProfileFillingForStudent}
                                                style={{ marginTop: 25, marginBottom: 20 }}
                                            >
                                                {
                                                    !createuniCourseProfile.expanduniCourseProfileFilling
                                                        ?
                                                        "Create company profile (optional)"
                                                        :
                                                        "Cancel creating company profile"
                                                }
                                            </Button>
                                        </Col>
                                    </Row>
                            }
                        </FlexView>

                        {
                            originalStudent.type === DB_CONST.TYPE_TEACHER
                            || createuniCourseProfile.expanduniCourseProfileFilling
                                ?
                                // start filling in Uni profile
                                <FlexView column marginTop={20} >
                                    {/** Student project name */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Student project name</b>
                                            </FormLabel>
                                            <TextField
                                                placeholder="Enter company name"
                                                name="companyName"
                                                value={createuniCourseProfile.uniCourseProfile.companyName}
                                                fullWidth
                                                variant="outlined"
                                                margin="dense"
                                                onChange={
                                                    this.handleCreateuniCourseProfileTextChanged(createuniCourseProfileActions.ORDINARY_UNI_PROFILE_FIELDS_CHANGED)
                                                }
                                            />
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Directors */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Company directors</b>
                                            </FormLabel>

                                            <Row noGutters >
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <List>
                                                        {
                                                            createuniCourseProfile.uniCourseProfile.directors.map((director, index) => (
                                                                <ListItem key={index} >
                                                                    <ListItemText> {director} </ListItemText>
                                                                    <ListItemSecondaryAction>
                                                                        <IconButton onClick={() => this.props.deleteDirectorTemporarily(index, false)} >
                                                                            <CloseIcon/>
                                                                        </IconButton>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            ))
                                                        }
                                                    </List>

                                                    {
                                                        createuniCourseProfile.uniCourseProfile.directors.length === 0
                                                            ?
                                                            null
                                                            :
                                                            <Divider style={{ marginTop: 10, marginBottom: 16 }} />
                                                    }
                                                </Col>

                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                </Col>

                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    {
                                                        !addNewDirector
                                                            ?
                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} >
                                                                <AddIcon fontSize="small" style={{ marginRight: 4 }} />
                                                                Add director
                                                            </Button>
                                                            :
                                                            <FlexView column >
                                                                <TextField
                                                                    placeholder="Enter director's name"
                                                                    name="newDirectorText"
                                                                    value={newDirectorText}
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    onChange={this.handleEditStudent(editStudentActions.ADDING_NEW_DIRECTOR)}
                                                                    margin="dense"
                                                                />

                                                                <FlexView marginTop={8} hAlignContent="right" >
                                                                    <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} style={{ marginRight: 8 }} >Cancel</Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="primary"
                                                                        className={css(sharedStyles.no_text_transform)}
                                                                        onClick={() => this.props.addNewDirectorTemporarily(false)}
                                                                        disabled={newDirectorText.trim().length === 0}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </FlexView>
                                                            </FlexView>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormControl>
                                    </FlexView>

                                    <Divider
                                        style={{ marginTop: 20, marginBottom: 20 }}
                                    />

                                    {/** Uni sector */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Uni sector</b>
                                            </FormLabel>
                                            <Select
                                                name="sector"
                                                value={createuniCourseProfile.uniCourseProfile.sector}
                                                input={<OutlinedInput/>}
                                                margin="dense"
                                                onChange={ this.handleCreateuniCourseProfileTextChanged(createuniCourseProfileActions.ORDINARY_UNI_PROFILE_FIELDS_CHANGED) }
                                            >
                                                <MenuItem key={-1} value={'None'} >Choose uni sector</MenuItem>
                                                {
                                                    clubAttributes
                                                        ?
                                                        clubAttributes.Sectors.map((sector, index) => (
                                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                                        ))
                                                        :
                                                        null
                                                }
                                            </Select>
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Company Website */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Company website</b>
                                            </FormLabel>
                                            <TextField
                                                placeholder="Enter company website"
                                                name="companyWebsite"
                                                value={createuniCourseProfile.uniCourseProfile.companyWebsite}
                                                fullWidth
                                                variant="outlined"
                                                margin="dense"
                                                onChange={
                                                    this.handleCreateuniCourseProfileTextChanged(createuniCourseProfileActions.ORDINARY_UNI_PROFILE_FIELDS_CHANGED)
                                                }
                                            />
                                            {
                                                createuniCourseProfile.uniCourseProfile.companyWebsite.trim().length === 0
                                                || utils.isValidWebURL(createuniCourseProfile.uniCourseProfile.companyWebsite)
                                                    ?
                                                    null
                                                    :
                                                    <Typography variant="body2" color="error" align="left" >Invalid website URL</Typography>
                                            }
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Upload logo and introduction video */}
                                    <FlexView marginBottom={20} width="100%" hAlignContent="center" >
                                        <Row style={{ width: "100%" }} >
                                            {/** Upload logo */}
                                            <Col xs={12} sm={12} md={6} lg={6} style={{ padding: 15 }} >
                                                <FlexView column width="100%" hAlignContent="center" >
                                                    <FlexView className={css(styles.upload_files_area_style)} onClick={() => this.props.toggleEditImageDialog(UPLOAD_LOGO_FIRST_TIME_MODE)} >
                                                        <Typography variant="body2" align="center" >Upload company logo (optional)</Typography>
                                                    </FlexView>
                                                    {
                                                        !createuniCourseProfile.logoToBeUploaded
                                                            ?
                                                            null
                                                            :
                                                            <FlexView width={270} height={270} marginTop={28} >
                                                                <Image src={window.URL.createObjectURL(createuniCourseProfile.logoToBeUploaded)} roundedCircle thumbnail style={{ maxHeight: 270, width: "100%", objectFit: "scale-down" }}/>
                                                            </FlexView>
                                                    }
                                                </FlexView>
                                            </Col>

                                            {/** Upload introduction video */}
                                            <Col xs={12} sm={12} md={6} lg={6} style={{ padding: 15 }} >
                                                <FlexView column width="100%" hAlignContent="center" >
                                                    <FlexView vAlignContent="center" >
                                                        <FlexView className={css(styles.upload_files_area_style)} onClick={() => this.props.toggleEditVideoDialog(UPLOAD_VIDEO_FIRST_TIME_MODE)} >
                                                            <Typography variant="body2" align="center" >Upload introduction video (optional)</Typography>
                                                        </FlexView>

                                                        <OverlayTrigger
                                                            trigger={['hover', 'focus']}
                                                            placement="top"
                                                            flip
                                                            overlay={
                                                                <Tooltip id={`tooltip-top`} >Introduction video helps other members understand more about your uni.</Tooltip>
                                                            }>
                                                            <InfoIcon
                                                                fontSize="default"
                                                                style={{
                                                                    marginLeft: 14,
                                                                    color: colors.gray_600
                                                                }}
                                                            />
                                                        </OverlayTrigger>
                                                    </FlexView>
                                                    {
                                                        !createuniCourseProfile.videoToBeUploaded
                                                            ?
                                                            null
                                                            :
                                                            <FlexView marginTop={28} >
                                                                <ReactPlayer
                                                                    url={
                                                                        typeof (createuniCourseProfile.videoToBeUploaded) === "string"
                                                                            ?
                                                                            createuniCourseProfile.videoToBeUploaded
                                                                            :
                                                                            window.URL.createObjectURL(createuniCourseProfile.videoToBeUploaded)
                                                                    }
                                                                    controls={true}
                                                                    playing={false}
                                                                    width="100%"
                                                                    height="auto"
                                                                />
                                                            </FlexView>
                                                    }
                                                </FlexView>
                                            </Col>
                                        </Row>
                                    </FlexView>

                                    <FlexView grow={1} hAlignContent="right" marginTop={30} marginBottom={20} >
                                        <FlexView marginRight={20} >
                                            <Button variant="outlined" color="primary" onClick={resetCreatinguniCourseProfile}>Cancel</Button>
                                        </FlexView>
                                        <FlexView>
                                            <Button variant="contained" color="primary" onClick={uploadUniProfile} disabled={this.shouldUploadButtonBeDisabled()}>Save</Button>
                                        </FlexView>
                                    </FlexView>
                                </FlexView>
                                :
                                null
                        }
                    </FlexView>
                );
            } else {
                return (
                    <FlexView column >
                        <Typography variant="h6" color="primary" >Uni profile</Typography>
                        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: 15 }} >Uni profile has not been uploaded.</Typography>
                    </FlexView>
                );
            }
        }
    };

    /**
     * Check if the student can upload uni profile --> only allow upload when all the required information has been provided
     *
     * @returns {boolean}
     */
    shouldUploadButtonBeDisabled = () => {
        const {
            originalStudent,
            createuniCourseProfile,
        } = this.props;

        // student is an issuer
        if (originalStudent.type === DB_CONST.TYPE_TEACHER) {
            if (createuniCourseProfile.uniCourseProfile.companyName.trim().length === 0
                || createuniCourseProfile.uniCourseProfile.registrationNo.trim().length === 0
                || createuniCourseProfile.uniCourseProfile.registeredOffice.address1.trim().length === 0
                || createuniCourseProfile.uniCourseProfile.registeredOffice.townCity.trim().length === 0
                || createuniCourseProfile.uniCourseProfile.registeredOffice.postcode.trim().length === 0
                || createuniCourseProfile.uniCourseProfile.directors.length === 0
                || createuniCourseProfile.uniCourseProfile.sector === 'None'
                || createuniCourseProfile.uniCourseProfile.companyWebsite.trim().length === 0
                || (createuniCourseProfile.uniCourseProfile.companyWebsite.trim().length > 0
                    && !utils.isValidWebURL(createuniCourseProfile.uniCourseProfile.companyWebsite)
                )
            ) {
                return true;
            }
        }
        // student is an investor
        else if (originalStudent.type === DB_CONST.TYPE_INVESTOR) {
            if (createuniCourseProfile.expanduniCourseProfileFilling) {
                if (createuniCourseProfile.uniCourseProfile.companyName.trim().length === 0
                    || createuniCourseProfile.uniCourseProfile.registrationNo.trim().length === 0
                    || createuniCourseProfile.uniCourseProfile.registeredOffice.address1.trim().length === 0
                    || createuniCourseProfile.uniCourseProfile.registeredOffice.townCity.trim().length === 0
                    || createuniCourseProfile.uniCourseProfile.registeredOffice.postcode.trim().length === 0
                    || createuniCourseProfile.uniCourseProfile.directors.length === 0
                    || createuniCourseProfile.uniCourseProfile.sector === 'None'
                    || createuniCourseProfile.uniCourseProfile.companyWebsite.trim().length === 0
                    || (createuniCourseProfile.uniCourseProfile.companyWebsite.trim().length > 0
                        && !utils.isValidWebURL(createuniCourseProfile.uniCourseProfile.companyWebsite)
                    )
                ) {
                    return true;
                }
            } else {
                return true;
            }
        }

        return false;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfile);

const styles = StyleSheet.create({
    upload_files_area_style: {
        padding: 12,
        textAlign: 'center',
        border: `1px solid ${colors.gray_400}`,

        ':hover': {
            backgroundColor: colors.blue_gray_50,
            cursor: 'pointer'
        }
    },

    address_list: {
        backgroundColor: colors.blue_gray_50,
        borderRadius: 3,
        padding: 4,
        width: "90%",

        position: 'relative',
        overflow: 'auto',
        maxHeight: 300
    },

    enter_address_manually: {
        marginTop: 6,
        ':hover': {
            color: colors.blue_gray_600,
            cursor: 'pointer',
            textDecoration: 'underline'
        }
    }
});