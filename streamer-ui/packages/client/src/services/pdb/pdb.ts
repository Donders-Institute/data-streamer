import { useState, useEffect } from "react";

import {
    baseURL,
    fetchRetry,
    basicAuthString
} from "../fetch/fetch";

import {
    Project,
    ServerResponse,
    UserProfile,
    UploadState,
    UploadStatus
} from "../../types/types";

// Actual fetching from project database
const fetchNumRetries = 1;
const fetchTimeout = 10000; // ms

async function fetchProjectList({
    username, 
    password, 
    signal
} : {
    username: string; 
    password: string; 
    signal: AbortSignal;
}) {
    
    const url = baseURL + "/projects";
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
                headers,
                signal
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

    return result.data as Project[];
};

// Custom hook to fetch projects from the Project Database
export const useFetchProjects = ({
    checkUploadStatus,
    userProfile,
    uploadState
} : {
    checkUploadStatus: UploadStatus;
    userProfile: UserProfile;
    uploadState: UploadState;
}) => {
    const [projectList, setProjectList] = useState([] as Project[]);
    const [error, setError] = useState(null as Error | null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchProjects = async () => {
            if (uploadState.status === checkUploadStatus) {
                console.log("Fetching projects");

                if (mounted) {
                    setIsLoading(true);
                }

                const username = userProfile.username;
                const password = userProfile.password;

                try {
                    const newProjectList = await fetchProjectList({
                        username, 
                        password, 
                        signal
                    });

                    if (mounted) {
                        setProjectList(newProjectList);
                        setIsLoading(false);
                        setError(null);
                    }
                } catch (err) {
                    if (mounted) {
                        setError(err as Error);
                    }
                }
            }
        };
        fetchProjects();

        return function cleanup() {
            abortController.abort();
            mounted = false;
        };
    }, [userProfile]);

    return [projectList, error, isLoading] as [Project[], Error | null, boolean];
}
