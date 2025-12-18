import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../types';
import { COLORS } from '../config/constants';

interface TrackCardProps {
  track: Track;
  onPress: () => void;
  onLike?: () => void;
  onRemix?: () => void;
  isLiked?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onPress,
  onLike,
  onRemix,
  isLiked = false,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {track.coverImageUrl ? (
          <Image source={{ uri: track.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="musical-notes" size={40} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(track.duration)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title}
            </Text>
            {track.isRemix && (
              <View style={styles.remixBadge}>
                <Ionicons name="git-branch" size={12} color={COLORS.accent} />
                <Text style={styles.remixText}>Remix</Text>
              </View>
            )}
          </View>
          <Text style={styles.username} numberOfLines={1}>
            {track.userId}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="play" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{formatNumber(track.plays)}</Text>
          </View>
          <View style={styles.statItem}>
            <TouchableOpacity onPress={onLike} disabled={!onLike}>
              <View style={styles.likeButton}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isLiked ? COLORS.error : COLORS.textSecondary}
                />
                <Text style={styles.statText}>{formatNumber(track.likes)}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="git-branch" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{formatNumber(track.remixCount)}</Text>
          </View>
        </View>

        {track.tags && track.tags.length > 0 && (
          <View style={styles.tags}>
            {track.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {onRemix && (
        <TouchableOpacity style={styles.remixButton} onPress={onRemix}>
          <Ionicons name="git-branch" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  remixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 211, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  remixText: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  username: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  remixButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrackCard;
