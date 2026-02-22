#!/usr/bin/env node
/**
 * Import GitHub activity as beats
 * 
 * Uses GitHub API to fetch recent events
 * No authentication required for public activity
 */

import { loadBeats, saveBeats, mergeBeats, generateBeatId, fetchJSON, formatDate } from './beats-utils.mjs';

// Configuration
const GITHUB_USERNAME = 'gregfitzgerald';
const DAYS_BACK = 30;

// Event types to include and how to describe them
const EVENT_TYPES = {
  'PushEvent': (e) => ({
    title: `Pushed to ${e.repo.name.split('/')[1]}`,
    description: e.payload.commits?.[0]?.message?.split('\n')[0] || null,
    url: `https://github.com/${e.repo.name}`
  }),
  'CreateEvent': (e) => {
    if (e.payload.ref_type === 'repository') {
      return {
        title: `Created ${e.repo.name.split('/')[1]}`,
        description: e.payload.description || 'New repository',
        url: `https://github.com/${e.repo.name}`
      };
    }
    if (e.payload.ref_type === 'branch') {
      return {
        title: `Created branch ${e.payload.ref} in ${e.repo.name.split('/')[1]}`,
        description: null,
        url: `https://github.com/${e.repo.name}/tree/${e.payload.ref}`
      };
    }
    return null;
  },
  'ReleaseEvent': (e) => ({
    title: `Released ${e.payload.release.tag_name} of ${e.repo.name.split('/')[1]}`,
    description: e.payload.release.name || null,
    url: e.payload.release.html_url
  }),
  'PublicEvent': (e) => ({
    title: `Made ${e.repo.name.split('/')[1]} public`,
    description: null,
    url: `https://github.com/${e.repo.name}`
  })
};

async function main() {
  console.log('💻 Importing GitHub activity...');
  
  const since = new Date();
  since.setDate(since.getDate() - DAYS_BACK);
  
  try {
    // Fetch recent events
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`;
    const events = await fetchJSON(url, {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'beats-importer'
    });
    
    console.log(`   Found ${events.length} events`);
    
    // Convert to beats
    const beats = [];
    const seenRepos = new Set(); // Dedupe multiple pushes to same repo
    
    for (const event of events) {
      const eventDate = new Date(event.created_at);
      
      // Skip old events
      if (eventDate < since) continue;
      
      // Skip unsupported event types
      const handler = EVENT_TYPES[event.type];
      if (!handler) continue;
      
      const beatData = handler(event);
      if (!beatData) continue;
      
      // For push events, only show one per repo per day
      if (event.type === 'PushEvent') {
        const key = `${event.repo.name}-${formatDate(eventDate)}`;
        if (seenRepos.has(key)) continue;
        seenRepos.add(key);
      }
      
      beats.push({
        id: generateBeatId('code', event.id),
        type: 'code',
        title: beatData.title,
        description: beatData.description,
        url: beatData.url,
        date: formatDate(eventDate),
        source: 'GitHub',
        meta: {
          eventType: event.type,
          repo: event.repo.name
        }
      });
    }
    
    console.log(`   ${beats.length} events within last ${DAYS_BACK} days`);
    
    // Merge with existing beats
    const data = loadBeats();
    const added = mergeBeats(data, beats, 'github');
    saveBeats(data);
    
    console.log(`✓ Added ${added} new code beats`);
    
  } catch (e) {
    console.error('❌ Error fetching from GitHub:', e.message);
    process.exit(1);
  }
}

main();
