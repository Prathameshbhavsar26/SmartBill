import { useContext } from "react";
import { CustomizationContext } from "@shared/context/CustomizationContext";

/**
 * Custom hook to consume CustomizationContext across components.
 */
export function useCustomization() {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error(
      "useCustomization must be used within a CustomizationProvider",
    );
  }
  return context;
}



