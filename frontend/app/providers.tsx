"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { ToastProvider } from "./components/ToastProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CacheProvider>
            <ChakraProvider>
                <ToastProvider>{children}</ToastProvider>
            </ChakraProvider>
        </CacheProvider>
    );
}
