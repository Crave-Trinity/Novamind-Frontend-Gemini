/**
 * NOVAMIND Testing Framework
 * LoadingIndicator Component Test
 *
 * This file tests the core functionality of the LoadingIndicator component
 * using a TypeScript-only approach with proper type safety.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingIndicator from "@/components/atoms/LoadingIndicator";

// Import the actual component props interface to ensure type safety
interface LoadingIndicatorProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  color?: "primary" | "secondary" | "white";
}

describe("LoadingIndicator", () => {
  it("renders with default props", () => {
    render(<LoadingIndicator data-testid="loading-indicator" />);

    // Check that the component renders
    const loadingElement = screen.getByRole("status");
    expect(loadingElement).toBeInTheDocument();
  });

  it("renders with custom size and color", () => {
    // Define custom props with proper TypeScript types
    const customProps: LoadingIndicatorProps = {
      size: "lg",
      color: "secondary",
    };

    render(<LoadingIndicator {...customProps} />);

    const loadingElement = screen.getByRole("status");
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveClass("w-12");
    expect(loadingElement).toHaveClass("h-12");
    expect(loadingElement).toHaveClass("border-gray-300");
  });

  it("renders with custom text", () => {
    // Define custom props with proper TypeScript types
    const customProps: LoadingIndicatorProps = {
      text: "Processing neural data...",
    };

    render(<LoadingIndicator {...customProps} />);

    const textElement = screen.getByText("Processing neural data...");
    expect(textElement).toBeInTheDocument();
  });

  it("renders as fullscreen overlay when specified", () => {
    // Define custom props with proper TypeScript types
    const customProps: LoadingIndicatorProps = {
      fullScreen: true,
      text: "Loading brain model...",
    };

    render(<LoadingIndicator {...customProps} />);

    // Check for fullscreen overlay
    const overlayElement = screen.getByText(
      "Loading brain model...",
    ).parentElement;
    expect(overlayElement).toHaveClass("fixed");
    expect(overlayElement).toHaveClass("inset-0");
    expect(overlayElement).toHaveClass("z-50");
  });
});
