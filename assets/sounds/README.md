# Sound Pack Assets

This directory contains sound packs for the loop pad.

## Structure

```
sounds/
├── hip-hop/
│   ├── kick.wav
│   ├── snare.wav
│   ├── hihat.wav
│   └── ...
├── electronic/
│   ├── synth1.wav
│   ├── bass.wav
│   └── ...
└── trap/
    ├── 808.wav
    ├── hihat-roll.wav
    └── ...
```

## Adding Custom Sounds

1. Place your audio files (WAV, MP3, M4A) in the appropriate category folder
2. Update the sound pack configuration in the app
3. Sounds should be:
   - High quality (44.1kHz or higher)
   - Mono or stereo
   - Short samples (< 5 seconds for loops)
   - Properly trimmed with no silence at start/end

## Sound Pack Structure

Each sound pack should contain 16 sounds mapped to the 4x4 grid:
- Position 1-4: Kick drums, bass
- Position 5-8: Snares, claps
- Position 9-12: Hi-hats, percussion
- Position 13-16: FX, vocals, melodies
