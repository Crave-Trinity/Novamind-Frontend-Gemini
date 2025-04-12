/**
 * BrainModelProvider
 * 
 * Context provider for the brain model visualization, handling state management
 * for region selection, highlighting, and data visualization.
 */

import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { BrainRegionData } from '../../test/mocks/mockBrainData';

// State types
export interface BrainModelState {
  isLoading: boolean;
  error: string | null;
  selectedRegion: string | null;
  highlightedRegion: string | null;
  regionData: BrainRegionData | null;
  viewMode: 'anatomical' | 'functional' | 'connectivity';
  colormap: 'rainbow' | 'heatmap' | 'blueRed';
  dataRange: [number, number];
  cameraPosition: [number, number, number];
  isAnimating: boolean;
}

// Actions
type BrainModelAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_REGION'; payload: string | null }
  | { type: 'SET_HIGHLIGHTED_REGION'; payload: string | null }
  | { type: 'SET_REGION_DATA'; payload: BrainRegionData | null }
  | { type: 'SET_VIEW_MODE'; payload: 'anatomical' | 'functional' | 'connectivity' }
  | { type: 'SET_COLORMAP'; payload: 'rainbow' | 'heatmap' | 'blueRed' }
  | { type: 'SET_DATA_RANGE'; payload: [number, number] }
  | { type: 'SET_CAMERA_POSITION'; payload: [number, number, number] }
  | { type: 'SET_ANIMATING'; payload: boolean };

// Initial state
const initialState: BrainModelState = {
  isLoading: false,
  error: null,
  selectedRegion: null,
  highlightedRegion: null,
  regionData: null,
  viewMode: 'anatomical',
  colormap: 'rainbow',
  dataRange: [0, 100],
  cameraPosition: [0, 0, 5],
  isAnimating: false,
};

// Context
const BrainModelContext = createContext<{
  state: BrainModelState;
  selectRegion: (id: string | null) => void;
  highlightRegion: (id: string | null) => void;
  setViewMode: (mode: 'anatomical' | 'functional' | 'connectivity') => void;
  setColormap: (colormap: 'rainbow' | 'heatmap' | 'blueRed') => void;
  setCameraPosition: (position: [number, number, number]) => void;
  loadRegionData: (data: BrainRegionData) => void;
  resetView: () => void;
  toggleAnimation: () => void;
}>({
  state: initialState,
  selectRegion: () => {},
  highlightRegion: () => {},
  setViewMode: () => {},
  setColormap: () => {},
  setCameraPosition: () => {},
  loadRegionData: () => {},
  resetView: () => {},
  toggleAnimation: () => {},
});

// Reducer
function brainModelReducer(state: BrainModelState, action: BrainModelAction): BrainModelState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_REGION':
      return { ...state, selectedRegion: action.payload };
    case 'SET_HIGHLIGHTED_REGION':
      return { ...state, highlightedRegion: action.payload };
    case 'SET_REGION_DATA':
      return { ...state, regionData: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_COLORMAP':
      return { ...state, colormap: action.payload };
    case 'SET_DATA_RANGE':
      return { ...state, dataRange: action.payload };
    case 'SET_CAMERA_POSITION':
      return { ...state, cameraPosition: action.payload };
    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.payload };
    default:
      return state;
  }
}

// Provider component
export const BrainModelProvider: React.FC<{
  children: React.ReactNode;
  initialState?: Partial<BrainModelState>;
}> = ({ children, initialState: initialProps }) => {
  const [state, dispatch] = useReducer(
    brainModelReducer,
    { ...initialState, ...initialProps }
  );

  // API to expose for consuming components
  const selectRegion = (id: string | null) => {
    dispatch({ type: 'SET_SELECTED_REGION', payload: id });
  };

  const highlightRegion = (id: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED_REGION', payload: id });
  };

  const setViewMode = (mode: 'anatomical' | 'functional' | 'connectivity') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const setColormap = (colormap: 'rainbow' | 'heatmap' | 'blueRed') => {
    dispatch({ type: 'SET_COLORMAP', payload: colormap });
  };

  const setCameraPosition = (position: [number, number, number]) => {
    dispatch({ type: 'SET_CAMERA_POSITION', payload: position });
  };

  const loadRegionData = (data: BrainRegionData) => {
    dispatch({ type: 'SET_REGION_DATA', payload: data });
  };

  const resetView = () => {
    dispatch({ type: 'SET_CAMERA_POSITION', payload: [0, 0, 5] });
    dispatch({ type: 'SET_SELECTED_REGION', payload: null });
    dispatch({ type: 'SET_HIGHLIGHTED_REGION', payload: null });
  };

  const toggleAnimation = () => {
    dispatch({ type: 'SET_ANIMATING', payload: !state.isAnimating });
  };

  // If initial data is provided, load it
  useEffect(() => {
    if (initialProps?.regionData) {
      loadRegionData(initialProps.regionData);
    }
  }, [initialProps?.regionData]);

  return (
    <BrainModelContext.Provider
      value={{
        state,
        selectRegion,
        highlightRegion,
        setViewMode,
        setColormap,
        setCameraPosition,
        loadRegionData,
        resetView,
        toggleAnimation,
      }}
    >
      {children}
    </BrainModelContext.Provider>
  );
};

// Custom hook for using the brain model context
export const useBrainModel = () => {
  const context = useContext(BrainModelContext);
  if (!context) {
    throw new Error('useBrainModel must be used within a BrainModelProvider');
  }
  return {
    ...context.state,
    selectRegion: context.selectRegion,
    highlightRegion: context.highlightRegion,
    setViewMode: context.setViewMode,
    setColormap: context.setColormap,
    setCameraPosition: context.setCameraPosition,
    loadRegionData: context.loadRegionData,
    resetView: context.resetView,
    toggleAnimation: context.toggleAnimation,
  };
};