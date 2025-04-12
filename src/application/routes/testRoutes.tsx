/* eslint-disable */
/**
 * NOVAMIND Neural Digital Twin
 * Test Routes Configuration
 * 
 * This module provides dedicated routes for testing components
 * with mathematical precision and architectural elegance.
 */

import React from 'react';
import { Route } from 'react-router-dom';
import BrainVisualization from '@presentation/organisms/BrainVisualization';
import NeuralControlPanel from '@presentation/organisms/NeuralControlPanel';
import BrainModelContainer from '@presentation/organisms/BrainModelContainer';

// Sample test data
const testData = {
  brainModel: {
    id: 'DEMO_SCAN_001',
    patientId: 'DEMO_PATIENT',
    regions: [
      {
        id: 'prefrontal',
        name: 'Prefrontal Cortex',
        position: { x: 0, y: 2, z: 0 },
        color: '#ff0000',
        connections: ['pfc-amy', 'pfc-hip'],
        activityLevel: 0.75,
        isActive: true,
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        volume: 100,
      },
      {
        id: 'amygdala',
        name: 'Amygdala',
        position: { x: -0.5, y: 0, z: 0 },
        color: '#00ff00',
        connections: ['pfc-amy', 'amy-hip'],
        activityLevel: 0.9,
        isActive: true,
        hemisphereLocation: 'left',
        dataConfidence: 0.9,
        volume: 50,
      },
      {
        id: 'hippocampus',
        name: 'Hippocampus',
        position: { x: 0.5, y: 0, z: 0 },
        color: '#0000ff',
        connections: ['pfc-hip', 'amy-hip'],
        activityLevel: 0.6,
        isActive: true,
        hemisphereLocation: 'right',
        dataConfidence: 0.9,
        volume: 75,
      },
    ],
    connections: [
      {
        id: 'pfc-amy',
        sourceId: 'prefrontal',
        targetId: 'amygdala',
        strength: 0.8,
        type: 'excitatory',
        directionality: 'unidirectional',
        dataConfidence: 0.85,
      },
      {
        id: 'pfc-hip',
        sourceId: 'prefrontal',
        targetId: 'hippocampus',
        strength: 0.7,
        type: 'excitatory',
        directionality: 'unidirectional',
        dataConfidence: 0.85,
      },
      {
        id: 'amy-hip',
        sourceId: 'amygdala',
        targetId: 'hippocampus',
        strength: 0.9,
        type: 'inhibitory',
        directionality: 'bidirectional',
        dataConfidence: 0.85,
      },
    ],
    timestamp: new Date().toISOString(),
    processingLevel: 'analyzed',
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    scan: {
      id: 'SCAN_123',
      patientId: 'DEMO_PATIENT',
      scanDate: new Date().toISOString(),
      scanType: 'fMRI',
      resolution: { x: 1, y: 1, z: 1 },
      metadata: { acquisitionTime: 300, sequence: 'EPI' },
      dataQualityScore: 0.95,
    },
  }
};

/**
 * Brain Visualization Test Page
 */
const BrainVisualizationTestPage = () => (
  <div className="min-h-screen bg-black flex flex-col justify-center items-center">
    <h1 className="text-white text-2xl mb-4">Brain Visualization Test</h1>
    <div className="w-full max-w-5xl aspect-[16/9] bg-gray-900 rounded-lg overflow-hidden">
      <BrainVisualization brainModel={testData.brainModel} />
    </div>
  </div>
);

/**
 * Neural Control Panel Test Page
 */
const NeuralControlPanelTestPage = () => (
  <div className="min-h-screen bg-gray-900 p-8">
    <h1 className="text-white text-2xl mb-6">Neural Control Panel Test</h1>
    <div className="border border-gray-700 rounded-lg p-4 bg-black/50 backdrop-blur-sm">
      <NeuralControlPanel
        patientId="DEMO_PATIENT_001"
        brainModelId="DEMO_SCAN_001"
        onSettingsChange={(settings) => console.log('Settings changed:', settings)}
      />
    </div>
  </div>
);

/**
 * Brain Model Container Test Page
 */
const BrainModelContainerTestPage = () => (
  <div className="min-h-screen bg-gray-900 p-4">
    <h1 className="text-white text-2xl mb-6">Brain Model Container Test</h1>
    <div className="h-[80vh] border border-gray-700 rounded-lg overflow-hidden">
      <BrainModelContainer
        modelId="DEMO_SCAN_001"
        patientId="DEMO_PATIENT_001"
      />
    </div>
  </div>
);

/**
 * Test Routes Component
 * Route definitions for test pages
 */
export const TestRoutes = () => (
  <>
    <Route path="/brain-visualization/demo" element={<BrainVisualizationTestPage />} />
    <Route path="/test/neural-control-panel" element={<NeuralControlPanelTestPage />} />
    <Route path="/brain-model-container/demo" element={<BrainModelContainerTestPage />} />
  </>
);