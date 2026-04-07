#!/usr/bin/env node

/**
 * Build Script for SUB INFRA Panel
 * Cross-platform build script (Windows, Mac, Linux)
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');
const FILES_TO_COPY = [
  'index.html',
  '2026_script.js',
  'config.js',
  'confirm-modal.js',
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
function copyFileSync(src, dst) {
  const content = fs.readFileSync(src);
  fs.writeFileSync(dst, content);
}

/**
 * Copy directory recursively
 */
function copyDirRecursive(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      const content = fs.readFileSync(srcPath);
      fs.writeFileSync(dstPath, content);
    }
  }
}

/**
 * Remove directory recursively with Windows EPERM workaround
 */
function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  try {
    fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
    return;
  } catch (err) {
    // Fallback: try to empty contents manually then remove
    try {
      emptyDirSync(dirPath);
      fs.rmdirSync(dirPath);
      return;
    } catch (e) {
      // Cannot remove - will use alternative build path
    }
  }
}

/**
 * Recursively empty a directory
 */
function emptyDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        emptyDirSync(fullPath);
        try {
          fs.rmdirSync(fullPath);
        } catch (e) { /* ignore */ }
      } else {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) { /* ignore */ }
      }
    }
  } catch (e) { /* ignore readdir errors */ }
}

/**
 * Check if a directory is accessible (not a zombie)
 */
function isDirAccessible(dirPath) {
  try {
    fs.readdirSync(dirPath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if dist folder has any zombie subdirectories
 */
function hasZombieDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return false;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dirPath, entry.name);
        if (!isDirAccessible(fullPath)) {
          return true;
        }
        // Check recursively
        if (hasZombieDirs(fullPath)) {
          return true;
        }
      }
    }
  } catch (e) {
    return true; // If we can't read the directory, it's a zombie
  }
  
  return false;
}

/**
 * Build function
 */
function build() {
  console.log('\n🔨 Building SUB INFRA Panel...\n');

  // Try to clean dist, but handle Windows permission issues
  let buildDir = DIST_DIR;
  let useCleanDist = true;

  if (fs.existsSync(DIST_DIR)) {
    console.log('Attempting to clean dist folder...');
    removeDirRecursive(DIST_DIR);

    // Check if dist still exists and has zombie directories
    if (fs.existsSync(DIST_DIR)) {
      if (hasZombieDirs(DIST_DIR)) {
        console.log('⚠️  Dist folder has zombie directories, using alternative build path...');
        useCleanDist = false;
        buildDir = path.join(ROOT, 'dist-new');
      } else {
        // Try to remove what we can
        try {
          fs.rmSync(DIST_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
        } catch (e) {
          // Remove accessible files only
          try {
            const entries = fs.readdirSync(DIST_DIR, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isFile()) {
                try { fs.unlinkSync(path.join(DIST_DIR, entry.name)); } catch (e) {}
              }
            }
          } catch (e) {}
        }
      }
    }
  }

  if (useCleanDist) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  } else {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Generate cache manifest
  console.log('Generating cache manifest...');
  try {
    require('./generate-cache-manifest.js');
  } catch (err) {
    console.warn('⚠️  Could not generate cache manifest:', err.message);
  }

  // Copy files
  console.log('\nCopying files:');
  FILES_TO_COPY.forEach((file) => {
    const srcPath = path.join(ROOT, file);
    const dstPath = path.join(buildDir, file);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }

    try {
      copyFileSync(srcPath, dstPath);
      console.log(`✓ Copied ${file}`);
    } catch (err) {
      console.error(`✗ Error copying ${file}:`, err.message);
    }
  });

  // Copy directories
  console.log('\nCopying directories:');
  DIRS_TO_COPY.forEach((dir) => {
    const srcPath = path.join(ROOT, dir);
    const dstPath = path.join(buildDir, dir);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠️  Directory not found: ${dir}`);
      return;
    }

    try {
      copyDirRecursive(srcPath, dstPath);
      console.log(`✓ Copied directory ${dir}`);
    } catch (err) {
      console.error(`✗ Error copying ${dir}:`, err.message);
    }
  });

  console.log(`\n✅ Build complete! Files are in the ${path.relative(ROOT, buildDir)}/ folder.\n`);

  // Write build output path for use by build-env.js
  fs.writeFileSync(path.join(ROOT, '.build-output.json'), JSON.stringify({ buildDir }));

  // If we built to an alternative path, inform user
  if (buildDir !== DIST_DIR) {
    console.log('ℹ️  Used alternative build path due to Windows permission issues.');
    console.log('   To fix: run "rd /s /q dist" in an Administrator command prompt.');
    console.log(`   Then update netlify.toml to publish: ${path.relative(ROOT, buildDir)}`);
  }
}

// Run build
try {
  build();
  process.exit(0);
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
}
