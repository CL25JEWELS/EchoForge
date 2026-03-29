import { arePropsEqual, SoundBrowserProps } from '../SoundBrowser';
import { SoundPack } from '../../../types/soundpack.types';
import { SoundCategory } from '../../../types/audio.types';

describe('SoundBrowser - arePropsEqual', () => {
  const mockSoundSelect = jest.fn();
  const mockCategoryChange = jest.fn();

  const mockPack1: SoundPack = {
    id: 'pack-1',
    name: 'Pack 1',
    version: '1.0.0',
    description: '',
    author: '',
    sounds: [],
    categories: [],
    metadata: { createdAt: new Date(), updatedAt: new Date() }
  };

  const mockPack2: SoundPack = {
    id: 'pack-2',
    name: 'Pack 2',
    version: '1.0.0',
    description: '',
    author: '',
    sounds: [],
    categories: [],
    metadata: { createdAt: new Date(), updatedAt: new Date() }
  };

  const baseProps: SoundBrowserProps = {
    soundPacks: [mockPack1],
    selectedCategory: undefined,
    onSoundSelect: mockSoundSelect,
    onCategoryChange: mockCategoryChange,
    className: ''
  };

  it('should return true when props are identical', () => {
    expect(arePropsEqual(baseProps, baseProps)).toBe(true);
  });

  it('should return true when soundPacks is a new array but has same content', () => {
    const nextProps = {
      ...baseProps,
      soundPacks: [mockPack1] // New array, same reference inside
    };
    expect(arePropsEqual(baseProps, nextProps)).toBe(true);
  });

  it('should return false when soundPacks content changes (different pack)', () => {
    const nextProps = {
      ...baseProps,
      soundPacks: [mockPack2]
    };
    expect(arePropsEqual(baseProps, nextProps)).toBe(false);
  });

  it('should return false when soundPacks content changes (different length)', () => {
    const nextProps = {
      ...baseProps,
      soundPacks: [mockPack1, mockPack2]
    };
    expect(arePropsEqual(baseProps, nextProps)).toBe(false);
  });

  it('should return false when other props change', () => {
    // selectedCategory
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        selectedCategory: SoundCategory.KICK
      })
    ).toBe(false);

    // onSoundSelect
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        onSoundSelect: jest.fn()
      })
    ).toBe(false);

    // className
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        className: 'new-class'
      })
    ).toBe(false);
  });
});
