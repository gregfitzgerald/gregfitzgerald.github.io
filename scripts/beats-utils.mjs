/**
 * Shared utilities for beats importers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BEATS_PATH = path.join(__dirname, '..', 'data', 'beats.json');

/**
 * Load existing beats data
 */
export function loadBeats() {
  try {
    const data = fs.readFileSync(BEATS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {
      beats: [],
      lastUpdated: null,
      sources: {}
    };
  }
}

/**
 * Save beats data
 */
export function saveBeats(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(BEATS_PATH, JSON.stringify(data, null, 2));
  console.log(`✓ Saved ${data.beats.length} beats to ${BEATS_PATH}`);
}

/**
 * Generate a stable ID for a beat
 */
export function generateBeatId(type, identifier) {
  return `${type}-${identifier}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Add beats without duplicates
 * @param {Object} data - The beats data object
 * @param {Array} newBeats - New beats to add
 * @param {string} source - Source name for tracking
 * @returns {number} Number of new beats added
 */
export function mergeBeats(data, newBeats, source) {
  const existingIds = new Set(data.beats.map(b => b.id));
  let added = 0;
  
  for (const beat of newBeats) {
    if (!existingIds.has(beat.id)) {
      data.beats.push(beat);
      existingIds.add(beat.id);
      added++;
    }
  }
  
  // Update source tracking
  if (!data.sources) data.sources = {};
  data.sources[source] = {
    lastSync: new Date().toISOString(),
    count: newBeats.length
  };
  
  // Sort by date (newest first)
  data.beats.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return added;
}

/**
 * Fetch JSON from a URL
 */
export async function fetchJSON(url, headers = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Format a date to ISO string (date only)
 */
export function formatDate(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toISOString().split('T')[0];
}
