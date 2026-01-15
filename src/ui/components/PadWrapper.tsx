
import React from 'react';
import { Pad, PadProps } from './Pad';
import { NoteState, PadConfig } from '../../types/audio.types';

interface PadWrapperProps {
  pad: PadConfig;
  padStates: Map<string, NoteState>;
  onTrigger: (padId: string) => void;
  onStop: (padId: string) => void;
}

/**
 * Custom comparison function for React.memo.
 * This function prevents the PadWrapper from re-rendering unless its specific
 * state has changed. This is critical for performance, as the `padStates` map
 * reference changes on every update from the parent.
 *
 * @param prevProps - The previous props.
 * @param nextProps - The next props.
 * @returns True if the props are equal, false otherwise.
 */
const areEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps) => {
  // Check if the state for this specific pad has changed.
  const oldState = prevProps.padStates.get(prevProps.pad.id);
  const newState = nextProps.padStates.get(nextProps.pad.id);

  // Also check if other props that could affect rendering have changed.
  return (
    oldState === newState &&
    prevProps.pad === nextProps.pad &&
    prevProps.onTrigger === nextProps.onTrigger &&
    prevProps.onStop === nextProps.onStop
  );
};

/**
 * PadWrapper is a memoized component that wraps the Pad component.
 * It uses a custom comparison function to prevent re-renders unless the
 * state for its specific pad has changed. This is a key optimization to
 * prevent the entire grid from re-rendering every time any pad's state is updated.
 */
export const PadWrapper: React.FC<PadWrapperProps> = React.memo(
  ({ pad, padStates, onTrigger, onStop }) => {
    return (
      <Pad
        config={pad}
        state={padStates.get(pad.id) || NoteState.IDLE}
        onTrigger={onTrigger}
        onStop={onStop}
      />
    );
  },
  areEqual
);

PadWrapper.displayName = 'PadWrapper';
