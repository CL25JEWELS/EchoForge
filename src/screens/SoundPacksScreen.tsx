import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { SoundPack } from '../types';

const SoundPacksScreen: React.FC = ({ navigation }: any) => {
  const [soundPacks] = useState<SoundPack[]>([
    {
      id: '1',
      name: 'Hip Hop Essentials',
      description: '16 professional hip hop drum samples and loops',
      sounds: [],
      thumbnail: undefined,
    },
    {
      id: '2',
      name: 'Electronic Dreams',
      description: 'Synths, bass, and electronic percussion',
      sounds: [],
      thumbnail: undefined,
    },
    {
      id: '3',
      name: 'Trap Beats',
      description: 'Hard-hitting 808s, hi-hats, and snares',
      sounds: [],
      thumbnail: undefined,
    },
    {
      id: '4',
      name: 'Lo-Fi Vibes',
      description: 'Chill drums, vinyl crackle, and jazzy samples',
      sounds: [],
      thumbnail: undefined,
    },
    {
      id: '5',
      name: 'House Starter',
      description: 'Classic house kicks, claps, and grooves',
      sounds: [],
      thumbnail: undefined,
    },
    {
      id: '6',
      name: 'Vocal Chops',
      description: 'Chopped vocal samples and vocal FX',
      sounds: [],
      thumbnail: undefined,
    },
  ]);

  const renderSoundPack = ({ item }: { item: SoundPack }) => (
    <TouchableOpacity
      style={styles.packCard}
      onPress={() => {
        // TODO: Load sound pack into loop pad
        // This should assign sounds from the pack to the pads
        navigation.goBack();
      }}
      activeOpacity={0.8}
    >
      <View style={styles.packImage}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="disc" size={40} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.packInfo}>
        <Text style={styles.packName}>{item.name}</Text>
        <Text style={styles.packDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.packMeta}>
          <Ionicons name="musical-notes" size={14} color={COLORS.primary} />
          <Text style={styles.packMetaText}>16 sounds</Text>
        </View>
      </View>
      <Ionicons name="download-outline" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Choose a sound pack to load samples into your loop pad
        </Text>
      </View>
      <FlatList
        data={soundPacks}
        renderItem={renderSoundPack}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.surface,
  },
  headerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  packImage: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packInfo: {
    flex: 1,
    marginRight: 12,
  },
  packName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  packMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packMetaText: {
    color: COLORS.primary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default SoundPacksScreen;
