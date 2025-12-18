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
  onPadConfigChange: (padId: string, config: Partial<PadConfig>) => void;
  columns?: number;
  className?: string;
}

export const PadGrid: React.FC<PadGridProps> = ({
  pads,
  padStates,
  onPadTrigger,
  onPadStop,
  onPadConfigChange,
  columns = 4,
  className = ''
}) => {
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
      {pads.map(pad => (
        <Pad
          key={pad.id}
          config={pad}
          state={padStates.get(pad.id) || NoteState.IDLE}
          onTrigger={() => onPadTrigger(pad.id)}
          onStop={() => onPadStop(pad.id)}
          onConfigChange={config => onPadConfigChange(pad.id, config)}
        />
      ))}
    </div>
  );
};
