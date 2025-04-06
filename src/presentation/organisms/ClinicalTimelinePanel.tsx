/**
 * NOVAMIND Neural-Safe Organism Component
 * ClinicalTimelinePanel - Quantum-level temporal clinical data visualization
 * with HIPAA-compliant event tracking and neural correlations
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';

// UI components
// Correct import paths for Shadcn components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import named export from correct Shadcn path
import { Button } from '@/components/ui/button';
import { Badge } from '@presentation/atoms/Badge';
import Card from '@presentation/atoms/Card'; // Use default import
import { Separator } from '@/components/ui/separator'; // Correct import path
// Correct import path for Shadcn component
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Correct import path
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@presentation/atoms/Tooltip';

// Icons
import {
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  Pill,
  FileText,
  Brain,
  ListFilter,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';

// Services
import { clinicalService } from '@application/services/clinicalService';
import { temporalService } from '@application/services/temporal/temporal.service'; // Correct filename

// Domain types
import {
  ClinicalEvent,
  ClinicalEventType,
  TreatmentEvent,
  SymptomEvent,
  DiagnosisEvent,
  AssessmentEvent,
} from '@domain/types/clinical/events';
// import {
//   StateTransition, // Type missing
//   CriticalTransitionIndicator, // Type missing
// } from "@domain/types/temporal/dynamics";

// Timeline subcomponents
import { TimelineEvent } from '@presentation/molecules/TimelineEvent';
import { NeuralCorrelationBadge } from '@presentation/atoms/NeuralCorrelationBadge';

/**
 * Props with neural-safe typing
 */
interface ClinicalTimelinePanelProps {
  patientId: string;
  className?: string;
  initialTimeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  showFilters?: boolean;
  highlightTransitions?: boolean;
  compact?: boolean;
}

/**
 * Event type to color mapping with clinical precision
 */
const eventTypeColorMap: Record<ClinicalEventType, string> = {
  medication: 'border-blue-400 bg-blue-50',
  symptom: 'border-amber-400 bg-amber-50',
  diagnosis: 'border-purple-400 bg-purple-50',
  therapy: 'border-green-400 bg-green-50',
  assessment: 'border-indigo-400 bg-indigo-50',
  labResult: 'border-slate-400 bg-slate-50',
  hospitalVisit: 'border-red-400 bg-red-50',
  clinicVisit: 'border-teal-400 bg-teal-50',
  transition: 'border-pink-400 bg-pink-50',
};

/**
 * Event type to icon mapping
 */
const eventTypeIconMap: Record<ClinicalEventType, React.ReactNode> = {
  medication: <Pill className="h-4 w-4" />,
  symptom: <Activity className="h-4 w-4" />,
  diagnosis: <FileText className="h-4 w-4" />,
  therapy: <Brain className="h-4 w-4" />,
  assessment: <FileText className="h-4 w-4" />,
  labResult: <FileText className="h-4 w-4" />,
  hospitalVisit: <AlertTriangle className="h-4 w-4" />,
  clinicVisit: <Calendar className="h-4 w-4" />,
  transition: <ArrowRight className="h-4 w-4" />,
};

// ArrowRight component for the icon map
function ArrowRight(props: any) {
  return <ChevronRight {...props} />;
}

/**
 * Format date with clinical precision
 */
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time with clinical precision
 */
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Clinical Timeline Panel - Organism component for visualizing clinical events
 * with neuropsychiatric temporal analysis and neural correlations
 */
