/**
 * Debug Panel Component
 *
 * Displays real-time debugging information for the audio engine
 */

import React from 'react';
import { AudioMetrics, TempoConfig } from '../../types/audio.types';

export interface DebugPanelProps {
  bpm: number;
  currentTime: number;
  currentBeat: number;
  activePads: string[];
  metrics: AudioMetrics;
  tempo: TempoConfig;
  className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = React.memo(
  ({ bpm, currentTime, currentBeat, activePads, metrics, tempo, className = '' }) => {
    return (
      <div className={`debug-panel ${className}`} style={debugPanelStyle}>
        <div style={debugHeaderStyle}>
          <strong>🔧 Debug Panel</strong>
        </div>
        <div style={debugContentStyle}>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>BPM:</span>
            <span style={debugValueStyle}>{bpm}</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Current Time:</span>
            <span style={debugValueStyle}>{currentTime.toFixed(3)}s</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Current Beat:</span>
            <span style={debugValueStyle}>{currentBeat.toFixed(2)}</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Time Signature:</span>
            <span style={debugValueStyle}>
              {tempo.timeSignature.numerator}/{tempo.timeSignature.denominator}
            </span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Quantize Grid:</span>
            <span style={debugValueStyle}>{tempo.quantizeGrid}th notes</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Active Pads:</span>
            <span style={debugValueStyle}>
              {activePads.length > 0 ? activePads.join(', ') : 'None'}
            </span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Active Voices:</span>
            <span style={debugValueStyle}>{metrics.activeVoices}</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>CPU Usage:</span>
            <span style={debugValueStyle}>{metrics.cpuUsage.toFixed(1)}%</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Latency:</span>
            <span style={debugValueStyle}>{metrics.latency.toFixed(2)}ms</span>
          </div>
          <div style={debugRowStyle}>
            <span style={debugLabelStyle}>Dropouts:</span>
            <span style={debugValueStyle}>{metrics.dropouts}</span>
          </div>
        </div>
      </div>
    );
  }
);

DebugPanel.displayName = 'DebugPanel';

// Inline styles for the debug panel
const debugPanelStyle: React.CSSProperties = {
  position: 'fixed',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  color: '#00ff00',
  fontFamily: 'monospace',
  fontSize: '12px',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #00ff00',
  minWidth: '250px',
  zIndex: 9999,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
};

const debugHeaderStyle: React.CSSProperties = {
  marginBottom: '10px',
  paddingBottom: '5px',
  borderBottom: '1px solid #00ff00',
  fontSize: '14px'
};

const debugContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const debugRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px'
};

const debugLabelStyle: React.CSSProperties = {
  color: '#00ff00',
  fontWeight: 'bold'
};

const debugValueStyle: React.CSSProperties = {
  color: '#ffffff',
  textAlign: 'right'
};
