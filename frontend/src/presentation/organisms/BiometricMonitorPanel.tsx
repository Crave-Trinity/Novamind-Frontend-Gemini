/**
 * NOVAMIND Neural-Safe Organism Component
 * BiometricMonitorPanel - Quantum-level biometric data visualization
 * with clinical precision and HIPAA-compliant data handling
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Neural visualization coordinator
import { useVisualizationCoordinator } from '@application/coordinators/NeuralVisualizationCoordinator';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@presentation/atoms/Tabs';
import { Button } from '@presentation/atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@presentation/atoms/Tooltip';
import { Badge } from '@presentation/atoms/Badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@presentation/atoms/Card';
import { ScrollArea } from '@presentation/atoms/ScrollArea';
import { Progress } from '@presentation/atoms/Progress';

// Icons
import { 
  Activity, 
  AlertTriangle, 
  Minimize, 
  Bell,
  Heart,
  BellOff,
  Check,
  AlertCircle,
  Thermometer,
  Droplets,
  Lungs,
  Brain,
  Eye
} from 'lucide-react';

// Domain types
import { BiometricAlert, AlertPriority } from '@domain/types/biometric/streams';

/**
 * Props with neural-safe typing
 */
interface BiometricMonitorPanelProps {
  className?: string;
  compact?: boolean;
  maxAlerts?: number;
}

/**
 * Alert priority to color mapping with clinical precision
 */
const alertPriorityColorMap: Record<AlertPriority, { bg: string; text: string; border: string }> = {
  'urgent': { 
    bg: 'bg-red-900/60', 
    text: 'text-red-100',
    border: 'border-red-700'
  },
  'warning': { 
    bg: 'bg-amber-900/60', 
    text: 'text-amber-100',
    border: 'border-amber-700'
  },
  'informational': { 
    bg: 'bg-slate-700/60', 
    text: 'text-slate-100',
    border: 'border-slate-600'
  }
};

/**
 * Biometric type to icon mapping
 */
const biometricTypeIconMap: Record<string, React.ReactNode> = {
  'heartRate': <Heart className="h-4 w-4" />,
  'bloodPressureSystolic': <Activity className="h-4 w-4" />,
  'bloodPressureDiastolic': <Activity className="h-4 w-4" />,
  'bloodGlucose': <Droplets className="h-4 w-4" />,
  'oxygenSaturation': <Lungs className="h-4 w-4" />,
  'respiratoryRate': <Lungs className="h-4 w-4" />,
  'bodyTemperature': <Thermometer className="h-4 w-4" />,
  'eegThetaPower': <Brain className="h-4 w-4" />,
  'pupilDilation': <Eye className="h-4 w-4" />
};

/**
 * Get default icon for biometric type
 */
const getIconForBiometricType = (type: string) => {
  return biometricTypeIconMap[type] || <Activity className="h-4 w-4" />;
};

/**
 * BiometricMonitorPanel - Organism component for monitoring biometric data
 * with clinical precision and HIPAA-compliant visualization
 */
