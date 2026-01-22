#!/bin/bash

SOURCE_IMG="/Users/murilomendonca/.gemini/antigravity/brain/df836686-d6ec-45fd-bd82-1b618e794342/app_icon_licita_gestor_1769022616469.png"
ICONSET_DIR="/Users/murilomendonca/Desktop/Licita Gestor.app/Contents/Resources/AppIcon.iconset"
DEST_ICNS="/Users/murilomendonca/Desktop/Licita Gestor.app/Contents/Resources/AppIcon.icns"
TEMP_PNG="/tmp/source_fixed.png"

# Ensure source is valid PNG
sips -s format png "$SOURCE_IMG" --out "$TEMP_PNG"

mkdir -p "$ICONSET_DIR"

# Resize images with explicit format
sips -z 16 16     -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16.png"
sips -z 32 32     -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
sips -z 32 32     -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32.png"
sips -z 64 64     -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
sips -z 128 128   -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128.png"
sips -z 256 256   -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
sips -z 256 256   -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256.png"
sips -z 512 512   -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
sips -z 512 512   -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512.png"
sips -z 1024 1024 -s format png "$TEMP_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png"

# Create icns
iconutil -c icns "$ICONSET_DIR" -o "$DEST_ICNS"

# Cleanup
rm -rf "$ICONSET_DIR"
rm "$TEMP_PNG"
echo "Icon creation attempted at $DEST_ICNS"
