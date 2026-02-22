#!/usr/bin/env node
/**
 * Import recent Zotero additions as beats
 * 
 * Uses Zotero Web API to fetch recently added items
 * API docs: https://www.zotero.org/support/dev/web_api/v3/basics
 */

import { loadBeats, saveBeats, mergeBeats, generateBeatId, fetchJSON, formatDate } from './beats-utils.mjs';
import fs from 'fs';
import path from 'path';

// Configuration
const ZOTERO_USER_ID = '6880732';
const API_KEY_PATH = '/mnt/c/Users/gregs/Drive/programming_GF776417/claude-code-companion/zotero api key.txt';

// How many days back to look
const DAYS_BACK = 30;

async function main() {
  console.log('📚 Importing Zotero items...');
  
  // Load API key
  let apiKey;
  try {
    apiKey = fs.readFileSync(API_KEY_PATH, 'utf-8').trim();
  } catch (e) {
    console.error('❌ Could not read Zotero API key from:', API_KEY_PATH);
    console.error('   Make sure the file exists and contains your API key.');
    process.exit(1);
  }
  
  const headers = {
    'Zotero-API-Key': apiKey,
    'Zotero-API-Version': '3'
  };
  
  // Calculate date threshold
  const since = new Date();
  since.setDate(since.getDate() - DAYS_BACK);
  
  try {
    // Fetch recent items - filter locally instead of via API (Zotero API syntax is complex)
    const url = `https://api.zotero.org/users/${ZOTERO_USER_ID}/items?limit=100&sort=dateAdded&direction=desc`;
    const items = await fetchJSON(url, headers);
    
    console.log(`   Found ${items.length} items`);
    
    // Convert to beats
    const beats = [];
    for (const item of items) {
      const data = item.data;
      const dateAdded = new Date(data.dateAdded);
      
      // Skip items older than threshold
      if (dateAdded < since) continue;
      
      // Skip notes, attachments, and annotations (double-check)
      const skipTypes = ['note', 'attachment', 'annotation'];
      if (skipTypes.includes(data.itemType)) continue;
      
      // Skip items without a title
      if (!data.title || data.title.trim() === '') continue;
      
      // Build URL - prefer DOI, then Zotero link
      let url = null;
      if (data.DOI) {
        url = `https://doi.org/${data.DOI}`;
      } else if (data.url) {
        url = data.url;
      }
      
      // Format authors
      let authors = '';
      if (data.creators && data.creators.length > 0) {
        const firstAuthor = data.creators[0];
        authors = firstAuthor.lastName || firstAuthor.name || '';
        if (data.creators.length > 1) {
          authors += ' et al.';
        }
      }
      
      beats.push({
        id: generateBeatId('paper', data.key),
        type: 'paper',
        title: data.title || 'Untitled',
        description: authors ? `${authors} (${data.date || 'n.d.'})` : null,
        url: url,
        date: formatDate(dateAdded),
        source: 'Zotero',
        meta: {
          itemType: data.itemType,
          key: data.key
        }
      });
    }
    
    console.log(`   ${beats.length} items within last ${DAYS_BACK} days`);
    
    // Merge with existing beats
    const data = loadBeats();
    const added = mergeBeats(data, beats, 'zotero');
    saveBeats(data);
    
    console.log(`✓ Added ${added} new paper beats`);
    
  } catch (e) {
    console.error('❌ Error fetching from Zotero:', e.message);
    process.exit(1);
  }
}

main();
