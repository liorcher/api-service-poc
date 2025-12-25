import { z } from 'zod/v4';
import { ObjectId } from 'mongodb';

export const userSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .describe("User's full name"),
  email: z.string().email('Invalid email format').describe("User's email address"),
  age: z
    .number()
    .int('Age must be an integer')
    .positive('Age must be positive')
    .optional()
    .describe("User's age (optional)")
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must not be empty')
    .max(100, 'Name must be less than 100 characters')
    .optional()
    .describe("User's full name"),
  email: z.string().email('Invalid email format').optional().describe("User's email address"),
  age: z
    .number()
    .int('Age must be an integer')
    .positive('Age must be positive')
    .optional()
    .describe("User's age (optional)")
});

export const userIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
    .describe('MongoDB ObjectId (24-character hex string)')
});

/**
 * User response schema for OpenAPI/Swagger documentation.
 * Uses string for _id to properly serialize in JSON responses.
 */
export const userResponseSchema = z.object({
  _id: z.string().describe('MongoDB ObjectId'),
  name: z.string().describe("User's full name"),
  email: z.string().describe("User's email address"),
  age: z.number().optional().describe("User's age"),
  createdAt: z.string().describe('Creation timestamp (ISO 8601)'),
  updatedAt: z.string().describe('Last update timestamp (ISO 8601)')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamSchema>;
