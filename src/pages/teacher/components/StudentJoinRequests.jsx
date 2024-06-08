import React, {Component} from 'react';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import {
    Typography,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableFooter,
    TablePagination,
    Table,
    InputBase,
    InputAdornment,
    IconButton, Button
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import FlexView from 'react-flexview';
import {NavLink} from 'react-router-dom';
import {css} from 'aphrodite';
import {HashLoader} from 'react-spinners';

import {connect} from 'react-redux';
import * as manageJoinStudentRequestsActions from '../../../redux-store/actions/manageJoinStudentRequestsActions';

import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';
import * as colors from '../../../values/colors';
import * as ROUTES from '../../../router/routes';
import * as myUtils from '../../../utils/utils';

const mapStateToProps = state => {
    return {
        courseStudentName: state.manageCourseFromParams.courseStudentName,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,
        shouldLoadOtherData: state.manageCourseFromParams.shouldLoadOtherData,

        student: state.auth.student,

        joinStudentRequests: state.manageJoinStudentRequests.joinStudentRequests,
        loadingJoinStudentRequests: state.manageJoinStudentRequests.loadingJoinStudentRequests,
        joinStudentRequestsLoaded: state.manageJoinStudentRequests.joinStudentRequestsLoaded,

        searchText: state.manageJoinStudentRequests.searchText,
        inSearchMode: state.manageJoinStudentRequests.inSearchMode,
        matchedJoinStudentRequests: state.manageJoinStudentRequests.matchedJoinStudentRequests,

        page: state.manageJoinStudentRequests.page,
        rowsPerPage: state.manageJoinStudentRequests.rowsPerPage
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadJoinStudentRequests: () => dispatch(manageJoinStudentRequestsActions.loadJoinStudentRequests()),
        toggleSearchMode: () => dispatch(manageJoinStudentRequestsActions.toggleSearchMode()),
        changePage: (event, newPage) => dispatch(manageJoinStudentRequestsActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(manageJoinStudentRequestsActions.changeRowsPerPage(event)),
        handleJoinStudentRequestsTableInputChanged: (event) => dispatch(manageJoinStudentRequestsActions.handleJoinStudentRequestsTableInputChanged(event)),
        acceptJoinRequest: (request) => dispatch(manageJoinStudentRequestsActions.acceptJoinRequest(request)),
        rejectJoinRequest: (request) => dispatch(manageJoinStudentRequestsActions.rejectJoinRequest(request)),
        startListeningForJoinStudentRequestsChanged: () => dispatch(manageJoinStudentRequestsActions.startListeningForJoinStudentRequestsChanged()),
        stopListeningForJoinStudentRequestsChanged: () => dispatch(manageJoinStudentRequestsActions.stopListeningForJoinStudentRequestsChanged())
    }
};

class JoinStudentRequests extends Component {

    componentDidMount() {
        this.loadData();
        this.attachListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,
            student,
            stopListeningForJoinStudentRequestsChanged
        } = this.props;

        // cancel all listeners if student is set to null
        if (!student || !shouldLoadOtherData) {
            stopListeningForJoinStudentRequestsChanged();
            return;
        }

        this.loadData();
        this.attachListener();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,

            student,

            loadingJoinStudentRequests,
            joinStudentRequestsLoaded,

            loadJoinStudentRequests
        } = this.props;

        if (shouldLoadOtherData) {
            if (student) {
                if (!loadingJoinStudentRequests && !joinStudentRequestsLoaded) {
                    loadJoinStudentRequests();
                }
            }
        }
    };

    /**
     * Attach listener
     */
    attachListener = () => {
        const {
            shouldLoadOtherData,

            joinStudentRequests,
            joinStudentRequestsLoaded,

            startListeningForJoinStudentRequestsChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (joinStudentRequests && joinStudentRequestsLoaded) {
                startListeningForJoinStudentRequestsChanged();
            }
        }
    };

    render() {
        const {
            courseProperties,
            coursePropertiesLoaded,
            student,
            joinStudentRequests,
            searchText,
            inSearchMode,
            page,
            rowsPerPage,
            loadJoinStudentRequests,
            toggleSearchMode,
            changePage,
            changeRowsPerPage,
            handleJoinStudentRequestsTableInputChanged
        } = this.props;

        if (!coursePropertiesLoaded || !student) {
            return null;
        }

        // sort join requests by request date (recent requests come first)
        joinStudentRequests.sort((joinStudentRequest1, joinStudentRequest2) => {
            return (joinStudentRequest2.requestedDate - joinStudentRequest1.requestedDate);
        });

        return (
            <Paper elevation={1} style={{ width: "100%", overflowX: "auto", marginTop: 20}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell colSpan={3} cellColor={colors.blue_gray_50}
                                component={
                                    <InputBase name="searchText" value={searchText} onChange={handleJoinStudentRequestsTableInputChanged} fullWidth placeholder="Search access request by email" type="text"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <OverlayTrigger trigger={['hover', 'focus']} flip placement="bottom"
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
                            <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50}
                                component={
                                    <FlexView hAlignContent="right" vAlignContent="center">
                                        <OverlayTrigger trigger={['hover', 'focus']} flip placement="bottom"
                                            overlay={
                                                <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>
                                            }>
                                            <IconButton onClick={loadJoinStudentRequests} style={{marginLeft: 10}}>
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
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Student's name</Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !courseProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        courseProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Email</Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !courseProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        courseProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Requested date</Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !courseProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        courseProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Action</Typography>
                                }
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.renderJoinStudentRequestsRows()
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination rowsPerPageOptions={[5, 10, 25]} colSpan={5} count={joinStudentRequests.length} rowsPerPage={rowsPerPage} page={page}
                                backIconButtonProps={{'aria-label': 'Previous Page',}}
                                nextIconButtonProps={{'aria-label': 'Next Page',}}
                                SelectProps={{ native: true,}}
                                onChangePage={changePage}
                                onChangeRowsPerPage={changeRowsPerPage}/>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    }

    /**
     * Render join requests table rows
     *
     * @returns {*}
     */
    renderJoinStudentRequestsRows = () => {
        const {
            courseStudentName,
            courseProperties,
            joinStudentRequests,
            joinStudentRequestsLoaded,
            matchedJoinStudentRequests,
            inSearchMode,
            page,
            rowsPerPage,
            acceptJoinRequest,
            rejectJoinRequest
        } = this.props;

        let renderedJoinStudentRequests = [];

        if (inSearchMode) {
            renderedJoinStudentRequests = matchedJoinStudentRequests;
        } else {
            renderedJoinStudentRequests = joinStudentRequests;
        }

        if (renderedJoinStudentRequests.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5}>
                        <FlexView style={{margin: 40}} hAlignContent="center" vAlignContent="center">
                            {
                                joinStudentRequestsLoaded
                                    ?
                                    <Typography variant="h6" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "Can't find any access request with this email."
                                                :
                                                "No access requests yet."
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
            renderedJoinStudentRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(joinStudentRequest => (
                <TableRow key={joinStudentRequest.id} hover>
                    <TableCell colSpan={2}>
                        <FlexView column>
                            <NavLink
                                to={
                                    courseStudentName
                                        ?
                                        `${ROUTES.STUDENT_PROFILE.replace(":courseStudentName", courseStudentName).replace(":studentID", joinStudentRequest.studentID)}`
                                        :
                                        `${ROUTES.STUDENT_PROFILE_STUDENT_SUPER.replace(":studentID", joinStudentRequest.studentID)}`
                                }
                                className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                            >
                                <Typography align="left" variant="body1" color="primary">
                                    {`${joinStudentRequest.studentProfile.title} ${joinStudentRequest.studentProfile.firstName} ${joinStudentRequest.studentProfile.lastName}`}
                                </Typography>
                            </NavLink>
                        </FlexView>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <Typography align="left" variant="body1">
                            {joinStudentRequest.studentProfile.email}
                        </Typography>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <Typography align="left" variant="body1">
                            {myUtils.dateInReadableFormat(joinStudentRequest.requestedDate)}
                        </Typography>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <FlexView>
                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} color="secondary" onClick={() => rejectJoinRequest(joinStudentRequest)} style={{marginRight: 6}}>Reject</Button>
                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} color="primary" onClick={() => acceptJoinRequest(joinStudentRequest)} style={{marginLeft: 6}}>Accept</Button>
                        </FlexView>
                    </TableCell>
                </TableRow>
            ))
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(JoinStudentRequests);