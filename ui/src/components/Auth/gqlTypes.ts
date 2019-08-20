/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLoginState
// ====================================================

export interface GetLoginState_loginState_user {
  __typename: "UserInfo";
  userName: string;
  displayName: string | null;
}

export interface GetLoginState_loginState {
  __typename: "LoginState";
  status: LoginStatus;
  user: GetLoginState_loginState_user | null;
  error: string | null;
}

export interface GetLoginState {
  loginState: GetLoginState_loginState;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartLogin
// ====================================================

export interface StartLogin_startLogin {
  __typename: "LoginState";
  status: LoginStatus;
}

export interface StartLogin {
  startLogin: StartLogin_startLogin;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: EndLoginSuccess
// ====================================================

export interface EndLoginSuccess_endLoginSuccess {
  __typename: "LoginState";
  status: LoginStatus;
}

export interface EndLoginSuccess {
  endLoginSuccess: EndLoginSuccess_endLoginSuccess;
}

export interface EndLoginSuccessVariables {
  userName: string;
  displayName?: string | null;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: EndLoginError
// ====================================================

export interface EndLoginError_endLoginError {
  __typename: "LoginState";
  status: LoginStatus;
}

export interface EndLoginError {
  endLoginError: EndLoginError_endLoginError;
}

export interface EndLoginErrorVariables {
  error: string;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StartLogout
// ====================================================

export interface StartLogout_startLogout {
  __typename: "LoginState";
  status: LoginStatus;
}

export interface StartLogout {
  startLogout: StartLogout_startLogout;
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUser
// ====================================================

export interface GetUser_get_user {
  __typename: "helper_get_user";
  created: any | null;
  email: string | null;
  external_phone_number: string | null;
  initials: string | null;
  internal_phone_number: string | null;
  room_id: number | null;
  updated: any | null;
  user_first_name: string | null;
  user_full_name: string | null;
  user_functions: string | null;
  user_id: number | null;
  user_last_name: string | null;
  user_middle_name: string | null;
  user_status: string | null;
  user_technical_room_number: string | null;
  user_title: string | null;
}

export interface GetUser {
  /**
   * execute function "get_user" which returns "helper_get_user"
   */
  get_user: GetUser_get_user[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUsers
// ====================================================

export interface GetUsers_view_users {
  __typename: "view_users";
  id: number | null;
  user_name: string | null;
  user_full_name: string | null;
  user_status: string | null;
}

export interface GetUsers {
  /**
   * fetch data from the table: "view_users"
   */
  view_users: GetUsers_view_users[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllPeople
// ====================================================

export interface GetAllPeople_view_users {
  __typename: "view_users";
  id: number | null;
  user_name: string | null;
  user_full_name: string | null;
  user_status: string | null;
}

export interface GetAllPeople {
  /**
   * fetch data from the table: "view_users"
   */
  view_users: GetAllPeople_view_users[];
}

/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum LoginStatus {
  ERROR = "ERROR",
  LOGGED_IN = "LOGGED_IN",
  LOGGING_IN = "LOGGING_IN",
  LOGGING_OUT = "LOGGING_OUT",
  NOT_LOGGED_IN = "NOT_LOGGED_IN",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
