import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../config/constants';
import { Track } from '../types';
import TrackCard from '../components/TrackCard';
import { db } from '../services/supabase';

const DiscoverScreen: React.FC = ({ navigation }: any) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const data = await db.getTracks(20, 0);
      setTracks(data || []);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTracks();
    setRefreshing(false);
  };

  const handleTrackPress = (trackId: string) => {
    navigation.navigate('TrackDetail', { trackId });
  };

  const handleLike = async (trackId: string) => {
    try {
      const userId = 'demo-user'; // Replace with actual user ID
      
      if (likedTracks.has(trackId)) {
        await db.unlikeTrack(userId, trackId);
        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        // Update track likes count
        setTracks(prev =>
          prev.map(track =>
            track.id === trackId
              ? { ...track, likes: Math.max(0, track.likes - 1) }
              : track
          )
        );
      } else {
        await db.likeTrack(userId, trackId);
        setLikedTracks(prev => new Set(prev).add(trackId));
        // Update track likes count
        setTracks(prev =>
          prev.map(track =>
            track.id === trackId ? { ...track, likes: track.likes + 1 } : track
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleRemix = (trackId: string) => {
    // TODO: Navigate to studio with remix data
    // This will load the track's project data into the loop pad
    navigation.navigate('Studio');
  };

  const renderTrack = ({ item }: { item: Track }) => (
    <TrackCard
      track={item}
      onPress={() => handleTrackPress(item.id)}
      onLike={() => handleLike(item.id)}
      onRemix={() => handleRemix(item.id)}
      isLiked={likedTracks.has(item.id)}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tracks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tracks yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to upload a track!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default DiscoverScreen;
