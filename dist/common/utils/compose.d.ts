export type UnaryFunction<T, R> = (arg: T) => R;
export declare function compose<T>(): UnaryFunction<T, T>;
export declare function compose<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
export declare function compose<T, A, B>(fn1: UnaryFunction<B, A>, fn2: UnaryFunction<T, B>): UnaryFunction<T, A>;
export declare function compose<T, A, B, C>(fn1: UnaryFunction<C, A>, fn2: UnaryFunction<B, C>, fn3: UnaryFunction<T, B>): UnaryFunction<T, A>;
export declare function compose<T, A, B, C, D>(fn1: UnaryFunction<D, A>, fn2: UnaryFunction<C, D>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<T, B>): UnaryFunction<T, A>;
export declare function compose<T, A, B, C, D, E>(fn1: UnaryFunction<E, A>, fn2: UnaryFunction<D, E>, fn3: UnaryFunction<C, D>, fn4: UnaryFunction<B, C>, fn5: UnaryFunction<T, B>): UnaryFunction<T, A>;
export declare function pipe<T>(): UnaryFunction<T, T>;
export declare function pipe<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
export declare function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
export declare function pipe<T, A, B, C>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
export declare function pipe<T, A, B, C, D>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>): UnaryFunction<T, D>;
export declare function pipe<T, A, B, C, D, E>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>, fn5: UnaryFunction<D, E>): UnaryFunction<T, E>;
