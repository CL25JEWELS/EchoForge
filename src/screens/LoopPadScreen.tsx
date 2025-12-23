import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, APP_CONFIG } from '../config/constants';
import { PadState, Project } from '../types';
import LoopPad from '../components/LoopPad';
import { audioService } from '../services/audio';
import { db } from '../services/supabase';

const LoopPadScreen: React.FC = ({ navigation }: any) => {
  const [pads, setPads] = useState<PadState[]>(
    Array(APP_CONFIG.LOOP_PAD_GRID_SIZE)
      .fill(0)
      .map((_, index) => ({
        padIndex: index,
        soundId: null,
        isPlaying: false,
        volume: 1.0,
        color: COLORS.padColors[index],
      }))
  );
  const [bpm, setBpm] = useState(APP_CONFIG.DEFAULT_BPM);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isRecording, setIsRecording] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    // Initialize audio service
    audioService.initialize();

    // Cleanup on unmount
    return () => {
      audioService.unloadAllSounds();
    };
  }, []);

  const handlePadPress = (index: number) => {
    setPads(prev =>
      prev.map((pad, i) =>
        i === index ? { ...pad, isPlaying: !pad.isPlaying } : pad
      )
    );
  };

  const handlePadLongPress = (index: number) => {
    Alert.alert(
      'Pad Options',
      `Configure pad ${index + 1}`,
      [
        {
          text: 'Assign Sound',
          onPress: () => navigation.navigate('SoundPacks'),
        },
        {
          text: 'Clear Sound',
          onPress: () => clearPad(index),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const clearPad = (index: number) => {
    setPads(prev =>
      prev.map((pad, i) =>
        i === index ? { ...pad, soundId: null, isPlaying: false } : pad
      )
    );
  };

  const clearAllPads = () => {
    setPads(prev =>
      prev.map(pad => ({ ...pad, soundId: null, isPlaying: false }))
    );
    audioService.unloadAllSounds();
  };

  const saveProject = async () => {
    try {
      // TODO: Replace with actual authenticated user ID from useAuth hook
      // For demo purposes, using 'demo-user' as placeholder
      const userId = 'demo-user';
      
      const projectData = {
        name: projectName,
        userId: userId,
        pads: pads,
        bpm: bpm,
        soundPackId: 'default',
        isPublic: false,
      };

      if (currentProject) {
        await db.updateProject(currentProject.id, projectData);
        Alert.alert('Success', 'Project updated!');
      } else {
        const newProject = await db.createProject(projectData);
        setCurrentProject(newProject);
        Alert.alert('Success', 'Project saved!');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      Alert.alert('Error', 'Failed to save project');
    }
  };

  const exportTrack = () => {
    Alert.alert(
      'Export Track',
      'This will render your loop and save it as a track',
      [
        {
          text: 'Export & Upload',
          onPress: () => {
            // Navigate to upload screen or handle export
            Alert.alert('Coming Soon', 'Export feature will be available soon!');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Controls */}
        <View style={styles.header}>
          <TextInput
            style={styles.projectNameInput}
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Project Name"
            placeholderTextColor={COLORS.textSecondary}
            maxLength={APP_CONFIG.MAX_PROJECT_NAME_LENGTH}
          />
        </View>

        {/* BPM Control */}
        <View style={styles.bpmContainer}>
          <Text style={styles.label}>BPM</Text>
          <View style={styles.bpmControls}>
            <TouchableOpacity
              style={styles.bpmButton}
              onPress={() => setBpm(Math.max(APP_CONFIG.MIN_BPM, bpm - 5))}
            >
              <Ionicons name="remove" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <TouchableOpacity
              style={styles.bpmButton}
              onPress={() => setBpm(Math.min(APP_CONFIG.MAX_BPM, bpm + 5))}
            >
              <Ionicons name="add" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loop Pad Grid */}
        <LoopPad
          pads={pads}
          onPadPress={handlePadPress}
          onPadLongPress={handlePadLongPress}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('SoundPacks')}
          >
            <Ionicons name="musical-notes" size={20} color={COLORS.text} />
            <Text style={styles.buttonText}>Sound Packs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={clearAllPads}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.text} />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={saveProject}
          >
            <Ionicons name="save-outline" size={20} color={COLORS.text} />
            <Text style={styles.buttonText}>Save Project</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.accentButton]}
            onPress={exportTrack}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.text} />
            <Text style={styles.buttonText}>Export</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.fullWidthButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('ProjectList')}
        >
          <Ionicons name="folder-outline" size={20} color={COLORS.text} />
          <Text style={styles.buttonText}>My Projects</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  projectNameInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bpmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 5,
  },
  bpmButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 6,
  },
  bpmValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 50,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
  },
  accentButton: {
    backgroundColor: COLORS.accent,
  },
  fullWidthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoopPadScreen;
