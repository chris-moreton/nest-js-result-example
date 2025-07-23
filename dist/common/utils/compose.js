"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = compose;
exports.pipe = pipe;
function compose(...fns) {
    if (fns.length === 0) {
        return (arg) => arg;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return fns.reduce((a, b) => (...args) => a(b(...args)));
}
function pipe(...fns) {
    if (fns.length === 0) {
        return (arg) => arg;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return fns.reduce((a, b) => (...args) => b(a(...args)));
}
//# sourceMappingURL=compose.js.map