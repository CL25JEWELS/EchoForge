/**
 * Pad Wrapper Component
 *
 * Memoizes the Pad component with a custom props comparison
 * to prevent unnecessary re-renders.
 */

import React from 'react';
import { Pad, PadProps } from './Pad';
import { NoteState } from '../../types/audio.types';

type PadWrapperProps = PadProps;

/**
 * Custom comparison function for React.memo.
 *
 * This function prevents the Pad component from re-rendering if its
 * own state hasn't changed, even if the parent component (PadGrid)
 * re-renders. It performs a shallow comparison of the config object
 * and a direct comparison of the pad's state.
 *
 * @param prevProps - The previous props.
 * @param nextProps - The next props.
 * @returns True if the props are equal, false otherwise.
 */
const areEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps): boolean => {
  // ⚡ Bolt: This custom comparison function is critical for performance.
  // It prevents a Pad from re-rendering unless its specific props have changed,
  // avoiding a full grid re-render every 50ms from the parent's state update.
  // The check now includes all `PadConfig` properties to ensure UI consistency.
  const configChanged =
    prevProps.config.id !== nextProps.config.id ||
    prevProps.config.soundId !== nextProps.config.soundId ||
    prevProps.config.volume !== nextProps.config.volume ||
    prevProps.config.pitch !== nextProps.config.pitch ||
    prevProps.config.pan !== nextProps.config.pan ||
    prevProps.config.playbackMode !== nextProps.config.playbackMode ||
    // Shallow compare effects array - assumes array is replaced on change
    prevProps.config.effects !== nextProps.config.effects;

  return (
    !configChanged &&
    prevProps.state === nextProps.state &&
    prevProps.onTrigger === nextProps.onTrigger &&
    prevProps.onStop === nextProps.onStop
  );
};

// Memoized PadWrapper component
export const PadWrapper = React.memo<PadWrapperProps>(({ config, state, onTrigger, onStop }) => {
  return <Pad config={config} state={state} onTrigger={onTrigger} onStop={onStop} />;
}, areEqual);

PadWrapper.displayName = 'PadWrapper';
