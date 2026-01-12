/**
 * Main Studio Screen
 *
 * Main interface for creating music with pads
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PadGrid } from '../components/PadGrid';
import { PlaybackControls } from '../components/PlaybackControls';
import { SoundBrowser } from '../components/SoundBrowser';
import { LooperApp } from '../../core/LooperApp';
import {
  NoteState,
  PadConfig,
  TempoConfig,
  Sound,
  SoundLoadingState
} from '../../types/audio.types';

export interface StudioScreenProps {
  app: LooperApp;
  className?: string;
}

export const StudioScreen: React.FC<StudioScreenProps> = ({ app, className = '' }) => {
  const [pads, setPads] = useState<PadConfig[]>([]);
  const [padStates, setPadStates] = useState<Map<string, NoteState>>(new Map());
  const [soundLoadingStates, setSoundLoadingStates] = useState<Map<string, SoundLoadingState>>(
    new Map()
  );
  const [soundLoadingErrors, setSoundLoadingErrors] = useState<Map<string, string>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState<TempoConfig>({
    bpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    quantizeGrid: 16
  });
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [showSoundBrowser, setShowSoundBrowser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioContextResumed = useRef(false);

  const audioEngine = app.getAudioEngine();
  const projectManager = app.getProjectManager();
  const soundPackManager = app.getSoundPackManager();

  useEffect(() => {
    const initializeStudio = async () => {
      try {
        // Load current project or create new one
        let project = projectManager.getCurrentProject();
        if (!project) {
          project = projectManager.createProject('New Project');
        }

        setPads(project.pads);
        setTempo(project.tempo);
        setMasterVolume(project.masterVolume);

        // Preload all sounds for the project
        const soundsToLoad = project.pads
          .filter((pad) => pad.soundId)
          .map((pad) => pad.soundId as string);

        const uniqueSoundIds = [...new Set(soundsToLoad)];

        // Load each sound
        for (const soundId of uniqueSoundIds) {
          const sound = soundPackManager.getSound(soundId);
          if (sound) {
            try {
              // Update loading state
              setSoundLoadingStates((prev) => new Map(prev).set(soundId, SoundLoadingState.LOADING));

              await audioEngine.loadSound(sound);

              // Update to loaded state
              setSoundLoadingStates((prev) => new Map(prev).set(soundId, SoundLoadingState.LOADED));
            } catch (err) {
              console.error(`Failed to load sound ${soundId}:`, err);
              setSoundLoadingStates((prev) => new Map(prev).set(soundId, SoundLoadingState.ERROR));
              setSoundLoadingErrors((prev) =>
                new Map(prev).set(soundId, err instanceof Error ? err.message : 'Failed to load')
              );
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize studio:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize studio');
        setIsLoading(false);
      }
    };

    initializeStudio();

    // Set up event listener for pad state changes
    const handlePadStateChange = (padId: string, state: NoteState) => {
      setPadStates((prev) => {
        const newStates = new Map(prev);
        newStates.set(padId, state);
        return newStates;
      });
    };

    audioEngine.onPadStateChange(handlePadStateChange);

    // Cleanup
    return () => {
      audioEngine.offPadStateChange(handlePadStateChange);
    };
  }, []);

  // ⚡ Bolt: Memoize callback functions with useCallback to prevent re-creating them on every render.
  // This ensures that child components like PadGrid don't receive new function props,
  // which allows React.memo to effectively prevent unnecessary re-renders.
  const handlePadTrigger = useCallback(
    async (padId: string) => {
      // Resume AudioContext on first user interaction
      if (!audioContextResumed.current) {
        try {
          await audioEngine.resumeAudioContext();
          audioContextResumed.current = true;
        } catch (err) {
          console.error('Failed to resume audio context:', err);
          setError('Failed to initialize audio. Please try again.');
          return;
        }
      }

      audioEngine.triggerPad(padId, { quantize: true });
    },
    [audioEngine]
  );

  const handlePadStop = useCallback(
    (padId: string) => {
      audioEngine.stopPad(padId);
    },
    [audioEngine]
  );

  const handlePadConfigChange = useCallback(
    (padId: string, config: Partial<PadConfig>) => {
      projectManager.updatePad(padId, config);
      const project = projectManager.getCurrentProject();
      if (project) {
        setPads([...project.pads]);
      }
    },
    [projectManager]
  );

  const handlePlay = () => {
    audioEngine.startClock();
    setIsPlaying(true);
  };

  const handleStop = () => {
    audioEngine.stopClock();
    audioEngine.reset();
    setIsPlaying(false);
  };

  const handleTempoChange = (newTempo: Partial<TempoConfig>) => {
    const updatedTempo = { ...tempo, ...newTempo };
    setTempo(updatedTempo);
    projectManager.updateTempo(updatedTempo);
  };

  const handleVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    audioEngine.setMasterVolume(volume);
  };

  const handleSoundSelect = async (sound: Sound) => {
    // Assign sound to the first empty pad or show pad selection UI
    const emptyPad = pads.find((p) => !p.soundId);
    if (emptyPad) {
      handlePadConfigChange(emptyPad.id, { soundId: sound.id });
      // Preload the sound into the audio engine
      const soundPackManager = app.getSoundPackManager();
      const fullSound = soundPackManager.getSound(sound.id);
      if (fullSound) {
        try {
          setSoundLoadingStates((prev) =>
            new Map(prev).set(sound.id, SoundLoadingState.LOADING)
          );

          await audioEngine.loadSound(fullSound);

          setSoundLoadingStates((prev) => new Map(prev).set(sound.id, SoundLoadingState.LOADED));
        } catch (err) {
          console.error('Failed to load sound:', err);
          setSoundLoadingStates((prev) => new Map(prev).set(sound.id, SoundLoadingState.ERROR));
          setSoundLoadingErrors((prev) =>
            new Map(prev).set(sound.id, err instanceof Error ? err.message : 'Failed to load')
          );
        }
      }
    }
    setShowSoundBrowser(false);
  };

  const soundPacks = soundPackManager.getAllSoundPacks();

  // Show loading screen while sounds are loading
  if (isLoading) {
    return (
      <div className={`studio-screen studio-screen--loading ${className}`}>
        <div className="studio-screen__loading-content">
          <h2>Loading Studio...</h2>
          <p>Preparing sounds and audio engine</p>
        </div>
      </div>
    );
  }

  // Show error screen if there's a critical error
  if (error) {
    return (
      <div className={`studio-screen studio-screen--error ${className}`}>
        <div className="studio-screen__error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`studio-screen ${className}`}>
      <header className="studio-screen__header">
        <h1>Looper Studio</h1>
        <button onClick={() => projectManager.saveProject()}>💾 Save</button>
      </header>

      <main className="studio-screen__main">
        <div className="studio-screen__workspace">
          <PlaybackControls
            isPlaying={isPlaying}
            tempo={tempo}
            masterVolume={masterVolume}
            onPlay={handlePlay}
            onStop={handleStop}
            onTempoChange={handleTempoChange}
            onVolumeChange={handleVolumeChange}
          />

          <PadGrid
            pads={pads}
            padStates={padStates}
            soundLoadingStates={soundLoadingStates}
            soundLoadingErrors={soundLoadingErrors}
            onPadTrigger={handlePadTrigger}
            onPadStop={handlePadStop}
            onPadConfigChange={handlePadConfigChange}
          />
        </div>

        {showSoundBrowser && (
          <aside className="studio-screen__sidebar">
            <button onClick={() => setShowSoundBrowser(false)}>✕ Close</button>
            <SoundBrowser
              soundPacks={soundPacks}
              onSoundSelect={handleSoundSelect}
              onCategoryChange={() => {}}
            />
          </aside>
        )}
      </main>
    </div>
  );
};
