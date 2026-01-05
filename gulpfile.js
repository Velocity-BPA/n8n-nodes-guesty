/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 */

const { src, dest, series } = require('gulp');
const path = require('path');

/**
 * Copy SVG icons to dist folder
 */
function copyIcons() {
  return src('nodes/**/*.svg')
    .pipe(dest('dist/nodes'));
}

/**
 * Copy any additional assets
 */
function copyAssets() {
  return src('nodes/**/*.{png,jpg,jpeg,gif}')
    .pipe(dest('dist/nodes'));
}

// Export tasks
exports['build:icons'] = series(copyIcons, copyAssets);
exports.default = exports['build:icons'];
