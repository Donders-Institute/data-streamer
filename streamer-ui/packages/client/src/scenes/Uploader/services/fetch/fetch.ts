import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

import { Project, ProjectList } from "../../../../types/types";

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Fake fetcher for testing purposes
export const fetchDummyProjectList = async (username: string, password: string) => {
    console.log(`Fetching data for ${username} ...`);
    await timeout(2000);
    const projectList = [
        {
            id: 1,
            number: "3010000.01"
        }
    ] as unknown as ProjectList;
    return projectList;
};

const handleGetProjectsResponse = (response: AxiosResponse) => {
    // console.log(response.data);
    // console.log(response.status);
    // console.log(response.statusText);
    // console.log(response.headers);
    // console.log(response.config);
    return response;
};

const handleGetProjectsError = (error: AxiosError) => {
    var errorMessage = "";
    if (error.response) {
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
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
    return new Promise<AxiosResponse | AxiosError>((resolve) => {
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

function isAxiosResponse(result: AxiosResponse | AxiosError): result is AxiosResponse {
    return (result as AxiosResponse).data !== undefined;
}

interface SQLQueryProjectElement {
    project: string;
}

export const fetchProjectList = async (username: string, password: string) => {
    console.log(`Fetching projects for ${username} ...`);
    const result = await handleGetProjectsRequest(username, password);
    let projectList = [] as unknown as ProjectList;
    if (isAxiosResponse(result)) {
        if (result.data) {
            if (result.data.data) {
                const data = result.data.data;
                for (let i = 0; i < data.length; i++) {
                    let projectElement: SQLQueryProjectElement = data[i];
                    let projectNumber = projectElement.project;
                    let project = { id: i, number: projectNumber } as Project;
                    console.log(projectNumber);
                    projectList!.push(project);
                }
            }
        }
    }
    return projectList;
};
