#!/usr/bin/env node

/**
 * Script to replace native confirm() with ConfirmModal
 * Handles both synchronous and async patterns
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_UPDATE = [
  path.join(__dirname, 'index.html'),
  path.join(__dirname, '2026_script.js'),
];

/**
 * Replace confirm calls with ConfirmModal
 * Note: This is a simple replacement. Complex confirm chains may need manual review
 */
function replaceConfirmCalls(content) {
  // Pattern 1: if (!confirm('message')) return;
  let updated = content.replace(
    /if\s*\(\s*!confirm\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)\s*return\s*;/g,
    "if (!(await ConfirmModal.show('$1', {isDangerous: true}))) return;"
  );

  // Pattern 2: if (confirm('message'))
  updated = updated.replace(
    /if\s*\(\s*confirm\s*\(\s*['"`]([^'"`]+)['"`]\s*\)\s*\)/g,
    "if (await ConfirmModal.show('$1', {isDangerous: true}))"
  );

  // Pattern 3: confirm with template literals - special handling
  // This one requires more context, so we'll do it manually for specific cases

  return updated;
}

/**
 * Main update function
 */
function updateFiles() {
  console.log('\n🔄 Replacing confirm() with ConfirmModal...\n');

  FILES_TO_UPDATE.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const confirmCount = (content.match(/confirm\(/g) || []).length;

      if (confirmCount === 0) {
        console.log(`✓ ${path.basename(filePath)} - No confirm() calls found`);
        return;
      }

      // Don't auto-replace in HTML due to template literals
      // Only update JavaScript files
      if (filePath.endsWith('.js')) {
        const updated = replaceConfirmCalls(content);
        
        // Count successful replacements
        const newConfirmCount = (updated.match(/confirm\(/g) || []).length;
        const replaced = confirmCount - newConfirmCount;

        fs.writeFileSync(filePath, updated, 'utf-8');

        console.log(`✓ Updated ${path.basename(filePath)}`);
        if (replaced > 0) {
          console.log(`  - Replaced ${replaced}/${confirmCount} confirm() calls`);
        }
      } else {
        console.log(`⚠️  ${path.basename(filePath)} has ${confirmCount} confirm() calls - requires manual review`);
        console.log(`  - Please review and replace manually for template literals`);
      }
    } catch (err) {
      console.error(`✗ Error updating ${filePath}:`, err.message);
    }
  });

  console.log('\n⚠️  NOTE: Manual review needed for confirm() calls with template literals\n');
}

// Run
updateFiles();
