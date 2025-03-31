/**
 * NOVAMIND Neural-Safe Molecular Component
 * TimelineEvent - Quantum-level clinical event visualization
 * with HIPAA-compliant data presentation
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// UI components
import { Badge } from '@presentation/atoms/Badge';
import { Button } from '@presentation/atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@presentation/atoms/Tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@presentation/atoms/Collapsible';
import { Card } from '@presentation/atoms/Card';

// Icons
import { 
  ChevronDown, 
  ChevronRight,
  Clock,
  Brain,
  Activity
} from 'lucide-react';

// Domain types
import { 
  ClinicalEvent,
  ClinicalEventType,
  TreatmentEvent,
  SymptomEvent,
  DiagnosisEvent,
  AssessmentEvent
} from '@domain/types/clinical/events';

/**
 * Props with neural-safe typing
 */
interface TimelineEventProps {
  event: ClinicalEvent;
  isSelected: boolean;
  onClick: () => void;
  showTime?: boolean;
  showNeuralCorrelation?: boolean;
  colorClass?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Format time with clinical precision
 */
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * TimelineEvent - Molecular component for visualizing clinical events
 * with HIPAA-compliant data presentation
 */
export const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  isSelected,
  onClick,
  showTime = true,
  showNeuralCorrelation = true,
  colorClass = 'border-slate-400 bg-slate-50',
  icon = null,
  className = ''
}) => {
  // Generate severity badge for symptoms
  const severityBadge = useMemo(() => {
    if (event.type === 'symptom') {
      const symptomEvent = event as SymptomEvent;
      
      const severityColor = 
        symptomEvent.severity === 'severe' ? 'bg-red-100 text-red-800 border-red-300' :
        symptomEvent.severity === 'moderate' ? 'bg-amber-100 text-amber-800 border-amber-300' :
        'bg-blue-100 text-blue-800 border-blue-300';
      
      return (
        <Badge 
          variant="outline" 
          className={`text-xs ${severityColor}`}
        >
          {symptomEvent.severity}
        </Badge>
      );
    }
    
    if (event.type === 'medication') {
      const medicationEvent = event as TreatmentEvent;
      
      return (
        <Badge 
          variant="outline" 
          className="text-xs bg-blue-100 text-blue-800 border-blue-300"
        >
          {medicationEvent.dosage || 'Standard Dose'}
        </Badge>
      );
    }
    
    return null;
  }, [event]);
  
  // Generate neural correlation indicator
  const neuralCorrelation = useMemo(() => {
    if (!showNeuralCorrelation || !event.neuralCorrelation) return null;
    
    const strengthColor = 
      event.neuralCorrelation.strength > 0.7 ? 'text-green-600' :
      event.neuralCorrelation.strength > 0.4 ? 'text-amber-600' :
      'text-slate-600';
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Brain className={`h-4 w-4 ${strengthColor}`} />
              <span className={`ml-1 text-xs ${strengthColor}`}>
                {Math.round(event.neuralCorrelation.strength * 100)}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Neural correlation: {event.neuralCorrelation.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [event, showNeuralCorrelation]);
  
  // Generate detailed content based on event type
  const eventDetails = useMemo(() => {
    switch (event.type) {
      case 'symptom': {
        const symptomEvent = event as SymptomEvent;
        return (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Severity</span>
              <span className="text-xs font-medium">{symptomEvent.severity}</span>
            </div>
            
            {symptomEvent.duration && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Duration</span>
                <span className="text-xs font-medium">{symptomEvent.duration}</span>
              </div>
            )}
            
            {symptomEvent.triggers && symptomEvent.triggers.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Triggers</span>
                <div className="flex flex-wrap gap-1">
                  {symptomEvent.triggers.map((trigger, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {symptomEvent.regions && symptomEvent.regions.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Neural Regions</span>
                <div className="flex flex-wrap gap-1">
                  {symptomEvent.regions.map((region, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0 bg-indigo-50 border-indigo-300">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      case 'medication': {
        const medicationEvent = event as TreatmentEvent;
        return (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Dosage</span>
              <span className="text-xs font-medium">{medicationEvent.dosage || 'Standard'}</span>
            </div>
            
            {medicationEvent.frequency && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Frequency</span>
                <span className="text-xs font-medium">{medicationEvent.frequency}</span>
              </div>
            )}
            
            {medicationEvent.targetSymptoms && medicationEvent.targetSymptoms.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Target Symptoms</span>
                <div className="flex flex-wrap gap-1">
                  {medicationEvent.targetSymptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0 bg-amber-50 border-amber-300">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {medicationEvent.sideEffects && medicationEvent.sideEffects.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Side Effects</span>
                <div className="flex flex-wrap gap-1">
                  {medicationEvent.sideEffects.map((effect, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0 bg-red-50 border-red-300">
                      {effect}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      case 'diagnosis': {
        const diagnosisEvent = event as DiagnosisEvent;
        return (
          <div className="space-y-2 mt-2">
            {diagnosisEvent.code && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Code</span>
                <span className="text-xs font-medium">{diagnosisEvent.code}</span>
              </div>
            )}
            
            {diagnosisEvent.clinician && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Clinician</span>
                <span className="text-xs font-medium">{diagnosisEvent.clinician}</span>
              </div>
            )}
            
            {diagnosisEvent.relatedSymptoms && diagnosisEvent.relatedSymptoms.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Related Symptoms</span>
                <div className="flex flex-wrap gap-1">
                  {diagnosisEvent.relatedSymptoms.map((symptom, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0 bg-amber-50 border-amber-300">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      case 'assessment': {
        const assessmentEvent = event as AssessmentEvent;
        return (
          <div className="space-y-2 mt-2">
            {assessmentEvent.score !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Score</span>
                <span className="text-xs font-medium">{assessmentEvent.score}</span>
              </div>
            )}
            
            {assessmentEvent.clinician && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Clinician</span>
                <span className="text-xs font-medium">{assessmentEvent.clinician}</span>
              </div>
            )}
            
            {assessmentEvent.findings && assessmentEvent.findings.length > 0 && (
              <div>
                <span className="text-xs text-slate-500 block mb-1">Key Findings</span>
                <ul className="text-xs space-y-1 pl-3">
                  {assessmentEvent.findings.map((finding, i) => (
                    <li key={i} className="list-disc">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }
      
      default:
        return (
          <div className="space-y-2 mt-2">
            {event.details && (
              <p className="text-xs text-slate-600">{event.details}</p>
            )}
          </div>
        );
    }
  }, [event]);
  
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-md border ${colorClass} transition-all duration-200 ${
          isSelected ? 'ring-2 ring-indigo-500 ring-opacity-50' : 'hover:bg-opacity-80'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <div>
              <h4 className="text-sm font-medium">{event.title}</h4>
              
              {showTime && (
                <div className="flex items-center mt-0.5">
                  <Clock className="h-3 w-3 text-slate-500 mr-1" />
                  <span className="text-xs text-slate-500">
                    {formatTime(new Date(event.date))}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {severityBadge}
            {neuralCorrelation}
            <ChevronDown 
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                isSelected ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>
        
        {event.details && !isSelected && (
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            {event.details}
          </p>
        )}
      </button>
      
      {isSelected && (
        <div className="mt-2 px-3 py-2 rounded-md border border-slate-200 bg-white">
          {eventDetails}
          
          {event.neuralCorrelation && event.neuralCorrelation.regions && (
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="flex items-center mb-1">
                <Brain className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="text-xs font-medium text-indigo-700">Neural Correlation</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {event.neuralCorrelation.regions.map((region, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="text-xs py-0 bg-indigo-50 border-indigo-300 text-indigo-800"
                  >
                    {region}
                  </Badge>
                ))}
              </div>
              
              {event.neuralCorrelation.description && (
                <p className="text-xs text-slate-600 mt-1">
                  {event.neuralCorrelation.description}
                </p>
              )}
            </div>
          )}
          
          {event.actions && event.actions.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-200">
              <div className="flex justify-end space-x-2">
                {event.actions.map((action, i) => (
                  <Button 
                    key={i}
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TimelineEvent;