export const BiometricMonitorPanel: React.FC<BiometricMonitorPanelProps> = ({
  className = '',
  compact = false,
  maxAlerts = 5
}) => {
  // Access visualization coordinator
  const { state, acknowledgeAlert } = useVisualizationCoordinator();
  
  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState('alerts');
  
  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  // Handle acknowledge alert
  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    acknowledgeAlert(alertId);
  }, [acknowledgeAlert]);
  
  // Process alerts for visualization
  const alertMetrics = useMemo(() => {
    // Get unacknowledged alerts
    const unacknowledgedAlerts = state.biometricAlerts
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        // Sort by priority then timestamp
        const priorityOrder: Record<AlertPriority, number> = {
          'urgent': 0,
          'warning': 1,
          'informational': 2
        };
        
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Most recent alerts first
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, maxAlerts);
    
    // Count alerts by priority
    const countsByPriority: Record<AlertPriority, number> = {
      'urgent': 0,
      'warning': 0,
      'informational': 0
    };
    
    state.biometricAlerts
      .filter(alert => !alert.acknowledged)
      .forEach(alert => {
        countsByPriority[alert.priority]++;
      });
    
    // Count alerts by biometric type
    const countsByType: Record<string, number> = {};
    
    state.biometricAlerts
      .filter(alert => !alert.acknowledged)
      .forEach(alert => {
        const type = alert.biometricType;
        countsByType[type] = (countsByType[type] || 0) + 1;
      });
    
    // Get top alert types
    const topAlertTypes = Object.entries(countsByType)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
    
    return {
      unacknowledgedAlerts,
      countsByPriority,
      countsByType,
      topAlertTypes,
      totalAlerts: state.biometricAlerts.length,
      totalUnacknowledged: unacknowledgedAlerts.length
    };
  }, [state.biometricAlerts, maxAlerts]);
  
  // Get alert badge variant based on counts
  const alertBadgeVariant = useMemo(() => {
    if (alertMetrics.countsByPriority.urgent > 0) return 'destructive';
    if (alertMetrics.countsByPriority.warning > 0) return 'warning';
    return 'secondary';
  }, [alertMetrics.countsByPriority]);
  
  // Format timestamp to readable time
  const formatTimestamp = useCallback((timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);
  
  // Format alert message with clinical precision
  const formatAlertValue = useCallback((alert: BiometricAlert) => {
    // Add units based on biometric type
    const units: Record<string, string> = {
      'heartRate': ' bpm',
      'bloodPressureSystolic': ' mmHg',
      'bloodPressureDiastolic': ' mmHg',
      'bloodGlucose': ' mg/dL',
      'oxygenSaturation': '%',
      'respiratoryRate': ' bpm',
      'bodyTemperature': '°C',
      'eegThetaPower': ' μV²',
      'pupilDilation': ' mm'
    };
    
    const unit = units[alert.biometricType] || '';
    return `${alert.value.toFixed(1)}${unit}`;
  }, []);
  
  // Main panel UI
  if (!expanded) {
    // Collapsed state - show alert indicator
    return (
      <motion.div
        className={`flex flex-col items-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={alertBadgeVariant} 
                size="icon" 
                className="rounded-full bg-slate-800/90 hover:bg-slate-700/90 relative"
                onClick={toggleExpanded}
              >
                <Bell className="h-5 w-5" />
                {alertMetrics.totalUnacknowledged > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alertMetrics.totalUnacknowledged}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {alertMetrics.totalUnacknowledged > 0 
                  ? `${alertMetrics.totalUnacknowledged} unacknowledged alerts`
                  : 'No active alerts'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }
  
  // Expanded state - full alert panel
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-[320px] bg-slate-800/90 backdrop-blur-md text-white border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Biometric Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={toggleExpanded}
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-slate-400">
            {alertMetrics.totalUnacknowledged > 0 
              ? `${alertMetrics.totalUnacknowledged} unacknowledged alerts`
              : 'No active alerts'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 bg-slate-700/50">
              <TabsTrigger value="alerts" className="data-[state=active]:bg-indigo-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-indigo-600">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="mt-0">
              <div className="space-y-4">
                {/* Alert Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Alert Summary</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-900/40 rounded-md p-2 text-center border border-red-800/50">
                      <div className="text-xs text-red-200 mb-1">Urgent</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.urgent}
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/40 rounded-md p-2 text-center border border-amber-800/50">
                      <div className="text-xs text-amber-200 mb-1">Warning</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.warning}
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/40 rounded-md p-2 text-center border border-slate-700/50">
                      <div className="text-xs text-slate-300 mb-1">Info</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.informational}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Active Alerts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Active Alerts</h3>
                  
                  <div className="rounded-md">
                    {alertMetrics.unacknowledgedAlerts.length > 0 ? (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 p-0.5">
                          {alertMetrics.unacknowledgedAlerts.map(alert => {
                            const { bg, text, border } = alertPriorityColorMap[alert.priority];
                            
                            return (
                              <div 
                                key={alert.id} 
                                className={`${bg} ${text} rounded-md p-2 border ${border} relative`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    {alert.priority === 'urgent' && <AlertCircle className="h-4 w-4 text-red-400 mr-1" />}
                                    {alert.priority === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 mr-1" />}
                                    <span className="text-xs font-medium">
                                      {alert.biometricType}
                                    </span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs py-0 border-${alert.priority === 'urgent' ? 'red' : alert.priority === 'warning' ? 'amber' : 'slate'}-600`}
                                  >
                                    {alert.priority}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm font-medium mb-1">{alert.message}</div>
                                
                                <div className="flex items-center justify-between text-xs opacity-80">
                                  <span>{formatTimestamp(alert.timestamp)}</span>
                                  <span>{formatAlertValue(alert)}</span>
                                </div>
                                
                                <div className="mt-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-xs h-7 ${
                                      alert.priority === 'urgent'
                                        ? 'hover:bg-red-800/60'
                                        : alert.priority === 'warning'
                                        ? 'hover:bg-amber-800/60'
                                        : 'hover:bg-slate-600/60'
                                    }`}
                                    onClick={() => handleAcknowledgeAlert(alert.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Acknowledge
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="bg-slate-700/50 rounded-md p-4 text-center">
                        <BellOff className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <div className="text-sm text-slate-400">No active alerts</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="monitoring" className="mt-0">
              <div className="space-y-4">
                {/* Top Alert Sources */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Top Alert Sources</h3>
                  
                  <div className="bg-slate-700/50 rounded-md p-3">
                    {alertMetrics.topAlertTypes.length > 0 ? (
                      <div className="space-y-3">
                        {alertMetrics.topAlertTypes.map(({ type, count }) => (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {getIconForBiometricType(type)}
                                <span className="text-xs text-white ml-2">{type}</span>
                              </div>
                              <span className="text-xs text-white">{count}</span>
                            </div>
                            <Progress 
                              value={(count / alertMetrics.totalUnacknowledged) * 100} 
                              className="h-1 bg-slate-700"
                              indicatorClassName="bg-indigo-600"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">
                        No alert sources to display
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Connected Devices */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Connected Devices</h3>
                  
                  <div className="bg-slate-700/50 rounded-md p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-green-400 mr-2" />
                          <span className="text-xs text-white">Cardiac Monitor</span>
                        </div>
                        <Badge variant="outline" className="bg-green-900/50 text-xs py-0">Connected</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 text-green-400 mr-2" />
                          <span className="text-xs text-white">EEG Headset</span>
                        </div>
                        <Badge variant="outline" className="bg-green-900/50 text-xs py-0">Connected</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Droplets className="h-4 w-4 text-green-400 mr-2" />
                          <span className="text-xs text-white">Blood Glucose Monitor</span>
                        </div>
                        <Badge variant="outline" className="bg-green-900/50 text-xs py-0">Connected</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lungs className="h-4 w-4 text-amber-400 mr-2" />
                          <span className="text-xs text-white">Respiratory Monitor</span>
                        </div>
                        <Badge variant="outline" className="bg-amber-900/50 text-xs py-0">Intermittent</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Data Quality */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Data Quality</h3>
                  
                  <div className="bg-slate-700/50 rounded-md p-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Signal Quality</span>
                        <span className="text-xs text-white">92%</span>
                      </div>
                      <Progress 
                        value={92} 
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-green-600"
                      />
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Data Completeness</span>
                        <span className="text-xs text-white">97%</span>
                      </div>
                      <Progress 
                        value={97} 
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-green-600"
                      />
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Update Frequency</span>
                        <span className="text-xs text-white">High</span>
                      </div>
                      <Progress 
                        value={95} 
                        className="h-1 bg-slate-700"
                        indicatorClassName="bg-green-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between">
          <div className="text-xs text-slate-400">
            {state.isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Monitoring...
              </span>
            ) : (
              <span>
                Real-time monitoring active
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BiometricMonitorPanel;
