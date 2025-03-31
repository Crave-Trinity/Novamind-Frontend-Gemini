/**
 * NOVAMIND Neural-Safe Molecular Component
 * TreatmentResponseVisualizer - Quantum-level treatment projection
 * with neuropsychiatric precision and temporal dynamics
 */

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Html, Text, Billboard } from '@react-three/drei';
import { Vector3, Group, Color, MathUtils } from 'three';

// Domain types
import { TreatmentResponsePrediction, TreatmentEfficacy } from '@domain/types/clinical/treatment';
import { BrainRegion } from '@domain/types/brain/models';

/**
 * Neural-safe projection point type
 */
interface ProjectionPoint {
  dayOffset: number;
  date: string;
  metrics: Record<string, number>;
  confidenceIntervals: Record<string, [number, number]>;
}

/**
 * Props with neural-safe typing
 */
interface TreatmentResponseVisualizerProps {
  predictions: TreatmentResponsePrediction[];
  temporalProjections?: {
    projectionId: string;
    timeSeries: ProjectionPoint[];
  };
  regions?: BrainRegion[];
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  showConfidenceIntervals?: boolean;
  showRegionImpact?: boolean;
  maxDaysToProject?: number;
  onTreatmentSelect?: (treatmentId: string) => void;
  selectedTreatmentId?: string;
  colorMap?: {
    efficacyHigh: string;
    efficacyModerate: string;
    efficacyLow: string;
    confidenceInterval: string;
    grid: string;
    background: string;
    text: string;
    baseline: string;
  };
}

/**
 * Efficacy level colors with clinical precision
 */
const getEfficacyColor = (
  efficacy: TreatmentEfficacy,
  colorMap: Record<string, string>
): string => {
  switch (efficacy) {
    case 'high':
      return colorMap.efficacyHigh;
    case 'moderate':
      return colorMap.efficacyModerate;
    case 'low':
      return colorMap.efficacyLow;
    default:
      return colorMap.efficacyLow;
  }
};

/**
 * TreatmentResponseVisualizer - Molecular component for treatment response projection
 * Implements clinical precision visualization of treatment efficacy with confidence intervals
 */
