/**
 * Pad Wrapper Component
 *
 * Memoizes the Pad component with a custom props comparison
 * to prevent unnecessary re-renders.
 */

import React from 'react';
import { Pad, PadProps } from './Pad';

type PadWrapperProps = PadProps;

/**
 * Custom comparison function for React.memo.
 *
 * This function prevents the Pad component from re-rendering if its
 * own state hasn't changed, even if the parent component (PadGrid)
 * re-renders. It performs a shallow comparison of the config object
 * and a direct comparison of the pad's state.
 *
 * ⚡ Bolt: Optimized to ignore audio-only properties (pan, filter, effects)
 * from the equality check. These properties do not affect the visual
 * rendering of the Pad component, so we can skip re-renders when they change.
 *
 * @param prevProps - The previous props.
 * @param nextProps - The next props.
 * @returns True if the props are equal, false otherwise.
 */
export const arePropsEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps): boolean => {
  return (
    prevProps.state === nextProps.state &&
    prevProps.loadState === nextProps.loadState &&
    prevProps.config.id === nextProps.config.id &&
    prevProps.config.soundId === nextProps.config.soundId &&
    prevProps.config.volume === nextProps.config.volume &&
    prevProps.config.pitch === nextProps.config.pitch &&
    prevProps.config.playbackMode === nextProps.config.playbackMode &&
    // Intentionally ignoring audio-only properties:
    // - pan
    // - filterFrequency
    // - filterResonance
    // - effects
    prevProps.onTrigger === nextProps.onTrigger &&
    prevProps.onStop === nextProps.onStop
  );
};

// Memoized PadWrapper component
export const PadWrapper = React.memo<PadWrapperProps>(
  ({ config, state, loadState, onTrigger, onStop }) => {
    return (
      <Pad
        config={config}
        state={state}
        loadState={loadState}
        onTrigger={onTrigger}
        onStop={onStop}
      />
    );
  },
  arePropsEqual
);

PadWrapper.displayName = 'PadWrapper';
