export function createRouteRegexp(pattern: string) {
    const paramNames: string[] = [];

    const regexpString = pattern.replace(
        /:([^/]+)/g,
        (_, paramName: string) => {
            paramNames.push(paramName);
            return "([^/]+)";
        },
    );

    return {
        regexp: new RegExp(`^${regexpString}$`),
        paramNames,
    };
}
