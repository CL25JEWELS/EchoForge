import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { Track, Comment } from '../types';
import { db } from '../services/supabase';
import { Audio } from 'expo-av';

const TrackDetailScreen: React.FC = ({ route, navigation }: any) => {
  const { trackId } = route.params;
  const [track, setTrack] = useState<Track | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadTrackDetails();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [trackId]);

  const loadTrackDetails = async () => {
    try {
      setLoading(true);
      const [trackData, commentsData] = await Promise.all([
        db.getTrackById(trackId),
        db.getComments(trackId),
      ]);
      setTrack(trackData);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Failed to load track details:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!track) return;

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    try {
      const userId = 'demo-user'; // Replace with actual user ID
      if (isLiked) {
        await db.unlikeTrack(userId, trackId);
        setIsLiked(false);
        if (track) {
          setTrack({ ...track, likes: Math.max(0, track.likes - 1) });
        }
      } else {
        await db.likeTrack(userId, trackId);
        setIsLiked(true);
        if (track) {
          setTrack({ ...track, likes: track.likes + 1 });
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const userId = 'demo-user'; // Replace with actual user ID
      const comment = await db.addComment(userId, trackId, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!track) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Track not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {track.coverImageUrl ? (
          <Image source={{ uri: track.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderCover}>
            <Ionicons name="musical-notes" size={80} color={COLORS.textSecondary} />
          </View>
        )}
        
        {/* Play Button Overlay */}
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={40}
            color={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.title}>{track.title}</Text>
        <Text style={styles.username}>by {track.userId}</Text>
        {track.description && (
          <Text style={styles.description}>{track.description}</Text>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="play" size={20} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{track.plays} plays</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? COLORS.error : COLORS.textSecondary}
            />
            <Text style={styles.statText}>{track.likes} likes</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="git-branch" size={20} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{track.remixCount} remixes</Text>
          </View>
        </View>

        {/* Tags */}
        {track.tags && track.tags.length > 0 && (
          <View style={styles.tags}>
            {track.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
            <Ionicons name="git-branch" size={20} color={COLORS.text} />
            <Text style={styles.actionText}>Remix</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <Ionicons name="share-outline" size={20} color={COLORS.text} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
        
        {/* Add Comment */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={COLORS.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? COLORS.primary : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        {comments.map(comment => (
          <View key={comment.id} style={styles.comment}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUsername}>{comment.userId}</Text>
              <Text style={styles.commentTime}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  coverContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  trackInfo: {
    padding: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  username: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  description: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  commentInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    padding: 8,
  },
  comment: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUsername: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
  },
});

export default TrackDetailScreen;
