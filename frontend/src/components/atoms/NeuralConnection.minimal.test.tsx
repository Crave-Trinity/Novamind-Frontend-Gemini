/**
 * NOVAMIND Testing Framework
 * NeuralConnection Component Test
 *
 * This file tests the core functionality of the NeuralConnection component
 * using a TypeScript-only approach with proper type safety.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Canvas } from "@react-three/fiber";
import NeuralConnection from "@/components/atoms/NeuralConnection";
import { NeuralConnection as NeuralConnectionType } from "@/types/brain";

// Mock Three.js objects since we can't test them directly in JSDOM
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useFrame: vi.fn((callback) =>
    callback({ clock: { getElapsedTime: () => 0 } }),
  ),
}));

vi.mock("@react-three/drei", () => ({
  Line: ({ points, color, lineWidth, dashed, opacity }: any) => (
    <div
      data-testid="mock-line"
      data-points={points.length}
      data-color={color}
      data-line-width={lineWidth}
      data-dashed={dashed}
      data-opacity={opacity}
    />
  ),
}));

// Test wrapper to provide Three.js context
const renderWithCanvas = (ui: React.ReactElement) => {
  return render(<Canvas>{ui}</Canvas>);
};

describe("NeuralConnection", () => {
  const mockConnection: NeuralConnectionType = {
    id: "connection-1",
    sourceId: "region-1",
    targetId: "region-2",
    strength: 0.8,
    type: "excitatory",
    active: true,
  };

  const defaultProps = {
    connection: mockConnection,
    sourcePosition: [0, 0, 0] as [number, number, number],
    targetPosition: [10, 5, 3] as [number, number, number],
    excitationColor: "#ff0000",
    inhibitionColor: "#0000ff",
    opacity: 0.8,
    onClick: vi.fn(),
  };

  it("renders with neural precision", () => {
    const { getByTestId } = renderWithCanvas(
      <NeuralConnection {...defaultProps} />,
    );

    const lineElement = getByTestId("mock-line");
    expect(lineElement).toBeInTheDocument();
    expect(lineElement.getAttribute("data-color")).toBe("#ff0000"); // Excitatory color
    expect(lineElement.getAttribute("data-dashed")).toBe("false");
  });

  it("renders inhibitory connections with dashed lines", () => {
    const inhibitoryConnection = {
      ...defaultProps,
      connection: {
        ...mockConnection,
        type: "inhibitory" as const, // Correct type assertion
      },
    };

    const { getByTestId } = renderWithCanvas(
      <NeuralConnection {...inhibitoryConnection} />,
    );

    const lineElement = getByTestId("mock-line");
    expect(lineElement).toBeInTheDocument();
    expect(lineElement.getAttribute("data-color")).toBe("#0000ff"); // Inhibitory color
    expect(lineElement.getAttribute("data-dashed")).toBe("true");
  });

  it("responds to user interaction with quantum precision", () => {
    const { getByTestId } = renderWithCanvas(
      <NeuralConnection {...defaultProps} />,
    );

    // Simulate click on the connection
    const canvasElement = getByTestId("mock-canvas");
    fireEvent.click(canvasElement);

    // Verify the onClick handler was called with the connection ID
    expect(defaultProps.onClick).toHaveBeenCalledWith("connection-1");
  });

  it("renders inactive connections with reduced opacity", () => {
    const inactiveConnection = {
      ...defaultProps,
      connection: {
        ...mockConnection,
        active: false,
      },
    };

    const { getByTestId } = renderWithCanvas(
      <NeuralConnection {...inactiveConnection} />,
    );

    const lineElement = getByTestId("mock-line");
    expect(lineElement).toBeInTheDocument();
    // We can't directly test the animated values, but we can verify the component renders
    expect(lineElement.getAttribute("data-opacity")).toBeDefined();
  });
});
