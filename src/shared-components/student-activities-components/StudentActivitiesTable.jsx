import React, {Component} from 'react';
import {
    Table,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    Typography,
    Paper,
    TablePagination,
    TableFooter,
    Button
} from '@material-ui/core';
import LinkIcon from '@material-ui/icons/Link';
import FlexView from 'react-flexview';
import {HashLoader} from 'react-spinners';
import {css} from 'aphrodite';
import {NavLink} from 'react-router-dom';

import sharedStyles, {StyledTableCell} from '../../shared-js-css-styles/SharedStyles';
import JSONCompareChangesDialog from './JSONCompareStudentChangesDialog';

import * as colors from '../../values/colors';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';
import * as DB_CONST from '../../firebase/databaseConsts';

import {connect} from 'react-redux';
import * as studentActivitiesTableActions from '../../redux-store/actions/studentActivitiesTableActions';
import * as manageJSONCompareChangesActions from '../../redux-store/actions/manageJSONCompareChangesDialogActions';

const mapStateToProps = state => {
    return {
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        courseProperties: state.manageCourseFromParams.courseProperties,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        currentStudent: state.auth.student,

        tableStudent: state.manageStudentActivitiesTable.tableStudent,
        activities: state.manageStudentActivitiesTable.activities,
        activitiesLoaded: state.manageStudentActivitiesTable.activitiesLoaded,
        loadingActivities: state.manageStudentActivitiesTable.loadingActivities,
        page: state.manageStudentActivitiesTable.page,
        rowsPerPage: state.manageStudentActivitiesTable.rowsPerPage
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadActivities: () => dispatch(studentActivitiesTableActions.loadActivities()),
        changePage: (event, newPage) => dispatch(studentActivitiesTableActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(studentActivitiesTableActions.changeRowsPerPage(event)),
        startListeningForActivitiesChanged: () => dispatch(studentActivitiesTableActions.startListeningForActivitiesChanged()),
        stopListeningForActivitiesChanged: () => dispatch(studentActivitiesTableActions.stopListeningForActivitiesChanged()),

        jsonCompareDialog_setData: (jsonBefore, jsonAfter) => dispatch(manageJSONCompareChangesActions.setData(jsonBefore, jsonAfter))
    }
};

class StudentActivitiesTable extends Component {

    componentDidMount() {
        this.loadData();
        this.addListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,

            tableStudent,

            stopListeningForActivitiesChanged
        } = this.props;

        // cancel all listeners if tableStudent is set to null
        if (!tableStudent || !shouldLoadOtherData) {
            stopListeningForActivitiesChanged();
            return;
        }

        this.loadData();
        this.addListener();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,

            tableStudent,
            loadingActivities,
            activitiesLoaded,

            loadActivities
        } = this.props;

        if (shouldLoadOtherData) {
            if (tableStudent && !loadingActivities && !activitiesLoaded) {
                loadActivities();
            }
        }
    };

    /**
     * Add listener
     */
    addListener = () => {
        const {
            shouldLoadOtherData,

            activities,
            activitiesLoaded,

            startListeningForActivitiesChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (activities && activitiesLoaded) {
                startListeningForActivitiesChanged();
            }
        }
    };

    render() {
        const {
            courseProperties,
            coursePropertiesLoaded,

            currentStudent,
            tableStudent,

            activities,
            page,
            rowsPerPage,

            changePage,
            changeRowsPerPage
        } = this.props;

        if (!coursePropertiesLoaded || !tableStudent || !currentStudent) {
            return null;
        }

        activities.sort((activity1, activity2) => {
            return activity2.time - activity1.time;
        });

        return (
            <div>
                <Paper elevation={1} style={{ overflowX: "auto" }} >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell
                                    colSpan={2}
                                    cellColor={
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Event</Typography>
                                    }
                                />
                                <StyledTableCell
                                    colSpan={1}
                                    cellColor={
                                        !courseProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            courseProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Time</Typography>
                                    }
                                />
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
                                    style={{
                                        backgroundColor: colors.blue_gray_50
                                    }}
                                    rowsPerPageOptions={[10, 30, 50]}
                                    count={activities.length}
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

                <JSONCompareChangesDialog/>
            </div>
        );
    }

    renderTableRows = () => {
        const {
            courseStudentName,
            courseProperties,

            currentStudent,

            activities,
            activitiesLoaded,
            page,
            rowsPerPage,

            jsonCompareDialog_setData
        } = this.props;

        if (activities.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={3} >
                        <FlexView hAlignContent="center" vAlignContent="center" style={{ margin: 20 }} >
                            {
                                activitiesLoaded
                                    ?
                                    <Typography variant="body1" align="center">No activities.</Typography>
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
            activities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(activity => (
                    <TableRow key={activity.id} >
                        <TableCell colSpan={2} >
                            {
                                activity.hasOwnProperty('action')
                                    ?
                                    <FlexView column >
                                        <Typography variant="body2" align="left" >
                                            <NavLink
                                                to={
                                                    courseStudentName
                                                        ?
                                                        `${ROUTES.COURSE_PATH.replace(":courseStudentName", courseStudentName)}${activity.action}`
                                                        :
                                                        activity.action
                                                }
                                                className={css(sharedStyles.nav_link_hover)}
                                                style={{
                                                    color:
                                                        !courseProperties
                                                            ?
                                                            colors.primaryColor
                                                            :
                                                            courseProperties.settings.primaryColor
                                                }}
                                            >
                                                <LinkIcon fontSize="small" style={{ marginRight: 6 }} />
                                                {activity.activitySummary}
                                            </NavLink>
                                        </Typography>
                                        {
                                            !activity.hasOwnProperty('studentProfile')
                                                ?
                                                null
                                                :
                                                <Typography
                                                    variant="body2"
                                                    align="left"
                                                    style={{
                                                        marginTop: 7
                                                    }}
                                                >
                                                    <i>_ done by <b>{activity.studentProfile.email}</b> _</i>
                                                </Typography>
                                        }
                                        {
                                            currentStudent.type !== DB_CONST.TYPE_ADMIN
                                                ?
                                                null
                                                :
                                                !currentStudent.superAdmin
                                                    ?
                                                    null
                                                    :
                                                    !activity.hasOwnProperty('value')
                                                        ?
                                                        null
                                                        :
                                                        <FlexView marginTop={10} >
                                                            <Button
                                                                variant="outlined"
                                                                color="primary"
                                                                size="small"
                                                                className={css(sharedStyles.no_text_transform)}
                                                                onClick={
                                                                    () => jsonCompareDialog_setData(
                                                                        activity.value.hasOwnProperty('before')
                                                                            ?
                                                                            activity.value.before
                                                                            :
                                                                            activity.value
                                                                        ,
                                                                        activity.value.hasOwnProperty('after')
                                                                            ?
                                                                            activity.value.after
                                                                            :
                                                                            activity.value
                                                                    )
                                                                }
                                                            >View changes</Button>
                                                        </FlexView>
                                        }
                                    </FlexView>
                                    :
                                    <Typography variant="body2" align="left">{activity.activitySummary}</Typography>
                            }
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" align="left">{utils.dateTimeInReadableFormat(activity.time)}</Typography>
                        </TableCell>
                    </TableRow>
                )
            )
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentActivitiesTable);