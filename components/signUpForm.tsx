"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

import { signupSchema } from "@/schemas/signupSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const router = useRouter();

  const [verifying, setVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [verificationCode, setVerificationCode] = useState("");
  const { signUp, isLoaded, setActive } = useSignUp();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    if (!isLoaded) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (error: any) {
      console.error("Error during sign up:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An unknown error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!isLoaded && !signUp) {
      return;
    }
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      console.log("Verification result:", result);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Verification failed:", result);
        setVerificationError(
          "Verification failed. Please check your code and try again.",
        );
      }
    } catch (error: any) {
      console.error("Error during verification:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An unknown error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-1 pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify your email address
          </h1>
          <p className="text-default-500 text-center">
            We have sent a verification code to your email address. Please enter
            the code below to verify your email address.
          </p>
        </CardHeader>
        <Divider />

        <CardBody className="py-6">
          {verificationError && (
            <div className="flex items-center gap-2 bg-orange-50 text-danger-700 p-4 rounded-lg mb-6">
              <AlertCircle className="h-5 w-5 flex-shrink-0">
                <p>{verificationError}</p>
              </AlertCircle>
            </div>
          )}
          <form onSubmit={handleVerificationSubmit} className="spac-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                placeholder="Enter your verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              color="primary"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend verification code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col items-center gap-1 pb-2">
        <h1 className="text-2xl font-bold text-default-900">
          Create an account
        </h1>
        <p className="text-default-500 text-center">
          Create an account to access all features of our application.
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6">
            <AlertCircle className="h-6 w-6 flex-shrink-0 " />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="........"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-default-900"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="........"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              {...register("confirmPassword")}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Creare Account"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-6">
        <p className="text-sm text-default-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
