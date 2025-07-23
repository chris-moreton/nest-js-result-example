export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure<E = Error> {
  success: false;
  error: E;
}

export const Result = {
  success: <T>(value: T): Success<T> => ({
    success: true,
    value,
  }),

  failure: <E = Error>(error: E): Failure<E> => ({
    success: false,
    error,
  }),

  isSuccess: <T, E>(result: Result<T, E>): result is Success<T> =>
    result.success === true,

  isFailure: <T, E>(result: Result<T, E>): result is Failure<E> =>
    result.success === false,

  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (result.success) {
      return Result.success(fn(result.value));
    }
    return result as Result<U, E>;
  },

  mapError: <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F,
  ): Result<T, F> => {
    if (!result.success) {
      return Result.failure(fn((result as Failure<E>).error));
    }
    return result as Result<T, F>;
  },

  flatMap: <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> => {
    if (result.success) {
      return fn(result.value);
    }
    return result as Result<U, E>;
  },

  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.success) {
      return result.value;
    }
    throw (result as Failure<E>).error;
  },

  unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    if (result.success) {
      return result.value;
    }
    return defaultValue;
  },

  fromPromise: async <T, E = Error>(
    promise: Promise<T>,
    mapError?: (error: unknown) => E,
  ): Promise<Result<T, E>> => {
    try {
      const value = await promise;
      return Result.success(value);
    } catch (error) {
      const mappedError = mapError ? mapError(error) : (error as E);
      return Result.failure(mappedError);
    }
  },

  all: <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const values: T[] = [];
    for (const result of results) {
      if (!result.success) {
        return result as Result<T[], E>;
      }
      values.push(result.value);
    }
    return Result.success(values);
  },
};
