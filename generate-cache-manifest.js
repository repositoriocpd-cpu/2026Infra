#!/usr/bin/env node

/**
 * Generate cache manifest for Service Worker
 * Creates hash-based versioning for better cache busting
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Calculate file hash
 */
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return hash.substring(0, 8); // Short hash
  } catch (error) {
    console.warn(`Could not hash file: ${filePath}`);
    return null;
  }
}

/**
 * Generate manifest
 */
function generateManifest() {
  const manifest = {
    version: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    files: {},
  };

  const FILES = [
    'index.html',
    '2026_script.js',
    'config.js',
    'confirm-modal.js',
    'pwa-handler.js',
    'ui-kit.css',
    'ui-kit.js',
    'manifest.json',
    'sw.js',
  ];

  FILES.forEach((file) => {
    const filePath = path.join(__dirname, file);
    const hash = getFileHash(filePath);
    if (hash) {
      manifest.files[file] = hash;
    }
  });

  const manifestPath = path.join(__dirname, '.cache-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('✓ Cache manifest generated:', manifestPath);
  return manifest;
}

/**
 * Update index.html with cache version
 */
function updateCacheVersion() {
  const manifest = generateManifest();
  const cacheVersion = `${manifest.version}-${crypto
    .createHash('md5')
    .update(JSON.stringify(manifest.files))
    .digest('hex')
    .substring(0, 8)}`;

  // Create version file for reference
  const versionPath = path.join(__dirname, '.cache-version');
  fs.writeFileSync(versionPath, cacheVersion);

  console.log('✓ Cache version:', cacheVersion);
}

// Run
try {
  updateCacheVersion();
  console.log('✅ Cache manifest complete!\n');
} catch (error) {
  console.error('❌ Error generating manifest:', error.message);
  process.exit(1);
}
