/**
 * Main Studio Screen
 * 
 * Main interface for creating music with pads
 */

import React, { useState, useEffect } from 'react';
import { PadGrid } from '../components/PadGrid';
import { PlaybackControls } from '../components/PlaybackControls';
import { SoundBrowser } from '../components/SoundBrowser';
import { LooperApp } from '../../core/LooperApp';
import { NoteState, PadConfig, TempoConfig } from '../../types/audio.types';

export interface StudioScreenProps {
  app: LooperApp;
  className?: string;
}

export const StudioScreen: React.FC<StudioScreenProps> = ({
  app,
  className = ''
}) => {
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
  const [selectedPadId, setSelectedPadId] = useState<string | null>(null);

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
      const states = new Map<string, NoteState>();
      project!.pads.forEach(pad => {
        states.set(pad.id, audioEngine.getPadState(pad.id));
      });
      setPadStates(states);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handlePadTrigger = (padId: string) => {
    audioEngine.triggerPad(padId, { quantize: true });
  };

  const handlePadStop = (padId: string) => {
    audioEngine.stopPad(padId);
  };

  const handlePadConfigChange = (padId: string, config: Partial<PadConfig>) => {
    projectManager.updatePad(padId, config);
    const project = projectManager.getCurrentProject();
    if (project) {
      setPads([...project.pads]);
    }
  };

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

  const handlePadClick = (padId: string) => {
    setSelectedPadId(padId);
    setShowSoundBrowser(true);
  };

  const handleSoundSelect = (sound: any) => {
    if (selectedPadId) {
      handlePadConfigChange(selectedPadId, { soundId: sound.id });
    }
    setShowSoundBrowser(false);
  };

  const soundPacks = soundPackManager.getAllSoundPacks();

  return (
    <div className={`studio-screen ${className}`}>
      <header className="studio-screen__header">
        <h1>Looper Studio</h1>
        <button onClick={() => projectManager.saveProject()}>
          💾 Save
        </button>
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
