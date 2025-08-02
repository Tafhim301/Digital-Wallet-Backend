"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    var _a;
    const matchedArray = (_a = err.message) === null || _a === void 0 ? void 0 : _a.match(/"([^"]*)"/);
    const fallbackValue = err.keyValue && Object.values(err.keyValue).length > 0
        ? Object.values(err.keyValue)[0]
        : "duplicate value";
    const duplicateValue = (matchedArray === null || matchedArray === void 0 ? void 0 : matchedArray[1]) || fallbackValue;
    return {
        message: `${duplicateValue} already exists`,
        statusCode: 400,
    };
};
exports.handleDuplicateError = handleDuplicateError;
