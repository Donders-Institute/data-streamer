import React, { useEffect, useState } from "react";

import {
    ProfileResult, UserProfile
} from "../types/types";

import AppLoggedIn from "./AppLoggedIn";

import "./App.less";
import { AuthContext, getProfile } from "../services/auth/auth";
import LoadingIcon from "../components/LoadingIcon/LoadingIcon";
import Login from "../scenes/Login/Login";
import { Route, Switch } from "react-router-dom";
import ErrorPage from "../scenes/ErrorPage/ErrorPage";
import { Layout } from "antd";
import Header from "../components/Header/Header";
import Help from "../scenes/Help/Help";

const { Content } = Layout;

const App: React.FC = () => {

    const [profile, setProfile] = useState(null as UserProfile | null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    // try to get user profile
    useEffect(() => {
        getProfile().then(result => {
            result && result.data &&
            setProfile({
                username: (result.data as ProfileResult).id,
                displayName: (result.data as ProfileResult).name
            });
        }).catch( (err: Error) => {
            console.log(err);
        }).finally(() => {
            setIsLoaded(true);
        })
    }, []);

    // determine page component based on the `authState.status`
    const content = () => {
        return profile && <AppLoggedIn/> || <Login/>;
    };

    return (
        <AuthContext.Provider value={{profile: profile}}>
            <Header/>
            <Content style={{ background: "#f0f2f5" }}>
                <Switch>
                    <Route path="/" exact={true} render={() => isLoaded && content() || <LoadingIcon/>}/>
                    <Route path="/help" exact={true} render={() => <Help/>}/>
                    <Route path="/403" exact={true} render={() => <ErrorPage status={403} message="Sorry! You are not unauthorized for this application."/>}/>
                    <Route path="/500" exact={true} render={() => <ErrorPage status={500} message="Oops! There are unexpected service errors."/>}/>
                    <Route render={() => <ErrorPage status={404} message="Sorry! Page not found."/>}/>
                </Switch>
            </Content>
        </AuthContext.Provider>
    );
};

export default App;
