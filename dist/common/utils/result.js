"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
exports.Result = {
    success: (value) => ({
        success: true,
        value,
    }),
    failure: (error) => ({
        success: false,
        error,
    }),
    isSuccess: (result) => result.success === true,
    isFailure: (result) => result.success === false,
    map: (result, fn) => {
        if (result.success) {
            return exports.Result.success(fn(result.value));
        }
        return result;
    },
    mapError: (result, fn) => {
        if (!result.success) {
            return exports.Result.failure(fn(result.error));
        }
        return result;
    },
    flatMap: (result, fn) => {
        if (result.success) {
            return fn(result.value);
        }
        return result;
    },
    unwrap: (result) => {
        if (result.success) {
            return result.value;
        }
        throw result.error;
    },
    unwrapOr: (result, defaultValue) => {
        if (result.success) {
            return result.value;
        }
        return defaultValue;
    },
    fromPromise: async (promise, mapError) => {
        try {
            const value = await promise;
            return exports.Result.success(value);
        }
        catch (error) {
            const mappedError = mapError ? mapError(error) : error;
            return exports.Result.failure(mappedError);
        }
    },
    all: (results) => {
        const values = [];
        for (const result of results) {
            if (!result.success) {
                return result;
            }
            values.push(result.value);
        }
        return exports.Result.success(values);
    },
};
//# sourceMappingURL=result.js.map