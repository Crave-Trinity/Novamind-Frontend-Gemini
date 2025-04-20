/* eslint-disable */
/**
 * NOVAMIND Neural-Safe Molecular Component
 * BiometricAlertVisualizer - Quantum-level biometric alert visualization
 * with HIPAA-compliant clinical precision and priority management
 */

import React, { useRef, useMemo, useState, useCallback } from 'react'; // Removed unused useEffect
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import * as THREE from 'three'; // Import THREE namespace
import { Vector3 } from 'three';
// @ts-ignore: TS2305 - Module '"@react-three/drei"' has no exported member 'Billboard'/'Html'. (Likely type/config issue)
import { Billboard, Html } from '@react-three/drei'; // Consolidate Drei imports

// Domain types
import type { BrainRegion } from '@domain/types/brain/models';

/**
 * Clinical alert with neural-safe typing
 */
export interface ClinicalAlert {
  id: string;
  timestamp: number;
  message: string;
  // description?: string; // Removed unused property
  sourceMetric: string;
  value: number;
  threshold: number;
  priority: 'urgent' | 'warning' | 'informational';
  category: 'physiological' | 'behavioral' | 'self-reported' | 'environmental' | 'treatment';
  relatedRegionIds?: string[];
  confidenceLevel: number; // 0.0-1.0
  // ruleId?: string; // Removed unused property
  isPatientSpecific: boolean;
  isAcknowledged: boolean;
  expiresAt?: number;
}

/**
 * Props with neural-safe typing
 */
interface BiometricAlertVisualizerProps {
  alerts: ClinicalAlert[];
  regions: BrainRegion[];
  maxVisibleAlerts?: number;
  showAcknowledged?: boolean;
  priorityFilter?: ('urgent' | 'warning' | 'informational')[];
  categoryFilter?: (
    | 'physiological'
    | 'behavioral'
    | 'self-reported'
    | 'environmental'
    | 'treatment'
  )[];
  onAlertClick?: (alertId: string) => void;
  onAlertAcknowledge?: (alertId: string) => void;
  alertPositionMode?: 'region' | 'floating' | 'hybrid';
  floatingPosition?: Vector3;
  themeColors?: {
    urgent: string;
    warning: string;
    informational: string;
    acknowledged: string;
    text: string;
    background: string;
  };
}

/**
 * Priority-based alert ordering and styling
 */
const PRIORITY_CONFIG = {
  urgent: {
    order: 0,
    pulseSpeed: 2.0,
    icon: '⚠️',
    defaultColor: '#ef4444', // Red
  },
  warning: {
    order: 1,
    pulseSpeed: 1.2,
    icon: '⚠',
    defaultColor: '#f97316', // Orange
  },
  informational: {
    order: 2,
    pulseSpeed: 0.8,
    icon: 'ℹ️',
    defaultColor: '#3b82f6', // Blue
  },
};

/**
 * Category-based styling and icons
 */
const CATEGORY_CONFIG = {
  physiological: {
    icon: '❤️',
    label: 'Physiological',
  },
  behavioral: {
    icon: '🚶',
    label: 'Behavioral',
  },
  'self-reported': {
    icon: '💬',
    label: 'Self-Reported',
  },
  environmental: {
    icon: '🌤️',
    label: 'Environmental',
  },
  treatment: {
    icon: '💊',
    label: 'Treatment',
  },
};

/**
 * BiometricAlertVisualizer - Molecular component for clinical alert visualization
 * Implements HIPAA-compliant alert presentation with priority management
 */
