/**
 * NOVAMIND Neural-Safe Controller Layer
 * BiometricStreamController - Quantum-level biometric processing
 * with mathematically precise clinical correlation and type-safe operations
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Domain types
import {
  BiometricStream,
  BiometricDataPoint,
  BiometricAlert,
  BiometricSource,
  BiometricType,
  AlertPriority,
  AlertSource,
  BiometricThreshold
} from '@domain/types/biometric/streams';
import { Result, success, failure } from '@domain/types/common/result';

// Services
import { biometricService } from '@application/services/biometricService';
import { clinicalService } from '@application/services/clinicalService';

/**
 * Neural-safe stream configuration with quantum precision
 */
interface StreamConfig {
  sampleRate: number; // Samples per minute
  bufferSize: number; // Maximum data points to keep in memory
  alertThresholds: Map<BiometricType, BiometricThreshold[]>;
  correlationWindow: number; // Time window in minutes for correlation analysis
  sources: BiometricSource[];
  streamIds: string[];
  normalizeData: boolean;
  filterOutliers: boolean;
}

/**
 * Stream state with thread-safety guarantees
 */
interface BiometricStreamState {
  activeStreams: Map<string, BiometricStream>;
  streamData: Map<string, BiometricDataPoint[]>;
  alerts: BiometricAlert[];
  isConnected: boolean;
  lastSyncTime: Date | null;
  correlations: Map<string, number>; // Correlation coefficients between streams
  normalRanges: Map<BiometricType, [number, number]>; // Min/max normal values
  isProcessing: boolean;
  errorState: string | null;
  lastAlertTime: Date | null;
  metrics: {
    dataPointsProcessed: number;
    alertsGenerated: number;
    processingLatency: number; // milliseconds
  };
}

/**
 * Default stream configuration with clinical precision
 */
const defaultStreamConfig: StreamConfig = {
  sampleRate: 60, // 1 sample per second
  bufferSize: 86400, // 24 hours of data at 1 sample per second
  alertThresholds: new Map(),
  correlationWindow: 30, // 30 minutes
  sources: ['wearable', 'mobile', 'clinical'],
  streamIds: [],
  normalizeData: true,
  filterOutliers: true
};

/**
 * Initial stream state with safe defaults
 */
const createInitialStreamState = (): BiometricStreamState => ({
  activeStreams: new Map(),
  streamData: new Map(),
  alerts: [],
  isConnected: false,
  lastSyncTime: null,
  correlations: new Map(),
  normalRanges: new Map(),
  isProcessing: false,
  errorState: null,
  lastAlertTime: null,
  metrics: {
    dataPointsProcessed: 0,
    alertsGenerated: 0,
    processingLatency: 0
  }
});

/**
 * Neural-safe controller for biometric stream processing
 * with clinical-grade precision and type safety
 */
