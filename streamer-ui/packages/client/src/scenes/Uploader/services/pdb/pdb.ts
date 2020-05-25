import {
    baseUrl,
    fetchRetry,
    basicAuthString
} from "../../../../services/fetch/fetch";

import {
    Project,
    ServerResponse,
    ProjectsResultElement,
    ProjectsResult
} from "../../../../types/types";

// Fake fetcher for testing purposes
export async function fetchDummyProjectList(username: string, password: string) {
    console.log(`Fetching data for ${username} ...`);
    const timeout = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    await timeout(2000);
    const projectList = [
        {
            id: 1,
            projectNumber: "3010000.01"
        } as Project
    ] as Project[];
    return projectList;
};

// Actual fetching from project database
const fetchNumRetries = 1;
const fetchTimeout = 2000; // ms

export async function fetchProjectList(username: string, password: string) {

    const url = baseUrl() + "/projects";
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );

    let result: ServerResponse;
    try {
        result = await fetchRetry({
            url,
            options: {
                method: 'GET',
                credentials: 'include',
                mode: 'cors',
                headers
            } as RequestInit,
            numRetries: fetchNumRetries,
            timeout: fetchTimeout
        });
    } catch (err) {
        throw err;
    }

    if (!result.data) {
        throw new Error("Empty data in result");
    }

    const projectsResult = result.data as ProjectsResult;

    let projectList = [] as Project[];
    for (let i = 0; i < projectsResult.length; i++) {
        let projectElement = projectsResult[i] as ProjectsResultElement;
        let projectNumber = projectElement.project;

        let project = {
            id: i,
            projectNumber
        } as Project;

        projectList.push(project);
    }

    return projectList;
};
