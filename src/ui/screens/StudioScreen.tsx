/**
 * Main Studio Screen
 *
 * Main interface for creating music with pads
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PadGrid } from '../components/PadGrid';
import { PlaybackControls } from '../components/PlaybackControls';
import { SoundBrowser } from '../components/SoundBrowser';
import { LooperApp } from '../../core/LooperApp';
import { NoteState, PadConfig, TempoConfig, Sound } from '../../types/audio.types';

/**
 * Compares two maps of pad states to see if they are equal.
 * @param map1 The first map
 * @param map2 The second map
 * @returns True if the maps are equal, false otherwise
 */
const arePadStateMapsEqual = (
  map1: Map<string, NoteState>,
  map2: Map<string, NoteState>
): boolean => {
  if (map1.size !== map2.size) {
    return false;
  }

  for (const [key, value] of map1) {
    if (map2.get(key) !== value) {
      return false;
    }
  }

  return true;
};

export interface StudioScreenProps {
  app: LooperApp;
  className?: string;
}

interface SoundLoadingState {
  [soundId: string]: {
    loading: boolean;
    error: string | null;
  };
}

export const StudioScreen: React.FC<StudioScreenProps> = ({ app, className = '' }) => {
  const [pads, setPads] = useState<PadConfig[]>([]);
  const [padStates, setPadStates] = useState<Map<string, NoteState>>(new Map());
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState<TempoConfig>({
    bpm: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    quantizeGrid: 16
  });
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [showSoundBrowser, setShowSoundBrowser] = useState(false);
  const [soundLoadingStates, setSoundLoadingStates] = useState<SoundLoadingState>({});
  const [audioContextReady, setAudioContextReady] = useState(false);
  const [hasResumedAudioContext, setHasResumedAudioContext] = useState(false);

  const audioEngine = app.getAudioEngine();
  const projectManager = app.getProjectManager();
  const soundPackManager = app.getSoundPackManager();

  // Preload all sounds on mount
  useEffect(() => {
    const preloadSounds = async () => {
      const project = projectManager.getCurrentProject();
      if (!project) return;

      const soundsToLoad = project.pads
        .map((pad) => pad.soundId)
        .filter((soundId): soundId is string => soundId !== null);

      const uniqueSoundIds = Array.from(new Set(soundsToLoad));

      for (const soundId of uniqueSoundIds) {
        setSoundLoadingStates((prev) => ({
          ...prev,
          [soundId]: { loading: true, error: null }
        }));

        try {
          const fullSound = soundPackManager.getSound(soundId);
          if (fullSound) {
            await audioEngine.loadSound(fullSound);
            setSoundLoadingStates((prev) => ({
              ...prev,
              [soundId]: { loading: false, error: null }
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load sound';
          console.error(`Failed to load sound ${soundId}:`, error);
          setSoundLoadingStates((prev) => ({
            ...prev,
            [soundId]: { loading: false, error: errorMessage }
          }));
        }
      }
    };

    preloadSounds();
  }, [audioEngine, projectManager, soundPackManager]);

  useEffect(() => {
    // Load current project or create new one
    let project = projectManager.getCurrentProject();
    if (!project) {
      project = projectManager.createProject('New Project');
    }

    setPads(project.pads);
    setTempo(project.tempo);
    setMasterVolume(project.masterVolume);

    // Check audio context state
    setAudioContextReady(audioEngine.isAudioContextReady());

    // Set up event-based state updates
    const handlePadStateChange = (padId: string, state: NoteState) => {
      setPadStates((currentStates) => {
        const newStates = new Map(currentStates);
        newStates.set(padId, state);
        return newStates;
      });
    };

    audioEngine.onPadStateChange(handlePadStateChange);

    // Keep polling as fallback for browsers without full event support
    const interval = setInterval(() => {
      const newStates = new Map<string, NoteState>();
      project!.pads.forEach((pad) => {
        newStates.set(pad.id, audioEngine.getPadState(pad.id));
      });

      // ⚡ Bolt: To make React.memo effective, we must avoid creating new object references
      // if the state hasn't actually changed. By comparing the old and new state maps,
      // we can prevent unnecessary state updates and re-renders of the entire PadGrid.
      setPadStates((currentPadStates) => {
        if (!arePadStateMapsEqual(currentPadStates, newStates)) {
          return newStates;
        }
        return currentPadStates;
      });

      // Update audio context ready state
      setAudioContextReady(audioEngine.isAudioContextReady());
    }, 50);

    return () => {
      clearInterval(interval);
      audioEngine.offPadStateChange(handlePadStateChange);
    };
  }, [audioEngine, projectManager]);

  // ⚡ Bolt: Memoize callback functions with useCallback to prevent re-creating them on every render.
  // This ensures that child components like PadGrid don't receive new function props,
  // which allows React.memo to effectively prevent unnecessary re-renders.
  const handlePadTrigger = useCallback(
    async (padId: string) => {
      // Resume audio context on first interaction
      if (!hasResumedAudioContext) {
        try {
          await audioEngine.resumeAudioContext();
          setHasResumedAudioContext(true);
          setAudioContextReady(audioEngine.isAudioContextReady());
        } catch (error) {
          console.error('Failed to resume audio context:', error);
        }
      }

      audioEngine.triggerPad(padId, { quantize: true });
    },
    [audioEngine, hasResumedAudioContext]
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
        setSoundLoadingStates((prev) => ({
          ...prev,
          [sound.id]: { loading: true, error: null }
        }));

        try {
          await audioEngine.loadSound(fullSound);
          setSoundLoadingStates((prev) => ({
            ...prev,
            [sound.id]: { loading: false, error: null }
          }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load sound';
          console.error('Failed to load sound:', err);
          setSoundLoadingStates((prev) => ({
            ...prev,
            [sound.id]: { loading: false, error: errorMessage }
          }));
        }
      }
    }
    setShowSoundBrowser(false);
  };

  const soundPacks = soundPackManager.getAllSoundPacks();

  // Helper functions to check sound loading state
  const isPadLoading = (pad: PadConfig): boolean => {
    if (!pad.soundId) return false;
    return soundLoadingStates[pad.soundId]?.loading || false;
  };

  const getPadError = (pad: PadConfig): string | null => {
    if (!pad.soundId) return null;
    return soundLoadingStates[pad.soundId]?.error || null;
  };

  return (
    <div className={`studio-screen ${className}`}>
      <header className="studio-screen__header">
        <h1>Looper Studio</h1>
        {!audioContextReady && (
          <div className="audio-context-warning" style={{ 
            color: '#ff9800', 
            fontSize: '14px', 
            marginLeft: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔇 Click any pad to enable audio
          </div>
        )}
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
