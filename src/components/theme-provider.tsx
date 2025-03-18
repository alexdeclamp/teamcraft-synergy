
"use client";

import { createContext, useContext, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export const ThemeContext = createContext({
  theme: "light",
  setTheme: (_theme: string) => {},
});

export const useTheme = () => useContext(ThemeContext);
