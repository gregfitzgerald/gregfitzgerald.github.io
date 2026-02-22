#!/usr/bin/env node
/**
 * Master import script - runs all beat importers
 * 
 * Usage:
 *   node scripts/import-all.mjs           # Run all importers
 *   node scripts/import-all.mjs --quick   # Skip slow importers (Twitter)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMPORTERS = [
  { name: 'TILs', script: 'import-til.mjs', slow: false },
  { name: 'GitHub', script: 'import-github.mjs', slow: false },
  { name: 'Zotero', script: 'import-zotero.mjs', slow: false },
  { name: 'Twitter', script: 'import-twitter.mjs', slow: true }
];

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    proc.on('error', reject);
  });
}

async function main() {
  const quick = process.argv.includes('--quick');
  
  console.log('═══════════════════════════════════════');
  console.log('  Beats Import - greg-fitzgerald.com');
  console.log('═══════════════════════════════════════\n');
  
  const importers = quick 
    ? IMPORTERS.filter(i => !i.slow)
    : IMPORTERS;
  
  if (quick) {
    console.log('Running in quick mode (skipping slow importers)\n');
  }
  
  let succeeded = 0;
  let failed = 0;
  
  for (const importer of importers) {
    console.log(`\n▶ ${importer.name}`);
    console.log('─'.repeat(40));
    
    try {
      await runScript(path.join(__dirname, importer.script));
      succeeded++;
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
      failed++;
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log(`  Done: ${succeeded} succeeded, ${failed} failed`);
  console.log('═══════════════════════════════════════\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

main();
