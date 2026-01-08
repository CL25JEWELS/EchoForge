/**
 * Pad Component
 *
 * Individual pad button for triggering sounds
 */

import React, { useState } from 'react';
import { PadConfig, NoteState } from '../../types/audio.types';

export interface PadProps {
  config: PadConfig;
  state: NoteState;
  onTrigger: (id: string) => void;
  onStop: (id: string) => void;
  className?: string;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// Pads only need to re-render when their specific config or state changes.
// Previously, all pads re-rendered when any pad state changed in the parent grid.
export const Pad: React.FC<PadProps> = React.memo(
  ({ config, state, onTrigger, onStop, className = '' }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
      setIsPressed(true);
      // ⚡ Bolt: Pass ID to parent handler to avoid inline arrow functions in parent
      onTrigger(config.id);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
      if (config.playbackMode === 'sustained') {
        // ⚡ Bolt: Pass ID to parent handler
        onStop(config.id);
      }
    };

    const isPlaying = state === NoteState.PLAYING;
    const isEmpty = !config.soundId;

    const padClasses = [
      'pad',
      className,
      isPressed && 'pad--pressed',
      isPlaying && 'pad--playing',
      isEmpty && 'pad--empty'
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={padClasses}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={isEmpty}
        style={{
          opacity: config.volume,
          filter: `hue-rotate(${config.pitch * 10}deg)`
        }}
      >
        <div className="pad__content">
          {!isEmpty && (
            <>
              <div className="pad__indicator" />
              <div className="pad__label">{config.id}</div>
            </>
          )}
        </div>
      </button>
    );
  }
);

Pad.displayName = 'Pad';
