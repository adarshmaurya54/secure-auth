import * as z from "zod";
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long"),
    email: z.email("Invalid email address"),
    password: z.
    string().
    min(8, "Password must be at least 8 characters long"). 
    regex(/[A-Z]/, "Password must contain at least one uppercase letter").
    regex(/[a-z]/, "Password must contain at least one lowercase letter").
    regex(/[0-9]/, "Password must contain at least one number").
    regex(/[@$!%*?&]/, "Password must contain at least one special character"),    
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
     email: z.email("Invalid email address"),
     password: z.string(),
});

export const emailSchema = z.object({
  email: z.email("Invalid email address"),
});

export const passwordSchema = z.object({
  password: z.
    string().
    min(8, "Password must be at least 8 characters long"). 
    regex(/[A-Z]/, "Password must contain at least one uppercase letter").
    regex(/[a-z]/, "Password must contain at least one lowercase letter").
    regex(/[0-9]/, "Password must contain at least one number").
    regex(/[@$!%*?&]/, "Password must contain at least one special character"), 
});

