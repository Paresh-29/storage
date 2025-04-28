import * as z from "zod";

export const signupSchema = z
    .object({
        email: z
            .string()
            .email({ message: "Invalid email address" })
            .min(1, { message: "Email is required" }),
        password: z
            .string()
            .min(1, { message: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters long" }),
        confirmPassword: z
            .string()
            .min(1, { message: "Confirm password is required" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });
