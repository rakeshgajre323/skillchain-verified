import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^[\d\s\-\+\(\)]{10,20}$/, "Please enter a valid phone number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one symbol");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const studentSignupSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  apparId: z.string().optional(),
});

export const instituteSignupSchema = z.object({
  instituteName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
});

export const companySignupSchema = z.object({
  companyName: nameSchema,
  officialEmail: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const issueCredentialSchema = z.object({
  // Certificate
  title: z.string().trim().min(1, "Title is required").max(200),
  credential_type: z.string().trim().min(1, "Type is required").max(50),
  issued_date: z.string().min(1, "Issued date is required"),
  expiry_date: z.string().optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  // Student identity (all 4 mandatory)
  student_full_name: z.string().trim().min(1, "Student full name is required").max(100),
  student_appar_id: z.string().trim().min(1, "APPAR ID is required").max(50),
  student_phone: phoneSchema,
  student_roll_number: z.string().trim().min(1, "Roll number is required").max(50),
  student_email: emailSchema,
});

export type IssueCredentialData = z.infer<typeof issueCredentialSchema>;
export type StudentSignupData = z.infer<typeof studentSignupSchema>;
export type InstituteSignupData = z.infer<typeof instituteSignupSchema>;
export type CompanySignupData = z.infer<typeof companySignupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type OtpData = z.infer<typeof otpSchema>;
