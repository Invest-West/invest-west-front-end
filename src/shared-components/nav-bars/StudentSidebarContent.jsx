import React, {Component} from "react";
import FlexView from "react-flexview/lib/index";
import {css} from "aphrodite";
import {Divider, List, ListItem, ListItemIcon, ListItemText, Link} from "@material-ui/core";
import {Image} from "react-bootstrap";
import HomeIcon from "@material-ui/icons/Home";
import WorkIcon from "@material-ui/icons/Work";
import SettingsIcon from "@material-ui/icons/Settings";
import ContactSupportIcon from "@material-ui/icons/ContactSupport";
import ArrowLeft from "@material-ui/icons/SubdirectoryArrowLeft";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import ProjectIcon from "@material-ui/icons/CardGiftcard";
import InfoIcon from "@material-ui/icons/Info";
import HistoryIcon from "@material-ui/icons/History";
import {NavLink} from "react-router-dom";

import {connect} from "react-redux";
import * as authActions from "../../redux-store/actions/authActions";
import * as dashboardSidebarActions from "../../redux-store/actions/dashboardSidebarActions";
import * as forumsActions from "../../redux-store/actions/forumsActions";

import * as DB_CONST from "../../firebase/databaseConsts";
import * as ROUTES from "../../router/routes";
import Routes from "../../router/routes";
import * as utils from "../../utils/utils";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {studentSignOut} from "../../redux-store/actions/authenticationActions";
import {School} from "@material-ui/icons";

export const HOME_TAB = "Home";
export const PROFILE_TAB = "Profile";
export const FORUMS_TAB = "Forums";
export const MY_STUDENT_OFFERS_TAB = "My offers";
// export const MY_PLEDGES_TAB = "My pledges";
export const SETTINGS_TAB = "Settings";
export const CHANGE_PASSWORD_TAB = "Change password";
export const CONTACT_US_TAB = "Contact us";
export const GUIDELINE_TAB = "Help";
export const RESOURCES_TAB = "Resources";
export const EXPLORE_COURSES_TAB = "Explore courses";
export const EXPLORE_STUDENT_OFFERS_TAB = "Explore offers";
export const MY_ACTIVITIES_TAB = "My activities";
export const COURSE_ACTIVITIES_TAB = "Audit Log";

const mapStateToProps = state => {
    return {
        ManageCourseUrlState: state.ManageCourseUrlState,
        AuthenticationState: state.AuthenticationState,

        courseStudent: state.manageCourseFromParams.courseStudent,
        courseProperties: state.manageCourseFromParams.courseProperties,
        coursePropertiesLoaded: state.manageCourseFromParams.coursePropertiesLoaded,

        student: state.auth.student
    };
};

const mapDispatchToProps = dispatch => {
    return {
        studentSignOutNew: async () => dispatch(studentSignOut()),

        logout: () => dispatch(authActions.logout()),
        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        goBackToForumsMain: () => dispatch(forumsActions.goBackToForumsMain())
    };
};

class SidebarContent extends Component {

    onLogoutClick = async () => {
        const {
            dashboardProps,
            logout,

            ManageCourseUrlState,
            AuthenticationState,
            studentSignOutNew
        } = this.props;

        await studentSignOutNew();
        dashboardProps.history.push(Routes.constructHomeRoute(dashboardProps.match.params, ManageCourseUrlState, AuthenticationState));

        logout(); // logout old
    };

    onForumsTabClick = () => {
        this.props.toggleSidebar(false);
        this.props.goBackToForumsMain();
    };

