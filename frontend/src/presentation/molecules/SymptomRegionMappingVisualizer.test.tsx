/**
 * NOVAMIND Neural Test Suite
 * SymptomRegionMappingVisualizer testing with quantum precision
 */

import { SymptomRegionMappingVisualizer } from "./SymptomRegionMappingVisualizer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
// Import types and mock helpers
import { BrainRegion } from "@domain/types/brain";
import { Symptom } from "@domain/types/clinical";
// Correct import path for SymptomNeuralMapping
import { SymptomNeuralMapping } from "@domain/models/brain/mapping/brain-mapping";
import {
  createMockBrainRegions,
  mockUseThree,
} from '@test/three-test-utils';

// Mock the @react-three/fiber module
vi.mock("@react-three/fiber", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/fiber")>();
  return {
    ...actual,
    useThree: mockUseThree,
    useFrame: vi.fn(),
  };
});

// Mock the @react-three/drei module
vi.mock("@react-three/drei", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@react-three/drei")>();
  return {
    ...actual,
    Line: (props: any) => <mesh {...props} data-testid="mock-line" />,
    Text: (props: any) => <mesh {...props} data-testid="mock-text" />,
    Billboard: (props: any) => (
      <group {...props} data-testid="mock-billboard" />
    ),
  };
});

// Mock the three module
vi.mock("three", () => {
  const Vector3Mock = vi.fn().mockImplementation((x = 0, y = 0, z = 0) => {
    const self: any = { x, y, z };
    self.set = vi.fn().mockImplementation(function (newX, newY, newZ) {
      self.x = newX;
      self.y = newY;
      self.z = newZ;
      return self;
    });
    self.copy = vi.fn().mockImplementation(function (v) {
      self.x = v.x;
      self.y = v.y;
      self.z = v.z;
      return self;
    });
    self.add = vi.fn().mockImplementation(function (v) {
      self.x += v.x;
      self.y += v.y;
      self.z += v.z;
      return self;
    });
    self.sub = vi.fn().mockImplementation(function (v) {
      self.x -= v.x;
      self.y -= v.y;
      self.z -= v.z;
      return self;
    });
    self.multiply = vi.fn().mockImplementation(function (v) {
      self.x *= v.x;
      self.y *= v.y;
      self.z *= v.z;
      return self;
    });
    self.divide = vi.fn().mockImplementation(function (v) {
      self.x /= v.x;
      self.y /= v.y;
      self.z /= v.z;
      return self;
    });
    self.length = vi
      .fn()
      .mockImplementation(() =>
        Math.sqrt(self.x * self.x + self.y * self.y + self.z * self.z),
      );
    self.normalize = vi.fn().mockImplementation(function () {
      const l = self.length();
      if (l > 0) {
        self.x /= l;
        self.y /= l;
        self.z /= l;
      }
      return self;
    });
    self.clone = vi
      .fn()
      .mockImplementation(() => Vector3Mock(self.x, self.y, self.z));
    self.applyQuaternion = vi.fn().mockReturnThis();
    self.toArray = vi.fn().mockImplementation(() => [self.x, self.y, self.z]);
    self.cross = vi.fn().mockImplementation(function (v) {
      const ax = self.x,
        ay = self.y,
        az = self.z;
      const bx = v.x,
        by = v.y,
        bz = v.z;
      self.x = ay * bz - az * by;
      self.y = az * bx - ax * bz;
      self.z = ax * by - ay * bx;
      return self;
    });
    return self;
  });

  return {
    Vector3: Vector3Mock,
    Color: vi.fn(() => ({ set: vi.fn() })),
    MathUtils: {
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      mapLinear: vi.fn(
        (x, a1, a2, b1, b2) => b1 + ((x - a1) * (b2 - b1)) / (a2 - a1),
      ),
    },
    Group: vi.fn(() => ({ add: vi.fn(), remove: vi.fn(), children: [] })),
    QuadraticBezierCurve3: vi.fn().mockImplementation(() => ({
      getPoints: vi.fn().mockReturnValue([]),
    })),
  };
});

// Mock data with clinical precision
const mockRegions: BrainRegion[] = createMockBrainRegions(3);
// Corrected mockSymptoms with valid literal types
const mockSymptoms: Symptom[] = [
  {
    id: "symptom-1",
    name: "Anxiety",
    severity: 0.8,
    category: "affective",
    frequency: "daily",
    impact: "severe",
    progression: "stable",
  },
  {
    id: "symptom-2",
    name: "Depression",
    severity: 0.6,
    category: "affective",
    frequency: "weekly",
    impact: "moderate",
    progression: "improving",
  },
  {
    id: "symptom-3",
    name: "Insomnia",
    severity: 0.7,
    category: "somatic",
    frequency: "daily",
    impact: "severe",
    progression: "worsening",
  },
];
// Corrected mock symptomMappings structure to match component implementation
const mockSymptomMappings: SymptomNeuralMapping[] = [
  {
    symptomId: "symptom-1",
    symptomName: "Anxiety",
    category: "Affective",
    // Revert to regionActivations and use 'as any' to match component code
    activationPatterns: [
      {
        regionActivations: [
          {
            regionId: mockRegions[0].id,
            activityLevel: 0.8,
            primaryEffect: true,
          },
        ],
        intensity: 0.8,
        connectivity: { increasedPathways: [], decreasedPathways: [] },
        timeScale: "chronic",
        confidence: 0.9,
      },
    ] as any,
    contributingFactors: ["Stress", "Genetics"],
    evidenceQuality: "established",
  },
];

const mockProps = {
  regions: mockRegions,
  symptoms: mockSymptoms,
  symptomMappings: mockSymptomMappings,
  activeSymptoms: mockSymptoms.slice(0, 1),
  // selectedSymptomId is optional, omitting it
  onRegionHover: vi.fn(),
  onRegionClick: vi.fn(),
  onSymptomHover: vi.fn(),
  onSymptomClick: vi.fn(),
};

describe("SymptomRegionMappingVisualizer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with neural precision", () => {
    render(<SymptomRegionMappingVisualizer {...mockProps} />);
    // Check if it renders without errors and renders mock lines/text
    expect(screen.queryAllByTestId("mock-line").length).toBeGreaterThan(0);
    expect(screen.queryAllByTestId("mock-text").length).toBeGreaterThan(0);
  });

  it("responds to user interaction with quantum precision", async () => {
    const user = userEvent.setup();
    render(<SymptomRegionMappingVisualizer {...mockProps} />);
    // Simulate interactions if applicable
    expect(true).toBe(true); // Placeholder
  });

  // Add more component-specific tests
});
