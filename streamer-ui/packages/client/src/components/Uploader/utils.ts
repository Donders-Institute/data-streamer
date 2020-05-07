export const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatBytes = (bytesAsString: string, decimals = 2) => {
    let bytes = parseInt(bytesAsString);
    if (bytes === 0) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Allow as many lowercase and uppercase characters and numbers as needed.
const regexpSubjectLabel = new RegExp("^[a-zA-Z0-9]+$");
export const validateSubjectLabelInput = (text: string) => {
    return regexpSubjectLabel.test(text);
};

// Allow as many lowercase and uppercase characters and numbers as needed.
const regexpSessionLabel = new RegExp("^[a-zA-Z0-9]+$");
export const validateSessionLabelInput = (text: string) => {
    return regexpSessionLabel.test(text);
};

// Start with lowercase characters. Next, allow as many lowercase characters, numbers dashes, underscores, and ampersands as needed.
const regexpSelectedDataTypeOtherInput = new RegExp("^[a-z][-a-z0-9_\&]+$");
export const validateSelectedDataTypeOtherInput = (text: string) => {
    return regexpSelectedDataTypeOtherInput.test(text);
};
