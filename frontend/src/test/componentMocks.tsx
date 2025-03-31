/**
 * NOVAMIND Neural Test Framework
 * Quantum-precise component mocking with mathematical elegance
 */

import React from 'react';
import { vi } from 'vitest';

// Core neural mocks for all atomic components with clinical precision
const mockComponents = {
  // Atom components
  Button: ({ children, onClick, className = '' }: any) => (
    <button onClick={onClick} className={className} data-testid="mock-button">
      {children}
    </button>
  ),
  
  Card: ({ children, className = '' }: any) => (
    <div className={`mock-card ${className}`} data-testid="mock-card">
      {children}
    </div>
  ),
  
  CardHeader: ({ children }: any) => (
    <div data-testid="mock-card-header">{children}</div>
  ),
  
  CardTitle: ({ children }: any) => (
    <div data-testid="mock-card-title">{children}</div>
  ),
  
  CardDescription: ({ children }: any) => (
    <div data-testid="mock-card-description">{children}</div>
  ),
  
  CardContent: ({ children }: any) => (
    <div data-testid="mock-card-content">{children}</div>
  ),
  
  CardFooter: ({ children }: any) => (
    <div data-testid="mock-card-footer">{children}</div>
  ),
  
  Badge: ({ children, variant = 'default', className = '' }: any) => (
    <span className={`mock-badge-${variant} ${className}`} data-testid="mock-badge">
      {children}
    </span>
  ),
  
  Tooltip: ({ children }: any) => (
    <div data-testid="mock-tooltip">{children}</div>
  ),
  
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="mock-tooltip-trigger">{children}</div>
  ),
  
  TooltipContent: ({ children }: any) => (
    <div data-testid="mock-tooltip-content">{children}</div>
  ),
  
  TooltipProvider: ({ children }: any) => (
    <div data-testid="mock-tooltip-provider">{children}</div>
  ),
  
  Tabs: ({ children }: any) => (
    <div data-testid="mock-tabs">{children}</div>
  ),
  
  TabsList: ({ children }: any) => (
    <div data-testid="mock-tabs-list">{children}</div>
  ),
  
  TabsTrigger: ({ children, value }: any) => (
    <div data-testid={`mock-tabs-trigger-${value}`}>{children}</div>
  ),
  
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`mock-tabs-content-${value}`}>{children}</div>
  ),
  
  Progress: ({ value }: any) => (
    <div data-testid="mock-progress" data-value={value}></div>
  ),
  
  ScrollArea: ({ children }: any) => (
    <div data-testid="mock-scroll-area">{children}</div>
  ),
  
  ScrollBar: ({ orientation = 'vertical' }: any) => (
    <div data-testid={`mock-scroll-bar-${orientation}`}></div>
  ),
  
  // Neural visualization components
  Canvas: ({ children }: any) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  
  ThreeCanvas: ({ children }: any) => (
    <div data-testid="mock-three-canvas">{children}</div>
  ),
  
  RegionMesh: ({ region, selected, onClick }: any) => (
    <div data-testid={`mock-region-${region.id}`} onClick={onClick}>
      {selected ? 'Selected' : 'Not Selected'}
    </div>
  ),
  
  ConnectionLine: ({ source, target, strength }: any) => (
    <div data-testid={`mock-connection-${source}-${target}`} data-strength={strength}></div>
  ),
  
  // Neural icons
  Brain: () => <div data-testid="mock-icon-brain">Brain Icon</div>,
  Activity: () => <div data-testid="mock-icon-activity">Activity Icon</div>,
  AlertCircle: () => <div data-testid="mock-icon-alert">Alert Icon</div>,
  Clock: () => <div data-testid="mock-icon-clock">Clock Icon</div>,
  ChevronDown: () => <div data-testid="mock-icon-chevron-down">Chevron Down Icon</div>,
  ChevronRight: () => <div data-testid="mock-icon-chevron-right">Chevron Right Icon</div>,
  Filter: () => <div data-testid="mock-icon-filter">Filter Icon</div>,
  Download: () => <div data-testid="mock-icon-download">Download Icon</div>,
  Zap: () => <div data-testid="mock-icon-zap">Zap Icon</div>,
  TrendingUp: () => <div data-testid="mock-icon-trending-up">Trending Up Icon</div>,
  TrendingDown: () => <div data-testid="mock-icon-trending-down">Trending Down Icon</div>,
  Pill: () => <div data-testid="mock-icon-pill">Pill Icon</div>,
  BarChart: () => <div data-testid="mock-icon-bar-chart">Bar Chart Icon</div>,
  Calendar: () => <div data-testid="mock-icon-calendar">Calendar Icon</div>,
};

// Neural-safe mocks for React Router
const mockRouter = {
  BrowserRouter: ({ children }: any) => <div data-testid="mock-browser-router">{children}</div>,
  Routes: ({ children }: any) => <div data-testid="mock-routes">{children}</div>,
  Route: ({ path, element }: any) => <div data-testid={`mock-route-${path}`}>{element}</div>,
  Link: ({ to, children }: any) => (
    <a href={to} data-testid={`mock-link-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'test-id' }),
  useLocation: () => ({ pathname: '/test-path' }),
};

// Neural-safe mocks for React Query
const mockReactQuery = {
  QueryClient: class {
    setDefaultOptions() {}
    invalidateQueries() {
      return Promise.resolve();
    }
    prefetchQuery() {
      return Promise.resolve();
    }
  },
  QueryClientProvider: ({ children }: any) => (
    <div data-testid="mock-query-client-provider">{children}</div>
  ),
  useQuery: () => ({
    data: { id: 'test-id', name: 'Test Data' },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMutation: () => ({
    mutate: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
};

// Neural-safe mocks for hooks
const mockHooks = {
  useEffect: React.useEffect,
  useState: React.useState,
  useContext: React.useContext,
  useRef: React.useRef,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useReducer: React.useReducer,
};

export {
  mockComponents,
  mockRouter,
  mockReactQuery,
  mockHooks
};
