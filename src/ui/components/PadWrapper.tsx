/**
 * Pad Wrapper Component
 *
 * Memoized wrapper for the Pad component to prevent unnecessary re-renders.
 */

import React from 'react';
import { Pad, PadProps } from './Pad';
import { NoteState } from '../../types/audio.types';

export type PadWrapperProps = Omit<PadProps, 'state'> & {
  padStates: Map<string, NoteState>;
};

const areEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps) => {
  // ⚡ Bolt: This custom comparison function is the core of the optimization.
  // It checks if the NoteState for this specific pad has changed.
  // This prevents the component from re-rendering if other pads' states change.
  const prevNoteState = prevProps.padStates.get(prevProps.config.id);
  const nextNoteState = nextProps.padStates.get(nextProps.config.id);

  return (
    prevNoteState === nextNoteState &&
    prevProps.config === nextProps.config &&
    prevProps.onTrigger === nextProps.onTrigger &&
    prevProps.onStop === nextProps.onStop
  );
};

export const PadWrapper: React.FC<PadWrapperProps> = React.memo(
  ({ padStates, ...rest }) => {
    const state = padStates.get(rest.config.id) || NoteState.IDLE;
    return <Pad {...rest} state={state} />;
  },
  areEqual
);

PadWrapper.displayName = 'PadWrapper';
