/**
 * NOVAMIND Neural Test Framework
 * Quantum-precise component mocking with mathematical elegance
 */

import React from 'react';
import { vi } from 'vitest';

// Core neural mocks for all atomic components with clinical precision
const mockComponents = {
  // Atom components
  Button: ({
    children,
    onClick,
    className = '',
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button onClick={onClick} className={className} data-testid="mock-button">
      {children}
    </button>
  ),

  Card: ({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={`mock-card ${className}`} data-testid="mock-card">
      {children}
    </div>
  ),

  CardHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-card-header">{children}</div>
  ),

  CardTitle: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-card-title">{children}</div>
  ),

  CardDescription: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-card-description">{children}</div>
  ),

  CardContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-card-content">{children}</div>
  ),

  CardFooter: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-card-footer">{children}</div>
  ),

  Badge: ({
    children,
    variant = 'default',
    className = '',
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span className={`mock-badge-${variant} ${className}`} data-testid="mock-badge">
      {children}
    </span>
  ),

  Tooltip: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-tooltip">{children}</div>
  ),

  TooltipTrigger: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-tooltip-trigger">{children}</div>
  ),

  TooltipContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-tooltip-content">{children}</div>
  ),

  TooltipProvider: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-tooltip-provider">{children}</div>
  ),

  Tabs: ({ children }: React.PropsWithChildren) => <div data-testid="mock-tabs">{children}</div>,

  TabsList: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-tabs-list">{children}</div>
  ),

  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-tabs-trigger-${value}`}>{children}</div>
  ),

  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`mock-tabs-content-${value}`}>{children}</div>
  ),

  Progress: ({ value }: { value?: number | null }) => (
    <div data-testid="mock-progress" data-value={value ?? undefined}></div>
  ),

  ScrollArea: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-scroll-area">{children}</div>
  ),

  ScrollBar: ({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) => (
    <div data-testid={`mock-scroll-bar-${orientation}`}></div>
  ),

  // Neural visualization components
  Canvas: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-canvas">{children}</div>
  ),

  ThreeCanvas: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-three-canvas">{children}</div>
  ),

  RegionMesh: ({
    region,
    selected,
    onClick,
  }: {
    region: { id: string | number };
    selected?: boolean;
    onClick?: () => void;
  }) => (
    <div data-testid={`mock-region-${region.id}`} onClick={onClick}>
      {selected ? 'Selected' : 'Not Selected'}
    </div>
  ),

  ConnectionLine: ({
    source,
    target,
    strength,
  }: {
    source: string | number;
    target: string | number;
    strength?: number;
  }) => <div data-testid={`mock-connection-${source}-${target}`} data-strength={strength}></div>,

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
  BrowserRouter: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-browser-router">{children}</div>
  ),
  Routes: ({ children }: React.PropsWithChildren) => (
    <div data-testid="mock-routes">{children}</div>
  ),
  Route: ({ path, element }: { path: string; element: React.ReactNode }) => (
    <div data-testid={`mock-route-${path}`}>{element}</div>
  ),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
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
  QueryClientProvider: ({ children }: React.PropsWithChildren) => (
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

export { mockComponents, mockRouter, mockReactQuery, mockHooks };