export const ClinicalTimelinePanel: React.FC<ClinicalTimelinePanelProps> = ({
  patientId,
  className = '',
  initialTimeRange = 'month',
  showFilters = true,
  highlightTransitions = true,
  compact = false,
}) => {
  // Timeline state
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>(
    initialTimeRange
  );
  const [filteredTypes, setFilteredTypes] = useState<ClinicalEventType[]>([]);
  // Use 'any' temporarily as ClinicalEvent type is missing
  const [events, setEvents] = useState<any[]>([]);
  // Use 'any' temporarily as StateTransition type is missing
  const [transitions, setTransitions] = useState<any[]>([]);
  // Use 'any' temporarily as ClinicalEvent type is missing
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('timeline');

  // Load timeline data
  // Temporarily comment out data fetching useEffect due to missing types/services
  // useEffect(() => {
  //   const loadTimelineData = async () => {
  //     try {
  //       setLoading(true);
  //       // ... (rest of fetching logic) ...
  //       // Fetch clinical events (service method missing)
  //       // const eventsResult = await clinicalService.getClinicalEvents(patientId, startDate);
  //       // if (eventsResult.success && eventsResult.data) { setEvents(eventsResult.data); } else { setError(...) }
  //
  //       // Fetch state transitions (service method missing)
  //       // if (highlightTransitions) {
  //       //   const transitionsResult = await temporalService.getStateTransitions(patientId, startDate);
  //       //   if (transitionsResult.success && transitionsResult.data) { setTransitions(transitionsResult.data); }
  //       // }
  //     } catch (err) { setError(...); console.error(err); }
  //     finally { setLoading(false); }
  //   };
  //   loadTimelineData();
  // }, [patientId, timeRange, highlightTransitions]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (filteredTypes.length === 0) {
      return events;
    }

    // Use 'any' for event type temporarily
    return events.filter((event: any) => filteredTypes.includes(event.type));
  }, [events, filteredTypes]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    // Use 'any' for event type temporarily
    const grouped: Record<string, any[]> = {};

    // Use 'any' for event type temporarily
    filteredEvents.forEach((event: any) => {
      const dateKey = formatDate(new Date(event.date));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each day by time
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return grouped;
  }, [filteredEvents]);

  // Get sorted dates for the timeline
  const sortedDates = useMemo(() => {
    return Object.keys(eventsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [eventsByDate]);

  // Handle filter change
  const toggleEventTypeFilter = useCallback((type: ClinicalEventType) => {
    setFilteredTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value as any);
  }, []);

  // Handle event selection
  const handleEventClick = useCallback(
    // Use 'any' for event type temporarily
    (event: any) => {
      setSelectedEvent(event === selectedEvent ? null : event);
    },
    [selectedEvent]
  );

  // Check if a date has transitions
  // Temporarily comment out transition logic due to missing types
  const hasTransitionOnDate = useCallback(
    (dateStr: string) => {
      // const date = new Date(dateStr);
      // const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // return transitions.some((transition: any) => { // Use 'any' temporarily
      //   const transitionDate = new Date(transition.timestamp);
      //   const transitionDateOnly = new Date(transitionDate.getFullYear(), transitionDate.getMonth(), transitionDate.getDate());
      //   return transitionDateOnly.getTime() === dateOnly.getTime();
      // });
      return false; // Default to false for now
    },
    [transitions] // Keep dependency array, though transitions is currently always []
  );

  // Render loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <div className="text-slate-600 text-sm">Loading clinical timeline...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Card className="max-w-md p-6 bg-red-50 border-red-200">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Timeline</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
          Clinical Timeline
        </h2>

        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="quarter">Past Quarter</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
            <SelectItem value="all">All History</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-700 flex items-center">
              <ListFilter className="h-4 w-4 mr-1 text-slate-500" />
              Filter Events
            </h3>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-slate-600"
              onClick={() => setFilteredTypes([])}
            >
              Clear Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.entries(eventTypeIconMap).map(([type, icon]) => (
              <Button
                key={type}
                variant={filteredTypes.includes(type as ClinicalEventType) ? 'default' : 'outline'}
                size="sm"
                className={`text-xs h-7 ${
                  filteredTypes.includes(type as ClinicalEventType)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700'
                }`}
                onClick={() => toggleEventTypeFilter(type as ClinicalEventType)}
              >
                <span className="mr-1">{icon}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-slate-600 font-medium mb-1">No events found</h3>
          <p className="text-slate-500 text-sm">
            {filteredTypes.length > 0
              ? 'Try adjusting your filters or time range'
              : 'No clinical events recorded in the selected time range'}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {sortedDates.map((dateStr) => (
              <div key={dateStr} className="relative">
                <div className="flex items-center mb-2">
                  <div
                    className={`flex-shrink-0 w-3 h-3 rounded-full ${
                      hasTransitionOnDate(dateStr) ? 'bg-pink-500' : 'bg-slate-400'
                    }`}
                  />
                  <h3 className="text-sm font-medium text-slate-700 ml-2">{dateStr}</h3>

                  {hasTransitionOnDate(dateStr) && (
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs py-0 border-pink-400 text-pink-700 bg-pink-50"
                    >
                      Transition Day
                    </Badge>
                  )}
                </div>

                <div className="ml-1.5 pl-4 border-l-2 border-slate-200 space-y-3">
                  {eventsByDate[dateStr].map((event, index) => (
                    <TimelineEvent
                      key={`${event.id}-${index}`}
                      event={event}
                      isSelected={selectedEvent?.id === event.id}
                      onClick={() => handleEventClick(event)}
                      colorClass={eventTypeColorMap[event.type]}
                      icon={eventTypeIconMap[event.type]}
                      showTime={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ClinicalTimelinePanel;
