/**
 * Pad Grid Component
 *
 * Grid layout of pads for the main interface
 */

import React from 'react';
import { Pad } from './Pad';
import { PadConfig, NoteState } from '../../types/audio.types';

// ⚡ Bolt: By creating a memoized wrapper for the Pad component, we can prevent
// individual pads from re-rendering when another pad's state changes.
// The custom comparison function ensures that a re-render only happens if the
// specific pad's state or config has changed.
interface PadWrapperProps {
  pad: PadConfig;
  padStates: Map<string, NoteState>;
  onTrigger: (padId: string) => void;
  onStop: (padId: string) => void;
}

const PadWrapper = React.memo<PadWrapperProps>(
  ({ pad, padStates, onTrigger, onStop }) => {
    return (
      <Pad
        config={pad}
        state={padStates.get(pad.id) || NoteState.IDLE}
        onTrigger={onTrigger}
        onStop={onStop}
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.pad !== nextProps.pad) {
      return false;
    }
    if (
      prevProps.onTrigger !== nextProps.onTrigger ||
      prevProps.onStop !== nextProps.onStop
    ) {
      return false;
    }
    const oldState = prevProps.padStates.get(prevProps.pad.id) || NoteState.IDLE;
    const newState = nextProps.padStates.get(nextProps.pad.id) || NoteState.IDLE;
    if (oldState !== newState) {
      return false;
    }
    return true;
  }
);
PadWrapper.displayName = 'PadWrapper';

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
          <PadWrapper
            key={pad.id}
            pad={pad}
            padStates={padStates}
            onTrigger={onPadTrigger}
            onStop={onPadStop}
          />
        ))}
      </div>
    );
  }
);

PadGrid.displayName = 'PadGrid';