export const BiometricAlertVisualizer: React.FC<BiometricAlertVisualizerProps> = ({
  alerts,
  regions,
  maxVisibleAlerts = 10,
  showAcknowledged = false,
  priorityFilter,
  categoryFilter,
  onAlertClick,
  onAlertAcknowledge,
  alertPositionMode = 'hybrid',
  floatingPosition = new Vector3(0, 5, 0),
  themeColors = {
    urgent: '#ef4444',
    warning: '#f97316',
    informational: '#3b82f6',
    acknowledged: '#94a3b8',
    text: '#ffffff',
    background: '#1e293b',
  },
}) => {
  // Refs
  const groupRef = useRef<Group>(null);
  const alertRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Animation state
  const [pulseState, setPulseState] = useState<Map<string, number>>(new Map());
  // Removed unused animationFrameRef

  // Create region lookup map for efficiency
  const regionMap = useMemo(() => {
    const map = new Map<string, BrainRegion>();
    regions.forEach((region) => {
      map.set(region.id, region);
    });
    return map;
  }, [regions]);

  // Filter and sort alerts
  const processedAlerts = useMemo(() => {
    let filteredAlerts = [...alerts];

    // Apply acknowledgement filter
    if (!showAcknowledged) {
      filteredAlerts = filteredAlerts.filter((alert) => !alert.isAcknowledged);
    }

    // Apply priority filter
    if (priorityFilter && priorityFilter.length > 0) {
      filteredAlerts = filteredAlerts.filter((alert) => priorityFilter.includes(alert.priority));
    }

    // Apply category filter
    if (categoryFilter && categoryFilter.length > 0) {
      filteredAlerts = filteredAlerts.filter((alert) => categoryFilter.includes(alert.category));
    }

    // Filter expired alerts
    const now = Date.now();
    filteredAlerts = filteredAlerts.filter((alert) => !alert.expiresAt || alert.expiresAt > now);

    // Sort by priority and timestamp
    filteredAlerts.sort((a, b) => {
      // First by priority
      const priorityDiff = PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order;

      if (priorityDiff !== 0) return priorityDiff;

      // Then by acknowledgement status
      if (a.isAcknowledged !== b.isAcknowledged) {
        return a.isAcknowledged ? 1 : -1;
      }

      // Then by timestamp (newest first)
      return b.timestamp - a.timestamp;
    });

    // Limit to max visible
    return filteredAlerts.slice(0, maxVisibleAlerts);
  }, [alerts, showAcknowledged, priorityFilter, categoryFilter, maxVisibleAlerts]);

  // Determine alert positions
  const alertPositions = useMemo(() => {
    const positions = new Map<string, Vector3>();

    processedAlerts.forEach((alert, index) => {
      let position: Vector3;

      if (alertPositionMode === 'region' && alert.relatedRegionIds?.length) {
        // Position near the first related region
        const regionId = alert.relatedRegionIds[0];
        const region = regionMap.get(regionId);

        if (region) {
          // Offset slightly above the region
          position = new THREE.Vector3(region.position.x, region.position.y, region.position.z)
            .clone()
            .add(new Vector3(0, 1.5, 0)); // Convert to THREE.Vector3 before clone
        } else {
          // Fallback to floating position with index-based offset
          position = floatingPosition.clone().add(new Vector3(0, -index * 1.2, 0));
        }
      } else if (alertPositionMode === 'hybrid' && alert.relatedRegionIds?.length) {
        // Position near the first related region
        const regionId = alert.relatedRegionIds[0];
        const region = regionMap.get(regionId);

        if (region) {
          // Offset slightly above the region
          position = new THREE.Vector3(region.position.x, region.position.y, region.position.z)
            .clone()
            .add(new Vector3(0, 1.5, 0)); // Convert to THREE.Vector3 before clone
        } else {
          // Fallback to floating position with index-based offset
          position = floatingPosition.clone().add(new Vector3(0, -index * 1.2, 0));
        }
      } else {
        // Floating position with index-based offset
        position = floatingPosition.clone().add(new Vector3(0, -index * 1.2, 0));
      }

      positions.set(alert.id, position);
    });

    return positions;
  }, [processedAlerts, alertPositionMode, regionMap, floatingPosition]);

  // Update pulse animation state
  useFrame((_state, delta) => {
    // state is unused
    // Update pulse state for each alert
    const newPulseState = new Map<string, number>();

    processedAlerts.forEach((alert) => {
      const currentPulse = pulseState.get(alert.id) || 0;
      const pulseSpeed = PRIORITY_CONFIG[alert.priority].pulseSpeed;
      const newPulse = (currentPulse + delta * pulseSpeed) % (Math.PI * 2);
      newPulseState.set(alert.id, newPulse);
    });

    setPulseState(newPulseState);
  });

  // Handle alert click
  const handleAlertClick = useCallback(
    (alertId: string) => {
      if (onAlertClick) {
        onAlertClick(alertId);
      }
    },
    [onAlertClick]
  );

  // Handle alert acknowledge
  const handleAlertAcknowledge = useCallback(
    (event: React.MouseEvent, alertId: string) => {
      event.stopPropagation();

      if (onAlertAcknowledge) {
        onAlertAcknowledge(alertId);
      }
    },
    [onAlertAcknowledge]
  );

  // Format alert timestamp
  const formatTimestamp = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    // If less than a minute ago
    if (diff < 60000) {
      return 'Just now';
    }

    // If less than an hour ago
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // If less than a day ago
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Otherwise show date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }, []);

  return (
    <group ref={groupRef}>
      {processedAlerts.map((alert) => {
        // Get position for this alert
        const position = alertPositions.get(alert.id) || floatingPosition;

        // Get pulse value for animation
        const pulseValue = pulseState.get(alert.id) || 0;
        const pulseScale = alert.isAcknowledged ? 1.0 : 0.9 + 0.1 * Math.sin(pulseValue);

        // Determine color based on priority and acknowledgement status
        const color = alert.isAcknowledged
          ? themeColors.acknowledged
          : themeColors[alert.priority] || PRIORITY_CONFIG[alert.priority].defaultColor;

        // Get category icon and info
        const category = CATEGORY_CONFIG[alert.category];

        return (
          <Billboard
            key={alert.id}
            position={position}
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
          >
            <Html
              center
              sprite
              transform
              scale={pulseScale}
              distanceFactor={10}
              zIndexRange={[100, 0]}
            >
              <div
                ref={(el) => {
                  if (el) alertRefs.current.set(alert.id, el);
                }}
                style={{
                  backgroundColor: `${themeColors.background}dd`,
                  borderLeft: `4px solid ${color}`,
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.75rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: themeColors.text,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '0.875rem',
                  width: '280px',
                  maxWidth: '280px',
                  transition: 'transform 0.2s ease-out',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: '0.5rem',
                  backdropFilter: 'blur(8px)',
                  opacity: alert.isAcknowledged ? 0.7 : 1.0,
                }}
                onClick={() => handleAlertClick(alert.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        marginRight: '0.5rem',
                        fontSize: '1rem',
                      }}
                    >
                      {PRIORITY_CONFIG[alert.priority].icon}
                    </span>
                    {alert.sourceMetric}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.8,
                    }}
                  >
                    {formatTimestamp(alert.timestamp)}
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>{alert.message}</div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '0.5rem',
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.8,
                    }}
                  >
                    <span style={{ marginRight: '0.25rem' }}>{category.icon}</span>
                    {category.label}

                    {alert.isPatientSpecific && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          backgroundColor: color,
                          color: 'white',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '1rem',
                          fontSize: '0.625rem',
                        }}
                      >
                        Patient-Specific
                      </span>
                    )}
                  </div>

                  {!alert.isAcknowledged && onAlertAcknowledge && (
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => handleAlertAcknowledge(e, alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                {/* Confidence indicator */}
                <div
                  style={{
                    marginTop: '0.5rem',
                    height: '3px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${alert.confidenceLevel * 100}%`,
                      backgroundColor: color,
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </div>
              </div>
            </Html>
          </Billboard>
        );
      })}
    </group>
  );
};

export default BiometricAlertVisualizer;
