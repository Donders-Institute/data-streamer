import { fetchRetry, basicAuthString } from "../../../../services/fetch/fetch";
import { Project, ServerResponse, ProjectsResultElement, ProjectsResult } from "../../../../types/types";

// Fake fetcher for testing purposes

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

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

// Actual fetching from project database

const fetchNumRetries = 1;
const fetchTimeout = 5000; // ms

export const fetchProjectList = async (username: string, password: string) => {
    const headers = new Headers(
        {
            'Content-Type': 'application/json',
            'Authorization': basicAuthString({ username, password })
        }
    );

    let result: ServerResponse;
    try {
        result = await fetchRetry<ServerResponse>({
            url: "/projects",
            options: {
                method: 'GET',
                credentials: 'include',
                headers
            } as RequestInit,
            numRetries: fetchNumRetries,
            timeout: fetchTimeout
        });
    } catch (err) {
        throw err;
    }

    console.dir(result);
    if (!result.data) {
        throw new Error("Empty data in result");
    }

    const getProjectsResult = result.data as ProjectsResult;
    const projects = getProjectsResult.data;

    let projectList = [] as Project[];
    for (let i = 0; i < projects.length; i++) {
        let projectElement = projects[i] as ProjectsResultElement;
        let projectNumber = projectElement.project;
        let project = {
            id: i,
            number: projectNumber
        } as Project;
        console.log(projectNumber);
        projectList!.push(project);
    }

    return projectList;
};
