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
 * @param prevProps - The previous props.
 * @param nextProps - The next props.
 * @returns True if the props are equal, false otherwise.
 */
const areEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps): boolean => {
  return (
    prevProps.state === nextProps.state &&
    prevProps.config.id === nextProps.config.id &&
    prevProps.config.soundId === nextProps.config.soundId &&
    prevProps.config.volume === nextProps.config.volume &&
    prevProps.config.pitch === nextProps.config.pitch &&
    prevProps.config.playbackMode === nextProps.config.playbackMode &&
    prevProps.config.pan === nextProps.config.pan &&
    prevProps.config.filterFrequency === nextProps.config.filterFrequency &&
    prevProps.config.filterResonance === nextProps.config.filterResonance &&
    prevProps.config.effects === nextProps.config.effects &&
    prevProps.onTrigger === nextProps.onTrigger &&
    prevProps.onStop === nextProps.onStop
  );
};

// Memoized PadWrapper component
export const PadWrapper = React.memo<PadWrapperProps>(({ config, state, onTrigger, onStop }) => {
  return <Pad config={config} state={state} onTrigger={onTrigger} onStop={onStop} />;
}, areEqual);

PadWrapper.displayName = 'PadWrapper';
