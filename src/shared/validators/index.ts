import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  parentId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  icon: z.string().max(50, 'Icon name too long').optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const fileUploadSchema = z.object({
  file: z.instanceof(File),
}).refine((data) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return allowedTypes.includes(data.file.type);
}, {
  message: 'Unsupported file type',
}).refine((data) => data.file.size <= 10 * 1024 * 1024, {
  message: 'File size must be less than 10MB',
});

export const bulkCategorizationSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1, 'At least one document required'),
  confidenceThreshold: z.number().min(0).max(100).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type CategoryCreateFormData = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateFormData = z.infer<typeof categoryUpdateSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type BulkCategorizationFormData = z.infer<typeof bulkCategorizationSchema>;