"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signinSchema } from "@/schemas/signinSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { AlertCircle, Eye, EyeOff, Mail } from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";

export default function SignInForm() {
  const router = useRouter();

  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signinSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign in failed", result);
        setAuthError("Invalid credentials");
      }
    } catch (error: any) {
      console.error("Sign in error", error);
      setAuthError(
        error.errors?.[0]?.message ||
        "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm p-6 border border-default-200 bg-default-50 shadow-md rounded-lg">
      <CardHeader className="flex flex-col items-center gap-2 pb-2">
        <h2 className="text-2xl font-bold text-default-900">Welcome Back!</h2>
        <p className="text-center text-default-500">
          Sign In to access our service
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="identifier"
              className="text-sm font-medium text-default-700"
            >
              Email
            </label>

            <Input
              type="text"
              id="identifier"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-600" />}
              isInvalid={!!errors.identifier}
              errorMessage={errors.identifier?.message}
              {...register("identifier")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-800"
            >
              Password
            </label>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              startContent={<Mail className="h-4 w-4 text-default-600" />}
              endContent={
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-600" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex flex-col items-center gap-2 pt-4">
        <p className="text-sm text-default-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary hover:underline font-medium transition-colors duration-200"
          />
          Sign Up
        </p>
      </CardFooter>
    </Card>
  );
}
