"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ImageKitProvider } from "imagekitio-next";

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

export interface ProvidersProps {
  children: React.ReactNode;
  themeProp?: ThemeProviderProps;
}

export function Providers({ children, themeProp }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ImageKitProvider
        authenticator={authenticator}
        publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
        urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
      >
        <NextThemesProvider {...themeProp}>{children}</NextThemesProvider>
      </ImageKitProvider>
    </HeroUIProvider>
  );
}