    render() {
        const {
            courseStudent,
            coursePropertiesLoaded,
            courseProperties,

            student,
            dashboardProps,

            toggleSidebar
        } = this.props;

        if (!coursePropertiesLoaded) {
            return null;
        }

        return (
            <FlexView
                column
                width={240}
                height="100%"
            >
                {/** Sidebar header */}
                <FlexView column height={65} vAlignContent="center" hAlignContent="center" style={{ padding: 8 }} >
                    <Link href={courseProperties.website ?? ""} target="_blank">
                        <Image
                            style={{ width: "auto", height: 65, margin: 0, padding: 10, objectFit: "scale-down" }}
                            src={
                                !courseProperties
                                    ?
                                    require('../../img/logo.png').default
                                    :
                                    utils.getLogoFromCourse(utils.GET_PLAIN_LOGO, courseProperties)
                            }
                        />
                    </Link>
                </FlexView>

                <Divider/>

                {/** Main navigation */}
                <FlexView column marginTop={10} >
                    {/** Home tab */}
                    <List>
                        <NavLink
                            to={{ pathname: dashboardProps.match.pathname, search: `?tab=${HOME_TAB}` }}
                            className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                        >
                            <ListItem button onClick={() => toggleSidebar(false)} >
                                <ListItemIcon>
                                    <HomeIcon/>
                                </ListItemIcon>
                                <ListItemText className={css(sharedStyles.black_text)}>{HOME_TAB}</ListItemText>
                            </ListItem>
                        </NavLink>

                        {/** Offers table */}
                        {
                            !student
                                ?
                                null
                                :
                                // student.type === DB_CONST.TYPE_INVESTOR
                                //     ?
                                //     <NavLink
                                //         to={{
                                //             pathname: dashboardProps.match.pathname,
                                //             search: `?tab=${MY_PLEDGES_TAB}`
                                //         }}
                                //         className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                //     >
                                //         <ListItem
                                //             button
                                //             onClick={() => toggleSidebar(false)}
                                //         >
                                //             <ListItemIcon>
                                //                 <HowToVoteIcon/>
                                //             </ListItemIcon>
                                //             <ListItemText
                                //                 className={css(sharedStyles.black_text)}
                                //             >
                                //                 {MY_PLEDGES_TAB}
                                //             </ListItemText>
                                //         </ListItem>
                                //     </NavLink>
                                //     :
                                student.type === DB_CONST.TYPE_TEACHER
                                    ?
                                    <NavLink
                                        to={{ pathname: dashboardProps.match.pathname, search: `?tab=${MY_STUDENT_OFFERS_TAB}` }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem
                                            button
                                            onClick={() => toggleSidebar(false)}
                                        >
                                            <ListItemIcon>
                                                <ProjectIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{MY_STUDENT_OFFERS_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                    :
                                    null
                        }

                        {/** Explore offers tab */}
                        {
                            student.type !== DB_CONST.TYPE_PROF
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${EXPLORE_STUDENT_OFFERS_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <ProjectIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{EXPLORE_STUDENT_OFFERS_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Explore courses tab */}
                        <NavLink
                            to={{
                                pathname: dashboardProps.match.pathname,
                                search: `?tab=${EXPLORE_COURSES_TAB}`
                            }}
                            className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                        >
                            <ListItem button onClick={() => toggleSidebar(false)} >
                                <ListItemIcon>
                                    <BubbleChartIcon/>
                                </ListItemIcon>
                                <ListItemText className={css(sharedStyles.black_text)}>{EXPLORE_COURSES_TAB}</ListItemText>
                            </ListItem>
                        </NavLink>

                        {/** Resources */}
                        <NavLink
                            to={{
                                pathname: dashboardProps.match.pathname,
                                search: `?tab=${RESOURCES_TAB}`
                            }}
                            className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                        >
                            <ListItem button onClick={() => toggleSidebar(false)} >
                                <ListItemIcon>
                                    <School/>
                                </ListItemIcon>
                                <ListItemText className={css(sharedStyles.black_text)}>{RESOURCES_TAB}</ListItemText>
                            </ListItem>
                        </NavLink>
                    </List>
                </FlexView>

                {/** Footer navigation */}
                <FlexView column height='100%' vAlignContent="bottom" >
                    <List>
                        {/** Profile tab (for normal students) || Settings tab (for admins) */}
                        {
                            !student
                                ?
                                null
                                :
                                student.type !== DB_CONST.TYPE_PROF
                                    ?
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${PROFILE_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <WorkIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{PROFILE_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                    :
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${SETTINGS_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <SettingsIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{SETTINGS_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                        }

                        {/** My/Course activities tab */}
                        {
                            student.type !== DB_CONST.TYPE_PROF
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${(student.type === DB_CONST.TYPE_PROF && !student.superAdmin) ? COURSE_ACTIVITIES_TAB : MY_ACTIVITIES_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <HistoryIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)} >
                                            {
                                                COURSE_ACTIVITIES_TAB
                                            }
                                        </ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Change password tab */}
                        {
                            !student
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${CHANGE_PASSWORD_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <VerifiedUserIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{CHANGE_PASSWORD_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Forums tab */}
                        {/*<NavLink*/}
                        {/*    to={{*/}
                        {/*        pathname: dashboardProps.match.pathname,*/}
                        {/*        search: `?tab=${FORUMS_TAB}`*/}
                        {/*    }}*/}
                        {/*    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}*/}
                        {/*>*/}
                        {/*    <ListItem*/}
                        {/*        button*/}
                        {/*        onClick={this.onForumsTabClick}*/}
                        {/*    >*/}
                        {/*        <ListItemIcon>*/}
                        {/*            <ChatIcon/>*/}
                        {/*        </ListItemIcon>*/}
                        {/*        <ListItemText*/}
                        {/*            className={css(sharedStyles.black_text)}*/}
                        {/*        >*/}
                        {/*            {FORUMS_TAB}*/}
                        {/*        </ListItemText>*/}
                        {/*    </ListItem>*/}
                        {/*</NavLink>*/}
                        {
                            student.type === DB_CONST.TYPE_PROF
                                ?
                                null
                                :
                                <NavLink
                                    to={
                                        courseStudent
                                            ?
                                            ROUTES.CONTACT_US.replace(':courseStudent', courseStudent)
                                            :
                                            ROUTES.CONTACT_US_INVEST_WEST_SUPER
                                    }
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <ContactSupportIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{CONTACT_US_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Help tab */}
                        {
                            // don't need to show this tab to super admin
                            student.type === DB_CONST.TYPE_PROF
                            && student.superAdmin
                                ?
                                null
                                :
                                <NavLink
                                    to={
                                        courseStudent
                                            ?
                                            ROUTES.HELP.replace(':courseStudent', courseStudent)
                                            :
                                            ROUTES.HELP_INVEST_WEST_SUPER
                                    }
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <InfoIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{GUIDELINE_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Logout tab */}
                        <ListItem button onClick={this.onLogoutClick} >
                            <ListItemIcon>
                                <ArrowLeft/>
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </ListItem>
                    </List>
                </FlexView>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContent);