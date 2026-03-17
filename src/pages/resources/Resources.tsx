import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {RouteComponentProps} from "react-router-dom";
import {RouteParams} from "../../router/router";
import {Box, Card, Typography} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import ResourceItem from "./ResourceItem";


interface ResourcesProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {}
}

export interface Resource {
    name: string;
    logo: string;
    page: React.ReactNode;
}

export const resources: Resource[] = [];

class Resources extends Component<ResourcesProps & Readonly<RouteComponentProps<RouteParams>>, any> {
    render() {
        const {
            MediaQueryState,
            ManageGroupUrlState
        } = this.props;

        return <Box
            paddingX={MediaQueryState.isMobile ? "20px" : "56px"}
            paddingY={MediaQueryState.isMobile ? "15px" : "40px"}
        >
            <Row noGutters>
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}}>
                    <Card elevation={0}>
                        <Box display="flex" flexDirection="column" alignItems="center" bgcolor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} color="white" paddingY="28px">
                            <Typography variant="h6" align="center">Resources on Invest West</Typography>
                        </Box>
                    </Card>
                </Col>
            </Row>

            {/** Loader */}
            {/*{*/}
            {/*    !isFetchingGroups(ExploreGroupsLocalState)*/}
            {/*        ? null*/}
            {/*        : <Row*/}
            {/*            noGutters*/}
            {/*        >*/}
            {/*            <Col*/}
            {/*                xs={12}*/}
            {/*                sm={12}*/}
            {/*                md={12}*/}
            {/*                lg={12}*/}
            {/*            >*/}
            {/*                <Box*/}
            {/*                    display="flex"*/}
            {/*                    marginY="80px"*/}
            {/*                    justifyContent="center"*/}
            {/*                >*/}
            {/*                    <BeatLoader*/}
            {/*                        color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}*/}
            {/*                    />*/}
            {/*                </Box>*/}
            {/*            </Col>*/}
            {/*        </Row>*/}
            {/*}*/}

            {/** Resources area */}
            <Box marginTop="30px">
                {resources.length === 0 ? (
                    <Row noGutters>
                        <Col xs={12}>
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                paddingY="60px"
                            >
                                <Typography variant="h6" color="textSecondary" align="center">
                                    No resources are currently available.
                                </Typography>
                                <Typography variant="body2" color="textSecondary" align="center"
                                    style={{ marginTop: 8 }}>
                                    Please check back later.
                                </Typography>
                            </Box>
                        </Col>
                    </Row>
                ) : (
                    <Row noGutters>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <Row>
                                {
                                    resources
                                        .map(resource =>
                                            <Col key={resource.name} xs={12} sm={12} md={3}>
                                                <ResourceItem resource={resource}/>
                                            </Col>
                                        )
                                }
                            </Row>
                        </Col>
                    </Row>
                )}
            </Box>

            {/** Pagination */}
            {/*{*/}
            {/*    // !successfullyFetchedGroups(ExploreGroupsLocalState)*/}
            {/*    //     ? null*/}
            {/*    //     : paginationPages === 1*/}
            {/*    //     ? null*/}
            {/*    //     :*/}
            {/*        <Row*/}
            {/*            noGutters*/}
            {/*        >*/}
            {/*            <Col*/}
            {/*                xs={12}*/}
            {/*                sm={12}*/}
            {/*                md={12}*/}
            {/*                lg={12}*/}
            {/*            >*/}
            {/*                <Box*/}
            {/*                    display="flex"*/}
            {/*                    justifyContent="center"*/}
            {/*                    marginTop="55px"*/}
            {/*                >*/}
            {/*                    <Pagination*/}
            {/*                        count={0}*/}
            {/*                        page={0}*/}
            {/*                        color="primary"*/}
            {/*                        //onChange={}*/}
            {/*                    />*/}
            {/*                </Box>*/}
            {/*            </Col>*/}
            {/*        </Row>*/}
            {/*}*/}
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Resources);