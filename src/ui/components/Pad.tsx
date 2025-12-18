/**
 * Pad Component
 * 
 * Individual pad button for triggering sounds
 */

import React, { useState, useEffect } from 'react';
import { PadConfig, NoteState } from '../../types/audio.types';

export interface PadProps {
  config: PadConfig;
  state: NoteState;
  onTrigger: () => void;
  onStop: () => void;
  onConfigChange: (config: Partial<PadConfig>) => void;
  className?: string;
}

export const Pad: React.FC<PadProps> = ({
  config,
  state,
  onTrigger,
  onStop,
  onConfigChange,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
    onTrigger();
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    if (config.playbackMode === 'sustained') {
      onStop();
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
  ].filter(Boolean).join(' ');

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
};
