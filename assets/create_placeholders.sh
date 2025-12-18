#!/bin/bash
# Create simple placeholder images using ImageMagick if available
# Otherwise document that assets should be added

if command -v convert &> /dev/null; then
    # Create icon.png (1024x1024)
    convert -size 1024x1024 xc:"#6c5ce7" \
        -gravity center \
        -pointsize 300 -fill white -annotate +0+0 "♪" \
        icon.png
    
    # Create adaptive-icon.png (1024x1024)
    cp icon.png adaptive-icon.png
    
    # Create favicon.png (48x48)
    convert icon.png -resize 48x48 favicon.png
    
    # Create splash.png (1242x2436)
    convert -size 1242x2436 xc:"#1a1a2e" \
        -gravity center \
        -pointsize 200 -fill "#6c5ce7" -annotate +0-100 "♪" \
        -pointsize 80 -fill white -annotate +0+200 "Looper" \
        splash.png
    
    echo "Placeholder assets created successfully!"
else
    echo "ImageMagick not found. Please add custom assets manually or install ImageMagick."
    echo "Creating empty placeholder files..."
    touch icon.png adaptive-icon.png favicon.png splash.png
    echo "Note: These are empty files. Replace with actual images before building."
fi
