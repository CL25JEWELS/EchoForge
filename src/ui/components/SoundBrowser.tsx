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

// ⚡ Bolt: Using React.memo to prevent unnecessary re-renders when parent component updates.
// This is critical because StudioScreen re-renders frequently (e.g. during playback),
// and we want to avoid expensive recalculations in SoundBrowser.
export const SoundBrowser = React.memo(
  ({
    soundPacks,
    selectedCategory,
    onSoundSelect,
    onCategoryChange,
    className = ''
  }: SoundBrowserProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    // ⚡ Bolt: Memoize expensive flatMap operation.
    // This operation is O(N) where N is total sounds across all packs.
    // Without useMemo, this runs on every render, which causes frame drops if there are many sounds.
    const allSounds = useMemo(() => {
      return soundPacks.flatMap((pack) => pack.sounds);
    }, [soundPacks]);

    // ⚡ Bolt: Memoize filtering logic.
    // Filtering is O(N) and creates new array references, which would cause child components
    // to re-render if we were passing this down.
    const filteredSounds = useMemo(() => {
      return allSounds.filter((sound) => {
        const matchesCategory = !selectedCategory || sound.category === selectedCategory;
        const matchesSearch =
          !searchQuery || sound.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }, [allSounds, selectedCategory, searchQuery]);

    // ⚡ Bolt: Memoize category extraction.
    // Creating a Set and Array from it is expensive and should only happen when sounds change.
    const categories = useMemo(() => {
      return Array.from(new Set(allSounds.map((s) => s.category)));
    }, [allSounds]);

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
  }
);

SoundBrowser.displayName = 'SoundBrowser';
