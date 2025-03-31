/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Organism Component Mocks with Quantum Precision
 *
 * This file implements neural-safe mocks for organism-level components
 * with clinical accuracy for comprehensive test coverage.
 */

import React from "react";
import { vi } from "vitest";

// Neural-safe type definitions with quantum precision
interface NeuralControlPanelProps {
  patientId: string;
  activeRegions?: string[];
  onRegionSelect?: (regionId: string) => void;
  onRenderModeChange?: (mode: string) => void;
  onTimeScaleChange?: (scale: string) => void;
  onDetailLevelChange?: (level: string) => void;
  disabled?: boolean;
}

interface ClinicalMetricsPanelProps {
  patientId: string;
  metrics?: {
    symptomSeverity?: number;
    treatmentEfficacy?: number;
    predictionConfidence?: number;
    riskLevel?: number;
  };
  showSymptoms?: boolean;
  showTreatments?: boolean;
  showPredictions?: boolean;
  showRisks?: boolean;
}

interface BiometricMonitorPanelProps {
  patientId: string;
  data?: {
    heartRate?: number;
    sleepQuality?: number;
    cortisol?: number;
    activity?: number;
  };
  showAlerts?: boolean;
  onAlertAcknowledge?: (alertId: string) => void;
}

// Neural-safe mock implementations with clinical precision
export const mockNeuralControlPanel = vi
  .fn()
  .mockImplementation(
    ({
      patientId,
      activeRegions = [],
      onRegionSelect,
      onRenderModeChange,
      onTimeScaleChange,
      onDetailLevelChange,
      disabled = false,
    }: NeuralControlPanelProps) => {
      // Return JSX-compatible mock for direct rendering
      return React.createElement(
        "div",
        {
          "data-testid": "neural-control-panel",
          style: { width: "100%", padding: "1rem" },
        },
        "Neural Control Panel",
        React.createElement(
          "div",
          {
            "data-testid": "region-selection",
            onClick: () => {
              if (!disabled && onRegionSelect) {
                onRegionSelect("prefrontal-cortex");
              }
            },
          },
          "Region Selection",
        ),
      );
    },
  );

export const mockClinicalMetricsPanel = vi
  .fn()
  .mockImplementation(
    ({
      patientId,
      metrics = {},
      showSymptoms = true,
      showTreatments = true,
      showPredictions = true,
      showRisks = true,
    }: ClinicalMetricsPanelProps) => {
      // Return JSX-compatible mock for direct rendering
      return React.createElement(
        "div",
        {
          "data-testid": "clinical-metrics-panel",
          style: { width: "100%", padding: "1rem" },
        },
        "Clinical Metrics",
        showSymptoms &&
          React.createElement(
            "div",
            { "data-testid": "symptom-metrics" },
            "Symptom Metrics",
          ),
        showTreatments &&
          React.createElement(
            "div",
            { "data-testid": "treatment-metrics" },
            "Treatment Metrics",
          ),
        showPredictions &&
          React.createElement(
            "div",
            { "data-testid": "prediction-metrics" },
            "Prediction Metrics",
          ),
        showRisks &&
          React.createElement(
            "div",
            { "data-testid": "risk-metrics" },
            "Risk Metrics",
          ),
      );
    },
  );

export const mockBiometricMonitorPanel = vi
  .fn()
  .mockImplementation(
    ({
      patientId,
      data = {},
      showAlerts = true,
      onAlertAcknowledge,
    }: BiometricMonitorPanelProps) => {
      // Return JSX-compatible mock for direct rendering
      return React.createElement(
        "div",
        {
          "data-testid": "biometric-monitor-panel",
          style: { width: "100%", padding: "1rem" },
        },
        "Biometric Monitor",
        showAlerts &&
          React.createElement(
            "div",
            {
              "data-testid": "alert-panel",
              onClick: () =>
                onAlertAcknowledge && onAlertAcknowledge("alert-1"),
            },
            "Active Alerts",
          ),
      );
    },
  );

// Register mocks in module system with quantum precision
export function registerNeuralOrganismMocks(): void {
  // Neural control panel mock
  vi.mock("../../presentation/organisms/NeuralControlPanel", () => ({
    __esModule: true,
    default: mockNeuralControlPanel,
  }));

  // Clinical metrics panel mock
  vi.mock("../../presentation/organisms/ClinicalMetricsPanel", () => ({
    __esModule: true,
    default: mockClinicalMetricsPanel,
  }));

  // Biometric monitor panel mock
  vi.mock("../../presentation/organisms/BiometricMonitorPanel", () => ({
    __esModule: true,
    default: mockBiometricMonitorPanel,
  }));
}
