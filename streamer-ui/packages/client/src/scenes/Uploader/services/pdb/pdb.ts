import { fetchRetry, basicAuthString } from "../../../../services/fetch/fetch";
import { Project, ServerResponse } from "../../../../types/types";

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

interface SQLQueryProjectElement {
    project: string;
}

export const fetchProjectList = async (username: string, password: string) => {
    let headers = new Headers(
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

    console.dir(result.data);
    if (!result.data.data) {
        throw new Error("Empty data.data in result");
    }

    console.dir(result.data.data);

    let projectList = [] as Project[];
    const data = result.data.data;
    for (let i = 0; i < data.length; i++) {
        let projectElement: SQLQueryProjectElement = data[i];
        let projectNumber = projectElement.project;
        let project = { id: i, number: projectNumber } as Project;
        console.log(projectNumber);
        projectList!.push(project);
    }

    return projectList;
};
