const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable tree-shaking and optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer?.minifierConfig,
    compress: {
      drop_console: true, // Remove console.logs in production
      reduce_funcs: true,
    },
    mangle: {
      toplevel: true,
    },
    output: {
      comments: false,
    },
  },
};

// Optimize resolver for better tree-shaking
config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts || []), 'mjs'],
};

module.exports = withNativeWind(config, { input: './global.css' });
