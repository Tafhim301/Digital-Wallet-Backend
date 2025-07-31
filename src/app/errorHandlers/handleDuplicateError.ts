/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const matchedArray = err.message?.match(/"([^"]*)"/);
  const fallbackValue =
    err.keyValue && Object.values(err.keyValue).length > 0
      ? Object.values(err.keyValue)[0]
      : "duplicate value";

  const duplicateValue = matchedArray?.[1] || fallbackValue;

  return {
    message: `${duplicateValue} already exists`,
    statusCode: 400,
  };
};
