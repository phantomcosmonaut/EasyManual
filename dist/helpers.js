export const toTitleCase = (str) => {
    let result = str.replace(/-/g, ' ');
    return result.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
};
