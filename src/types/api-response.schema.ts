import { z } from 'zod/v4';

/**
 * Generic success response wrapper
 * Format: { success: true, data: T }
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema
  });

/**
 * Generic error response
 * Format: { success: false, error: string }
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string()
});

/**
 * Validation error response with details
 * Format: { success: false, error: string, details: any[] }
 */
export const validationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.array(z.any()).optional()
});

/**
 * Success message response (for operations like delete)
 * Format: { success: true, message: string }
 */
export const successMessageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string()
});

/**
 * Not found error response
 * Format: { success: false, error: string }
 */
export const notFoundResponseSchema = z.object({
  success: z.literal(false),
  error: z.string()
});

/**
 * Response type inferences from schemas
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ValidationErrorResponse = z.infer<typeof validationErrorResponseSchema>;
export type NotFoundResponse = z.infer<typeof notFoundResponseSchema>;
export type SuccessMessageResponse = z.infer<typeof successMessageResponseSchema>;

/**
 * Helper functions to construct responses that match the schemas
 */
export const createErrorResponse = (error: string): ErrorResponse => ({
  success: false,
  error
});

export const createValidationErrorResponse = (
  error: string,
  details?: any[]
): ValidationErrorResponse => ({
  success: false,
  error,
  details
});

export const createNotFoundResponse = (error: string = 'Not found'): NotFoundResponse => ({
  success: false,
  error
});

export const createSuccessDataResponse = <T>(data: T) => ({
  success: true as const,
  data
});

export const createSuccessMessageResponse = (message: string): SuccessMessageResponse => ({
  success: true,
  message
});