export const TreatmentResponseVisualizer: React.FC<TreatmentResponseVisualizerProps> = ({
  predictions,
  temporalProjections,
  regions = [],
  width = 10,
  height = 6,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  showConfidenceIntervals = true,
  showRegionImpact = true,
  maxDaysToProject = 90,
  onTreatmentSelect,
  selectedTreatmentId,
  colorMap = {
    efficacyHigh: '#10b981', // Green
    efficacyModerate: '#f59e0b', // Amber
    efficacyLow: '#ef4444', // Red
    confidenceInterval: '#6366f1', // Indigo
    grid: '#475569', // Slate
    background: '#0f172a88', // Semi-transparent dark blue
    text: '#f8fafc', // Light slate
    baseline: '#64748b', // Slate
  },
}) => {
  // Refs
  const groupRef = useRef<Group>(null);
  
  // Create region lookup map for efficiency
  const regionMap = useMemo(() => {
    const map = new Map<string, BrainRegion>();
    regions.forEach(region => {
      map.set(region.id, region);
    });
    return map;
  }, [regions]);
  
  // Process treatment predictions for visualization
  const processedPredictions = useMemo(() => {
    return predictions.map(prediction => {
      // Determine color based on efficacy
      const color = getEfficacyColor(prediction.efficacy, colorMap);
      
      // Determine if this treatment is selected
      const isSelected = selectedTreatmentId === prediction.treatmentId;
      
      // Map projection timeline to visualization space
      const timelinePoints: Vector3[] = [];
      const confidenceAreaPoints: Vector3[] = [];
      
      // Generate timeline points based on response trajectory
      const daysToProject = prediction.daysToEffect || 30;
      const limitedDays = Math.min(daysToProject, maxDaysToProject);
      
      // Create baseline point at day 0
      timelinePoints.push(new Vector3(
        -width / 2,
        0,
        0
      ));
      
      // Map trajectory points
      for (let day = 0; day <= limitedDays; day++) {
        const t = day / limitedDays;
        const x = MathUtils.lerp(-width / 2, width / 2, t);
        
        // Calculate response level based on trajectory shape
        let responseLevel: number;
        
        switch (prediction.responseTrajectory) {
          case 'rapid':
            // Rapid initial improvement that plateaus
            responseLevel = 1 - Math.exp(-3 * t);
            break;
          case 'gradual':
            // Linear improvement
            responseLevel = t;
            break;
          case 'delayed':
            // Slow start with acceleration
            responseLevel = Math.pow(t, 2);
            break;
          case 'fluctuating':
            // Up and down pattern with overall improvement
            responseLevel = t + 0.1 * Math.sin(t * 10);
            break;
          default:
            responseLevel = t;
            break;
        }
        
        // Scale response by efficacy
        const efficacyFactor = 
          prediction.efficacy === 'high' ? 0.8 :
          prediction.efficacy === 'moderate' ? 0.5 :
          0.3;
        
        const scaledResponse = responseLevel * efficacyFactor;
        
        // Map to y position
        const y = MathUtils.mapLinear(
          scaledResponse,
          0,
          1,
          0,
          height / 2
        );
        
        timelinePoints.push(new Vector3(x, y, 0));
        
        // Generate confidence interval points
        if (showConfidenceIntervals && day > 0) {
          // Calculate confidence interval based on confidence level
          // Lower confidence = wider interval
          const interval = (1 - prediction.confidenceLevel) * y * 0.6;
          
          confidenceAreaPoints.push(
            new Vector3(x, y + interval, 0),
            new Vector3(x, y - interval, 0)
          );
        }
      }
      
      // Generate impacted region data
      const impactedRegions = prediction.impactedRegions?.map(impact => {
        const region = regionMap.get(impact.regionId);
        return {
          ...impact,
          region,
          color
        };
      }).filter(item => item.region) || [];
      
      return {
        ...prediction,
        color,
        isSelected,
        timelinePoints,
        confidenceAreaPoints,
        impactedRegions
      };
    });
  }, [predictions, selectedTreatmentId, width, height, maxDaysToProject, showConfidenceIntervals, regionMap, colorMap]);
  
  // Process temporal projections if available
  const processedProjections = useMemo(() => {
    if (!temporalProjections) return null;
    
    // Process each metric in the temporal projections
    const metrics = new Set<string>();
    temporalProjections.timeSeries.forEach(point => {
      Object.keys(point.metrics).forEach(metric => metrics.add(metric));
    });
    
    return Array.from(metrics).map(metricName => {
      // Create points for this metric
      const points: Vector3[] = [];
      const confidencePoints: Vector3[][] = [];
      
      temporalProjections.timeSeries.forEach((point, i) => {
        // Map x position (time)
        const x = MathUtils.mapLinear(
          point.dayOffset,
          0,
          Math.min(maxDaysToProject, temporalProjections.timeSeries[temporalProjections.timeSeries.length - 1].dayOffset),
          -width / 2,
          width / 2
        );
        
        // Get metric value
        const value = point.metrics[metricName] || 0;
        
        // Map to y position
        const y = MathUtils.mapLinear(
          value,
          0,
          1,
          0,
          height / 2
        );
        
        points.push(new Vector3(x, y, 0));
        
        // Get confidence interval
        if (showConfidenceIntervals && point.confidenceIntervals?.[metricName]) {
          const [lower, upper] = point.confidenceIntervals[metricName];
          
          const lowerY = MathUtils.mapLinear(
            lower,
            0,
            1,
            0,
            height / 2
          );
          
          const upperY = MathUtils.mapLinear(
            upper,
            0,
            1,
            0,
            height / 2
          );
          
          confidencePoints.push([
            new Vector3(x, lowerY, 0),
            new Vector3(x, upperY, 0)
          ]);
        }
      });
      
      // Assign a color based on the metric name
      const color = new Color().setHSL(
        Math.abs(metricName.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360) / 360,
        0.7,
        0.5
      ).getStyle();
      
      return {
        name: metricName,
        points,
        confidencePoints,
        color
      };
    });
  }, [temporalProjections, maxDaysToProject, width, height, showConfidenceIntervals]);
  
  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: { points: Vector3[]; color: string; opacity: number; lineWidth: number }[] = [];
    
    // Horizontal baseline
    lines.push({
      points: [
        new Vector3(-width / 2, 0, 0),
        new Vector3(width / 2, 0, 0)
      ],
      color: colorMap.baseline,
      opacity: 0.8,
      lineWidth: 2
    });
    
    // Vertical time markers (months)
    const monthMarkers = Math.ceil(maxDaysToProject / 30);
    
    for (let i = 0; i <= monthMarkers; i++) {
      const day = i * 30;
      const x = MathUtils.mapLinear(
        day,
        0,
        maxDaysToProject,
        -width / 2,
        width / 2
      );
      
      lines.push({
        points: [
          new Vector3(x, -height / 2, 0),
          new Vector3(x, height / 2, 0)
        ],
        color: colorMap.grid,
        opacity: 0.4,
        lineWidth: 1
      });
    }
    
    // Horizontal response level markers
    const levels = 5;
    
    for (let i = 1; i <= levels; i++) {
      const y = MathUtils.mapLinear(
        i / levels,
        0,
        1,
        0,
        height / 2
      );
      
      lines.push({
        points: [
          new Vector3(-width / 2, y, 0),
          new Vector3(width / 2, y, 0)
        ],
        color: colorMap.grid,
        opacity: 0.4,
        lineWidth: 1
      });
    }
    
    return lines;
  }, [width, height, maxDaysToProject, colorMap]);
  
  // Handle treatment selection
  const handleTreatmentSelect = useCallback((treatmentId: string) => {
    if (onTreatmentSelect) {
      onTreatmentSelect(treatmentId);
    }
  }, [onTreatmentSelect]);
  
  // Format response percentage
  const formatResponsePercentage = useCallback((efficacy: TreatmentEfficacy): string => {
    switch (efficacy) {
      case 'high':
        return '70-90%';
      case 'moderate':
        return '40-60%';
      case 'low':
        return '10-30%';
      default:
        return '0%';
    }
  }, []);
  
  return (
    <group
      ref={groupRef}
      position={new Vector3(...position)}
      rotation={[rotation[0], rotation[1], rotation[2]]}
    >
      {/* Background plane */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial 
          color={colorMap.background} 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Grid lines */}
      {gridLines.map((line, i) => (
        <Line
          key={`grid-${i}`}
          points={line.points}
          color={line.color}
          lineWidth={line.lineWidth}
          opacity={line.opacity}
          transparent
        />
      ))}
      
      {/* Axis labels */}
      <Text
        position={[0, -height / 2 - 0.5, 0]}
        fontSize={0.4}
        color={colorMap.text}
        anchorX="center"
        anchorY="top"
      >
        Months of Treatment
      </Text>
      
      <Text
        position={[-width / 2 - 0.5, height / 4, 0]}
        fontSize={0.4}
        color={colorMap.text}
        anchorX="right"
        anchorY="middle"
        rotation={[0, 0, Math.PI / 2]}
      >
        Symptom Improvement
      </Text>
      
      {/* Month markers */}
      {[0, 1, 2, 3].map(month => {
        const x = MathUtils.mapLinear(
          month * 30,
          0,
          maxDaysToProject,
          -width / 2,
          width / 2
        );
        
        return (
          <Text
            key={`month-${month}`}
            position={[x, -height / 2 - 0.2, 0]}
            fontSize={0.35}
            color={colorMap.text}
            anchorX="center"
            anchorY="top"
          >
            {month === 0 ? 'Start' : `${month}M`}
          </Text>
        );
      })}
      
      {/* Render temporal projections if available */}
      {processedProjections && (
        <group>
          {processedProjections.map((metric, i) => (
            <group key={`metric-${i}`}>
              {/* Confidence interval lines */}
              {showConfidenceIntervals && metric.confidencePoints.map((points, j) => (
                <Line
                  key={`confidence-${j}`}
                  points={points}
                  color={colorMap.confidenceInterval}
                  lineWidth={1}
                  opacity={0.3}
                  transparent
                />
              ))}
              
              {/* Metric line */}
              <Line
                points={metric.points}
                color={metric.color}
                lineWidth={2}
                opacity={0.8}
              />
              
              {/* Metric label */}
              <Billboard
                position={[
                  metric.points[metric.points.length - 1].x + 0.2,
                  metric.points[metric.points.length - 1].y,
                  0
                ]}
                follow={true}
              >
                <Html center sprite>
                  <div
                    style={{
                      backgroundColor: metric.color,
                      color: 'white',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      fontWeight: 'bold'
                    }}
                  >
                    {metric.name}
                  </div>
                </Html>
              </Billboard>
            </group>
          ))}
        </group>
      )}
      
      {/* Render treatment predictions */}
      {processedPredictions.map((prediction, i) => {
        // Line opacity based on selection state
        const opacity = prediction.isSelected ? 1 : 
                      (selectedTreatmentId ? 0.4 : 0.8);
        
        // Line width based on selection state
        const lineWidth = prediction.isSelected ? 3 : 2;
        
        return (
          <group key={prediction.treatmentId}>
            {/* Confidence interval area */}
            {showConfidenceIntervals && prediction.confidenceAreaPoints.length > 0 && (
              <Line
                points={prediction.confidenceAreaPoints}
                color={prediction.color}
                lineWidth={1}
                opacity={opacity * 0.3}
                transparent
                segments
              />
            )}
            
            {/* Treatment response line */}
            <Line
              points={prediction.timelinePoints}
              color={prediction.color}
              lineWidth={lineWidth}
              opacity={opacity}
              transparent
            />
            
            {/* Treatment label */}
            <Billboard
              position={[
                prediction.timelinePoints[prediction.timelinePoints.length - 1].x + 0.2,
                prediction.timelinePoints[prediction.timelinePoints.length - 1].y,
                0
              ]}
              follow={true}
            >
              <Html
                center
                sprite
                onClick={() => handleTreatmentSelect(prediction.treatmentId)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  style={{
                    backgroundColor: `${prediction.color}cc`,
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    fontWeight: 'bold',
                    boxShadow: prediction.isSelected ? '0 0 10px rgba(255, 255, 255, 0.5)' : 'none',
                    transform: `scale(${prediction.isSelected ? 1.1 : 1})`,
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {prediction.treatmentName}
                </div>
              </Html>
            </Billboard>
            
            {/* Days to effect indicator */}
            {prediction.daysToEffect && (
              <group>
                <mesh
                  position={[
                    MathUtils.mapLinear(
                      prediction.daysToEffect,
                      0,
                      maxDaysToProject,
                      -width / 2,
                      width / 2
                    ),
                    prediction.timelinePoints[prediction.timelinePoints.length - 1].y / 2,
                    0
                  ]}
                  scale={0.1}
                >
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshBasicMaterial color={prediction.color} />
                </mesh>
                
                <Text
                  position={[
                    MathUtils.mapLinear(
                      prediction.daysToEffect,
                      0,
                      maxDaysToProject,
                      -width / 2,
                      width / 2
                    ),
                    prediction.timelinePoints[prediction.timelinePoints.length - 1].y / 2 + 0.3,
                    0
                  ]}
                  fontSize={0.3}
                  color={prediction.color}
                  anchorX="center"
                  anchorY="bottom"
                >
                  {prediction.daysToEffect} days
                </Text>
              </group>
            )}
            
            {/* Show impacted brain regions */}
            {showRegionImpact && prediction.isSelected && prediction.impactedRegions.map((impact, j) => {
              if (!impact.region) return null;
              
              return (
                <group key={`impact-${j}`}>
                  <Line
                    points={[
                      new Vector3(-width / 2 - 1, j * 0.6 - 2, 0),
                      new Vector3(-width / 2 - 0.2, j * 0.6 - 2, 0)
                    ]}
                    color={impact.color}
                    lineWidth={2}
                    opacity={0.8}
                  />
                  
                  <Text
                    position={[-width / 2 - 1.2, j * 0.6 - 2, 0]}
                    fontSize={0.3}
                    color={colorMap.text}
                    anchorX="right"
                    anchorY="middle"
                  >
                    {impact.region.name}: {Math.round(impact.impactLevel * 100)}%
                  </Text>
                </group>
              );
            })}
            
            {/* Show clinical information panel for selected treatment */}
            {prediction.isSelected && (
              <Html
                position={[0, -height / 2 - 1.2, 0]}
                center
              >
                <div
                  style={{
                    backgroundColor: `${colorMap.background.replace('88', 'ee')}`,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${prediction.color}`,
                    color: colorMap.text,
                    width: '300px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                    {prediction.treatmentName}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '0.75rem',
                    fontSize: '0.875rem'
                  }}>
                    <div>
                      <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Expected Response</div>
                      <div style={{ fontWeight: 'bold', color: prediction.color }}>
                        {formatResponsePercentage(prediction.efficacy)}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Onset</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {prediction.responseTrajectory === 'rapid' ? 'Rapid' : 
                         prediction.responseTrajectory === 'gradual' ? 'Gradual' :
                         prediction.responseTrajectory === 'delayed' ? 'Delayed' :
                         prediction.responseTrajectory === 'fluctuating' ? 'Fluctuating' : 'Unknown'}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Confidence</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {Math.round(prediction.confidenceLevel * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  {prediction.sideEffects && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>
                      <span style={{ opacity: 0.7 }}>Potential side effects:</span> {prediction.sideEffects}
                    </div>
                  )}
                  
                  {prediction.contraindications && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>
                      <span style={{ opacity: 0.7 }}>Contraindications:</span> {prediction.contraindications}
                    </div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default TreatmentResponseVisualizer;
