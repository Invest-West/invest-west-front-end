import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import {StudentAuthenticationState} from "../../../../redux-store/reducers/studentAuthenticationReducer";
import {
    hasErrorFindingAddressForRegisteredOffice,
    hasErrorFindingAddressForTradingAddress,
    StudentProfileState
} from "../../StudentProfileReducer";
import Student, {hasuniCourseProfile} from "../../../../models/student";
import Teacher, {isProf} from "../../../../models/teacher";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {ManageSystemAttributesState} from "../../../../redux-store/reducers/manageSystemAttributesReducer";
import {handleInputFieldChanged, InputCategories} from "../../StudentProfileActions";
import {KeyboardArrowRight} from "@material-ui/icons";
import {findAddress} from "./UniProfileActions";
import {getFormattedAddress} from "../../../../models/address";

interface UniProfileProps {
    StudentAuthenticationState: StudentAuthenticationState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    StudentProfileLocalState: StudentProfileState;
    handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => any;
    findAddress: (mode: "registeredOffice" | "tradingAddress") => any;
    // changeAddressFindingState: (mode: "registeredOffice" | "tradingAddress", addressFindingState: AddressFindingStates) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        StudentAuthenticationState: state.StudentAuthenticationState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        StudentProfileLocalState: state.StudentProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(inputCategory, event)),
        findAddress: (mode: "registeredOffice" | "tradingAddress") => dispatch(findAddress(mode)),
        // changeAddressFindingState: (mode: "registeredOffice" | "tradingAddress", addressFindingState: AddressFindingStates) => dispatch(changeAddressFindingState(mode, addressFindingState))
    }
}

class UniProfile extends Component<UniProfileProps, any> {

