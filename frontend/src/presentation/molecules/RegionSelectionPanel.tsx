/**
 * NOVAMIND Neural Visualization
 * RegionSelectionPanel Molecular Component - interface for neural region selection
 * with clinical precision and anatomical organization
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrainRegion } from '@domain/types/brain/models';
import { SafeArray } from '@domain/types/common';

// Define neural-safe props
interface RegionSelectionPanelProps {
  regions: BrainRegion[];
  selectedRegionIds: string[];
  onRegionSelect: (regionId: string, selected: boolean) => void;
  onRegionSearch?: (query: string) => void;
  searchQuery?: string;
  anatomicalGrouping?: boolean;
  functionalGrouping?: boolean;
  maxHeight?: string;
  showActivity?: boolean;
  className?: string;
}

// Anatomical grouping categories
type AnatomicalGroup = 
  | 'frontal'
  | 'parietal'
  | 'temporal'
  | 'occipital'
  | 'subcortical'
  | 'cerebellum'
  | 'brainstem'
  | 'other';

// Functional grouping categories
type FunctionalGroup = 
  | 'motor'
  | 'sensory'
  | 'vision'
  | 'language'
  | 'memory'
  | 'emotion'
  | 'executive'
  | 'default_mode'
  | 'salience'
  | 'attention'
  | 'reward'
  | 'other';

/**
 * RegionSelectionPanel - Molecular component for region selection interface
 * Implements clinical precision for neuroanatomical organization and selection
 */
