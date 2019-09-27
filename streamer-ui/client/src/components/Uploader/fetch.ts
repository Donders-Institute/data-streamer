import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { Project } from "./types";
import { timeout } from "./utils";

// Fake fetcher for testing purposes
export const fetchDummyProjectList = async (username: string, password: string) => {
    console.log(`Fetching data for ${username} ...`);
    await timeout(2000);
    const projectList = [
        {
            id: 1,
            number: "3010000.01"
        }
    ] as Project[];
    return projectList;
};

const handleGetProjectsResponse = (response: AxiosResponse) => {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
    return response;
};

const handleGetProjectsError = (error: AxiosError) => {
    var errorMessage = "";
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        errorMessage = JSON.stringify(error.response.data, null, 2);
    } else {
        console.log(error.message);
        errorMessage = error.message;
    }
    console.log(errorMessage);
    alert(error);
    return error;
};

const handleGetProjectsRequest = (username: string, password: string) => {
    return new Promise((resolve) => {
        const config: AxiosRequestConfig = {
            url: "/projects",
            method: "get",
            headers: { "Content-Type": "application/json" },
            data: {
            },
            timeout: 5000,
            withCredentials: true,
            auth: {
                username: username,
                password: password
            },
            responseType: "json"
        };

        resolve(
            axios(config)
                .then(handleGetProjectsResponse)
                .catch(handleGetProjectsError));
    });
};

export const fetchProjectList = async (username: string, password: string) => {
    console.log(`Fetching data for ${username} ...`);
    const response = await handleGetProjectsRequest(username, password);
    // TODO grab the data from the response
    let projectList = [
        {
            id: 1,
            number: "3010000.01"
        }
    ] as Project[];
    console.log(response);
    return projectList;
};
