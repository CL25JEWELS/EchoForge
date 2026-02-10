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
  onTrigger: (padId: string) => void;
  onStop: (padId: string) => void;
  className?: string;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// The parent (PadGrid) renders many of these.
// onTrigger and onStop are expected to be stable references from the parent.
export const Pad: React.FC<PadProps> = React.memo(
  ({ config, state, onTrigger, onStop, className = '' }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
      console.log('[Pad] Clicked:', config.id);
      setIsPressed(true);
      onTrigger(config.id);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
      if (config.playbackMode === 'sustained') {
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
