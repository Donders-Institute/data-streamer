import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";
import { timeout } from "./utils";

// Fake fetcher for testing purposes
export const fetchDummyIpAddress = async () => {
    await timeout(2000);
    const ipAddress = "1.2.3.4";
    return ipAddress;
};

const handleGetIpAddressResponse = (response: AxiosResponse) => {
    // console.log(response.data);
    // console.log(response.status);
    // console.log(response.statusText);
    // console.log(response.headers);
    // console.log(response.config);
    return response;
};

const handleGetIpAddressError = (error: AxiosError) => {
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

const handleGetIpAddressRequest = () => {
    return new Promise<AxiosResponse|AxiosError>((resolve) => {
        const config: AxiosRequestConfig = {
            url: "https://api.ipify.org?format=json",
            method: "get",
            headers: { "Content-Type": "application/json" },
            data: {
            },
            timeout: 5000,
            withCredentials: false,
            responseType: "json"
        };

        resolve(
            axios(config)
                .then(handleGetIpAddressResponse)
                .catch(handleGetIpAddressError));
    });
};

function isAxiosResponse(result: AxiosResponse|AxiosError): result is AxiosResponse {
    return (result as AxiosResponse).data !== undefined;
}

export const fetchIpAddress = async () => {
    console.log(`Fetching IP address ...`);
    const result = await handleGetIpAddressRequest();
    let ipAddress = "";
    if (isAxiosResponse(result)) {
        if (result.data) {
            if (result.data.ip) {
                ipAddress = result.data.ip;
            }
        }
    }
    console.log(`IP address: ${ipAddress}`);
    return ipAddress;
};
