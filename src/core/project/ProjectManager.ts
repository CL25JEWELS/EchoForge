/**
 * Project Manager
 *
 * Handles creating, saving, loading, and exporting projects
 */

import { Project, ProjectFile, ExportOptions } from '../../types/project.types';
import { PadConfig, TempoConfig, PlaybackMode } from '../../types/audio.types';
import { IAudioEngine } from '../audio-engine/IAudioEngine';
import { debugLog } from '../../utils/debug';

export class ProjectManager {
  private currentProject: Project | null = null;
  private audioEngine: IAudioEngine;
  private autoSaveInterval: number | null = null;

  constructor(audioEngine: IAudioEngine) {
    this.audioEngine = audioEngine;
  }

  /**
   * Create a new project
   */
  createProject(name: string, description?: string): Project {
    const project: Project = {
      id: this.generateId(),
      name,
      description,
      version: '1.0.0',
      tempo: {
        bpm: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        quantizeGrid: 16
      },
      pads: this.createDefaultPads(),
      masterVolume: 0.8,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      }
    };

    this.currentProject = project;
    this.applyProjectToEngine(project);

    console.log(`[ProjectManager] Created new project: ${name}`);
    return project;
  }

  /**
   * Load a project from JSON
   */
  loadProject(projectData: ProjectFile): Project {
    // Only log full project data in debug mode (can be expensive for large projects)
    debugLog.log('ProjectManager', 'Loading project from data:', JSON.stringify(projectData, null, 2));
    
    const project = projectData.project;

    // Update timestamp
    project.metadata.updatedAt = new Date();

    this.currentProject = project;
    this.applyProjectToEngine(project);

    console.log(`[ProjectManager] Loaded project: ${project.name}`);
    debugLog.log('ProjectManager', `  Tempo: ${project.tempo.bpm} BPM`);
    debugLog.log('ProjectManager', `  Pads: ${project.pads.length}`);
    debugLog.log('ProjectManager', `  Master volume: ${project.masterVolume}`);
    return project;
  }

  /**
   * Save the current project to JSON
   */
  saveProject(): ProjectFile | null {
    if (!this.currentProject) {
      console.warn('[ProjectManager] No project to save');
      return null;
    }

    // Sync current state from audio engine
    this.syncFromEngine();

    // Update timestamp
    this.currentProject.metadata.updatedAt = new Date();

    const projectFile: ProjectFile = {
      project: this.currentProject,
      soundPackReferences: this.extractSoundPackReferences(),
      version: '1.0.0'
    };

    debugLog.log('ProjectManager', `Saved project: ${this.currentProject.name}`);
    // Only log full project data in debug mode (can be expensive for large projects)
    debugLog.log('ProjectManager', 'Project data:', JSON.stringify(projectFile, null, 2));
    return projectFile;
  }

  /**
   * Get the current project
   */
  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  /**
   * Update project metadata
   */
  updateProjectMetadata(updates: Partial<Project>): void {
    if (!this.currentProject) {
      return;
    }

    this.currentProject = {
      ...this.currentProject,
      ...updates,
      metadata: {
        ...this.currentProject.metadata,
        updatedAt: new Date()
      }
    };
  }

  /**
   * Update a specific pad configuration
   */
  updatePad(padId: string, config: Partial<PadConfig>): void {
    if (!this.currentProject) {
      return;
    }

    const padIndex = this.currentProject.pads.findIndex((p) => p.id === padId);
    if (padIndex === -1) {
      return;
    }

    const updatedPad = {
      ...this.currentProject.pads[padIndex],
      ...config
    };

    this.currentProject.pads[padIndex] = updatedPad;
    this.audioEngine.configurePad(padId, updatedPad);
  }

  /**
   * Update tempo configuration
   */
  updateTempo(tempo: Partial<TempoConfig>): void {
    if (!this.currentProject) {
      return;
    }

    this.currentProject.tempo = {
      ...this.currentProject.tempo,
      ...tempo
    };

    this.audioEngine.setTempoConfig(this.currentProject.tempo);
  }

  /**
   * Export project to audio file
   */
  async exportToAudio(options: ExportOptions): Promise<Blob> {
    if (!this.currentProject) {
      throw new Error('No project to export');
    }

    // This is a simplified implementation
    // In a real app, this would render the project to an audio file
    console.log(`[ProjectManager] Exporting project with options:`, options);

    // Placeholder: return empty blob
    // Real implementation would use OfflineAudioContext or similar
    return new Blob([], { type: 'audio/wav' });
  }

  /**
   * Enable auto-save
   */
  enableAutoSave(intervalMs: number = 60000): void {
    this.disableAutoSave();

    this.autoSaveInterval = window.setInterval(() => {
      if (this.currentProject) {
        this.saveProject();
        console.log('[ProjectManager] Auto-saved project');
      }
    }, intervalMs);

    console.log(`[ProjectManager] Auto-save enabled (${intervalMs}ms interval)`);
  }

  /**
   * Disable auto-save
   */
  disableAutoSave(): void {
    if (this.autoSaveInterval) {
      window.clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('[ProjectManager] Auto-save disabled');
    }
  }

  /**
   * Create default pad configuration
   */
  private createDefaultPads(): PadConfig[] {
    const pads: PadConfig[] = [];

    // Create a 4x4 grid of pads
    for (let i = 0; i < 16; i++) {
      pads.push({
        id: `pad-${i}`,
        soundId: null,
        volume: 0.8,
        pitch: 0,
        playbackMode: PlaybackMode.ONE_SHOT,
        pan: 0,
        effects: []
      });
    }

    return pads;
  }

  /**
   * Apply project settings to audio engine
   */
  private applyProjectToEngine(project: Project): void {
    // Configure tempo
    this.audioEngine.setTempoConfig(project.tempo);

    // Configure master volume
    this.audioEngine.setMasterVolume(project.masterVolume);

    // Configure all pads
    project.pads.forEach((pad) => {
      this.audioEngine.configurePad(pad.id, pad);
    });

    console.log('[ProjectManager] Applied project settings to audio engine');
  }

  /**
   * Sync project state from audio engine
   */
  private syncFromEngine(): void {
    if (!this.currentProject) {
      return;
    }

    // Sync master volume
    this.currentProject.masterVolume = this.audioEngine.getMasterVolume();

    // Sync tempo
    this.currentProject.tempo = this.audioEngine.getTempoConfig();

    // Sync pads
    const enginePads = this.audioEngine.getAllPads();
    enginePads.forEach((padConfig, padId) => {
      const projectPadIndex = this.currentProject!.pads.findIndex((p) => p.id === padId);
      if (projectPadIndex !== -1) {
        this.currentProject!.pads[projectPadIndex] = padConfig;
      }
    });
  }

  /**
   * Extract sound pack IDs referenced by the project
   */
  private extractSoundPackReferences(): string[] {
    if (!this.currentProject) {
      return [];
    }

    const soundIds = new Set<string>();
    this.currentProject.pads.forEach((pad) => {
      if (pad.soundId) {
        soundIds.add(pad.soundId);
      }
    });

    // In a real app, we'd map sound IDs to pack IDs
    // For now, return empty array
    return [];
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
