module.exports = function override(config) {
  // Fix for @cyntler/react-doc-viewer ESM resolution issue with webpack 5.
  // The package has "type": "module" so its .js files are treated as strict ESM,
  // which requires fully specified imports. This disables that requirement.
  config.module.rules.push({
    test: /\.m?js$/,
    include: /node_modules/,
    resolve: {
      fullySpecified: false,
    },
  });

  return config;
};
