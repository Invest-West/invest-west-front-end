import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, IconButton, TextField, Typography} from "@material-ui/core";
import {
    ManageSystemAttributesState,
    successfullyLoadedSystemAttributes
} from "../../../../redux-store/reducers/manageSystemAttributesReducer";
import {isSavingCourseSectorsChanges, ManageCourseSectorsState} from "./ManageCourseSectorsReducer";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {
    addNewCourseSector,
    cancelCourseSectorsChanges, deleteCourseSector,
    onTextChanged,
    saveCourseSectorsChanges,
    toggleAddNewCourseSector
} from "./ManageCourseSectorsActions";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";

interface ManageCourseSectorsProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageCourseSectorsLocalState: ManageCourseSectorsState;
    toggleAddNewCourseSector: () => any;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    addNewCourseSector: () => any;
    deleteCourseSector: (sector: string) => any;
    saveCourseSectorsChanges: () => any;
    cancelCourseSectorsChanges: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageCourseSectorsLocalState: state.ManageCourseSectorsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleAddNewCourseSector: () => dispatch(toggleAddNewCourseSector()),
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        addNewCourseSector: () => dispatch(addNewCourseSector()),
        deleteCourseSector: (sector: string) => dispatch(deleteCourseSector(sector)),
        saveCourseSectorsChanges: () => dispatch(saveCourseSectorsChanges()),
        cancelCourseSectorsChanges: () => dispatch(cancelCourseSectorsChanges())
    }
}

class ManageCourseSectors extends Component<ManageCourseSectorsProps, any> {
    render() {
        const {
            ManageSystemAttributesState,
            ManageCourseSectorsLocalState,
            toggleAddNewCourseSector,
            onTextChanged,
            addNewCourseSector,
            deleteCourseSector,
            saveCourseSectorsChanges,
            cancelCourseSectorsChanges
        } = this.props;

        if (!successfullyLoadedSystemAttributes(ManageSystemAttributesState)) {
            return null;
        }

        return <Box>
            <Typography variant="h6" color="primary">Edit sectors</Typography>

            <Box height="15px"/>

            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => toggleAddNewCourseSector()}>
                {
                    !ManageCourseSectorsLocalState.addingNewCourseSector
                        ? <AddIcon/>
                        : <CloseIcon/>
                }

                <Box
                    width="6px"
                />
                {
                    !ManageCourseSectorsLocalState.addingNewCourseSector
                        ? "Add new sector"
                        : "Cancel adding new sector"
                }
            </Button>

            {
                !ManageCourseSectorsLocalState.addingNewCourseSector
                    ? null
                    : <Box display="flex" flexDirection="row" alignItems="center" marginTop="10px">
                        <TextField variant="outlined" margin="dense" onChange={onTextChanged}/>
                        <Box width="15px"/>
                        <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => addNewCourseSector()}>Add</Button>
                      </Box>
            }

            <Box height="30px"/>

            {
                ManageCourseSectorsLocalState.sectors.map(sector => (
                    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
                        <Typography align="left" variant="body1">{sector}
                        </Typography>
                        <Box width="10px"/>
                        <IconButton onClick={() => deleteCourseSector(sector)} >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                ))
            }

            <Box display="flex" flexDirection="row" marginTop="20px">
                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => cancelCourseSectorsChanges()}>Cancel changes</Button>
                <Box width="15px"/>
                <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => saveCourseSectorsChanges()} disabled={isSavingCourseSectorsChanges(ManageCourseSectorsLocalState)}>
                    {
                        isSavingCourseSectorsChanges(ManageCourseSectorsLocalState)
                            ? "Saving ..."
                            : "Save changes"
                    }
                </Button>
            </Box>
        </Box>;
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCourseSectors);