import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {Box, Button, Card, CardActionArea, CardActions, colors, Typography} from "@material-ui/core";
import CourseProperties, {getCourseLogo} from "../../models/course_properties";
import {Image} from "react-bootstrap";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {isTeacher} from "../../models/teacher";
import {
    ExploreCoursesState,
    hasAccessRequestsBeenSatisfied,
    isRemovingAccessRequest,
    isSendingAccessRequest
} from "./ExploreCoursesReducer";
import CourseOfMembership, {getHomeCourse} from "../../models/course_of_membership";
import {CheckCircle} from "@material-ui/icons";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {removeAccessRequest, sendAccessRequest} from "./ExploreCoursesActions";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";
import {ManageCourseUrlState} from "../../redux-store/reducers/manageCourseUrlReducer";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as DB_CONST from "../../firebase/databaseConsts";

interface CourseItemProps {
    course: CourseProperties;
    ManageCourseUrlState: ManageCourseUrlState;
    AuthenticationState: AuthenticationState;
    ExploreCoursesLocalState: ExploreCoursesState;
    sendAccessRequest: (courseID: string) => any;
    removeAccessRequest: (courseID: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageCourseUrlState: state.ManageCourseUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreCoursesLocalState: state.ExploreCoursesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        sendAccessRequest: (courseID: string) => dispatch(sendAccessRequest(courseID)),
        removeAccessRequest: (courseID: string) => dispatch(removeAccessRequest(courseID))
    }
}

class CourseItem extends Component<CourseItemProps, any> {
    render() {
        const {
            course,
            ManageCourseUrlState,
            AuthenticationState,
            ExploreCoursesLocalState,
            sendAccessRequest,
            removeAccessRequest
        } = this.props;

        const currentStudent = AuthenticationState.currentStudent;

        if (!currentStudent) {
            return null;
        }

        let courseMember: CourseOfMembership | undefined = AuthenticationState.coursesOfMembership.find(
            courseOfMembership => courseOfMembership.course.anid === course.anid);

        let hasRequestedToAccessCourse: boolean = false;
        if (hasAccessRequestsBeenSatisfied(ExploreCoursesLocalState)) {
            hasRequestedToAccessCourse = ExploreCoursesLocalState.accessRequestsInstances
                ?.findIndex(accessRequestInstance => accessRequestInstance.course.anid === course.anid) !== -1;
        }

        return <Box
            marginY="18px"
        >
            <Card>
                <CustomLink
                    url={Routes.constructCourseDetailRoute(ManageCourseUrlState.courseNameFromUrl ?? null, course.courseStudentName)}
                    color="black"
                    activeColor="none"
                    activeUnderline={false}
                    component="nav-link"
                    childComponent={
                        <CardActionArea
                            onClick={
                                () => {
                                    if (!isTeacher(currentStudent)) {
                                        realtimeDBUtils.trackActivity({
                                            studentID: currentStudent.id,
                                            activityType: DB_CONST.ACTIVITY_TYPE_CLICK,
                                            interactedObjectLocation: DB_CONST.GROUP_PROPERTIES_CHILD,
                                            interactedObjectID: course.anid,
                                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_GROUP_ITEM.replace("%course%", course.displayName),
                                            action: Routes.nonCourseViewCourse.replace(":courseID", course.anid)
                                        });
                                    }
                                }
                            }
                        >
                            <Box>
                                <Box display="flex" height="220px" justifyContent="center" bgcolor={colors.grey["200"]} >
                                    <Image
                                        alt={`${course.displayName} logo`}
                                        src={getCourseLogo(course) ?? undefined}
                                        height="auto"
                                        width="100%"
                                        style={{ padding: 40, objectFit: "scale-down" }}
                                    />
                                </Box>

                                <Box paddingX="18px" paddingY="20px" >
                                    <Typography variant="subtitle1" align="center" noWrap ><b>{course.displayName}</b></Typography>

                                    {
                                        !courseMember
                                            ? null
                                            : <Box display="flex" flexDirection="row" marginTop="15px" alignItems="center" justifyContent="center" >
                                                <CheckCircle fontSize="small" color="primary" />
                                                <Box width="6px" />
                                                <Typography variant="body1" align="center" noWrap color="textSecondary" >
                                                    {
                                                        getHomeCourse(AuthenticationState.coursesOfMembership)?.course.anid === courseMember.course.anid
                                                            ? "Home member"
                                                            : "Platform member"
                                                    }
                                                </Typography>
                                            </Box>
                                    }
                                </Box>
                            </Box>
                        </CardActionArea>
                    }
                />

                {
                    isTeacher(currentStudent)
                        ? null
                        : courseMember
                        ? null
                        : <CardActions style={{ padding: 0 }} >
                            <Box display="flex" width="100%" padding="18px" justifyContent="center" >
                                {
                                    !hasRequestedToAccessCourse
                                        ? <Button
                                            fullWidth
                                            variant="outlined"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={() => sendAccessRequest(course.anid)}
                                            disabled={isSendingAccessRequest(ExploreCoursesLocalState, course.anid)}
                                        >
                                            {
                                                isSendingAccessRequest(ExploreCoursesLocalState, course.anid)
                                                    ? "Sending request ..."
                                                    : "Join Course"
                                            }
                                        </Button>
                                        : <Button
                                            variant="outlined"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={() => removeAccessRequest(course.anid)}
                                            disabled={isRemovingAccessRequest(ExploreCoursesLocalState, course.anid)}
                                        >
                                            {
                                                isRemovingAccessRequest(ExploreCoursesLocalState, course.anid)
                                                    ? "Cancelling ..."
                                                    : "Cancel request"
                                            }
                                        </Button>
                                }
                            </Box>
                        </CardActions>
                }
            </Card>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseItem);