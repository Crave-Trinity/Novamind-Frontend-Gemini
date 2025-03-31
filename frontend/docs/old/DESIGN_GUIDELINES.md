# Novamind Digital Twin Design Guidelines

## Overview

This document outlines the design principles, style guidelines, and UX patterns for the Novamind Digital Twin frontend. The design system prioritizes a sleek, premium experience while maintaining clinical precision and HIPAA compliance.

## Design Philosophy

### Core Principles

1. **Premium Experience**
   - Every interaction reflects the concierge nature of the service
   - Polished animations with appropriate timing
   - Thoughtful microinteractions that enhance usability

2. **Clinical Precision**
   - Data visualization prioritizes accuracy and clarity
   - Confidence intervals clearly displayed
   - Clear visual hierarchy for clinical information

3. **Cognitive Efficiency**
   - Reduce cognitive load through progressive disclosure
   - Minimize steps for common tasks
   - Consistent patterns across the application

4. **HIPAA-Compliant Design**
   - Privacy-first information architecture
   - Clear data protection indicators
   - Automatic inactivity timeouts with elegant re-authentication

## Design System

### Color Palette

#### Primary Palette (Sleek Dark Theme)
- **Background**: `#121212` - Deep space black
- **Surface**: `#1E1E1E` - Elevated surface
- **Primary**: `#6E64F0` - Rich indigo
- **Secondary**: `#3CCFCF` - Bright teal
- **Accent**: `#F06464` - Clinical accent red

#### Functional Colors
- **Success**: `#4CAF50` - Forest green
- **Warning**: `#FF9800` - Amber orange
- **Error**: `#F44336` - Bright red
- **Info**: `#2196F3` - Blue
- **Neutral**: `#9E9E9E` - Gray

#### Clinical Risk Indicators
- **Low Risk**: `#4CAF50` - Green
- **Moderate Risk**: `#FF9800` - Orange
- **High Risk**: `#F44336` - Red
- **Severe Risk**: `#D32F2F` - Deep red
- **Unknown**: `#9E9E9E` - Gray

### Typography

#### Font Family
- **Primary**: `Inter` - Clean, modern sans-serif
- **Monospace**: `JetBrains Mono` - For medical codes and technical data

#### Font Sizes
- **Display**: 36px / 2.25rem
- **Heading 1**: 28px / 1.75rem
- **Heading 2**: 24px / 1.5rem
- **Heading 3**: 20px / 1.25rem
- **Body**: 16px / 1rem
- **Small**: 14px / 0.875rem
- **Micro**: 12px / 0.75rem

#### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Spacing System

Based on a 4px grid:
- **xs**: 4px / 0.25rem
- **sm**: 8px / 0.5rem  
- **md**: 16px / 1rem
- **lg**: 24px / 1.5rem
- **xl**: 32px / 2rem
- **2xl**: 48px / 3rem
- **3xl**: 64px / 4rem

### Shadows & Elevation

#### Elevation Levels
- **Level 0**: No shadow (flat)
- **Level 1**: `0 2px 4px rgba(0, 0, 0, 0.2)` (subtle)
- **Level 2**: `0 4px 8px rgba(0, 0, 0, 0.2)` (moderate)
- **Level 3**: `0 8px 16px rgba(0, 0, 0, 0.2)` (pronounced)
- **Level 4**: `0 16px 24px rgba(0, 0, 0, 0.2)` (dramatic)

#### Glow Effects
- **Data Focus**: `0 0 15px rgba(60, 207, 207, 0.4)` - Teal glow
- **Warning**: `0 0 15px rgba(255, 152, 0, 0.4)` - Orange glow
- **Alert**: `0 0 15px rgba(244, 67, 54, 0.4)` - Red glow

### Border Radius
- **None**: 0
- **Small**: 4px / 0.25rem
- **Medium**: 8px / 0.5rem
- **Large**: 12px / 0.75rem
- **XL**: 16px / 1rem
- **Circular**: 50%

## Component Guidelines

### Data Visualization

#### Brain Visualization
- Use THREE.js with WebGL renderer for complex visualizations
- Implement bloom effect for neural connections
- Use instanced rendering for nodes
- Color-code regions based on activity levels
- Provide interactive tooltips on hover

```jsx
// Brain Visualization Component Example
<BrainVisualization
  regions={brainData.regions}
  connections={brainData.connections}
  activeRegions={activeRegions}
  highlightStrength={0.8}
  rotationSpeed={0.001}
  showLabels={true}
  interactionMode="orbit"
/>
```

#### Time Series Charts
- Use D3.js for high-performance rendering
- Always include confidence intervals where applicable
- Use gradient opacity for prediction ranges
- Implement smooth transitions for updates
- Support touch and mouse interactions
- Include clear reference points (baseline, thresholds)

```jsx
// Time Series Chart Example
<TimeSeriesChart
  data={patientData.symptomProgression}
  metric="phq9Score"
  showConfidenceInterval={true}
  baseline={9}
  thresholds={[5, 10, 15, 20]}
  predictedRangeOpacity={0.3}
  height={300}
/>
```

#### Risk Visualizations
- Use radar charts for multi-factor risk assessment
- Implement clear visual indicators for risk levels
- Include historical trend indicators
- Ensure accessibility with patterns in addition to colors
- Provide numerical values alongside visual indicators

```jsx
// Risk Assessment Component Example
<RiskAssessment
  patientId={patientId}
  riskFactors={riskFactors}
  assessmentDate={latestAssessment.date}
  historicalTrend={historicalTrend}
  confidenceLevel={0.85}
  showFactorBreakdown={true}
/>
```

### Clinical Interface Components

#### Patient Timeline
- Implement horizontal scrolling timeline
- Use consistent iconography for event types
- Group related events visually
- Provide clear date/time indicators
- Allow filtering by event type

```jsx
// Patient Timeline Example
<PatientTimeline
  patientId={patientId}
  events={clinicalEvents}
  startDate={startDate}
  endDate={endDate}
  highlightedEventTypes={['medication', 'assessment']}
  density="compact"
/>
```

#### Treatment Response Simulator
- Clear input controls with appropriate constraints
- Real-time updates for simulation parameters
- Parallel outcome visualizations
- Confidence intervals displayed prominently
- Interactive "what-if" scenario exploration

```jsx
// Treatment Simulator Example
<TreatmentSimulator
  patientId={patientId}
  baselineMeasurements={baselineData}
  treatmentOptions={availableTreatments}
  predictionTimeframe={12} // weeks
  comparisonMode="parallel"
  showConfidenceIntervals={true}
/>
```

#### Alert System
- Consistent color-coding for priority levels
- Non-intrusive notifications for routine alerts
- Modal interruption only for critical alerts
- Clear actions for each alert type
- Grouping of related alerts

```jsx
// Alert Component Example
<ClinicalAlert
  type="warning"
  message="Patient reported medication side effect"
  patientId={patientId}
  timestamp={new Date()}
  actions={[
    { label: 'Review', action: handleReview },
    { label: 'Dismiss', action: handleDismiss }
  ]}
  autoDisappear={false}
/>
```

## Interaction Patterns

### Loading States
- Skeleton screens instead of spinners where possible
- Branded loading animations for longer waits
- Clear progress indicators for multi-step processes
- Background loading for non-critical data

```jsx
// Skeleton Loading Example
<SkeletonLoader
  type="dashboard"
  itemCount={3}
  animate={true}
  preserveAspectRatio={true}
/>
```

### Empty States
- Contextual guidance in empty states
- Actionable empty states where appropriate
- Consistent visual language
- Clear next steps for users

```jsx
// Empty State Example
<EmptyState
  title="No assessments found"
  description="Create a new assessment to track patient progress"
  icon={<AssessmentIcon size="large" />}
  action={{
    label: "Create Assessment",
    onClick: handleCreateAssessment
  }}
/>
```

### Error Handling
- Contextual error messages
- Clear recovery paths
- Non-technical language
- Appropriate tone for clinical setting

```jsx
// Error Component Example
<ErrorDisplay
  title="Unable to load patient data"
  message="The secure connection to the patient database could not be established."
  severity="warning"
  retryAction={handleRetry}
  alternateAction={{
    label: "View cached data",
    onClick: handleViewCached
  }}
/>
```

## Responsive Design Guidelines

### Breakpoints
- **Mobile**: 0-639px
- **Tablet**: 640-1023px
- **Desktop**: 1024-1279px
- **Large Desktop**: 1280px+
- **Clinical Workstation**: 1600px+

### Adaptive Components
- Visualization components must adapt to available space
- Consider touch targets on mobile/tablet (min 44x44px)
- Rearrange complex dashboards for smaller screens
- Maintain visual hierarchy across breakpoints

```jsx
// Responsive Component Example
<ResponsiveContainer
  mobileLayout="stacked"
  tabletLayout="sidebar"
  desktopLayout="dashboard"
  criticalContentFirst={true}
/>
```

## Accessibility Guidelines

### Color Contrast
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Don't rely solely on color to convey information

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts for power users

### Screen Reader Support
- Proper semantic HTML
- ARIA landmarks and labels
- Descriptive alt text for images
- Announcements for dynamic content changes

```jsx
// Accessible Component Example
<AccessibleChart
  data={chartData}
  ariaLabel="Patient symptom progression over time"
  includeDataTable={true}
  announceChanges={true}
  keyboardNavigable={true}
/>
```

## Implementation Examples

### Symptom Forecasting Component

```jsx
import React, { useState, useMemo } from 'react';
import { LineChart, Tooltip, Legend } from '../visualizations';
import { Card, Select, Toggle } from '../atoms';
import { useTheme } from '../../hooks/useTheme';

export const SymptomForecastingComponent = ({ patientData, timeframe = 30 }) => {
  const { theme } = useTheme();
  const [selectedSymptom, setSelectedSymptom] = useState('depression');
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  
  const chartData = useMemo(() => {
    // Process patient data for selected symptom and timeframe
    return processChartData(patientData, selectedSymptom, timeframe);
  }, [patientData, selectedSymptom, timeframe]);
  
  const themeColors = {
    'sleek-dark': {
      lineColor: '#6E64F0',
      confidenceAreaColor: 'rgba(110, 100, 240, 0.2)',
      gridColor: 'rgba(255, 255, 255, 0.1)',
      textColor: 'rgba(255, 255, 255, 0.87)'
    }
  };
  
  const colors = themeColors[theme];
  
  return (
    <Card 
      className="p-4 bg-surface rounded-lg shadow-md"
      title="Symptom Forecast"
      titleClassName="text-xl font-semibold mb-4"
    >
      <div className="flex justify-between mb-4">
        <Select
          label="Symptom"
          value={selectedSymptom}
          onChange={(e) => setSelectedSymptom(e.target.value)}
          options={[
            { value: 'depression', label: 'Depression (PHQ-9)' },
            { value: 'anxiety', label: 'Anxiety (GAD-7)' },
            { value: 'sleep', label: 'Sleep Quality' }
          ]}
        />
        <Toggle
          label="Show Confidence"
          checked={showConfidenceInterval}
          onChange={() => setShowConfidenceInterval(!showConfidenceInterval)}
        />
      </div>
      
      <LineChart
        data={chartData.data}
        xAxis={chartData.xAxis}
        yAxis={chartData.yAxis}
        lines={[
          {
            id: 'actual',
            name: 'Actual',
            color: colors.lineColor,
            width: 2
          },
          {
            id: 'forecast',
            name: 'Forecast',
            color: colors.lineColor,
            width: 2,
            dashed: true
          }
        ]}
        confidenceInterval={showConfidenceInterval ? {
          areaColor: colors.confidenceAreaColor,
          upperDataKey: 'upperBound',
          lowerDataKey: 'lowerBound'
        } : null}
        grid={{
          vertical: true,
          horizontal: true,
          color: colors.gridColor
        }}
        height={300}
        tooltip={{
          formatter: (value, name) => 
            `${name}: ${value} ${chartData.unit}`
        }}
        legend={{
          position: 'bottom',
          textColor: colors.textColor
        }}
      />
      
      <div className="mt-4 text-sm text-neutral-300">
        <p>
          <strong>Analysis:</strong> {chartData.analysis}
        </p>
        <p className="mt-2">
          <strong>Precision:</strong> ±{chartData.precision} {chartData.unit} (95% confidence)
        </p>
      </div>
    </Card>
  );
};
```

### Biometric Alert Component

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { AlertIcon, DismissIcon } from '../icons';
import { formatDistanceToNow } from 'date-fns';

const alertVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 100 }
};

const priorityColors = {
  urgent: 'bg-error text-white',
  warning: 'bg-warning text-gray-900',
  info: 'bg-info text-white'
};

export const BiometricAlert = ({ 
  patientId,
  patientInitials,
  alertType,
  metric,
  value,
  threshold,
  timestamp,
  priority = 'info',
  onView,
  onDismiss
}) => {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  const priorityClass = priorityColors[priority] || priorityColors.info;
  
  return (
    <motion.div
      className={`flex items-center p-4 rounded-lg shadow-md ${priorityClass}`}
      variants={alertVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="flex-shrink-0 mr-4">
        <AlertIcon priority={priority} />
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between">
          <h4 className="font-medium">
            {alertType} Alert
          </h4>
          <span className="text-sm opacity-80">
            {timeAgo}
          </span>
        </div>
        
        <p className="mt-1">
          Patient <span className="font-semibold">{patientInitials}</span> - {metric}: {value} 
          {threshold && ` (Threshold: ${threshold})`}
        </p>
      </div>
      
      <div className="flex-shrink-0 ml-4 space-x-2">
        <button
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          onClick={() => onView(patientId)}
          aria-label="View details"
        >
          View
        </button>
        
        <button
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          onClick={() => onDismiss(patientId)}
          aria-label="Dismiss alert"
        >
          <DismissIcon size={16} />
        </button>
      </div>
    </motion.div>
  );
};
```

## Animation Guidelines

### Principles
- Animations should enhance usability, not distract
- Keep durations between 200-300ms for UI interactions
- Use easing functions appropriate to the action
- Ensure animations respect reduced motion preferences

### Timing
- **Micro-interactions**: 100-200ms
- **Transitions**: 200-300ms
- **Emphasis**: 300-500ms
- **Celebratory**: 500-1000ms

### Easing
- Entrance: `cubic-bezier(0.0, 0.0, 0.2, 1)` (Material easeOut)
- Exit: `cubic-bezier(0.4, 0.0, 1, 1)` (Material easeIn)
- Standard: `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material standard)

## Conclusion

These design guidelines establish the foundation for creating a premium, HIPAA-compliant user interface for the Novamind Digital Twin. Following these principles will ensure consistency, usability, and clinical precision throughout the application.