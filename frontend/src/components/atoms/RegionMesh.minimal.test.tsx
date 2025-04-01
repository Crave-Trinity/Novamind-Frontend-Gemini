/**
 * NOVAMIND Testing Framework
 * RegionMesh Component Test
 *
 * This file tests the core functionality of the RegionMesh component
 * using a TypeScript-only approach with proper type safety.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Canvas } from "@react-three/fiber";
import RegionMesh from "@/components/atoms/RegionMesh";
import { BrainRegion } from "@/types/brain";

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
  Sphere: ({
    children,
    position,
    args,
    onClick,
    onPointerOver,
    onPointerOut,
  }: any) => (
    <div
      data-testid="mock-sphere"
      data-position={JSON.stringify(position)}
      data-args={JSON.stringify(args)}
      onClick={onClick}
      onMouseEnter={onPointerOver}
      onMouseLeave={onPointerOut}
    >
      {children}
    </div>
  ),
  MeshDistortMaterial: ({
    color,
    emissive,
    emissiveIntensity,
    distort,
    speed,
    opacity,
  }: any) => (
    <div
      data-testid="mock-material"
      data-color={color}
      data-emissive={emissive}
      data-emissive-intensity={emissiveIntensity}
      data-distort={distort}
      data-speed={speed}
      data-opacity={opacity}
    />
  ),
}));

vi.mock("@react-spring/three", () => ({
  useSpring: vi.fn(() => ({
    scale: { to: (fn: Function) => fn(1), get: () => 1 },
    emissiveIntensity: { get: () => 0.5 },
  })),
  animated: {
    group: ({ children, scale }: any) => (
      <div data-testid="mock-animated-group" data-scale={scale}>
        {children}
      </div>
    ),
  },
}));

// Test wrapper to provide Three.js context
const renderWithCanvas = (ui: React.ReactElement) => {
  return render(<Canvas>{ui}</Canvas>);
};

describe("RegionMesh", () => {
  // Mock region data
  const mockRegion: BrainRegion = {
    id: "region-1",
    name: "Prefrontal Cortex",
    position: [0, 0, 0],
    scale: 1.5,
    isActive: true,
    metrics: { activity: 0.8, connectivity: 0.5, volume: 1500 }, // Corrected structure
    color: "#4dabf7",
    type: "cortical", // Added missing 'type' property
  };

  const defaultProps = {
    region: mockRegion,
    glowIntensity: 0.5,
    onClick: vi.fn(),
    pulse: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with neural precision", () => {
    const { getByTestId } = renderWithCanvas(<RegionMesh {...defaultProps} />);

    const sphereElement = getByTestId("mock-sphere");
    const materialElement = getByTestId("mock-material");

    expect(sphereElement).toBeInTheDocument();
    expect(materialElement).toBeInTheDocument();

    // Check position and scale
    expect(
      JSON.parse(sphereElement.getAttribute("data-position") || "[]"),
    ).toEqual([0, 0, 0]);
    expect(
      JSON.parse(sphereElement.getAttribute("data-args") || "[]")[0],
    ).toEqual(1.5);

    // Check material properties
    expect(materialElement.getAttribute("data-color")).toBe("#4dabf7");
    expect(materialElement.getAttribute("data-emissive")).toBe("#4dabf7");
  });

  it("responds to user interaction with quantum precision", () => {
    const { getByTestId } = renderWithCanvas(<RegionMesh {...defaultProps} />);

    const sphereElement = getByTestId("mock-sphere");

    // Simulate click
    sphereElement.click();

    // Verify the onClick handler was called with the region ID
    expect(defaultProps.onClick).toHaveBeenCalledWith("region-1");
  });

  it("renders inactive regions with reduced glow", () => {
    const inactiveRegion = {
      ...defaultProps,
      region: {
        ...mockRegion,
        isActive: false,
        color: "#aaaaaa",
      },
    };

    const { getByTestId } = renderWithCanvas(
      <RegionMesh {...inactiveRegion} />,
    );

    const materialElement = getByTestId("mock-material");

    // Check material properties for inactive region
    expect(materialElement.getAttribute("data-color")).toBe("#aaaaaa");
    expect(materialElement.getAttribute("data-emissive")).toBe("#aaaaaa");
    expect(materialElement.getAttribute("data-distort")).toBe("0.1");
  });

  it("renders without pulse animation when disabled", () => {
    const noPulseProps = {
      ...defaultProps,
      pulse: false,
    };

    const { getByTestId } = renderWithCanvas(<RegionMesh {...noPulseProps} />);

    // Just verify it renders without errors when pulse is disabled
    const sphereElement = getByTestId("mock-sphere");
    expect(sphereElement).toBeInTheDocument();
  });
});
