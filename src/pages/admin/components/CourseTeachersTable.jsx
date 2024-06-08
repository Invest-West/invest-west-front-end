import React, {Component} from 'react';
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    Typography,
    Button,
    InputBase,
    TablePagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import {
    HashLoader,
    BeatLoader
} from 'react-spinners';
import {css} from 'aphrodite';
import FlexView from 'react-flexview';

import * as utils from '../../../utils/utils';
import * as colors from '../../../values/colors';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as courseTeachersTableActions from '../../../redux-store/actions/courseTeacherTableActions';

export const ADD_NEW_COURSE_TEACHER_STATUS_NONE = 0;
export const ADD_NEW_COURSE_TEACHER_STATUS_MISSING_EMAIL = 1;
export const ADD_NEW_COURSE_TEACHER_STATUS_CHECKING = 2;
export const ADD_NEW_COURSE_TEACHER_STATUS_EMAIL_USED = 3;
export const ADD_NEW_COURSE_TEACHER_STATUS_SUCCESS = 4;

const mapStateToProps = state => {
    return {
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        courseProperties: state.manageCourseFromParams.courseProperties,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,
        currentStudent: state.auth.student,
        tableCourse: state.manageCourseTeachersTable.tableCourse,
        courseTeachers: state.manageCourseTeachersTable.courseTeachers,
        courseTeachersLoaded: state.manageCourseTeachersTable.courseTeachersLoaded,
        loadingCourseTeachers: state.manageCourseTeachersTable.loadingCourseTeachers,
        page: state.manageCourseTeachersTable.page,
        rowsPerPage: state.manageCourseTeachersTable.rowsPerPage,
        searchText: state.manageCourseTeachersTable.searchText,
        inSearchMode: state.manageCourseTeachersTable.inSearchMode,

        addNewCourseTeacherDialogOpen: state.manageCourseTeachersTable.addNewCourseTeacherDialogOpen,
        newCourseTeacherEmail: state.manageCourseTeachersTable.newCourseTeacherEmail,
        addNewCourseTeacherStatus: state.manageCourseTeachersTable.addNewCourseTeacherStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadCourseTeachers: () => dispatch(courseTeachersTableActions.loadCourseTeachers()),
        changePage: (event, newPage) => dispatch(courseTeachersTableActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(courseTeachersTableActions.changeRowsPerPage(event)),
        handleInputChanged: (event) => dispatch(courseTeachersTableActions.handleInputChanged(event)),
        toggleSearchMode: () => dispatch(courseTeachersTableActions.toggleSearchMode()),
        startListeningForCourseTeachersChanged: () => dispatch(courseTeachersTableActions.startListeningForCourseTeachersChanged()),
        stopListeningForCourseTeachersChanged: () => dispatch(courseTeachersTableActions.stopListeningForCourseTeachersChanged()),
        handleAddNewCourseTeacher: () => dispatch(courseTeachersTableActions.handleAddNewCourseTeacher()),

        toggleAddNewCourseTeacherDialog: () => dispatch(courseTeachersTableActions.toggleAddNewCourseTeacherDialog())
    }
};

class CourseTeachersTable extends Component {

    componentDidMount() {
        this.loadData();
        this.addListeners();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        const {
            shouldLoadOtherData,
            tableCourse,
            stopListeningForCourseTeachersChanged
        } = this.props;

        // cancel all listeners if tableCourse is set to null
        if (!tableCourse || !shouldLoadOtherData) {
            stopListeningForCourseTeachersChanged();
            return;
        }

        this.loadData();
        this.addListeners();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,
            tableCourse,
            loadingCourseTeachers,
            courseTeachersLoaded,
            loadCourseTeachers
        } = this.props;

        if (shouldLoadOtherData) {
            if (tableCourse && !loadingCourseTeachers && !courseTeachersLoaded) {
                loadCourseTeachers();
            }
        }
    };

    /**
     * Add listener
     */
    addListeners = () => {
        const {
            shouldLoadOtherData,
            courseTeachers,
            courseTeachersLoaded,
            startListeningForCourseTeachersChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (courseTeachers && courseTeachersLoaded) {
                startListeningForCourseTeachersChanged();
            }
        }
    };

    render() {
        const {
            courseProperties,
            currentStudent,
            tableCourse,
            page,
            rowsPerPage,
            searchText,
            inSearchMode,
            addNewCourseTeacherDialogOpen,
            newCourseTeacherEmail,
            addNewCourseTeacherStatus,
            changePage,
            changeRowsPerPage,
            loadCourseTeachers,
            handleInputChanged,
            toggleSearchMode,
            handleAddNewCourseTeacher,

            toggleAddNewCourseTeacherDialog
        } = this.props;

        return (
            <div>
                <Paper elevation={1} style={{overflowX: "auto"}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell colSpan={3} cellColor={colors.blue_gray_50}
                                    component={
                                        <InputBase name="searchText" value={searchText} onChange={handleInputChanged} fullWidth placeholder="Search by email" type="text"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" fli
                                                        overlay={
                                                            <Tooltip id={`tooltip-bottom`}>
                                                                {
                                                                    inSearchMode
                                                                        ?
                                                                        "Exit search mode"
                                                                        :
                                                                        "Enter search mode"
                                                                }
                                                            </Tooltip>
                                                        }>
                                                        <IconButton onClick={toggleSearchMode}>
                                                            {
                                                                inSearchMode
                                                                    ?
                                                                    <CloseIcon/>
                                                                    :
                                                                    <SearchIcon/>
                                                            }
                                                        </IconButton>
                                                    </OverlayTrigger>
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                />
                                <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50} component={
                                        <FlexView hAlignContent="right" vAlignContent="center">
                                            {
                                                currentStudent.superCourseTeacher
                                                && tableCourse !== null
                                                && currentStudent.anid === tableCourse.anid
                                                    ?
                                                    <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)} onClick={toggleAddNewCourseTeacherDialog} style={{ marginRight: 8}}>Add new course teacher</Button>
                                                    :
                                                    null
                                            }
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" flip
                                                overlay={
                                                    <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>}>
                                                <IconButton onClick={loadCourseTeachers} style={{marginLeft: 10}}>
                                                    <RefreshIcon/>
                                                </IconButton>
                                            </OverlayTrigger>
                                        </FlexView>
                                    }
                                />
                            </TableRow>
                            <TableRow>
                                <StyledTableCell colSpan={2}
                                    cellColor={
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Email</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left"  className={css(sharedStyles.white_text)}>Type</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Date added</Typography>}/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.renderTableRows()
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    style={{backgroundColor: colors.blue_gray_50}}
                                    rowsPerPageOptions={[10, 30, 50]}
                                    count={this.getRenderedCourseTeachers().length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChangePage={changePage}
                                    onChangeRowsPerPage={changeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>

                <AddCourseTeacherDialog
                    courseProperties={courseProperties}
                    addNewCourseTeacherDialogOpen={addNewCourseTeacherDialogOpen}
                    newCourseTeacherEmail={newCourseTeacherEmail}
                    addNewCourseTeacherStatus={addNewCourseTeacherStatus}
                    toggleAddNewCourseTeacherDialog={toggleAddNewCourseTeacherDialog}
                    handleInputChanged={handleInputChanged}
                    handleAddNewCourseTeacher={handleAddNewCourseTeacher}
                />
            </div>
        );
    }

    /**
     * Render table rows
     *
     * @returns {*[]|*}
     */
    renderTableRows = () => {
        const {
            courseProperties,
            courseTeachersLoaded,
            page,
            rowsPerPage,
            inSearchMode
        } = this.props;

        if (this.getRenderedCourseTeachers().length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4}>
                        <FlexView hAlignContent="center" vAlignContent="center" style={{margin: 20}}>
                            {
                                courseTeachersLoaded
                                    ?
                                    <Typography variant="body1" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "No course teachers found."
                                                :
                                                "No course teachers."
                                        }
                                    </Typography>
                                    :
                                    <HashLoader
                                        color={
                                            !courseProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                courseProperties.settings.primaryColor
                                        }
                                    />
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            this.getRenderedCourseTeachers()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(courseTeacher => (
                    <TableRow key={courseTeacher.id} hover>
                        <TableCell colSpan={2}>
                            <Typography variant="body2" align="left">
                                {courseTeacher.email}
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {
                                    courseTeacher.superGroupTeacher
                                        ?
                                        "Super course teacher"
                                        :
                                        "Course teacher"
                                }
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {utils.dateTimeInReadableFormat(courseTeacher.dateAdded)}
                            </Typography>
                        </TableCell>
                    </TableRow>
                )
            )
        );
    };

    /**
     * Get rendered course teachers
     *
     * @returns {*[]}
     */
    getRenderedCourseTeachers = () => {
        const {
            searchText,
            inSearchMode,
            courseTeachers
        } = this.props;

        let searchedCourseTeachers = [...courseTeachers];

        if (inSearchMode) {
            searchedCourseTeachers = searchedCourseTeachers
                .filter(courseTeacher => courseTeacher.email.includes(searchText.toLowerCase()));
        }

        return searchedCourseTeachers.sort((courseTeacher1, courseTeacher2) => {
            return courseTeacher2.time - courseTeacher1.time;
        });
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseTeachersTable);

class AddCourseTeacherDialog extends Component {
    render() {
        const {
            forwardedRef,
            addNewCourseTeacherDialogOpen,
            newCourseTeacherEmail,
            toggleAddNewCourseTeacherDialog,
            handleInputChanged,
            handleAddNewCourseTeacher
        } = this.props;

        return (
            <Dialog open={addNewCourseTeacherDialogOpen} ref={forwardedRef} fullWidth maxWidth="md" onClose={toggleAddNewCourseTeacherDialog}>
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">Add new course teacher
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleAddNewCourseTeacherDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="Email"
                        name="newCourseTeacherEmail"
                        placeholder="Write email here"
                        value={newCourseTeacherEmail}
                        onChange={handleInputChanged}
                        fullWidth
                        required
                        style={{ marginTop: 10}}/>
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={20} hAlignContent="right" vAlignContent="center">
                        {
                            this.renderStatusMessage()
                        }
                        <Button variant="outlined" color="primary" onClick={handleAddNewCourseTeacher} size="medium" className={css(sharedStyles.no_text_transform)} style={{marginLeft: 20}}>Add<AddIcon fontSize="small" style={{ marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Render status message
     *
     * @returns {null|*}
     */
    renderStatusMessage = () => {
        const {
            addNewCourseTeacherStatus,
            courseProperties
        } = this.props;

        let msg = {
            text: '',
            color: ''
        };

        switch (addNewCourseTeacherStatus) {
            case ADD_NEW_COURSE_TEACHER_STATUS_NONE:
                return null;
            case ADD_NEW_COURSE_TEACHER_STATUS_MISSING_EMAIL:
                msg.tex = "Please fill in the email.";
                msg.color = "error";
                break;
            case ADD_NEW_COURSE_TEACHER_STATUS_CHECKING:
                return (
                    <BeatLoader size={10}
                        color={
                            !courseProperties
                                ?
                                colors.primaryColor
                                :
                                courseProperties.settings.primaryColor
                        }
                    />
                );
            case ADD_NEW_COURSE_TEACHER_STATUS_EMAIL_USED:
                msg.text = "This email has been used by another account.";
                msg.color = "error";
                break;
            case ADD_NEW_COURSE_TEACHER_STATUS_SUCCESS:
                return null;
            default:
                return null;
        }

        return (
            <Typography color={msg.color} variant="body1" align="left">
                {msg.text}
            </Typography>
        );
    }
}