const RegionSelectionPanel: React.FC<RegionSelectionPanelProps> = ({
  regions,
  selectedRegionIds,
  onRegionSelect,
  onRegionSearch,
  searchQuery = '',
  anatomicalGrouping = true,
  functionalGrouping = false,
  maxHeight = '600px',
  showActivity = true,
  className = ''
}) => {
  // Local state with type safety
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'activity'>('name');
  
  // Safe array wrapper for null safety
  const safeRegions = new SafeArray(regions);
  const safeSelectedIds = new SafeArray(selectedRegionIds);
  
  // Update local search when external search changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // Filter and group regions based on search query and grouping preference
  const { groupedRegions, filteredCount, totalCount } = useMemo(() => {
    // First apply search filter
    let filtered = safeRegions;
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(region => 
        region.name.toLowerCase().includes(query)
      );
    }
    
    // Define the grouping function
    const getGroupKey = (region: BrainRegion): string => {
      if (functionalGrouping) {
        // In a real implementation, we would use region.functionalSystem
        // For now, use a simplified approach based on name
        const name = region.name.toLowerCase();
        if (name.includes('motor')) return 'motor';
        if (name.includes('sensory') || name.includes('somato')) return 'sensory';
        if (name.includes('visual') || name.includes('occipit')) return 'vision';
        if (name.includes('language') || name.includes('broca') || name.includes('wernicke')) return 'language';
        if (name.includes('memory') || name.includes('hippocamp')) return 'memory';
        if (name.includes('emotion') || name.includes('amygdala') || name.includes('limbic')) return 'emotion';
        if (name.includes('frontal') || name.includes('executive')) return 'executive';
        if (name.includes('default') || name.includes('dmpfc')) return 'default_mode';
        if (name.includes('salience') || name.includes('insula') || name.includes('anterior cingulate')) return 'salience';
        if (name.includes('attention') || name.includes('parietal')) return 'attention';
        if (name.includes('reward') || name.includes('nucleus accumbens') || name.includes('striatum')) return 'reward';
        return 'other';
      } else {
        // Default to anatomical grouping
        // In a real implementation, we would use region.anatomicalLocation
        // For now, use a simplified approach based on name
        const name = region.name.toLowerCase();
        if (name.includes('frontal')) return 'frontal';
        if (name.includes('parietal')) return 'parietal';
        if (name.includes('temporal')) return 'temporal';
        if (name.includes('occipit')) return 'occipital';
        if (name.includes('thalamus') || name.includes('basal') || name.includes('caudate') || name.includes('putamen')) return 'subcortical';
        if (name.includes('cerebell')) return 'cerebellum';
        if (name.includes('brainstem') || name.includes('pons') || name.includes('medulla')) return 'brainstem';
        return 'other';
      }
    };
    
    // Group the filtered regions
    const grouped: Record<string, BrainRegion[]> = {};
    filtered.forEach(region => {
      const groupKey = getGroupKey(region);
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(region);
    });
    
    // Sort each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (sortBy === 'activity') {
          return b.activityLevel - a.activityLevel;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
    });
    
    // Get counts for display
    const filteredCount = filtered.size();
    const totalCount = safeRegions.size();
    
    return { groupedRegions: grouped, filteredCount, totalCount };
  }, [safeRegions, localSearchQuery, anatomicalGrouping, functionalGrouping, sortBy]);
  
  // Initialize expanded groups on first render
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    Object.keys(groupedRegions).forEach(group => {
      // Default to expanded for search results or if there are only a few groups
      initialExpandedState[group] = !!localSearchQuery || Object.keys(groupedRegions).length <= 3;
    });
    setExpandedGroups(initialExpandedState);
  }, [functionalGrouping, anatomicalGrouping]);
  
  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    if (onRegionSearch) {
      onRegionSearch(query);
    }
  };
  
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    if (onRegionSearch) {
      onRegionSearch('');
    }
  };
  
  const handleRegionToggle = (regionId: string) => {
    const isSelected = safeSelectedIds.includes(regionId);
    onRegionSelect(regionId, !isSelected);
  };
  
  const handleGroupExpand = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };
  
  const handleSelectAll = (groupKey: string) => {
    const regionsInGroup = groupedRegions[groupKey] || [];
    // Select all unselected regions in this group
    regionsInGroup.forEach(region => {
      if (!safeSelectedIds.includes(region.id)) {
        onRegionSelect(region.id, true);
      }
    });
  };
  
  const handleDeselectAll = (groupKey: string) => {
    const regionsInGroup = groupedRegions[groupKey] || [];
    // Deselect all selected regions in this group
    regionsInGroup.forEach(region => {
      if (safeSelectedIds.includes(region.id)) {
        onRegionSelect(region.id, false);
      }
    });
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'activity');
  };
  
  // Panel header title based on grouping
  const getPanelTitle = () => {
    if (functionalGrouping) return 'Functional Systems';
    return 'Brain Regions';
  };
  
  // Render activity indicator with color scale
  const renderActivityIndicator = (activityLevel: number) => {
    let bgColor = 'bg-gray-300';
    if (activityLevel > 0.8) bgColor = 'bg-red-500';
    else if (activityLevel > 0.6) bgColor = 'bg-orange-500';
    else if (activityLevel > 0.4) bgColor = 'bg-yellow-500';
    else if (activityLevel > 0.2) bgColor = 'bg-green-500';
    
    return (
      <div className="w-2 h-2 rounded-full mr-1.5" style={{ 
        backgroundColor: bgColor,
        opacity: 0.3 + (activityLevel * 0.7)
      }} />
    );
  };
  
  // Render group name with proper formatting
  const formatGroupName = (groupKey: string): string => {
    return groupKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get group icon based on group key
  const getGroupIcon = (groupKey: string): string => {
    const iconMap: Record<string, string> = {
      // Anatomical
      frontal: '🧠',
      parietal: '🧠',
      temporal: '🧠',
      occipital: '🧠',
      subcortical: '🧠',
      cerebellum: '🧠',
      brainstem: '🧠',
      // Functional
      motor: '👋',
      sensory: '👁️',
      vision: '👁️',
      language: '💬',
      memory: '💾',
      emotion: '😊',
      executive: '⚙️',
      default_mode: '💭',
      salience: '❗',
      attention: '👀',
      reward: '🎯',
      // Default
      other: '📍'
    };
    
    return iconMap[groupKey] || '📍';
  };
  
  return (
    <div 
      className={`bg-black/40 backdrop-blur-sm rounded-lg p-3 w-64 ${className}`}
      style={{ maxHeight }}
    >
      <div className="mb-3">
        <h3 className="text-white text-sm font-medium mb-2">{getPanelTitle()}</h3>
        
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search regions..."
            className="w-full bg-black/30 text-white text-xs rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
          />
          {localSearchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Filter counts */}
        <div className="text-xs text-gray-400 mt-1">
          {filteredCount} of {totalCount} regions
          {localSearchQuery && ` matching "${localSearchQuery}"`}
        </div>
        
        {/* Sort options */}
        <div className="mt-2 flex items-center">
          <label htmlFor="sort-by" className="text-xs text-gray-400 mr-2">Sort:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={handleSortChange}
            className="bg-black/30 text-white text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="activity">Activity</option>
          </select>
        </div>
      </div>
      
      {/* Region groups */}
      <div className="space-y-2 max-h-[calc(100%-5rem)] overflow-y-auto pr-1">
        {Object.entries(groupedRegions).map(([groupKey, groupRegions]) => (
          <div key={groupKey} className="bg-black/20 rounded">
            {/* Group header */}
            <div
              className={`
                flex items-center justify-between p-2 rounded cursor-pointer
                ${expandedGroups[groupKey] ? 'rounded-b-none' : ''}
                hover:bg-black/40
              `}
              onClick={() => handleGroupExpand(groupKey)}
            >
              <div className="flex items-center">
                <span className="mr-1.5">{getGroupIcon(groupKey)}</span>
                <span className="text-white text-xs font-medium">
                  {formatGroupName(groupKey)} ({groupRegions.length})
                </span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll(groupKey);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 mr-2"
                >
                  All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselectAll(groupKey);
                  }}
                  className="text-xs text-gray-400 hover:text-white mr-2"
                >
                  None
                </button>
                <span className="text-gray-500">
                  {expandedGroups[groupKey] ? '▼' : '►'}
                </span>
              </div>
            </div>
            
            {/* Group regions */}
            {expandedGroups[groupKey] && (
              <div className="py-1 max-h-52 overflow-y-auto">
                {groupRegions.map(region => (
                  <div
                    key={region.id}
                    className={`
                      flex items-center px-3 py-1 text-xs cursor-pointer hover:bg-black/30
                      ${safeSelectedIds.includes(region.id) ? 'bg-blue-500/30' : ''}
                    `}
                    onClick={() => handleRegionToggle(region.id)}
                  >
                    <input
                      type="checkbox"
                      checked={safeSelectedIds.includes(region.id)}
                      onChange={() => {}} // Handled by div click
                      className="mr-2"
                    />
                    <div className="flex items-center flex-1 min-w-0">
                      {showActivity && renderActivityIndicator(region.activityLevel)}
                      <span className="truncate">{region.name}</span>
                    </div>
                    {showActivity && (
                      <span className="text-2xs text-gray-400 ml-1">
                        {Math.round(region.activityLevel * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Empty state */}
        {Object.keys(groupedRegions).length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-400 text-xs">No regions matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RegionSelectionPanel);
