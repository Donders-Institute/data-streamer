import { fetchRetry, basicAuthString } from "../../../../services/fetch/fetch";
import { Project, ServerResponse } from "../../../../types/types";

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
    ] as Project[];
    return projectList;
};

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
            numRetries: 1,
            timeout: 5000
        });
    } catch (err) {
        throw err;
    }

    console.dir(result);
    let projectList = [] as Project[];
    // if (result.data) {
    //     if (result.data.data) {
    //         const data = result.data.data;
    //         for (let i = 0; i < data.length; i++) {
    //             let projectElement: SQLQueryProjectElement = data[i];
    //             let projectNumber = projectElement.project;
    //             let project = { id: i, number: projectNumber } as Project;
    //             console.log(projectNumber);
    //             projectList!.push(project);
    //         }
    //     }
    // }

    return projectList;
};