export function useBiometricStreamController(
  patientId: string,
  initialConfig: Partial<StreamConfig> = {}
) {
  // Merge provided config with defaults
  const config = useMemo<StreamConfig>(() => ({
    ...defaultStreamConfig,
    ...initialConfig
  }), [initialConfig]);
  
  // State with thread-safe operations
  const [state, setState] = useState<BiometricStreamState>(createInitialStreamState());
  
  // WebSocket connection for real-time data (simulated)
  const wsRef = useRef<WebSocket | null>(null);
  
  // Initialize with default thresholds
  useEffect(() => {
    // Set up default alert thresholds
    const defaultThresholds = new Map<BiometricType, BiometricThreshold[]>([
      ['heartRate', [
        { min: 40, max: 60, label: 'Bradycardia', priority: 'warning' },
        { min: 100, max: 120, label: 'Tachycardia', priority: 'warning' },
        { min: 0, max: 40, label: 'Severe Bradycardia', priority: 'urgent' },
        { min: 120, max: 999, label: 'Severe Tachycardia', priority: 'urgent' }
      ]],
      ['bloodPressureSystolic', [
        { min: 90, max: 120, label: 'Normal', priority: 'informational' },
        { min: 120, max: 140, label: 'Elevated', priority: 'informational' },
        { min: 140, max: 160, label: 'Hypertension Stage 1', priority: 'warning' },
        { min: 160, max: 180, label: 'Hypertension Stage 2', priority: 'warning' },
        { min: 180, max: 999, label: 'Hypertensive Crisis', priority: 'urgent' },
        { min: 0, max: 90, label: 'Hypotension', priority: 'warning' }
      ]],
      ['bloodPressureDiastolic', [
        { min: 60, max: 80, label: 'Normal', priority: 'informational' },
        { min: 80, max: 90, label: 'Elevated', priority: 'informational' },
        { min: 90, max: 100, label: 'Hypertension Stage 1', priority: 'warning' },
        { min: 100, max: 110, label: 'Hypertension Stage 2', priority: 'warning' },
        { min: 110, max: 999, label: 'Hypertensive Crisis', priority: 'urgent' },
        { min: 0, max: 60, label: 'Hypotension', priority: 'warning' }
      ]],
      ['respiratoryRate', [
        { min: 12, max: 20, label: 'Normal', priority: 'informational' },
        { min: 8, max: 12, label: 'Low', priority: 'warning' },
        { min: 20, max: 30, label: 'Elevated', priority: 'warning' },
        { min: 0, max: 8, label: 'Critical Low', priority: 'urgent' },
        { min: 30, max: 999, label: 'Critical High', priority: 'urgent' }
      ]],
      ['bodyTemperature', [
        { min: 36.5, max: 37.5, label: 'Normal', priority: 'informational' },
        { min: 35.0, max: 36.5, label: 'Low', priority: 'warning' },
        { min: 37.5, max: 38.5, label: 'Fever', priority: 'warning' },
        { min: 0, max: 35.0, label: 'Hypothermia', priority: 'urgent' },
        { min: 38.5, max: 41.5, label: 'High Fever', priority: 'urgent' },
        { min: 41.5, max: 999, label: 'Critical Hyperthermia', priority: 'urgent' }
      ]],
      ['oxygenSaturation', [
        { min: 95, max: 100, label: 'Normal', priority: 'informational' },
        { min: 91, max: 95, label: 'Low', priority: 'warning' },
        { min: 85, max: 91, label: 'Very Low', priority: 'warning' },
        { min: 0, max: 85, label: 'Critical', priority: 'urgent' }
      ]],
      ['bloodGlucose', [
        { min: 70, max: 140, label: 'Normal', priority: 'informational' },
        { min: 140, max: 180, label: 'Elevated', priority: 'informational' },
        { min: 40, max: 70, label: 'Low', priority: 'warning' },
        { min: 180, max: 250, label: 'High', priority: 'warning' },
        { min: 0, max: 40, label: 'Critical Low', priority: 'urgent' },
        { min: 250, max: 999, label: 'Critical High', priority: 'urgent' }
      ]],
      ['cortisol', [
        { min: 5, max: 23, label: 'Normal', priority: 'informational' },
        { min: 23, max: 40, label: 'Elevated', priority: 'warning' },
        { min: 0, max: 5, label: 'Low', priority: 'warning' },
        { min: 40, max: 999, label: 'Critically High', priority: 'warning' }
      ]],
      ['sleepQuality', [
        { min: 70, max: 100, label: 'Good', priority: 'informational' },
        { min: 50, max: 70, label: 'Fair', priority: 'informational' },
        { min: 30, max: 50, label: 'Poor', priority: 'warning' },
        { min: 0, max: 30, label: 'Very Poor', priority: 'warning' }
      ]],
      ['eegThetaPower', [
        { min: 0, max: 100, label: 'Normal', priority: 'informational' },
        // Custom thresholds would be set by clinical team
      ]],
      ['motionActivity', [
        { min: 0, max: 100, label: 'Normal', priority: 'informational' },
        // Thresholds determined by baseline activity patterns
      ]]
    ]);
    
    // Apply default thresholds where not already defined
    const mergedThresholds = new Map(config.alertThresholds);
    
    defaultThresholds.forEach((thresholds, type) => {
      if (!mergedThresholds.has(type)) {
        mergedThresholds.set(type, thresholds);
      }
    });
    
    // Update config with merged thresholds
    config.alertThresholds = mergedThresholds;
    
    // Set normal ranges
    const normalRanges = new Map<BiometricType, [number, number]>([
      ['heartRate', [60, 100]],
      ['bloodPressureSystolic', [90, 120]],
      ['bloodPressureDiastolic', [60, 80]],
      ['respiratoryRate', [12, 20]],
      ['bodyTemperature', [36.5, 37.5]],
      ['oxygenSaturation', [95, 100]],
      ['bloodGlucose', [70, 140]],
      ['cortisol', [5, 23]],
      ['sleepQuality', [70, 100]],
      // Other metrics would be set based on patient baseline
    ]);
    
    setState(prevState => ({
      ...prevState,
      normalRanges
    }));
    
  }, [config.alertThresholds]);
  
  // Connect to biometric streams
  const connectStreams = useCallback(async (
    streamIds?: string[]
  ): Promise<Result<void>> => {
    try {
      // Target streams (use provided or configured)
      const targetStreamIds = streamIds || config.streamIds;
      
      if (targetStreamIds.length === 0) {
        return failure('No stream IDs provided for connection');
      }
      
      // Start by marking as processing
      setState(prevState => ({
        ...prevState,
        isProcessing: true,
        errorState: null
      }));
      
      // Get stream metadata
      const streamsResult = await biometricService.getStreamMetadata(
        patientId, 
        targetStreamIds
      );
      
      if (!streamsResult.success || !streamsResult.data) {
        setState(prevState => ({
          ...prevState,
          isProcessing: false,
          errorState: streamsResult.error || 'Failed to load stream metadata'
        }));
        
        return failure(streamsResult.error || 'Failed to load stream metadata');
      }
      
      // Initialize stream data storage
      const newActiveStreams = new Map<string, BiometricStream>();
      const newStreamData = new Map<string, BiometricDataPoint[]>();
      
      streamsResult.data.forEach(stream => {
        newActiveStreams.set(stream.id, stream);
        newStreamData.set(stream.id, []);
      });
      
      // Update state with initialized streams
      setState(prevState => ({
        ...prevState,
        activeStreams: newActiveStreams,
        streamData: newStreamData,
        isProcessing: false,
        isConnected: true,
        lastSyncTime: new Date()
      }));
      
      // Establish WebSocket connection for real-time data
      // (This is simulated - in a real app, would connect to actual WebSocket endpoint)
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Simulate WebSocket for demo purposes
      // In a real implementation, this would be a real WebSocket connection
      const simulateWebSocket = () => {
        const simulatedWs = {
          send: (message: string) => {
            console.log('Sending to biometric WebSocket:', message);
          },
          close: () => {
            console.log('Closing biometric WebSocket connection');
            clearInterval(dataInterval);
          }
        } as unknown as WebSocket;
        
        // Simulate incoming data at the configured sample rate
        const dataInterval = setInterval(() => {
          if (newActiveStreams.size > 0) {
            // Generate random data for each stream (for demo purposes)
            newActiveStreams.forEach((stream, streamId) => {
              // Generate simulated data point
              const dataPoint = generateSimulatedDataPoint(streamId, stream.type);
              
              // Process the data point
              processDataPoint(streamId, dataPoint);
            });
          }
        }, (60 * 1000) / config.sampleRate); // Convert to milliseconds
        
        return simulatedWs;
      };
      
      wsRef.current = simulateWebSocket();
      
      return success(undefined);
    } catch (error) {
      // Update error state
      setState(prevState => ({
        ...prevState,
        isProcessing: false,
        isConnected: false,
        errorState: error instanceof Error ? error.message : 'Unknown error connecting to streams'
      }));
      
      return failure(error instanceof Error ? error.message : 'Unknown error connecting to streams');
    }
  }, [patientId, config.streamIds, config.sampleRate]);
  
  // Disconnect from biometric streams
  const disconnectStreams = useCallback((): Result<void> => {
    try {
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Update state
      setState(prevState => ({
        ...prevState,
        isConnected: false
      }));
      
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error disconnecting streams');
    }
  }, []);
  
  // Generate simulated data point for demo purposes
  const generateSimulatedDataPoint = useCallback((
    streamId: string,
    type: BiometricType
  ): BiometricDataPoint => {
    const timestamp = new Date();
    const normalRange = state.normalRanges.get(type) || [0, 100];
    
    // Generate value within normal range with some variation
    const mean = (normalRange[0] + normalRange[1]) / 2;
    const stdDev = (normalRange[1] - normalRange[0]) / 6; // ~99% within range
    
    // Generate normally distributed random value
    const randNormal = () => {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z0;
    };
    
    const randomValue = mean + stdDev * randNormal();
    
    // Occasionally generate out-of-range values to trigger alerts
    const triggerAlert = Math.random() < 0.05; // 5% chance
    const value = triggerAlert 
      ? normalRange[1] + stdDev * (1 + Math.random()) // Above normal
      : randomValue;
    
    // Create data point
    return {
      id: `dp-${streamId}-${timestamp.getTime()}`,
      streamId,
      timestamp,
      value,
      type,
      source: 'wearable', // Default source for simulation
      quality: Math.random() < 0.9 ? 'high' : 'medium' // 90% high quality
    };
  }, [state.normalRanges]);
  
  // Process a single biometric data point
  const processDataPoint = useCallback((
    streamId: string,
    dataPoint: BiometricDataPoint
  ): void => {
    const startTime = performance.now();
    
    setState(prevState => {
      // Get current data for this stream
      const streamData = prevState.streamData.get(streamId) || [];
      
      // Filter outliers if enabled
      if (config.filterOutliers) {
        // Simple outlier detection
        if (streamData.length > 10) {
          const recentValues = streamData.slice(Math.max(0, streamData.length - 10))
            .map(dp => dp.value);
          
          const mean = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
          const stdDev = Math.sqrt(
            recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length
          );
          
          // If value is more than 3 standard deviations from mean, flag as outlier
          if (Math.abs(dataPoint.value - mean) > 3 * stdDev) {
            // Skip this point or mark as low quality
            dataPoint = {
              ...dataPoint,
              quality: 'low',
              flags: ['outlier']
            };
          }
        }
      }
      
      // Add to data array
      const newStreamData = [...streamData, dataPoint];
      
      // Trim to buffer size
      const trimmedData = newStreamData.length > config.bufferSize
        ? newStreamData.slice(newStreamData.length - config.bufferSize)
        : newStreamData;
      
      // Create updated streamData map
      const updatedStreamData = new Map(prevState.streamData);
      updatedStreamData.set(streamId, trimmedData);
      
      // Check if data point triggers any alerts
      const newAlerts = [...prevState.alerts];
      const stream = prevState.activeStreams.get(streamId);
      
      if (stream) {
        const thresholds = config.alertThresholds.get(dataPoint.type) || [];
        
        // Check each threshold
        for (const threshold of thresholds) {
          if (dataPoint.value < threshold.min || dataPoint.value > threshold.max) {
            // Skip informational alerts if we're beyond a threshold for the same metric
            if (threshold.priority === 'informational' &&
                newAlerts.some(alert => 
                  alert.streamId === streamId && 
                  alert.biometricType === dataPoint.type && 
                  alert.priority !== 'informational'
                )) {
              continue;
            }
            
            // Create alert
            const alert: BiometricAlert = {
              id: `alert-${streamId}-${Date.now()}`,
              timestamp: new Date(),
              streamId,
              dataPointId: dataPoint.id,
              biometricType: dataPoint.type,
              value: dataPoint.value,
              threshold: threshold,
              message: `${threshold.label}: ${dataPoint.value.toFixed(1)} ${stream.unit || ''}`,
              priority: threshold.priority,
              source: 'algorithm',
              acknowledged: false
            };
            
            newAlerts.push(alert);
            
            // Limit alerts to most recent 100
            if (newAlerts.length > 100) {
              newAlerts.shift();
            }
          }
        }
      }
      
      // Update metrics
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      return {
        ...prevState,
        streamData: updatedStreamData,
        alerts: newAlerts,
        lastSyncTime: new Date(),
        lastAlertTime: newAlerts.length > prevState.alerts.length ? new Date() : prevState.lastAlertTime,
        metrics: {
          dataPointsProcessed: prevState.metrics.dataPointsProcessed + 1,
          alertsGenerated: prevState.metrics.alertsGenerated + (newAlerts.length - prevState.alerts.length),
          processingLatency: (prevState.metrics.processingLatency + latency) / 2 // Running average
        }
      };
    });
  }, [config.filterOutliers, config.bufferSize, config.alertThresholds]);
  
  // Acknowledge an alert
  const acknowledgeAlert = useCallback((
    alertId: string
  ): Result<void> => {
    try {
      setState(prevState => {
        const alertIndex = prevState.alerts.findIndex(alert => alert.id === alertId);
        
        if (alertIndex === -1) {
          return prevState;
        }
        
        // Create new alerts array with the acknowledged alert
        const newAlerts = [...prevState.alerts];
        newAlerts[alertIndex] = {
          ...newAlerts[alertIndex],
          acknowledged: true,
          acknowledgedAt: new Date()
        };
        
        return {
          ...prevState,
          alerts: newAlerts
        };
      });
      
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error acknowledging alert');
    }
  }, []);
  
  // Get recent data for a specific stream
  const getStreamData = useCallback((
    streamId: string,
    count?: number
  ): BiometricDataPoint[] => {
    const streamData = state.streamData.get(streamId) || [];
    
    if (count === undefined) {
      return [...streamData];
    }
    
    return streamData.slice(Math.max(0, streamData.length - count));
  }, [state.streamData]);
  
  // Get active alerts
  const getAlerts = useCallback((
    priority?: AlertPriority,
    acknowledged?: boolean
  ): BiometricAlert[] => {
    let filteredAlerts = [...state.alerts];
    
    if (priority !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }
    
    if (acknowledged !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return filteredAlerts;
  }, [state.alerts]);
  
  // Calculate correlations between biometric streams
  const calculateCorrelations = useCallback((): Result<Map<string, number>> => {
    try {
      // Get all stream IDs
      const streamIds = Array.from(state.activeStreams.keys());
      
      if (streamIds.length < 2) {
        return success(new Map()); // Need at least 2 streams to correlate
      }
      
      const correlations = new Map<string, number>();
      
      // Calculate correlations for each pair of streams
      for (let i = 0; i < streamIds.length; i++) {
        for (let j = i + 1; j < streamIds.length; j++) {
          const streamIdA = streamIds[i];
          const streamIdB = streamIds[j];
          
          // Get data for both streams
          const dataA = state.streamData.get(streamIdA) || [];
          const dataB = state.streamData.get(streamIdB) || [];
          
          // Need enough data points for correlation
          if (dataA.length < 10 || dataB.length < 10) {
            continue;
          }
          
          // Calculate Pearson correlation coefficient
          // (This is a simplified version - real implementation would need time alignment)
          const valuesA = dataA.slice(Math.max(0, dataA.length - 100)).map(dp => dp.value);
          const valuesB = dataB.slice(Math.max(0, dataB.length - 100)).map(dp => dp.value);
          
          // Use smallest length
          const n = Math.min(valuesA.length, valuesB.length);
          
          // Calculate means
          const meanA = valuesA.reduce((sum, val) => sum + val, 0) / n;
          const meanB = valuesB.reduce((sum, val) => sum + val, 0) / n;
          
          // Calculate correlation
          let numerator = 0;
          let denomA = 0;
          let denomB = 0;
          
          for (let k = 0; k < n; k++) {
            const diffA = valuesA[k] - meanA;
            const diffB = valuesB[k] - meanB;
            
            numerator += diffA * diffB;
            denomA += diffA * diffA;
            denomB += diffB * diffB;
          }
          
          const correlation = numerator / (Math.sqrt(denomA) * Math.sqrt(denomB));
          
          // Add to correlations
          correlations.set(`${streamIdA}-${streamIdB}`, correlation);
        }
      }
      
      // Update state with correlations
      setState(prevState => ({
        ...prevState,
        correlations: new Map([...prevState.correlations, ...correlations])
      }));
      
      return success(correlations);
    } catch (error) {
      return failure(error instanceof Error ? error.message : 'Unknown error calculating correlations');
    }
  }, [state.activeStreams, state.streamData]);
  
  // Get current controller status
  const getStatus = useCallback(() => {
    return {
      isConnected: state.isConnected,
      activeStreamCount: state.activeStreams.size,
      lastSyncTime: state.lastSyncTime,
      alertCount: state.alerts.length,
      unacknowledgedAlertCount: state.alerts.filter(alert => !alert.acknowledged).length,
      urgentAlertCount: state.alerts.filter(
        alert => alert.priority === 'urgent' && !alert.acknowledged
      ).length,
      dataPointsProcessed: state.metrics.dataPointsProcessed,
      processingLatency: state.metrics.processingLatency
    };
  }, [state]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Return controller interface
  return {
    connectStreams,
    disconnectStreams,
    processDataPoint,
    acknowledgeAlert,
    getStreamData,
    getAlerts,
    calculateCorrelations,
    getStatus,
    activeStreams: state.activeStreams,
    isConnected: state.isConnected,
    latestAlerts: state.alerts.filter(a => !a.acknowledged)
                              .sort((a, b) => {
                                // Sort by priority and then by timestamp
                                const priorityOrder = { urgent: 0, warning: 1, informational: 2 };
                                const aPriority = priorityOrder[a.priority];
                                const bPriority = priorityOrder[b.priority];
                                
                                if (aPriority !== bPriority) {
                                  return aPriority - bPriority;
                                }
                                
                                return b.timestamp.getTime() - a.timestamp.getTime();
                              })
                              .slice(0, 10) // Latest 10 unacknowledged alerts
  };
}

export default useBiometricStreamController;
