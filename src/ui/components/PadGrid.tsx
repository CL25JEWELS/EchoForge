/**
 * Pad Grid Component
 *
 * Grid layout of pads for the main interface
 */

/**
 * Pad Grid Component
 *
 * Grid layout of pads for the main interface
 */

import React, { useMemo } from 'react';
import { PadWrapper } from './PadWrapper';
import { PadConfig, NoteState } from '../../types/audio.types';

export interface PadGridProps {
  pads: PadConfig[];
  padStates: Map<string, NoteState>;
  onPadTrigger: (padId: string) => void;
  onPadStop: (padId: string) => void;
  onPadConfigChange?: (padId: string, config: Partial<PadConfig>) => void;
  columns?: number;
  className?: string;
}

// ⚡ Bolt: Using React.memo to prevent unnecessary re-renders of the entire grid
// When the parent component re-renders, PadGrid will only re-render if its props have changed.
// This is a significant performance improvement, especially for large grids or frequent parent updates.
export const PadGrid: React.FC<PadGridProps> = React.memo(
  ({ pads, padStates, onPadTrigger, onPadStop, columns = 4, className = '' }) => {
    // ⚡ Bolt: Memoize the style object to prevent re-creating it on every render.
    // This is a common React performance optimization that avoids unnecessary style recalculations
    // and ensures that the child DOM element receives a stable `style` prop reference.
    const gridStyle = useMemo(
      () => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
        padding: '1rem'
      }),
      [columns]
    );

    return (
      <div className={`pad-grid ${className}`} style={gridStyle}>
        {/* ⚡ Bolt: Render PadWrapper instead of Pad directly.
            This leverages the custom memoization in PadWrapper, ensuring that only
            the pads whose state has actually changed will re-render. This is the
            key to preventing the entire grid from re-rendering on every tick. */}
        {pads.map((pad) => (
          <PadWrapper
            key={pad.id}
            config={pad}
            state={padStates.get(pad.id) || NoteState.IDLE}
            onTrigger={onPadTrigger}
            onStop={onPadStop}
          />
        ))}
      </div>
    );
  }
);

PadGrid.displayName = 'PadGrid';
