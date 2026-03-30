#!/usr/bin/env node

/**
 * Script to clean console.log statements from production code
 * Replaces console.* with conditional logging using AppConfig
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_CLEAN = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, '2026_script.js'),
];

/**
 * Remove console statements, keeping only errors and warns
 */
function cleanConsoleStatements(content) {
  // Replace console.log with AppConfig.log (conditional logging)
  let cleaned = content.replace(
    /console\.log\(/g,
    'if (window.AppConfig && !window.AppConfig.isProduction()) console.log('
  );

  // Keep console.error and console.warn (for important messages)
  // No changes needed - they remain as is

  // Remove debug/verbose console calls
  cleaned = cleaned.replace(
    /console\.debug\(/g,
    'if (window.AppConfig && window.AppConfig.debug.enableConsole) console.debug('
  );

  return cleaned;
}

/**
 * Main clean function
 */
function cleanFiles() {
  console.log('\n🧹 Cleaning console statements...\n');

  FILES_TO_CLEAN.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const cleaned = cleanConsoleStatements(content);

      // Count changes
      const logCount = (content.match(/console\.log\(/g) || []).length;
      const debugCount = (content.match(/console\.debug\(/g) || []).length;

      fs.writeFileSync(filePath, cleaned, 'utf-8');

      console.log(`✓ Cleaned ${path.basename(filePath)}`);
      if (logCount > 0) console.log(`  - Wrapped ${logCount} console.log calls`);
      if (debugCount > 0) console.log(`  - Wrapped ${debugCount} console.debug calls`);
    } catch (err) {
      console.error(`✗ Error cleaning ${filePath}:`, err.message);
    }
  });

  console.log('\n✅ Console cleanup complete!\n');
}

// Run
cleanFiles();
