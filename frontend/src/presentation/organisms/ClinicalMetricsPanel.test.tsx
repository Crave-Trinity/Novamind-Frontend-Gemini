/**
 * NOVAMIND Neural Test Suite
 * ClinicalMetricsPanel component testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClinicalMetricsPanel } from "./ClinicalMetricsPanel";

// Mock the dependencies that might be causing import errors
vi.mock("@presentation/atoms/Tabs", () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: any) => (
    <div data-testid={`tab-trigger-${value}`}>{children}</div>
  ),
}));

vi.mock("@presentation/atoms/Button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@presentation/atoms/Tooltip", () => ({
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: any) => (
    <div data-testid="tooltip-provider">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="tooltip-trigger">{children}</div>
  ),
}));

vi.mock("@presentation/atoms/Badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@presentation/atoms/Card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardDescription: ({ children }: any) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardFooter: ({ children }: any) => (
    <div data-testid="card-footer">{children}</div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <div data-testid="card-title">{children}</div>
  ),
}));

vi.mock("@presentation/atoms/ScrollArea", () => ({
  ScrollArea: ({ children }: any) => (
    <div data-testid="scroll-area">{children}</div>
  ),
  ScrollBar: ({ orientation }: any) => (
    <div data-testid={`scroll-bar-${orientation}`}></div>
  ),
}));

vi.mock("@presentation/atoms/Progress", () => ({
  Progress: ({ value }: any) => (
    <div data-testid="progress" data-value={value}></div>
  ),
}));

vi.mock("lucide-react", () => ({
  Brain: () => <div data-testid="icon-brain">Brain Icon</div>,
  Activity: () => <div data-testid="icon-activity">Activity Icon</div>,
  AlertCircle: () => <div data-testid="icon-alert">Alert Icon</div>,
  Clock: () => <div data-testid="icon-clock">Clock Icon</div>,
  TrendingUp: () => <div data-testid="icon-trending-up">Trending Up Icon</div>,
  TrendingDown: () => (
    <div data-testid="icon-trending-down">Trending Down Icon</div>
  ),
  BarChart: () => <div data-testid="icon-bar-chart">Bar Chart Icon</div>,
  Zap: () => <div data-testid="icon-zap">Zap Icon</div>,
  Calendar: () => <div data-testid="icon-calendar">Calendar Icon</div>,
  ChevronRight: () => (
    <div data-testid="icon-chevron-right">Chevron Right Icon</div>
  ),
  Filter: () => <div data-testid="icon-filter">Filter Icon</div>,
  Download: () => <div data-testid="icon-download">Download Icon</div>,
  Pill: () => <div data-testid="icon-pill">Pill Icon</div>,
}));

// Mock data with clinical precision
const mockMetrics = {
  clinicalRiskScore: 72,
  anxietyLevel: "moderate",
  depressionLevel: "mild",
  sleepQuality: "poor",
  medication: {
    adherence: 0.85,
    effectivenessScore: 68,
    currentMedications: [
      { name: "Sertraline", dosage: "100mg", schedule: "Daily morning" },
      { name: "Lorazepam", dosage: "0.5mg", schedule: "As needed" },
    ],
  },
  vitalSigns: {
    heartRate: { value: 82, trend: "stable" },
    bloodPressure: { systolic: 128, diastolic: 82, trend: "elevated" },
    respiratoryRate: { value: 16, trend: "normal" },
    temperature: { value: 98.6, trend: "normal" },
  },
  temporalPatterns: {
    diurnalVariation: "significant",
    cyclicalPatterns: ["weekly mood fluctuations", "monthly hormonal pattern"],
    significantTimepoints: [
      { date: "2025-03-05", event: "Medication change", impact: "positive" },
      { date: "2025-03-15", event: "Stress exposure", impact: "negative" },
    ],
  },
  brainActivity: {
    regions: [
      {
        name: "Amygdala",
        activation: "high",
        clinicalSignificance: "anxiety correlation",
      },
      {
        name: "Prefrontal Cortex",
        activation: "reduced",
        clinicalSignificance: "executive function deficit",
      },
      {
        name: "Hippocampus",
        activation: "normal",
        clinicalSignificance: "memory intact",
      },
    ],
    overallPattern: "dysregulated",
    treatmentResponse: "partial",
  },
};

// Mock the hook calls
const mockSetActiveMetric = vi.fn();
const mockExportData = vi.fn();
const mockToggleTimeframe = vi.fn();

// Mock props
const mockProps = {
  patientId: "patient-123",
  metrics: mockMetrics,
  loading: false,
  error: null,
  onExportData: mockExportData,
  onTimeframeChange: mockToggleTimeframe,
  className: "custom-panel-class",
};

describe("ClinicalMetricsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders metrics cards with clinical precision when data is provided", () => {
    render(<ClinicalMetricsPanel {...mockProps} />);

    // Check for key risk score indicator
    expect(screen.getByText(/Clinical Risk Score/i)).toBeInTheDocument();
    expect(screen.getByTestId("progress")).toHaveAttribute("data-value", "72");

    // Check for vital signs section
    expect(screen.getByText(/Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/82/i)).toBeInTheDocument();

    // Check for brain activity metrics
    expect(screen.getByText(/Brain Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Amygdala/i)).toBeInTheDocument();
  });

  it("displays loading state with quantum precision", () => {
    render(<ClinicalMetricsPanel {...mockProps} loading={true} />);

    // Should show loading indicators
    expect(screen.getAllByTestId("card")).toBeTruthy();
    // Loading state would typically show skeletons or spinners
    // This would need to be adjusted based on actual implementation
  });

  it("applies custom class name with mathematical precision", () => {
    render(<ClinicalMetricsPanel {...mockProps} />);

    // The root element should have the custom class
    const rootElement = screen.getByTestId("clinical-metrics-panel");
    expect(rootElement).toHaveClass("custom-panel-class");
  });

  it("handles error states with clinical precision", () => {
    const errorProps = {
      ...mockProps,
      error: "Failed to load clinical metrics",
      metrics: null,
    };

    render(<ClinicalMetricsPanel {...errorProps} />);

    // Should display error message
    expect(
      screen.getByText(/Failed to load clinical metrics/i),
    ).toBeInTheDocument();
  });

  it("calls export data handler when export button is clicked", async () => {
    const user = userEvent.setup();
    render(<ClinicalMetricsPanel {...mockProps} />);

    // Find and click export button
    const exportButton = screen.getByText(/Export/i);
    await user.click(exportButton);

    // Export handler should be called with patient ID
    expect(mockExportData).toHaveBeenCalledTimes(1);
    expect(mockExportData).toHaveBeenCalledWith("patient-123");
  });

  it("shows medication information with HIPAA-compliant precision", () => {
    render(<ClinicalMetricsPanel {...mockProps} />);

    // Check for medication adherence
    expect(screen.getByText(/Adherence/i)).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toBeInTheDocument();

    // Check for medication names
    expect(screen.getByText(/Sertraline/i)).toBeInTheDocument();
    expect(screen.getByText(/Lorazepam/i)).toBeInTheDocument();
  });

  it("responds to timeframe changes with quantum precision", async () => {
    const user = userEvent.setup();
    render(<ClinicalMetricsPanel {...mockProps} />);

    // Find and click timeframe selector
    const timeframeButton =
      screen.getByText(/7 Days/i) ||
      screen.getByText(/30 Days/i) ||
      screen.getByText(/90 Days/i);
    await user.click(timeframeButton);

    // Timeframe change handler should be called
    expect(mockToggleTimeframe).toHaveBeenCalledTimes(1);
  });
});
