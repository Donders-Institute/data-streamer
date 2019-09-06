import { LOCATION_HOME, UPDATE_SESSION, SystemState, SystemActionTypes } from "./types";

const initialState: SystemState = {
    loggedIn: false,
    session: "",
    userName: "",
    location: LOCATION_HOME
};

export function systemReducer(
    state = initialState,
    action: SystemActionTypes
): SystemState {
    switch (action.type) {
        case UPDATE_SESSION: {
            return {
                ...state,
                ...action.payload
            };
        }
        default:
            return state;
    }
}