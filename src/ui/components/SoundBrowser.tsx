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

// ⚡ Bolt: Wrap in React.memo to prevent unnecessary re-renders when parent (StudioScreen)
// updates frequently due to pad state changes.
export const SoundBrowser: React.FC<SoundBrowserProps> = React.memo(
  ({ soundPacks, selectedCategory, onSoundSelect, onCategoryChange, className = '' }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // ⚡ Bolt: Memoize allSounds to avoid flatMap on every render.
    // This is especially important as soundPacks can be large.
    const allSounds = useMemo(() => soundPacks.flatMap((pack) => pack.sounds), [soundPacks]);

    // ⚡ Bolt: Memoize filteredSounds based on dependencies.
    // This prevents expensive filtering during high-frequency parent updates.
    const filteredSounds = useMemo(
      () =>
        allSounds.filter((sound) => {
          const matchesCategory = !selectedCategory || sound.category === selectedCategory;
          const matchesSearch =
            !searchQuery || sound.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        }),
      [allSounds, selectedCategory, searchQuery]
    );

    // ⚡ Bolt: Memoize categories extraction.
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
  }
);

SoundBrowser.displayName = 'SoundBrowser';