    onInputFieldChanged = (inputCategory: InputCategories) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.handleInputFieldChanged(inputCategory, event);
    }

    render() {
        const {
            StudentAuthenticationState,
            StudentProfileLocalState
        } = this.props;

        const currentStudent: Student | Teacher | null = StudentAuthenticationState.currentStudent;
        if (!currentStudent) {
            return null;
        }

        const currentTeacher: Teacher | null = isProf(currentStudent);

        const copiedStudent: Student | undefined = StudentProfileLocalState.copiedStudent;

        if (!copiedStudent) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Section title */}
            <Box>
                <Typography variant="h6" color="primary" > Business profile </Typography>
            </Box>
            <Box height="25px" />
            {/** Edit Business profile */}
            {
                this.renderEditUniProfile()
            }
        </Box>;
    }

    /**
     * Render Business profile in Edit mode
     */
    renderEditUniProfile = () => {
        const {
            ManageSystemAttributesState,
            StudentProfileLocalState
        } = this.props;

        const copiedStudent: Student | undefined = StudentProfileLocalState.copiedStudent;

        if (!copiedStudent) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Company name */}
            <FormControl fullWidth required >
                <FormLabel><b>Company name</b></FormLabel>
                <TextField
                    name="companyName"
                    placeholder="Enter company name"
                    // value={
                    //     hasuniCourseProfile(copiedStudent)
                    //         ? copiedStudent.UniProfile?.companyName
                    //         : StudentProfileLocalState.UniProfileState.newUniProfile.companyName
                    // }
                    margin="dense"
                    variant="outlined"
                    onChange={this.onInputFieldChanged(InputCategories.UniProfile)}
                    // error={copiedStudent.firstName.trim().length === 0}
                />
            </FormControl>

            {/** Registration number */}
            <FormControl fullWidth required >
                <FormLabel> <b>Registration number</b> </FormLabel>
                <TextField
                    name="registrationNo"
                    placeholder="Enter company registration number"
                    // value={
                    //     hasuniCourseProfile(copiedStudent)
                    //         ? copiedStudent.UniProfile?.registrationNo
                    //         : StudentProfileLocalState.UniProfileState.newUniProfile.registrationNo
                    // }
                    margin="dense"
                    variant="outlined"
                    onChange={this.onInputFieldChanged(InputCategories.UniProfile)}
                    // error={copiedStudent.firstName.trim().length === 0}
                />
            </FormControl>

            {/** Registered office */}
            {
                this.renderAddressInput("registeredOffice")
            }

            {/** Trading address */}
            {
                this.renderAddressInput("tradingAddress")
            }

            {/** Directors */}
            <FormControl required >
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        className={css(sharedStyles.no_text_transform)}
                        // onClick={this.props.toggleAddNewDirector}
                    >
                        <AddIcon fontSize="small" />
                        <Box marginRight="5px" />Add director
                    </Button>
                </Box>

                <Box display="flex" flexDirection="column" >
                    <TextField
                        placeholder="Enter director's name"
                        name="newDirectorText"
                        // value={newDirectorText}
                        fullWidth
                        variant="outlined"
                        // onChange={this.handleEditStudent(editStudentActions.ADDING_NEW_DIRECTOR)}
                        margin="dense"
                    />

                    <Box display="flex" flexDirection="row" marginTop="8px" justifyContent="flex-end" >
                        <Button
                            variant="outlined"
                            size="small"
                            className={css(sharedStyles.no_text_transform)}
                            // onClick={this.props.toggleAddNewDirector}
                        >Cancel
                        </Button>

                        <Box width="10px" />

                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            className={css(sharedStyles.no_text_transform)}
                            // onClick={() => this.props.addNewDirectorTemporarily(false)}
                            // disabled={newDirectorText.trim().length === 0}
                        >Add
                        </Button>
                    </Box>
                </Box>
            </FormControl>

            {/** Sector */}
            <FormControl required >
                <FormLabel> <b>Business sector</b> </FormLabel>
                <Select
                    name="sector"
                    // value={
                    //     hasuniCourseProfile(copiedStudent)
                    //         ? copiedStudent.UniProfile?.sector
                    //         : StudentProfileLocalState.UniProfileState.newUniProfile.sector
                    // }
                    input={<OutlinedInput/>}
                    margin="dense"
                    // @ts-ignore
                    onChange={this.onInputFieldChanged(InputCategories.UniProfile)}
                >
                    <MenuItem key={-1} value={"none"}>Choose business sector</MenuItem>
                    {
                        !ManageSystemAttributesState.systemAttributes
                            ? null
                            : ManageSystemAttributesState.systemAttributes.Sectors.map((sector, index) => (
                                <MenuItem key={index} value={sector}>{sector}</MenuItem>
                            ))
                    }
                </Select>
            </FormControl>

            {/** Company website */}
            <FormControl required >
                <FormLabel><b>Company website</b></FormLabel>
                <TextField
                    placeholder="Enter company website"
                    name="companyWebsite"
                    // value={
                    //     hasuniCourseProfile(copiedStudent)
                    //         ? copiedStudent.UniProfile?.companyWebsite
                    //         : StudentProfileLocalState.UniProfileState.newUniProfile.companyWebsite
                    // }
                    fullWidth
                    variant="outlined"
                    required
                    margin="dense"
                    onChange={this.onInputFieldChanged(InputCategories.UniProfile)}
                />
            </FormControl>

            <Box display="flex" flexDirection="row" justifyContent="flex-end">
                <Button
                    variant="outlined"
                    size="small"
                    className={css(sharedStyles.no_text_transform)}
                    // onClick={this.props.toggleAddNewDirector}
                >Cancel
                </Button>

                <Box width="10px"/>

                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    className={css(sharedStyles.no_text_transform)}
                    // onClick={() => this.props.addNewDirectorTemporarily(false)}
                    // disabled={newDirectorText.trim().length === 0}
                >
                    Save
                </Button>
            </Box>
        </Box>;
    }

    /**
     * Render address component
     *
     * @param mode
     */
    renderAddressInput = (mode: "registeredOffice" | "tradingAddress") => {
        const {
            StudentProfileLocalState,
            findAddress,
            // changeAddressFindingState
        } = this.props;

        const copiedStudent: Student | undefined = StudentProfileLocalState.copiedStudent;

        if (!copiedStudent) {
            return null;
        }

        return <FormControl
            required
        >
            <FormLabel>
                <b>
                    {
                        mode === "registeredOffice"
                            ? "Registered office"
                            : "Trading address"
                    }
                </b>
            </FormLabel>
            <FormGroup>
                {
                    mode !== "tradingAddress"
                        ? null
                        : <FormControlLabel
                            label="Same as registered office address"
                            labelPlacement="end"
                            control={
                                <Checkbox
                                    name="tradingAddressSameAsRegisteredOffice"
                                    checked={StudentProfileLocalState.UniProfileState.tradingAddressSameAsRegisteredOffice}
                                    color="primary"
                                    onChange={this.onInputFieldChanged(InputCategories.UniProfileCheckBox)}
                                />
                            }
                        />
                }

                {/** Trading address - showed when Trading address is different from Registered office */}
                {
                    mode === "tradingAddress"
                    && StudentProfileLocalState.UniProfileState.tradingAddressSameAsRegisteredOffice
                        ? null
                        : <Box display="flex" flexDirection="column" >
                            <FormHelperText> Enter a UK postcode </FormHelperText>

                            {/** Enter postcode to find address automatically */}
                            {
                                (mode === "registeredOffice")
                                // && StudentProfileLocalState.UniProfileState.addressFindingStateForRegisteredOffice !== AddressFindingStates.DisplayFoundAddresses)
                                || (mode === "tradingAddress")
                                    // && StudentProfileLocalState.UniProfileState.addressFindingStateForRegisteredOffice !== AddressFindingStates.DisplayFoundAddresses)
                                    ? <Box
                                        display="flex"
                                        flexDirection="column"
                                    >
                                        <TextField
                                            name="postcode"
                                            placeholder="Postcode"
                                            // value={
                                            //     hasuniCourseProfile(copiedStudent)
                                            //         ? mode === "registeredOffice"
                                            //         ? copiedStudent.UniProfile?.registeredOffice.postcode
                                            //         : copiedStudent.UniProfile?.tradingAddress.postcode
                                            //         : mode === "registeredOffice"
                                            //         ? StudentProfileLocalState.UniProfileState.newUniProfile.registeredOffice.postcode
                                            //         : StudentProfileLocalState.UniProfileState.newUniProfile.tradingAddress.postcode
                                            // }
                                            margin="dense"
                                            variant="outlined"
                                            onChange={this.onInputFieldChanged(mode === "registeredOffice" ? InputCategories.RegisteredOffice : InputCategories.TradingAddress)}
                                            // error={copiedStudent.firstName.trim().length === 0}
                                        />

                                        {/** Error text - displayed when postcode cannot be found */}
                                        {
                                            (mode === "registeredOffice" && hasErrorFindingAddressForRegisteredOffice(StudentProfileLocalState.UniProfileState))
                                            || (mode === "tradingAddress" && hasErrorFindingAddressForTradingAddress(StudentProfileLocalState.UniProfileState))
                                                ? <Typography variant="body2" color="error" align="left">
                                                    Sorry, we can't find your address, please check the details entered and search
                                                    again.
                                                  </Typography>
                                                : null
                                        }

                                        <Box>
                                            <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => findAddress(mode)} >
                                                {
                                                    (mode === "registeredOffice")
                                                    // && StudentProfileLocalState.UniProfileState.addressFindingStateForRegisteredOffice === AddressFindingStates.FindingAddresses)
                                                    || (mode === "tradingAddress")
                                                        // && StudentProfileLocalState.UniProfileState.addressFindingStateForTradingAddress === AddressFindingStates.FindingAddresses)
                                                        ? "Finding address ..."
                                                        : "Find address"
                                                }
                                                <Box width="6px" />
                                                <KeyboardArrowRight/>
                                            </Button>
                                        </Box>
                                    </Box>
                                    : null
                            }

                            {/** Select address from found addresses */}
                            {
                                (mode === "registeredOffice") // && StudentProfileLocalState.UniProfileState.addressFindingStateForRegisteredOffice === AddressFindingStates.DisplayFoundAddresses)
                                || (mode === "tradingAddress") // && StudentProfileLocalState.UniProfileState.addressFindingStateForTradingAddress === AddressFindingStates.DisplayFoundAddresses)
                                    ? <Box display="flex" flexDirection="column" >
                                        <Box display="flex" flexDirection="row" >
                                            <Typography variant="body1" align="left" > Select an address </Typography>
                                            <Button
                                                className={css(sharedStyles.no_text_transform)}
                                                variant="outlined"
                                                // onClick={() => changeAddressFindingState(mode, AddressFindingStates.EnterPostcode)}
                                            >
                                                Change
                                            </Button>
                                        </Box>
                                        <Select
                                            name={mode}
                                            value={
                                                hasuniCourseProfile(copiedStudent)
                                                    ? mode === "registeredOffice"
                                                    ? getFormattedAddress(copiedStudent.UniProfile?.registeredOffice)
                                                    : getFormattedAddress(copiedStudent.UniProfile?.tradingAddress)
                                                    : mode === "registeredOffice"
                                                    ? getFormattedAddress(StudentProfileLocalState.UniProfileState.editedUniProfile.registeredOffice)
                                                    : getFormattedAddress(StudentProfileLocalState.UniProfileState.editedUniProfile.tradingAddress)
                                            }
                                            input={<OutlinedInput/>}
                                            margin="dense"
                                            // @ts-ignore
                                            onChange={this.onInputFieldChanged(mode === "registeredOffice"
                                                ? InputCategories.RegisteredOffice : InputCategories.TradingAddress)}
                                        >
                                            <MenuItem key={-1} value={"none"}>Addresses found</MenuItem>
                                            {
                                                mode === "registeredOffice" && StudentProfileLocalState.UniProfileState.foundAddressesForRegisteredOffice
                                                    ? StudentProfileLocalState.UniProfileState.foundAddressesForRegisteredOffice.map(address => (
                                                        <MenuItem key={getFormattedAddress(address)} value={getFormattedAddress(address)}>{getFormattedAddress(address)}</MenuItem>
                                                    ))
                                                    : null
                                            }
                                            {
                                                mode === "tradingAddress" && StudentProfileLocalState.UniProfileState.foundAddressesForTradingAddress
                                                    ? StudentProfileLocalState.UniProfileState.foundAddressesForTradingAddress.map(address => (
                                                        <MenuItem key={getFormattedAddress(address)} value={getFormattedAddress(address)} >{getFormattedAddress(address)}</MenuItem>
                                                    ))
                                                    : null
                                            }
                                        </Select>
                                    </Box>
                                    : null
                            }
                        </Box>
                }
            </FormGroup>
        </FormControl>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UniProfile);