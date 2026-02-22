#!/usr/bin/env node
/**
 * Import TILs from data/tils.md as beats
 * 
 * Format in tils.md:
 * ---
 * ## YYYY-MM-DD: Title
 * 
 * Content here (optional, used as description)
 * 
 * Tags: tag1, tag2
 * ---
 */

import { loadBeats, saveBeats, mergeBeats, generateBeatId, formatDate } from './beats-utils.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TILS_PATH = path.join(__dirname, '..', 'data', 'tils.md');

function parseTils(content) {
  const tils = [];
  
  // Split by horizontal rules
  const sections = content.split(/^---$/m);
  
  for (const section of sections) {
    // Look for header pattern: ## YYYY-MM-DD: Title
    const headerMatch = section.match(/^##\s+(\d{4}-\d{2}-\d{2}):\s*(.+)$/m);
    if (!headerMatch) continue;
    
    const date = headerMatch[1];
    const title = headerMatch[2].trim();
    
    // Get content after header, before Tags line
    let description = '';
    const lines = section.split('\n');
    const headerIdx = lines.findIndex(l => l.match(/^##\s+\d{4}-\d{2}-\d{2}/));
    const tagsIdx = lines.findIndex(l => l.match(/^Tags:/i));
    
    if (headerIdx !== -1) {
      const endIdx = tagsIdx !== -1 ? tagsIdx : lines.length;
      const contentLines = lines.slice(headerIdx + 1, endIdx)
        .map(l => l.trim())
        .filter(l => l.length > 0);
      
      // Take first paragraph as description
      if (contentLines.length > 0) {
        description = contentLines[0];
        if (description.length > 150) {
          description = description.substring(0, 147) + '...';
        }
      }
    }
    
    // Parse tags
    let tags = [];
    const tagsMatch = section.match(/^Tags:\s*(.+)$/im);
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim().toLowerCase());
    }
    
    // Generate stable ID from date + title
    const hash = crypto.createHash('md5')
      .update(`${date}-${title}`)
      .digest('hex')
      .substring(0, 8);
    
    tils.push({
      id: generateBeatId('til', hash),
      type: 'til',
      title: title,
      description: description || null,
      url: null, // TILs don't link anywhere (could link to a page later)
      date: date,
      source: 'TIL',
      meta: {
        tags: tags
      }
    });
  }
  
  return tils;
}

async function main() {
  console.log('💡 Importing TILs...');
  
  // Check if file exists
  if (!fs.existsSync(TILS_PATH)) {
    console.log('   No tils.md file found, skipping');
    return;
  }
  
  const content = fs.readFileSync(TILS_PATH, 'utf-8');
  const tils = parseTils(content);
  
  console.log(`   Found ${tils.length} TILs`);
  
  // Skip the example TIL
  const realTils = tils.filter(t => !t.title.toLowerCase().includes('example'));
  
  if (realTils.length === 0) {
    console.log('   No TILs to import (only example found)');
    return;
  }
  
  // Merge with existing beats
  const data = loadBeats();
  const added = mergeBeats(data, realTils, 'til');
  saveBeats(data);
  
  console.log(`✓ Added ${added} new TIL beats`);
}

main();
