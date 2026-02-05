/**
 * Playback Controls Component
 *
 * Transport controls for play/stop/record
 */

import React from 'react';
import { TempoConfig } from '../../types/audio.types';

export interface PlaybackControlsProps {
  isPlaying: boolean;
  tempo: TempoConfig;
  masterVolume: number;
  onPlay: () => void;
  onStop: () => void;
  onTempoChange: (tempo: Partial<TempoConfig>) => void;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders when StudioScreen
// updates its pad states (every 50ms). This component only needs to re-render
// if its own props (isPlaying, tempo, masterVolume) or its callbacks change.
export const PlaybackControls: React.FC<PlaybackControlsProps> = React.memo(
  ({
    isPlaying,
    tempo,
    masterVolume,
    onPlay,
    onStop,
    onTempoChange,
    onVolumeChange,
    className = ''
  }) => {
    return (
      <div className={`playback-controls ${className}`}>
        <div className="playback-controls__transport">
          <button className="playback-controls__button" onClick={isPlaying ? onStop : onPlay}>
            {isPlaying ? '⏸ Stop' : '▶ Play'}
          </button>
        </div>

        <div className="playback-controls__tempo">
          <label>
            BPM:
            <input
              type="number"
              value={tempo.bpm}
              onChange={(e) => onTempoChange({ bpm: Number(e.target.value) })}
              min={60}
              max={200}
            />
          </label>
        </div>

        <div className="playback-controls__volume">
          <label>
            Volume:
            <input
              type="range"
              value={masterVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              min={0}
              max={1}
              step={0.01}
            />
            <span>{Math.round(masterVolume * 100)}%</span>
          </label>
        </div>
      </div>
    );
  }
);

PlaybackControls.displayName = 'PlaybackControls';
