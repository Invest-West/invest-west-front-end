import User from "../../models/user";
import Admin from "../../models/admin";
import {
    AuthenticationAction,
    AuthenticationEvents,
    CompleteAuthenticationAction,
    UpdateUserChangesAction
} from "../actions/authenticationActions";
import Error from "../../models/error";
import GroupOfMembership from "../../models/group_of_membership";
import InvestorSelfCertification from "../../models/investor_self_certification";

export enum AuthenticationStatus {
    NotInitialized,
    Authenticating,
    Authenticated,
    Unauthenticated
}

export interface AuthenticationState {
    status: AuthenticationStatus;
    currentUser: User | Admin | null;
    groupsOfMembership: GroupOfMembership[];
    selfCertification?: InvestorSelfCertification; // only available for investor
    error?: Error
}

const initialState: AuthenticationState = {
    status: AuthenticationStatus.NotInitialized,
    currentUser: null,
    groupsOfMembership: []
}

export const authIsNotInitialized = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.NotInitialized;
}

export const isAuthenticating = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.Authenticating;
}

export const successfullyAuthenticated = (state: AuthenticationState) => {
    return state.status === AuthenticationStatus.Authenticated && state.currentUser && state.error === undefined;
}

export const hasAuthenticationError = (state: AuthenticationState) => {
    return state.error !== undefined;
}

const authenticationReducer = (state = initialState, action: AuthenticationAction) => {
    switch (action.type) {
        case AuthenticationEvents.StartAuthenticating:
            return {
                ...initialState,
                status: AuthenticationStatus.Authenticating
            }
        case AuthenticationEvents.CompleteAuthentication:
            const completeAuthenticationAction: CompleteAuthenticationAction = (action as CompleteAuthenticationAction);
            if (completeAuthenticationAction.status === AuthenticationStatus.Authenticated) {
                console.log('Successfully logged in!'); // Add this line
            }          
            return {
                ...state,
                status: completeAuthenticationAction.status,
                currentUser: completeAuthenticationAction.currentUser
                    ? JSON.parse(JSON.stringify(completeAuthenticationAction.currentUser)) : state.currentUser,
                selfCertification: completeAuthenticationAction.selfCertification
                    ? JSON.parse(JSON.stringify(completeAuthenticationAction.selfCertification))
                    : state.selfCertification,
                groupsOfMembership: JSON.parse(JSON.stringify(completeAuthenticationAction.groupsOfMembership)),
                error: completeAuthenticationAction.error
            }
        case AuthenticationEvents.SignOut:
            // Always clear all user state on sign out - no conditional logic
            // This prevents stale data when switching between accounts
            return {
                ...initialState,
                status: AuthenticationStatus.Unauthenticated
            }
        case AuthenticationEvents.UpdateUserChanges:
            const updateUserChangesAction: UpdateUserChangesAction = action as UpdateUserChangesAction;
            return {
                ...state,
                currentUser: updateUserChangesAction.updatedUser
            }
        default:
            return state;
    }
};

export default authenticationReducer;