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

  const audioEngine = app.getAudioEngine();
  const projectManager = app.getProjectManager();
  const soundPackManager = app.getSoundPackManager();

  useEffect(() => {
    // Load current project or create new one
    let project = projectManager.getCurrentProject();
    if (!project) {
      project = projectManager.createProject('New Project');
    }

    setPads(project.pads);
    setTempo(project.tempo);
    setMasterVolume(project.masterVolume);

    // Update pad states periodically
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
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // ⚡ Bolt: Memoize callback functions with useCallback to prevent re-creating them on every render.
  // This ensures that child components like PadGrid don't receive new function props,
  // which allows React.memo to effectively prevent unnecessary re-renders.
  const handlePadTrigger = useCallback(
    (padId: string) => {
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

  // ⚡ Bolt: Memoize playback control handlers to prevent re-renders in the PlaybackControls component.
  // By wrapping these functions in useCallback, we ensure they have stable references across renders,
  // allowing React.memo in the child component to skip unnecessary updates.
  const handlePlay = useCallback(() => {
    audioEngine.startClock();
    setIsPlaying(true);
  }, [audioEngine]);

  const handleStop = useCallback(() => {
    audioEngine.stopClock();
    audioEngine.reset();
    setIsPlaying(false);
  }, [audioEngine]);

  const handleTempoChange = useCallback(
    (newTempo: Partial<TempoConfig>) => {
      const updatedTempo = { ...tempo, ...newTempo };
      setTempo(updatedTempo);
      projectManager.updateTempo(updatedTempo);
    },
    [projectManager, tempo]
  );

  const handleVolumeChange = useCallback(
    (volume: number) => {
      setMasterVolume(volume);
      audioEngine.setMasterVolume(volume);
    },
    [audioEngine]
  );

  const handleSoundSelect = (sound: Sound) => {
    // Assign sound to the first empty pad or show pad selection UI
    const emptyPad = pads.find((p) => !p.soundId);
    if (emptyPad) {
      handlePadConfigChange(emptyPad.id, { soundId: sound.id });
      // Preload the sound into the audio engine
      const soundPackManager = app.getSoundPackManager();
      const fullSound = soundPackManager.getSound(sound.id);
      if (fullSound) {
        audioEngine.loadSound(fullSound).catch((err) => {
          console.error('Failed to load sound:', err);
        });
      }
    }
    setShowSoundBrowser(false);
  };

  const soundPacks = soundPackManager.getAllSoundPacks();

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
