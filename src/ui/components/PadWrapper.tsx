/**
 * Pad Wrapper Component
 *
 * Memoized wrapper for the Pad component to prevent unnecessary re-renders.
 */
import React from 'react';
import { Pad, PadProps } from './Pad';
import { NoteState } from '../../types/audio.types';

export interface PadWrapperProps extends Omit<PadProps, 'state'> {
  padStates: Map<string, NoteState>;
}

const areEqual = (prevProps: PadWrapperProps, nextProps: PadWrapperProps) => {
  // ⚡ Bolt: This custom comparison is the core of the optimization.
  // Instead of the Pad re-rendering whenever the entire padStates map changes,
  // this wrapper ensures it only re-renders if its *own* state has changed.
  // This is much more efficient when many pads are updating frequently.
  const padId = prevProps.config.id;
  const oldState = prevProps.padStates.get(padId) || NoteState.IDLE;
  const newState = nextProps.padStates.get(padId) || NoteState.IDLE;

  // Also check if other props that could affect rendering have changed.
  return oldState === newState &&
         prevProps.config === nextProps.config &&
         prevProps.onTrigger === nextProps.onTrigger &&
         prevProps.onStop === nextProps.onStop;
};

export const PadWrapper: React.FC<PadWrapperProps> = React.memo(
  ({ padStates, config, ...rest }) => {
    const state = padStates.get(config.id) || NoteState.IDLE;
    return <Pad config={config} state={state} {...rest} />;
  },
  areEqual
);

PadWrapper.displayName = 'PadWrapper';
