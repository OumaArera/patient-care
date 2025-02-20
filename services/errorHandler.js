export const errorHandler = (errorString) =>{
    let parsedErrors = [];
    if (typeof errorString === "string") {
        try {
            parsedErrors = JSON.parse(errorString.replace(/'/g, '"'));
        } catch (parseError) {
            console.log("JSON Parse Error:", parseError);
            parsedErrors = [errorString];
        }
    } else if (Array.isArray(errorString)) {
    parsedErrors = errorString;
    } else {
    parsedErrors = ["An unknown error occurred."];
    }

    return parsedErrors
}