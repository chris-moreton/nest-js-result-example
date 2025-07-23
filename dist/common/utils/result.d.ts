export type Result<T, E = Error> = Success<T> | Failure<E>;
export interface Success<T> {
    success: true;
    value: T;
}
export interface Failure<E = Error> {
    success: false;
    error: E;
}
export declare const Result: {
    success: <T>(value: T) => Success<T>;
    failure: <E = Error>(error: E) => Failure<E>;
    isSuccess: <T, E>(result: Result<T, E>) => result is Success<T>;
    isFailure: <T, E>(result: Result<T, E>) => result is Failure<E>;
    map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U) => Result<U, E>;
    mapError: <T, E, F>(result: Result<T, E>, fn: (error: E) => F) => Result<T, F>;
    flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>) => Result<U, E>;
    unwrap: <T, E>(result: Result<T, E>) => T;
    unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T) => T;
    fromPromise: <T, E = Error>(promise: Promise<T>, mapError?: (error: unknown) => E) => Promise<Result<T, E>>;
    all: <T, E>(results: Result<T, E>[]) => Result<T[], E>;
};
