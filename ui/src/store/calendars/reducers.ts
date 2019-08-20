import {
  CalendarsState,
  SEND_MESSAGE,
  DELETE_MESSAGE,
  CalendarsActionTypes
} from "./types";

const initialState: CalendarsState = {
  messages: []
};

export function calendarsReducer(
  state = initialState,
  action: CalendarsActionTypes
): CalendarsState {
  switch (action.type) {
    case SEND_MESSAGE:
      return {
        messages: [...state.messages, action.payload]
      };
    case DELETE_MESSAGE:
      return {
        messages: state.messages.filter(
          message => message.timestamp !== action.meta.timestamp
        )
      };
    default:
      return state;
  }
}
