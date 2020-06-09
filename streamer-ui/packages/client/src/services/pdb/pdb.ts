import { useState, useEffect } from "react";

import {
    baseUrl,
    fetchRetry,
    basicAuthString
} from "../fetch/fetch";

import {
    Project,
    ServerResponse,
    ProjectsResultElement,
    ProjectsResult,
    UserProfile
} from "../../types/types";

// Fake fetcher for testing purposes
async function fetchDummyProjectList() {
    const timeout = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    await timeout(2000);
    const projectList = [
        {
            projectNumber: "3010000.01"
        } as Project,
        {
            projectNumber: "3010000.02"
        } as Project
    ] as Project[];
    return projectList;
};

// Actual fetching from project database
const fetchNumRetries = 1;
const fetchTimeout = 2000; // ms

async function fetchProjectList(username: string, password: string) {

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
        const projectElement = projectsResult[i] as ProjectsResultElement;
        const projectNumber = projectElement.project;
        const project = { 
            projectNumber 
        } as Project;
        projectList.push(project);
    }

    return projectList;
};

// Custom hook to fetch projects from the Project Database
export const useFetchProjects = (userProfile: UserProfile, mockPdb: boolean) => {
    const [projectList, setProjectList] = useState([] as Project[]);
    const [error, setError] = useState(null as Error | null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchProjects = async () => {
            if (mounted) {
                setIsLoading(true);
            }

            const username = userProfile.username;
            const password = userProfile.password;

            try {
                let newProjectList: Project[];
                if (mockPdb) {
                    newProjectList = await fetchDummyProjectList(); 
                } else {
                    newProjectList = await fetchProjectList(username, password);
                }

                if (mounted) {
                    setProjectList(newProjectList);
                    setIsLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                }
            }
        };
        fetchProjects();

        return function cleanup() {
            mounted = false;
        };
    }, [userProfile]);

    return [projectList, error, isLoading] as [Project[], Error | null, boolean];
}
