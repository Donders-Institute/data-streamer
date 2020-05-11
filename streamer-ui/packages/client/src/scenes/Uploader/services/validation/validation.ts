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

// Start with lowercase characters. Next, allow as many lowercase characters, numbers dashes, and underscores as needed.
const regexpSelectedDataTypeOtherInput = new RegExp("^[a-z][-a-z0-9_]+$");
export const validateSelectedDataTypeOtherInput = (text: string) => {
    return regexpSelectedDataTypeOtherInput.test(text);
};
