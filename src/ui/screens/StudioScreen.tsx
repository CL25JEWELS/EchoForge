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
  const [audioContextState, setAudioContextState] = useState<'suspended' | 'running' | 'closed'>(
    'suspended'
  );
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [soundsLoading, setSoundsLoading] = useState<Set<string>>(new Set());

  const audioEngine = app.getAudioEngine();
  const projectManager = app.getProjectManager();
  const soundPackManager = app.getSoundPackManager();

  useEffect(() => {
    // Initialize audio context state
    const updateAudioContextState = () => {
      const state = (audioEngine as any).getAudioContextState?.() ?? 'suspended';
      setAudioContextState(state);
      setIsAudioInitialized(state === 'running');
    };

    updateAudioContextState();

    // Load current project or create new one
    let project = projectManager.getCurrentProject();
    if (!project) {
      project = projectManager.createProject('New Project');
    }

    setPads(project.pads);
    setTempo(project.tempo);
    setMasterVolume(project.masterVolume);

    // Preload sounds for configured pads
    const loadPadSounds = async () => {
      const loadingSet = new Set<string>();
      for (const pad of project!.pads) {
        if (pad.soundId) {
          loadingSet.add(pad.id);
          const sound = soundPackManager.getSound(pad.soundId);
          if (sound && !(audioEngine as any).isSoundLoaded?.(pad.soundId)) {
            try {
              await audioEngine.loadSound(sound);
              console.log(`[StudioScreen] Preloaded sound for pad ${pad.id}`);
            } catch (err) {
              console.error(`[StudioScreen] Failed to preload sound for pad ${pad.id}:`, err);
            }
          }
          loadingSet.delete(pad.id);
        }
      }
      setSoundsLoading(new Set(loadingSet));
    };

    loadPadSounds();

    // Update pad states using requestAnimationFrame for better performance
    let animationFrameId: number;
    const updatePadStates = () => {
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

      animationFrameId = requestAnimationFrame(updatePadStates);
    };

    animationFrameId = requestAnimationFrame(updatePadStates);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // ⚡ Bolt: Memoize callback functions with useCallback to prevent re-creating them on every render.
  // This ensures that child components like PadGrid don't receive new function props,
  // which allows React.memo to effectively prevent re-renders.
  
  const handleUserInteraction = useCallback(async () => {
    if (audioContextState === 'suspended') {
      try {
        await (audioEngine as any).resumeAudioContext?.();
        const newState = (audioEngine as any).getAudioContextState?.() ?? 'running';
        setAudioContextState(newState);
        setIsAudioInitialized(newState === 'running');
        console.log('[StudioScreen] Audio context resumed after user interaction');
      } catch (err) {
        console.error('[StudioScreen] Failed to resume audio context:', err);
      }
    }
  }, [audioContextState, audioEngine]);

  const handlePadTrigger = useCallback(
    async (padId: string) => {
      // Resume audio context if needed (browsers require user gesture)
      if (audioContextState === 'suspended') {
        await handleUserInteraction();
      }

      // Check if the sound is loaded
      const pad = pads.find((p) => p.id === padId);
      if (pad?.soundId) {
        const isLoaded = (audioEngine as any).isSoundLoaded?.(pad.soundId);
        if (!isLoaded) {
          console.warn(`[StudioScreen] Sound ${pad.soundId} not loaded for pad ${padId}`);
          return;
        }
      }

      try {
        audioEngine.triggerPad(padId, { quantize: true });
      } catch (err) {
        console.error(`[StudioScreen] Failed to trigger pad ${padId}:`, err);
      }
    },
    [audioEngine, audioContextState, handleUserInteraction, pads]
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

  const handleSoundSelect = useCallback(
    async (sound: Sound) => {
      // Assign sound to the first empty pad or show pad selection UI
      const emptyPad = pads.find((p) => !p.soundId);
      if (emptyPad) {
        handlePadConfigChange(emptyPad.id, { soundId: sound.id });
        
        // Preload the sound into the audio engine
        const soundPackManager = app.getSoundPackManager();
        const fullSound = soundPackManager.getSound(sound.id);
        if (fullSound) {
          setSoundsLoading((prev) => new Set(prev).add(emptyPad.id));
          try {
            await audioEngine.loadSound(fullSound);
            console.log(`[StudioScreen] Loaded sound ${sound.id}`);
          } catch (err) {
            console.error('[StudioScreen] Failed to load sound:', err);
          } finally {
            setSoundsLoading((prev) => {
              const next = new Set(prev);
              next.delete(emptyPad.id);
              return next;
            });
          }
        }
      }
      setShowSoundBrowser(false);
    },
    [pads, handlePadConfigChange, app, audioEngine]
  );

  const soundPacks = soundPackManager.getAllSoundPacks();

  return (
    <div className={`studio-screen ${className}`} onClick={handleUserInteraction}>
      <header className="studio-screen__header">
        <h1>Looper Studio</h1>
        {audioContextState === 'suspended' && (
          <div className="audio-init-warning">
            ⚠️ Click anywhere to enable audio
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
            soundsLoading={soundsLoading}
            isAudioReady={isAudioInitialized}
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
