import React, {Component} from 'react';
import {
    Button,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import {Col, Row} from "react-bootstrap";
import FlexView from "react-flexview";
import {HashLoader} from "react-spinners";
import {NavLink} from "react-router-dom";
import {css} from "aphrodite";
import InfoOverlay from "../../../shared-components/info_overlay/InfoOverlay";
import {connect} from "react-redux";
import * as invitedStudentsActions from "../../../redux-store/actions/invitedStudentsActions";
import * as invitationDialogActions from "../../../redux-store/actions/invitationDialogActions";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as ROUTES from "../../../router/routes";
import * as myUtils from "../../../utils/utils";
import * as colors from "../../../values/colors";

export const FILTER_REGISTRATION_STATUS_ALL = -1;

export const FILTER_COURSE_STUDENTS_ALL = 0;
export const FILTER_HOME_STUDENTS = 1;
export const FILTER_PLATFORM_STUDENTS = 2;

const mapStateToProps = state => {
    return {
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        courseProperties: state.manageCourseFromParams.courseProperties,

        systemCourses: state.manageSystemCourses.systemCourses,
        coursesLoaded: state.manageSystemCourses.coursesLoaded,

        teacher: state.auth.student,

        invitedStudents: state.invitedStudents.invitedStudents,
        invitedStudentsLoaded: state.invitedStudents.invitedStudentsLoaded,
        invitedStudentsBeingLoaded: state.invitedStudents.invitedStudentsBeingLoaded,

        invitedStudentsPage: state.invitedStudents.invitedStudentsPage,
        invitedStudentsRowsPerPage: state.invitedStudents.invitedStudentsRowsPerPage,

        filterRegistrationStatus: state.invitedStudents.filterRegistrationStatus,
        filterStudentType: state.invitedStudents.filterStudentType,
        filterMembers: state.invitedStudents.filterMembers,
        filterCourse: state.invitedStudents.filterCourse,

        invitedStudentSearchText: state.invitedStudents.invitedStudentSearchText,
        invitedStudentsInSearchMode: state.invitedStudents.invitedStudentsInSearchMode,

        requestingCsv: state.invitedStudents.requestingCsv,
        addingMembersFromOneCourseToAnotherCourse: state.invitedStudents.addingMembersFromOneCourseToAnotherCourse,

        matchedInvitedStudents: state.invitedStudents.matchedInvitedStudents
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadInvitedStudents: () => dispatch(invitedStudentsActions.loadInvitedStudents()),
        toggleSearchMode: () => dispatch(invitedStudentsActions.toggleInvitedStudentsSearchMode()),
        handleInputChanged: (event) => dispatch(invitedStudentsActions.handleInputChanged(event)),
        handleChangeTablePage: (event, newPage) => dispatch(invitedStudentsActions.handleChangeTablePage(event, newPage)),
        handleChangeTableRowsPerPage: (event) => dispatch(invitedStudentsActions.handleChangeTableRowsPerPage(event)),
        startListeningForInvitedStudentsChanged: () => dispatch(invitedStudentsActions.startListeningForInvitedStudentsChanged()),
        resendInvite: (invitedStudent) => dispatch(invitedStudentsActions.resendInvite(invitedStudent)),
        exportToCsv: () => dispatch(invitedStudentsActions.exportToCsv()),
        addMembersFromOneCourseToAnotherCourse: (fromCourse, toCourse) => dispatch(invitedStudentsActions.addMembersFromOneCourseToAnotherCourse(fromCourse, toCourse)),

        toggleInvitationDialog: () => dispatch(invitationDialogActions.toggleInvitationDialog())
    }
};

class InvitedStudents extends Component {

    componentDidMount() {
        const {
            invitedStudents,
            invitedStudentsLoaded,
            invitedStudentsBeingLoaded,

            loadInvitedStudents
        } = this.props;

        if (invitedStudents && !invitedStudentsBeingLoaded && !invitedStudentsLoaded) {
            loadInvitedStudents();
        }

        this.addListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            invitedStudents,
            invitedStudentsLoaded,
            invitedStudentsBeingLoaded,

            loadInvitedStudents
        } = this.props;

        if (invitedStudents && !invitedStudentsBeingLoaded && !invitedStudentsLoaded) {
            loadInvitedStudents();
        }

        this.addListener();
    }

    /**
     * Add listener
     */
    addListener = () => {
        const {
            invitedStudents,
            invitedStudentsLoaded,

            startListeningForInvitedStudentsChanged
        } = this.props;

        if (invitedStudents && invitedStudentsLoaded) {
            startListeningForInvitedStudentsChanged();
        }
    };

    render() {
        const {
            teacher,

            filterRegistrationStatus,
            filterStudentType,
            filterMembers,
            filterCourse,
            invitedStudentSearchText,
            invitedStudentsInSearchMode,

            systemCourses,
            coursesLoaded,
            requestingCsv,
            addingMembersFromOneCourseToAnotherCourse,

            toggleInvitationDialog,
            toggleSearchMode,
            handleInputChanged,
            exportToCsv,
            addMembersFromOneCourseToAnotherCourse
        } = this.props;

        return (
            <FlexView column width="100%">
                <Divider style={{marginBottom: 30}}/>

                {/** Invite new student button - available for course teachers only */}
                {
                    teacher.superTeacher
                        ?
                        null
                        :
                        <Row style={{marginBottom: 30}}>
                            <Col xs={12} md={5} lg={12}>
                                <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleInvitationDialog}>
                                    <Add style={{ marginRight: 10, width: 20, height: "auto"}}/>Invite new course member</Button>
                            </Col>
                        </Row>
                }

                {/** Filters */}
                <Row>
                    {/** Registration status */}
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>
                                <Typography variant="body1" color="primary" align="left">Registration status</Typography>
                            </InputLabel>
                            <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterRegistrationStatus"/>
                                }
                                style={{marginTop: 25, width: "100%"}}
                                name="filterRegistrationStatus"
                                value={filterRegistrationStatus}
                                onChange={handleInputChanged}>
                                <MenuItem value={FILTER_REGISTRATION_STATUS_ALL}> All</MenuItem>
                                <MenuItem value={DB_CONST.INVITED_STUDENT_NOT_REGISTERED}>Not registered</MenuItem>
                                <MenuItem value={DB_CONST.INVITED_STUDENT_STATUS_ACTIVE}>Active</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>

                    {/** Student type */}
                    <Col xs={12} sm={12} md={4} lg={3}>
                        <FormControl fullWidth>
                            <InputLabel>
                                <Typography variant="body1" color="primary" align="left">Student type</Typography>
                            </InputLabel>
                            <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterStudentType"/>
                                }
                                style={{ marginTop: 25, width: "100%"}}
                                name="filterStudentType"
                                value={filterStudentType}
                                onChange={handleInputChanged}>
                                <MenuItem value={0}>All</MenuItem>
                                <MenuItem value={DB_CONST.TYPE_STUDENT}>Student</MenuItem>
                                <MenuItem value={DB_CONST.TYPE_TEACHER}>Teacher</MenuItem>
                            </Select>
                        </FormControl>
                    </Col>

                    {/** Course members */}
                    {
                        !teacher.superTeacher
                            ?
                            <Col xs={12} sm={12} md={4} lg={3}>
                                <FlexView vAlignContent="center">
                                    <FormControl fullWidth>
                                        <InputLabel>
                                            <Typography variant="body1" color="primary" align="left">Members</Typography>
                                        </InputLabel>
                                        <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterMembers"/>
                                            }
                                            style={{ marginTop: 25, width: "100%"}}
                                            name="filterMembers"
                                            value={filterMembers}
                                            onChange={handleInputChanged}
                                        >
                                            <MenuItem value={FILTER_COURSE_STUDENTS_ALL} key={FILTER_COURSE_STUDENTS_ALL}>All</MenuItem>
                                            <MenuItem value={FILTER_HOME_STUDENTS} key={FILTER_HOME_STUDENTS}>Core student members</MenuItem>
                                            <MenuItem value={FILTER_PLATFORM_STUDENTS} key={FILTER_PLATFORM_STUDENTS}>Platform student members</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FlexView marginLeft={15}>
                                        <InfoOverlay
                                            placement="right"
                                            message={
                                                "Home members are the students that registered through this course. Platform members are existing students of Invest West who requested access to this course."
                                            }
                                        />
                                    </FlexView>
                                </FlexView>
                            </Col>
                            :
                            <Col xs={12} sm={12} md={4} lg={3}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        <Typography variant="body1" color="primary" align="left">Course</Typography>
                                    </InputLabel>
                                    <Select margin="dense" input={<OutlinedInput labelWidth={0} name="filterCourse" disabled={!coursesLoaded}/>
                                        }
                                        style={{marginTop: 25, width: "100%"}}
                                        name="filterCourse"
                                        value={filterCourse}
                                        onChange={handleInputChanged}>
                                        <MenuItem value="null" key="null">
                                            {
                                                !coursesLoaded
                                                    ?
                                                    "Loading courses ..."
                                                    :
                                                    "All"
                                            }
                                        </MenuItem>
                                        {
                                            !coursesLoaded
                                                ?
                                                null
                                                :
                                                systemCourses.map(course => (
                                                    <MenuItem value={course.anid} key={course.anid}>{course.displayName}</MenuItem>
                                                ))
                                        }
                                    </Select>
                                </FormControl>
                            </Col>
                    }
                </Row>

                {/** Search email */}
                <Row
                    style={{ marginTop: 30,  marginBottom: 30}}>
                    <Col xs={12} sm={12} md={12} lg={8}>
                        <FlexView>
                            <FlexView basis="90%" vAlignContent="center" hAlignContent="center"
                            >
                                <TextField value={invitedStudentSearchText} label="Search by email" name="invitedStudentSearchText" fullWidth variant="outlined" margin="dense" onChange={handleInputChanged}/>
                            </FlexView>
                            <FlexView hAlignContent="center" vAlignContent="center" basis="10%" marginLeft={10}>
                                <IconButton style={{width: 50,height: 50}}
                                    onClick={toggleSearchMode}>
                                    {
                                        !invitedStudentsInSearchMode
                                            ?
                                            <SearchIcon/>
                                            :
                                            <CloseIcon/>
                                    }
                                </IconButton>
                            </FlexView>
                        </FlexView>
                    </Col>
                </Row>

                {/** Add members (only students) from QIB to Silicon Gorge and vice versa */}
                {
                    !teacher.superTeacher
                        ?
                        null
                        :
                        systemCourses.findIndex(course => course.anid === filterCourse) !== -1
                        && (
                            systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].courseStudentName === "qib"
                            || systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].courseStudentName === "iap-silicon-gorge"
                        )
                            ?
                            <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)}
                                    onClick={
                                        systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].courseStudentName === "qib"
                                            ?
                                            () => addMembersFromOneCourseToAnotherCourse(
                                                // from qib
                                                systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].anid,
                                                // to sg
                                                systemCourses[systemCourses.findIndex(course => course.courseStudentName === "iap-silicon-gorge")].anid
                                            )
                                            :
                                            () => addMembersFromOneCourseToAnotherCourse(
                                                // from sg
                                                systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].anid,
                                                // to qib
                                                systemCourses[systemCourses.findIndex(course => course.courseStudentName === "qib")].anid
                                            )
                                    }
                                    style={{marginRight: 10}}>
                                    {
                                        addingMembersFromOneCourseToAnotherCourse
                                            ?
                                            "Adding ..."
                                            :
                                            systemCourses[systemCourses.findIndex(course => course.anid === filterCourse)].courseStudentName === "qib"
                                                ?
                                                "Add members from QIB to Silicon Gorge"
                                                :
                                                "Add members from Silicon Gorge to QIB"
                                    }
                                </Button>
                            </FlexView>
                            :
                            null
                }

                {/** Export button - only available for teachers */}
                {
                    teacher.type !== DB_CONST.TYPE_TEACHER
                        ?
                        null
                        :
                        <FlexView vAlignContent="center" marginTop={30} marginBottom={20}>
                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={exportToCsv} style={{marginRight: 10}}
                            >
                                {
                                    requestingCsv
                                        ?
                                        "Exporting ..."
                                        :
                                        "Export to csv"
                                }
                            </Button>

                            <InfoOverlay placement="right"
                                message={
                                    teacher.superTeacher
                                        ?
                                        "Export all the students in the system to a .csv file."
                                        :
                                        "Export all the members in your course to a .csv file."
                                }
                            />
                        </FlexView>
                }

                {
                    this.renderInvitedStudentsTable()
                }
            </FlexView>
        );
    }

    /**
     * Render invited students table
     *
     * @returns {null|*}
     */
    renderInvitedStudentsTable() {
        const {
            teacher,

            matchedInvitedStudents,

            invitedStudentsPage,
            invitedStudentsRowsPerPage,

            handleChangeTablePage,
            handleChangeTableRowsPerPage
        } = this.props;

        return (
            <Paper elevation={0} style={{width: "100%", overflowX: "auto", marginTop: 20}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Name</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Email</b></Typography>
                            </TableCell>
                            {
                                !teacher.superTeacher
                                    ?
                                    null
                                    :
                                    <TableCell colSpan={2}>
                                        <Typography align="left" variant="body2"><b>Course</b></Typography>
                                    </TableCell>
                            }
                            <TableCell colSpan={1}>
                                <Typography align="left" variant="body2"><b>Student type</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2"><b>Invited/requested to join date</b></Typography>
                            </TableCell>
                            <TableCell colSpan={1}>
                                <Typography align="left" variant="body2"><b>Registration status</b></Typography>
                            </TableCell>
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2" ><b>Registered/joined date</b></Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.renderInvitedStudentsRows()
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination rowsPerPageOptions={[5, 10, 25]} count={matchedInvitedStudents.length} rowsPerPage={invitedStudentsRowsPerPage} page={invitedStudentsPage}
                                backIconButtonProps={{
                                    'aria-label': 'Previous Page',
                                }}
                                nextIconButtonProps={{
                                    'aria-label': 'Next Page',
                                }}
                                SelectProps={{
                                    native: true,
                                }}
                                onChangePage={handleChangeTablePage}
                                onChangeRowsPerPage={handleChangeTableRowsPerPage}/>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    } catch (error) {
        console.error("Error in renderInvitedStudentsTable:", error);
        return null;
    }

    /**
     * Render invited students rows
     *
     * @returns {*}
     */
    renderInvitedStudentsRows = () => {
        const {
            courseStudentName,
            courseProperties,
            teacher,
            invitedStudentsLoaded,
            matchedInvitedStudents,
            invitedStudentsPage,
            invitedStudentsRowsPerPage,
            invitedStudentsInSearchMode,
            filterRegistrationStatus,
            filterStudentType,
            filterCourse,
            filterMembers,
            resendInvite
        } = this.props;

        let renderedInvitedStudents = [];

        if (matchedInvitedStudents.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={12}>
                        <FlexView style={{ margin: 40}} hAlignContent="center" vAlignContent="center">
                            {
                                invitedStudentsLoaded
                                    ?
                                    <Typography variant="h6" align="center">
                                        {
                                            invitedStudentsInSearchMode
                                            || filterRegistrationStatus !== FILTER_REGISTRATION_STATUS_ALL
                                            || filterStudentType !== 0
                                            || filterCourse !== "null"
                                            || filterMembers !== FILTER_COURSE_STUDENTS_ALL
                                                ?
                                                "There are no students found using your current filter criteria."
                                                :
                                                "No students found."
                                        }
                                    </Typography>
                                    :
                                    <HashLoader color={colors.primaryColor}/>
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        let matchedStudentsInvitedByTheCourse = matchedInvitedStudents.filter(
            student => student.hasOwnProperty('invitedDate') && student.invitedDate !== "none"
        );
        matchedStudentsInvitedByTheCourse.sort((student1, student2) => {
            return student2.invitedDate - student1.invitedDate;
        });

        let matchedStudentsRequestedToJoin = matchedInvitedStudents.filter(
            student => student.hasOwnProperty('invitedDate') && student.invitedDate === "none"
        );
        matchedStudentsRequestedToJoin.sort((student1, student2) => {
            return student2.requestedToJoinDate - student1.requestedToJoinDate;
        });

        if (filterMembers === FILTER_HOME_STUDENTS) {
            renderedInvitedStudents = [...matchedStudentsInvitedByTheCourse];
        } else if (filterMembers === FILTER_PLATFORM_STUDENTS) {
            renderedInvitedStudents = [...matchedStudentsRequestedToJoin];
        } else {
            renderedInvitedStudents = [...matchedStudentsInvitedByTheCourse, ...matchedStudentsRequestedToJoin];
        }

        return (
            !renderedInvitedStudents
                ?
                null
                :
                renderedInvitedStudents
                    .slice(invitedStudentsPage * invitedStudentsRowsPerPage, invitedStudentsPage * invitedStudentsRowsPerPage + invitedStudentsRowsPerPage)
                    .map(invitedStudent => (
                        <TableRow hover key={invitedStudent.id}>
                            {/** Student name */}
                            <TableCell colSpan={2}>
                                <FlexView column>
                                    {/** Student name */}
                                    {invitedStudent.officialStudent ? (
                                    <NavLink
                                        to={
                                            invitedStudent.hasOwnProperty('officialStudentID')
                                                ?
                                                courseStudentName
                                                    ?
                                                    ROUTES.EDIT_STUDENT_PROFILE
                                                        .replace(":courseStudent", courseStudentName)
                                                        .replace(":studentID", invitedStudent.officialStudentID)
                                                    :
                                                    ROUTES.EDIT_STUDENT_PROFILE_INVEST_WEST_SUPER
                                                        .replace(":studentID", invitedStudent.officialStudentID)
                                                :
                                                courseStudentName
                                                    ?
                                                    ROUTES.STUDENT_PROFILE
                                                        .replace(":courseStudent", courseStudentName)
                                                        .replace(":studentID", invitedStudent.id)
                                                    :
                                                    ROUTES.STUDENT_PROFILE_STUDENT_SUPER
                                                        .replace(":studentID", invitedStudent.id)
                                        }
                                        className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                    >
                                        <Typography color="primary" align="left">
                                            {`${invitedStudent.officialStudent.firstName} ${invitedStudent.officialStudent.lastName}`}
                                        </Typography>
                                    </NavLink>

                                    ) : (
                                        <Typography color="textSecondary" align="left">
                                            Student not found
                                        </Typography>
                                    )}

                                    {/** Resend invite button */}
                                    {
                                        invitedStudent.status === DB_CONST.INVITED_STUDENT_STATUS_ACTIVE
                                            ?
                                            null
                                            :
                                            // this check to ensure only the course teacher that initally invited this
                                            // student can resend the invitation
                                            teacher.superTeacher
                                            || (!teacher.superTeacher
                                                && courseProperties
                                                && courseProperties.anid !== invitedStudent.invitedBy
                                            )
                                                ?
                                                null
                                                :
                                                <FlexView marginTop={10}>
                                                    <Button variant="outlined" size="small" color="primary" className={css(sharedStyles.no_text_transform)} onClick={() => resendInvite(invitedStudent)}>Resend invite</Button>
                                                </FlexView>
                                    }

                                    {/** Display home/platform members */}
                                    {
                                        teacher.superTeacher
                                            ?
                                            null
                                            :
                                            <Typography align="left" variant="body2" color="textSecondary" style={{ marginTop: 15}}>
                                                {
                                                    invitedStudent.hasOwnProperty('invitedDate')
                                                    && invitedStudent.invitedDate !== "none"
                                                        ?
                                                        "Home member"
                                                        :
                                                        "Platform member"
                                                }
                                            </Typography>
                                    }
                                </FlexView>
                            </TableCell>

                            {/** Email */}
                            <TableCell colSpan={2}>
                                <FlexView column>
                                    <Typography align="left" variant="body2" paragraph={teacher.superTeacher}>{invitedStudent.email}</Typography>

                                    {
                                        teacher.superTeacher
                                            ?
                                            <FlexView column>
                                                <Typography align="left" variant="body2" color="textSecondary"><b><u>Invited ID:</u></b> {invitedStudent.id}</Typography>
                                                {
                                                    !invitedStudent.hasOwnProperty('officialStudentID')
                                                        ?
                                                        null
                                                        :
                                                        <Typography align="left" variant="body2" color="textSecondary"><b><u>UID:</u></b> {invitedStudent.officialStudentID}</Typography>
                                                }
                                            </FlexView>
                                            :
                                            null
                                    }
                                </FlexView>
                            </TableCell>

                            {/** Course the student belongs to - available only for super teachers */}
                            {
                                !teacher.superTeacher
                                    ?
                                    null
                                    :
                                    <TableCell colSpan={2}>
                                        <FlexView column>
                                            <Typography align="left" variant="body2" paragraph>
                                                {invitedStudent.Invitor.displayName}
                                            </Typography>

                                            <Typography align="left" variant="body2" color="textSecondary">
                                                {
                                                    invitedStudent.hasOwnProperty('invitedDate')
                                                    && invitedStudent.invitedDate !== "none"
                                                        ?
                                                        "Home member"
                                                        :
                                                        "Platform member"
                                                }
                                            </Typography>
                                        </FlexView>
                                    </TableCell>
                            }

                            {/** Student type */}
                            <TableCell colSpan={1}>
                                <Typography align="left"  variant="body2">
                                    {
                                        invitedStudent.type === DB_CONST.TYPE_TEACHER
                                            ?
                                            "Teacher"
                                            :
                                            "Student"
                                    }
                                </Typography>
                            </TableCell>

                            {/** Date invited / requested to join / registered via public link */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        invitedStudent.invitedDate !== "none"
                                        && (
                                            invitedStudent.hasOwnProperty('requestedToJoinDate')
                                            && invitedStudent.requestedToJoinDate !== "none"
                                        )
                                            ?
                                            `Registered via public link on ${myUtils.dateInReadableFormat(invitedStudent.invitedDate)}`
                                            :
                                            invitedStudent.invitedDate !== "none"
                                                ?
                                                `Invited on ${myUtils.dateInReadableFormat(invitedStudent.invitedDate)}`
                                                :
                                                `Requested to join on ${myUtils.dateInReadableFormat(invitedStudent.requestedToJoinDate)}`
                                    }
                                </Typography>
                            </TableCell>

                            {/** Registration status */}
                            <TableCell colSpan={1}>{this.renderInvitedStudentRegistrationStatus(invitedStudent)}</TableCell>

                            {/** Date registered/joined */}
                            <TableCell colSpan={2}>
                                <Typography align="left" variant="body2">
                                    {
                                        !invitedStudent.hasOwnProperty('joinedDate')
                                            ?
                                            null
                                            :
                                            !invitedStudent.requestedToJoin
                                                ?
                                                `Registered on ${myUtils.dateInReadableFormat(invitedStudent.joinedDate)}`
                                                :
                                                `Joined on ${myUtils.dateInReadableFormat(invitedStudent.joinedDate)}`
                                    }
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))
        );
    };

    /**
     * This function is used to render invited Students' registration status
     *
     * @param invitedStudent
     * @returns {null|*}
     */
    renderInvitedStudentRegistrationStatus = invitedStudent => {

        let msgObj = {
            msg: '',
            color: ''
        };

        switch (invitedStudent.status) {
            case DB_CONST.INVITED_STUDENT_NOT_REGISTERED:
                msgObj.msg = 'Not registered';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_STUDENT_STATUS_ACTIVE:
                msgObj.msg = `Current ${invitedStudent.type === DB_CONST.TYPE_STUDENT ? "student" : "teacher"}`;
                msgObj.color = 'primary';
                break;
            case DB_CONST.INVITED_STUDENT_DECLINED_TO_REGISTER:
                msgObj.msg = 'Declined to join';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_STUDENT_STATUS_LEFT:
                msgObj.msg = 'Left';
                msgObj.color = 'error';
                break;
            case DB_CONST.INVITED_STUDENT_STATUS_KICKED_OUT:
                msgObj.msg = 'Kicked out';
                msgObj.color = 'error';
                break;
            default:
                return null;
        }

        return (
            <Typography align="left" variant="body2" color={msgObj.color}>{msgObj.msg}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvitedStudents);