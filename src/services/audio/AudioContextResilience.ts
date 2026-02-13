/**
 * AudioContext Resilience Helper
 *
 * Provides fallback mechanisms and diagnostics for AudioContext failures
 */

export interface AudioContextDiagnostics {
  browser: string;
  browserVersion: string;
  os: string;
  audioContextState: string;
  error: Error | null;
  timestamp: number;
  retryAttempts: number;
}

export interface AudioContextResilienceConfig {
  maxRetries?: number;
  retryDelay?: number;
  onDiagnostics?: (diagnostics: AudioContextDiagnostics) => void;
  onFallback?: () => void;
}

export class AudioContextResilience {
  private config: Required<Omit<AudioContextResilienceConfig, 'onDiagnostics' | 'onFallback'>> & {
    onDiagnostics?: (diagnostics: AudioContextDiagnostics) => void;
    onFallback?: () => void;
  };

  constructor(config: AudioContextResilienceConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      onDiagnostics: config.onDiagnostics,
      onFallback: config.onFallback
    };
  }

  /**
   * Attempt to resume the audio context with retry logic and diagnostics
   */
  public async resumeWithRetry(
    audioContext: AudioContext,
    userInteractionEvent?: Event
  ): Promise<boolean> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.config.maxRetries) {
      try {
        // Attempt to resume
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Check if successful
        if (audioContext.state === 'running') {
          console.log(
            `[AudioContextResilience] Successfully resumed audio context (attempt ${retryCount + 1})`
          );
          return true;
        }

        // If not running, treat as error
        throw new Error(`AudioContext state is ${audioContext.state} after resume attempt`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount++;

        console.warn(
          `[AudioContextResilience] Resume attempt ${retryCount} failed:`,
          lastError.message
        );

        // Log diagnostics
        const diagnostics = this.collectDiagnostics(audioContext, lastError, retryCount);
        if (this.config.onDiagnostics) {
          this.config.onDiagnostics(diagnostics);
        }

        // Wait before retry (with exponential backoff)
        if (retryCount < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, retryCount - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    console.error(
      `[AudioContextResilience] Failed to resume audio context after ${this.config.maxRetries} attempts`
    );

    // Log final diagnostics
    const finalDiagnostics = this.collectDiagnostics(audioContext, lastError, retryCount);
    console.error('[AudioContextResilience] Final diagnostics:', finalDiagnostics);

    if (this.config.onDiagnostics) {
      this.config.onDiagnostics(finalDiagnostics);
    }

    // Trigger fallback if available
    if (this.config.onFallback) {
      this.config.onFallback();
    }

    return false;
  }

  /**
   * Collect detailed diagnostics about the audio context and environment
   */
  private collectDiagnostics(
    audioContext: AudioContext,
    error: Error | null,
    retryAttempts: number
  ): AudioContextDiagnostics {
    const userAgent = navigator.userAgent;

    // Parse browser info
    const browserInfo = this.parseBrowserInfo(userAgent);

    return {
      browser: browserInfo.browser,
      browserVersion: browserInfo.version,
      os: browserInfo.os,
      audioContextState: audioContext.state,
      error,
      timestamp: Date.now(),
      retryAttempts
    };
  }

  /**
   * Parse browser information from user agent
   */
  private parseBrowserInfo(userAgent: string): {
    browser: string;
    version: string;
    os: string;
  } {
    let browser = 'Unknown';
    let version = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      browser = 'Opera';
      const match = userAgent.match(/(Opera|OPR)\/(\d+)/);
      version = match ? match[2] : 'Unknown';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      os = 'iOS';
    }

    return { browser, version, os };
  }

  /**
   * Check if Web Audio API is supported
   */
  public static isWebAudioSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      (window.AudioContext !== undefined ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext !== undefined)
    );
  }

  /**
   * Get detailed Web Audio API support information
   */
  public static getWebAudioSupportInfo(): {
    supported: boolean;
    hasStandardAudioContext: boolean;
    hasWebkitAudioContext: boolean;
    features: {
      audioWorklet: boolean;
      decodeAudioData: boolean;
      createStereoPanner: boolean;
    };
  } {
    const hasStandardAudioContext = typeof AudioContext !== 'undefined';
    const hasWebkitAudioContext =
      typeof (
        window as typeof window & { webkitAudioContext?: typeof AudioContext }
      ).webkitAudioContext !== 'undefined';

    const supported = hasStandardAudioContext || hasWebkitAudioContext;

    // Check for specific features
    let features = {
      audioWorklet: false,
      decodeAudioData: false,
      createStereoPanner: false
    };

    if (supported) {
      try {
        const testContext =
          new AudioContext() ||
          new (
            window as typeof window & { webkitAudioContext?: typeof AudioContext }
          ).webkitAudioContext!();
        features = {
          audioWorklet: 'audioWorklet' in testContext,
          decodeAudioData: typeof testContext.decodeAudioData === 'function',
          createStereoPanner: typeof testContext.createStereoPanner === 'function'
        };
        testContext.close();
      } catch (error) {
        console.warn('[AudioContextResilience] Error checking Web Audio features:', error);
      }
    }

    return {
      supported,
      hasStandardAudioContext,
      hasWebkitAudioContext,
      features
    };
  }
}
