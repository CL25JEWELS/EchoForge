import { arePadPropsEqual } from '../PadWrapper';
import { NoteState, PlaybackMode, PadConfig } from '../../../types/audio.types';
import { PadProps } from '../Pad';

describe('PadWrapper optimization', () => {
  const baseConfig: PadConfig = {
    id: 'pad-1',
    soundId: 'kick',
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
    onTrigger: jest.fn(),
    onStop: jest.fn()
  };

  it('should re-render when visual properties change', () => {
    // Volume change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, volume: 0.5 }
      })
    ).toBe(false);

    // Pitch change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, pitch: 2 }
      })
    ).toBe(false);

    // PlaybackMode change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, playbackMode: PlaybackMode.LOOP }
      })
    ).toBe(false);

    // ID change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, id: 'pad-2' }
      })
    ).toBe(false);

    // Sound ID change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, soundId: 'snare' }
      })
    ).toBe(false);
  });

  it('should NOT re-render when audio-only properties change (Optimization)', () => {
    // Pan change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, pan: 0.5 }
      })
    ).toBe(true);

    // Filter change
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, filterFrequency: 1000 }
      })
    ).toBe(true);

    // Effects change (new array, same content)
    expect(
      arePadPropsEqual(baseProps, {
        ...baseProps,
        config: { ...baseConfig, effects: [] }
      })
    ).toBe(true);
  });
});
