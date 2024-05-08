import React, {Component} from "react";

import {
    FormControl,
    FormControlLabel,
    Typography,
    RadioGroup,
    Radio,
    Divider,
    Button,
    TextField
} from "@material-ui/core";
import {KeyboardDatePicker} from "@material-ui/pickers";
import PublicIcon from "@material-ui/icons/Public";
import {
    Col,
    Container,
    Row
} from "react-bootstrap";
import FlexView from "react-flexview";
import {css} from "aphrodite";
import {NavLink} from "react-router-dom";

import {connect} from "react-redux";
import * as courseAdminSettingsActions from "../../../redux-store/actions/courseAdminSettingsActions";

import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as colors from "../../../values/colors";
import * as utils from "../../../utils/utils";
import * as ROUTES from "../../../router/routes";
import Routes from "../../../router/routes";

const mapStateToProps = state => {
    return {
        courseUserName: state.managecourseFromParams.courseUserName,
        courseDetails: state.managecourseFromParams.courseProperties,
        courseAttributesEdited: state.courseAdminSettings.courseAttributesEdited,

        clubAttributes: state.manageClubAttributes.clubAttributes,

        courseWebsite: state.courseAdminSettings.website,
        courseDescription: state.courseAdminSettings.description,
        primaryColor: state.courseAdminSettings.primaryColor,
        secondaryColor: state.courseAdminSettings.secondaryColor,

        addNewPledgeFAQ: state.courseAdminSettings.addNewPledgeFAQ,
        addedPledgeQuestion: state.courseAdminSettings.addedPledgeQuestion,
        addedPledgeAnswer: state.courseAdminSettings.addedPledgeAnswer,
        expandedPledgeFAQ: state.courseAdminSettings.expandedPledgeFAQ,
        editExpandedPledgeFAQ: state.courseAdminSettings.editExpandedPledgeFAQ,
        editedPledgeQuestion: state.courseAdminSettings.editedPledgeQuestion,
        editedPledgeAnswer: state.courseAdminSettings.editedPledgeAnswer
    }
};

const mapDispatchToProps = dispatch => {
    return {
        initializeCourseAttributesEdited: () => dispatch(courseAdminSettingsActions.initializeCourseAttributesEdited()),
        handleInputChanged: (event) => dispatch(courseAdminSettingsActions.handleInputChanged(event)),

        saveCourseDetails: (field, value) => dispatch(courseAdminSettingsActions.saveCourseDetails(field, value)),
        cancelEditingCourseDetails: (field) => dispatch(courseAdminSettingsActions.cancelEditingCourseDetails(field)),

        saveColor: (field) => dispatch(courseAdminSettingsActions.saveColor(field)),
        cancelEditingColor: (field) => dispatch(courseAdminSettingsActions.cancelEditingColor(field)),
        handlePitchExpiryDateChanged: (date) => dispatch(courseAdminSettingsActions.handlePitchExpiryDateChanged(date)),
        handleSavePitchExpiryDate: () => dispatch(courseAdminSettingsActions.handleSavePitchExpiryDate()),
        handleCancelEditingPitchExpiryDate: () => dispatch(courseAdminSettingsActions.handleCancelEditingPitchExpiryDate()),

        handleExpandPledgeFAQPanel: (FAQ, isExpanded) => dispatch(courseAdminSettingsActions.handleExpandPledgeFAQPanel(FAQ, isExpanded)),
        toggleAddNewPledgeFAQ: () => dispatch(courseAdminSettingsActions.toggleAddNewPledgeFAQ()),
        submitNewPledgeFAQ: () => dispatch(courseAdminSettingsActions.submitNewPledgeFAQ()),
        toggleEditExpandedPledgeFAQ: () => dispatch(courseAdminSettingsActions.toggleEditExpandedPledgeFAQ()),
        saveEditedPledgeFAQ: () => dispatch(courseAdminSettingsActions.saveEditedPledgeFAQ()),
        deleteExistingPledgeFAQ: () => dispatch(courseAdminSettingsActions.deleteExistingPledgeFAQ())
    }
};

class CourseTeacherSettings extends Component {

    handleExpandPledgeFAQPanel = FAQ => (event, isExpanded) => {
        this.props.handleExpandPledgeFAQPanel(FAQ, isExpanded);
    };

    componentDidMount() {
        const {
            initializeCourseAttributesEdited
        } = this.props;

        initializeCourseAttributesEdited();
    }

