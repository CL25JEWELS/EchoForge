/**
 * Sound Browser Component
 *
 * Browse and select sounds from loaded sound packs
 */

import React, { useState, useMemo } from 'react';
import { Sound, SoundCategory } from '../../types/audio.types';
import { SoundPack } from '../../types/soundpack.types';

export interface SoundBrowserProps {
  soundPacks: SoundPack[];
  selectedCategory?: SoundCategory;
  onSoundSelect: (sound: Sound) => void;
  onCategoryChange: (category: SoundCategory | undefined) => void;
  className?: string;
}

/**
 * Custom comparison function for React.memo.
 *
 * This checks if soundPacks are effectively equal (same length and same pack references)
 * to avoid re-renders when the parent passes a new array reference containing the same packs.
 */
export const arePropsEqual = (
  prevProps: SoundBrowserProps,
  nextProps: SoundBrowserProps
): boolean => {
  const isPacksEqual =
    prevProps.soundPacks.length === nextProps.soundPacks.length &&
    prevProps.soundPacks.every((pack, index) => pack === nextProps.soundPacks[index]);

  return (
    isPacksEqual &&
    prevProps.selectedCategory === nextProps.selectedCategory &&
    prevProps.onSoundSelect === nextProps.onSoundSelect &&
    prevProps.onCategoryChange === nextProps.onCategoryChange &&
    prevProps.className === nextProps.className
  );
};

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary re-renders.
// Since StudioScreen creates a new soundPacks array on every render,
// this custom comparison is critical for performance.
export const SoundBrowser = React.memo<SoundBrowserProps>(
  ({ soundPacks, selectedCategory, onSoundSelect, onCategoryChange, className = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // ⚡ Bolt: Memoize expensive array operations
    // Get all sounds from all packs
    const allSounds = useMemo(() => soundPacks.flatMap((pack) => pack.sounds), [soundPacks]);

    // Filter sounds
    const filteredSounds = useMemo(() => {
      return allSounds.filter((sound) => {
        const matchesCategory = !selectedCategory || sound.category === selectedCategory;
        const matchesSearch =
          !searchQuery || sound.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }, [allSounds, selectedCategory, searchQuery]);

    // Get unique categories
    const categories = useMemo(
      () => Array.from(new Set(allSounds.map((s) => s.category))),
      [allSounds]
    );

    return (
      <div className={`sound-browser ${className}`}>
        <div className="sound-browser__header">
          <h2>Sound Browser</h2>
          <input
            type="text"
            placeholder="Search sounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sound-browser__search"
          />
        </div>

        <div className="sound-browser__categories">
          <button
            className={!selectedCategory ? 'active' : ''}
            onClick={() => onCategoryChange(undefined)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="sound-browser__list">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="sound-browser__item"
              onClick={() => onSoundSelect(sound)}
            >
              <span className="sound-browser__name">{sound.name}</span>
              <span className="sound-browser__category">{sound.category}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  arePropsEqual
);

SoundBrowser.displayName = 'SoundBrowser';
