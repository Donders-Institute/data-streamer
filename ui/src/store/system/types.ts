export const LOCATION_HOME = "HOME";
export const LOCATION_EXPLORE = "EXPLORE";
export const LOCATION_CALENDARS = "CALENDARS";
export const LOCATION_FLOORMAP = "FLOORMAP";

// Describing the shape of the system's slice of state
export interface SystemState {
  loggedIn: boolean
  session: string
  userName: string
  location: string
}

// Describing the different ACTION NAMES available
export const UPDATE_SESSION = "UPDATE_SESSION";

interface UpdateSessionAction {
  type: typeof UPDATE_SESSION;
  payload: SystemState;
}

export type SystemActionTypes = UpdateSessionAction;