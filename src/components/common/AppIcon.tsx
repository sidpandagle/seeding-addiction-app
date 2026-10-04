import React from 'react';
import { Image, View } from 'react-native';

interface AppIconProps {
  size: number;
}

/**
 * The Seeding launcher icon in a rounded tile.
 * The artwork has a wide margin, so it's scaled up a little to fill the tile.
 */
export default function AppIcon({ size }: AppIconProps) {
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size * 0.25, overflow: 'hidden' }}
    >
      <Image
        source={require('../../../assets/app-icon.png')}
        style={{ width: size, height: size, transform: [{ scale: 1.45 }] }}
        resizeMode="cover"
      />
    </View>
  );
}
