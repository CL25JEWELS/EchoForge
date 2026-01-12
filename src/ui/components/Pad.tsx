/**
 * Pad Component
 *
 * Individual pad button for triggering sounds
 */

import React, { useState } from 'react';
import { PadConfig, NoteState, SoundLoadingState } from '../../types/audio.types';

export interface PadProps {
  config: PadConfig;
  state: NoteState;
  loadingState?: SoundLoadingState;
  error?: string;
  onTrigger: (padId: string) => void;
  onStop: (padId: string) => void;
  className?: string;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// The parent (PadGrid) renders many of these.
// onTrigger and onStop are expected to be stable references from the parent.
export const Pad: React.FC<PadProps> = React.memo(
  ({ config, state, loadingState, error, onTrigger, onStop, className = '' }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
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
    const isLoading = loadingState === SoundLoadingState.LOADING;
    const hasError = loadingState === SoundLoadingState.ERROR;
    const isDisabled = isEmpty || isLoading || hasError;

    const padClasses = [
      'pad',
      className,
      isPressed && 'pad--pressed',
      isPlaying && 'pad--playing',
      isEmpty && 'pad--empty',
      isLoading && 'pad--loading',
      hasError && 'pad--error'
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={padClasses}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        disabled={isDisabled}
        aria-label={`Pad ${config.id}${isEmpty ? ' (empty)' : ''}${isLoading ? ' (loading)' : ''}${hasError ? ' (error)' : ''}`}
        aria-pressed={isPlaying}
        style={{
          opacity: config.volume,
          filter: `hue-rotate(${config.pitch * 10}deg)`
        }}
      >
        <div className="pad__content">
          {!isEmpty && (
            <>
              {isLoading && <div className="pad__spinner">⏳</div>}
              {hasError && <div className="pad__error">⚠️</div>}
              {!isLoading && !hasError && (
                <>
                  <div className="pad__indicator" />
                  <div className="pad__label">{config.id}</div>
                </>
              )}
              {error && <div className="pad__error-message" title={error}>Error</div>}
            </>
          )}
        </div>
      </button>
    );
  }
);

Pad.displayName = 'Pad';
