import { arePropsEqual } from '../PadWrapper';
import { PadProps } from '../Pad';
import { NoteState, PlaybackMode, PadConfig, EffectType } from '../../../types/audio.types';

describe('PadWrapper - arePropsEqual', () => {
  const mockTrigger = jest.fn();
  const mockStop = jest.fn();

  const baseConfig: PadConfig = {
    id: 'pad-1',
    soundId: 'kick-1',
    volume: 0.8,
    pitch: 0,
    playbackMode: PlaybackMode.ONE_SHOT,
    pan: 0,
    filterFrequency: 20000,
    filterResonance: 0,
    effects: []
  };

  const baseProps: PadProps = {
    config: baseConfig,
    state: NoteState.IDLE,
    onTrigger: mockTrigger,
    onStop: mockStop
  };

  it('should return true when props are identical', () => {
    expect(arePropsEqual(baseProps, baseProps)).toBe(true);
  });

  it('should return true when only audio-only properties change', () => {
    const nextProps = {
      ...baseProps,
      config: {
        ...baseConfig,
        pan: 0.5,
        filterFrequency: 1000,
        filterResonance: 0.5,
        effects: [{ id: 'fx-1', type: EffectType.REVERB, enabled: true, parameters: {} }]
      }
    };
    expect(arePropsEqual(baseProps, nextProps)).toBe(true);
  });

  it('should return false when visual properties change', () => {
    // Volume
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, volume: 0.5 }
      })
    ).toBe(false);

    // Pitch
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, pitch: 12 }
      })
    ).toBe(false);
  });

  it('should return false when logic properties change', () => {
    // ID
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, id: 'pad-2' }
      })
    ).toBe(false);

    // Sound ID
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, soundId: 'snare-1' }
      })
    ).toBe(false);

    // Playback Mode
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, playbackMode: PlaybackMode.LOOP }
      })
    ).toBe(false);
  });

  it('should return false when state changes', () => {
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        state: NoteState.PLAYING
      })
    ).toBe(false);
  });

  it('should return false when handlers change', () => {
    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        onTrigger: jest.fn()
      })
    ).toBe(false);

    expect(
      arePropsEqual(baseProps, {
        ...baseProps,
        onStop: jest.fn()
      })
    ).toBe(false);
  });
});
