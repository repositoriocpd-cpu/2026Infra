#!/usr/bin/env node

/**
 * Build Script for SUB INFRA Panel
 * Cross-platform build script (Windows, Mac, Linux)
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, 'dist');
const FILES_TO_COPY = [
  'index.html',
  '2026_script.js',
  'pwa-handler.js',
  'ui-kit.css',
  'ui-kit.js',
  'manifest.json',
  'sw.js',
  '_redirects',
  'icone_logo.png',
];
const DIRS_TO_COPY = ['icons', 'public'];

/**
 * Copy file from source to destination
 */
function copyFile(src, dst) {
  const srcPath = path.join(__dirname, src);
  const dstPath = path.join(DIST_DIR, src);

  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  File not found: ${src}`);
    return false;
  }

  try {
    fs.copyFileSync(srcPath, dstPath);
    console.log(`✓ Copied ${src}`);
    return true;
  } catch (err) {
    console.error(`✗ Error copying ${src}:`, err.message);
    return false;
  }
}

/**
 * Copy directory recursively
 */
function copyDir(src, dst) {
  const srcPath = path.join(__dirname, src);
  const dstPath = path.join(DIST_DIR, src);

  if (!fs.existsSync(srcPath)) {
    console.warn(`⚠️  Directory not found: ${src}`);
    return false;
  }

  try {
    copyDirRecursive(srcPath, dstPath);
    console.log(`✓ Copied directory ${src}`);
    return true;
  } catch (err) {
    console.error(`✗ Error copying ${src}:`, err.message);
    return false;
  }
}

/**
 * Recursive directory copy helper
 */
function copyDirRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcFile = path.join(src, file);
    const dstFile = path.join(dst, file);
    const stat = fs.statSync(srcFile);

    if (stat.isDirectory()) {
      copyDirRecursive(srcFile, dstFile);
    } else {
      fs.copyFileSync(srcFile, dstFile);
    }
  });
}

/**
 * Main build function
 */
function build() {
  console.log('\n🔨 Building SUB INFRA Panel...\n');

  // Remove old dist folder
  if (fs.existsSync(DIST_DIR)) {
    console.log('Removing old dist folder...');
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }

  // Create new dist folder
  console.log('Creating dist folder...\n');
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy files
  console.log('Copying files:');
  FILES_TO_COPY.forEach((file) => copyFile(file, DIST_DIR));

  // Copy directories
  console.log('\nCopying directories:');
  DIRS_TO_COPY.forEach((dir) => copyDir(dir, DIST_DIR));

  console.log('\n✅ Build complete! Files are in the dist/ folder.\n');
}

// Run build
try {
  build();
  process.exit(0);
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
}
