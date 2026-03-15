import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DEFAULT_ERROR_MESSAGE } from '../constants';

type HandleControllerExceptionOptionsType<T = never> = {
  error: unknown;
  logger: Logger;
  context: string;
  customErrorMessage?: string;
  defaultValue?: T;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Handles error responses in controller methods with consistent logging and error transformation
 * @param options.error - The error that occurred
 * @param options.logger - Logger instance for logging errors
 * @param options.context - Context description for logging (e.g., "register", "login")
 * @param options.customErrorMessage - Optional custom error message instead of throwing
 * @param options.defaultValue - Optional default value to return instead of throwing error 500
 * @throws InternalServerErrorException (customErrorMessage or DEFAULT_ERROR_MESSAGE)
 * @returns defaultValue if provided and no customErrorMessage, never otherwise
 */
export function handleControllerException(
  options: HandleControllerExceptionOptionsType<never>,
): never;
export function handleControllerException<T>(
  options: HandleControllerExceptionOptionsType<T> & { defaultValue: T },
): T;
export function handleControllerException<T>(
  options: HandleControllerExceptionOptionsType<T>,
): T {
  const { error, logger, context, customErrorMessage } = options;

  logger.error(`[${context}] ${getErrorMessage(error)}`, context);

  // Re-throw HttpException as-is (already has proper status and message)
  if (error instanceof HttpException) {
    throw error;
  }

  // Return defaultValue if explicitly provided
  if (Object.prototype.hasOwnProperty.call(options, 'defaultValue')) {
    return options.defaultValue as T;
  }

  // Throw generic internal server error for unexpected errors
  throw new InternalServerErrorException(
    customErrorMessage || DEFAULT_ERROR_MESSAGE,
  );
}
