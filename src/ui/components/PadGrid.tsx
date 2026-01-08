/**
 * Pad Grid Component
 *
 * Grid layout of pads for the main interface
 */

import React from 'react';
import { Pad } from './Pad';
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
    return (
      <div
        className={`pad-grid ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
          padding: '1rem'
        }}
      >
        {pads.map((pad) => (
          <Pad
            key={pad.id}
            config={pad}
            state={padStates.get(pad.id) || NoteState.IDLE}
            // ⚡ Bolt: Passing stable function references from props.
            // Since Pad is memoized and accepts the ID in the callback,
            // we avoid inline arrow functions here, preventing unnecessary re-renders.
            onTrigger={onPadTrigger}
            onStop={onPadStop}
          />
        ))}
      </div>
    );
  }
);

PadGrid.displayName = 'PadGrid';
