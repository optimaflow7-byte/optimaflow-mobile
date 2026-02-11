import { useThemeContext } from "@/lib/theme-provider";

export function useColorScheme() {
  const { colorScheme, setColorScheme } = useThemeContext();
  return {
    colorScheme,
    setColorScheme,
    toggleColorScheme: () => setColorScheme(colorScheme === "dark" ? "light" : "dark"),
  };
}