    render() {
        const {
            courseUserName,
            courseDetails,
            courseAttributesEdited,

            courseWebsite,
            courseDescription,
            primaryColor,
            secondaryColor,

            handleInputChanged,
            handlePitchExpiryDateChanged,
            handleSavePitchExpiryDate,
            handleCancelEditingPitchExpiryDate,
            saveCourseDetails,
            cancelEditingCourseDetails,
            saveColor,
            cancelEditingColor
        } = this.props;

        if (!courseAttributesEdited) {
            return null;
        }

        return (
            <Container fluid style={{padding: 30}}>
                <Row noGutters>
                    {/** Manage course details */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" color="primary">
                            Manage course details
                        </Typography>

                        <FlexView marginTop={16} marginBottom={32}>
                            <NavLink
                                to={
                                    courseUserName
                                        ?
                                        ROUTES.VIEW_COURSE_DETAILS.replace(":courseUserName", courseUserName).replace(":courseID", courseDetails.anid)
                                        :
                                        ROUTES.VIEW_COURSE_DETAILS_STUDENT_SUPER.replace(":courseID", courseDetails.anid)
                                }
                                className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                            >
                                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary">
                                    <PublicIcon style={{marginRight: 8}}/>
                                    View course's public page
                                </Button>
                            </NavLink>
                        </FlexView>

                        {/** Edit course description */}
                        <FlexView column marginTop={20}>
                            <TextField name="description" value={courseDescription} variant="outlined" label="Course description" multiline rowsMax={5} rows={5} onChange={handleInputChanged}/>

                            <FlexView width="100%" hAlignContent="right" marginTop={15}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingCourseDetails('description')} style={{ marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveCourseDetails('description', courseDescription)} disabled={courseDetails.description === courseDescription} style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Edit website */}
                        <FlexView marginTop={35} column>
                            <FormControl fullWidth>
                                <TextField label="Website" placeholder="Official website" name="website" value={courseWebsite} fullWidth margin="dense" variant="outlined" required onChange={handleInputChanged}
                                    error={
                                        courseWebsite.trim().length === 0
                                        || (courseWebsite.trim().length > 0 && !utils.isValidWebURL(courseWebsite))
                                    }/>
                                {
                                    courseWebsite.trim().length === 0 || utils.isValidWebURL(courseWebsite)
                                        ?
                                        null
                                        :
                                        <Typography variant="body2" color="error" align="left">
                                            Invalid website URL
                                        </Typography>
                                }
                            </FormControl>

                            <FlexView width="100%" hAlignContent="right" marginTop={15}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingCourseDetails('website')} style={{marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveCourseDetails('website', courseWebsite)}
                                    disabled={
                                        courseDetails.website === courseWebsite
                                        || courseWebsite.trim().length === 0
                                        || (courseWebsite.trim().length > 0 && !utils.isValidWebURL(courseWebsite))
                                    }
                                    style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Sign up link */}
                        <FlexView marginTop={35} column>
                            <FormControl fullWidth>
                                <TextField label="Public registration link" fullWidth margin="dense" variant="outlined" helperText="This link can be shared to unregistered issuers/investors so that they can sign up and become members of your course without sending invitation emails manually." value={ process.env.REACT_APP_PUBLIC_URL + Routes.constructSignUpRoute(courseUserName)}/>
                            </FormControl>
                        </FlexView>

                        {/** Edit primary color */}
                        <FlexView marginTop={35} column>
                            <FlexView vAlignContent="center">
                                <TextField required name="primaryColor" variant="outlined" margin="dense" label="Primary color" value={primaryColor.toUpperCase()} onChange={handleInputChanged}/>

                                {
                                    utils.isValidHexColorCode(primaryColor)
                                        ?
                                        <FlexView width={20} height={20} marginLeft={15} style={{backgroundColor: primaryColor}}/>
                                        :
                                        null
                                }
                            </FlexView>

                            {
                                utils.isValidHexColorCode(primaryColor)
                                    ?
                                    null
                                    :
                                    <Typography variant="body2" color="error" align="left" style={{marginTop: 4}}>
                                        Invalid color
                                    </Typography>
                            }

                            <FlexView width="100%" marginTop={10}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingColor("primaryColor")} style={{ marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveColor("primaryColor")}
                                    disabled={!utils.isValidHexColorCode(primaryColor) || courseDetails.settings.primaryColor === primaryColor}
                                    style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Edit secondary color */}
                        <FlexView marginTop={35} column>
                            <FlexView vAlignContent="center">
                                <TextField required name="secondaryColor" variant="outlined" margin="dense" label="Secondary color" value={secondaryColor.toUpperCase()} onChange={handleInputChanged}/>

                                {
                                    utils.isValidHexColorCode(secondaryColor)
                                        ?
                                        <FlexView width={20} height={20} marginLeft={15} style={{backgroundColor: secondaryColor}}/>
                                        :
                                        null
                                }
                            </FlexView>

                            {
                                utils.isValidHexColorCode(secondaryColor)
                                    ?
                                    null
                                    :
                                    <Typography variant="body2" color="error" align="left" style={{marginTop: 4}}>
                                        Invalid color
                                    </Typography>
                            }

