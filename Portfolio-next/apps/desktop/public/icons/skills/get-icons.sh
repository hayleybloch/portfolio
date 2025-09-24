#!/bin/bash

set -e

ICON_DIR="public/icons/skills"
mkdir -p "$ICON_DIR"

# SimpleIcons
curl -L https://simpleicons.org/icons/python.svg      -o "$ICON_DIR/python.svg"
curl -L https://simpleicons.org/icons/arduino.svg     -o "$ICON_DIR/arduino.svg"
curl -L https://simpleicons.org/icons/javascript.svg  -o "$ICON_DIR/javascript.svg"
curl -L https://simpleicons.org/icons/html5.svg       -o "$ICON_DIR/html5.svg"
curl -L https://simpleicons.org/icons/css3.svg        -o "$ICON_DIR/css3.svg"
curl -L https://simpleicons.org/icons/kicad.svg       -o "$ICON_DIR/kicad.svg"
curl -L https://simpleicons.org/icons/raspberrypi.svg -o "$ICON_DIR/raspberrypi.svg"
curl -L https://simpleicons.org/icons/autodesk.svg    -o "$ICON_DIR/autodesk.svg"
curl -L https://simpleicons.org/icons/blender.svg     -o "$ICON_DIR/blender.svg"
curl -L https://simpleicons.org/icons/figma.svg       -o "$ICON_DIR/figma.svg"
curl -L https://simpleicons.org/icons/canva.svg       -o "$ICON_DIR/canva.svg"

# Lucide line icons, generic stand-ins
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cpu.svg        -o "$ICON_DIR/cpu.svg"        # microcontrollers
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/wrench.svg     -o "$ICON_DIR/soldering.svg"  # soldering stand-in
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/printer.svg    -o "$ICON_DIR/printer.svg"    # 3D printing
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/scan.svg       -o "$ICON_DIR/laser.svg"      # laser cutting stand-in
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/cup-soda.svg   -o "$ICON_DIR/ceramics.svg"   # ceramics stand-in
curl -L https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shirt.svg      -o "$ICON_DIR/fashion.svg"    # fashion

echo "Downloaded icons to $ICON_DIR"

# Zip the folder
cd public
zip -r ../skills_icons.zip icons/skills >/dev/null
cd ..

echo "Created skills_icons.zip in project root"