                            <FlexView width="100%" marginTop={10}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingColor("secondaryColor")} style={{marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveColor("secondaryColor")}
                                    disabled={!utils.isValidHexColorCode(secondaryColor) || courseDetails.settings.secondaryColor === secondaryColor}
                                    style={{ marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !courseDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        courseDetails.settings.primaryColor
                            }}/>
                    </Col>

                    {/** Manage course attributes */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">
                                Manage course attributes
                            </Typography>

                            {
                                /**
                                 * Set pitch expiry date (for QIB only)
                                 */
                            }
                            {
                                courseUserName !== "qib"
                                    ?
                                    null
                                    :
                                    <FlexView column marginTop={30}>
                                        <KeyboardDatePicker
                                            autoOk
                                            fullWidth
                                            variant="dialog"
                                            inputVariant="outlined"
                                            label="Choose expired date for this pitch"
                                            format="dd/MM/yyyy"
                                            minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                            value={
                                                !courseAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                    ?
                                                    utils.getDateWithDaysFurtherThanToday(1)
                                                    :
                                                    courseAttributesEdited.defaultPitchExpiryDate
                                            }
                                            InputAdornmentProps={{position: "start"}}
                                            error={
                                                courseAttributesEdited.hasOwnProperty('courseAttributesEdited')
                                                    ?
                                                    courseAttributesEdited.defaultPitchExpiryDate === null
                                                    || isNaN(courseAttributesEdited.defaultPitchExpiryDate)
                                                    :
                                                    false
                                            }
                                            onChange={handlePitchExpiryDateChanged}
                                        />

                                        <FlexView width="100%" marginTop={15}>
                                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={handleCancelEditingPitchExpiryDate} style={{marginRight: 6}}>
                                                Cancel
                                            </Button>
                                            <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={handleSavePitchExpiryDate}
                                                disabled={
                                                    courseAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                        ?
                                                        courseAttributesEdited.defaultPitchExpiryDate === null
                                                        || isNaN(courseAttributesEdited.defaultPitchExpiryDate)
                                                        || (
                                                            courseDetails.settings.hasOwnProperty('defaultPitchExpiryDate')
                                                            && courseAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                            && courseDetails.settings.defaultPitchExpiryDate === courseAttributesEdited.defaultPitchExpiryDate
                                                        )
                                                        :
                                                        false}
                                                style={{marginLeft: 6}}>
                                                Save
                                            </Button>
                                        </FlexView>

                                        {/** Divider */}
                                        <Divider style={{marginTop: 40, marginBottom: 20, height: 3}}/>
                                    </FlexView>
                            }

                            {
                                /**
                                 * Set project's visibility
                                 */
                            }
                            <FlexView marginTop={20}>
                                <FormControl>
                                    <Typography variant="body1" align="left" paragraph>
                                        Choose default visibility value for all newly created investment opportunities
                                    </Typography>
                                    <RadioGroup name="projectVisibility" value={courseAttributesEdited.projectVisibility.toString()} onChange={handleInputChanged}>
                                        <FormControlLabel value={DB_CONST.STUDENT_PROJECT_VISIBILITY_PRIVATE.toString()} control={<Radio/>} label="Private"/>
                                        <FormControlLabel value={DB_CONST.STUDENT_PROJECT_VISIBILITY_RESTRICTED.toString()} control={<Radio/>} label="Restricted"/>
                                        <FormControlLabel value={DB_CONST.STUDENT_PROJECT_VISIBILITY_PUBLIC.toString()} control={<Radio/>} label="Public"/>
                                    </RadioGroup>
                                </FormControl>
                            </FlexView>

                            {/** Divider */}
                            <Divider style={{marginTop: 20, marginBottom: 20, height: 3}}/>

                            {
                                /**
                                 * Hide/Show investors' contact details
                                 */
                            }
                            {/*<FlexView>*/}
                            {/*    <FormControl>*/}
                            {/*        <FormControlLabel*/}
                            {/*            name="makeInvestorsContactDetailsVisibleToIssuers"*/}
                            {/*            control={*/}
                            {/*                <Checkbox*/}
                            {/*                    color="primary"*/}
                            {/*                    value={courseAttributesEdited.makeInvestorsContactDetailsVisibleToIssuers}*/}
                            {/*                    checked={courseAttributesEdited.makeInvestorsContactDetailsVisibleToIssuers}*/}
                            {/*                    onChange={handleInputChanged}*/}
                            {/*                />*/}
                            {/*            }*/}
                            {/*            label="Allow issuers to see investors' contact details"*/}
                            {/*            labelPlacement="end"*/}
                            {/*        />*/}
                            {/*        <Typography*/}
                            {/*            variant="body1"*/}
                            {/*            align="left"*/}
                            {/*            style={{*/}
                            {/*                marginTop: 8*/}
                            {/*            }}*/}
                            {/*        >*/}
                            {/*            <b*/}
                            {/*                style={{*/}
                            {/*                    color: colors.errorColor*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                <u>Note:</u>&nbsp;This is a global setting.*/}
                            {/*            </b>*/}
                            {/*            &nbsp;When <u><b>ticked</b></u>, <b>the contact details of all investors in this*/}
                            {/*            course</b> will be*/}
                            {/*            made visible to the issuers.*/}
                            {/*        </Typography>*/}
                            {/*    </FormControl>*/}
                            {/*</FlexView>*/}
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !courseDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        courseDetails.settings.primaryColor
                            }}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseTeacherSettings);