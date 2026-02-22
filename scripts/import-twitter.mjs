#!/usr/bin/env node
/**
 * Import recent tweets as beats
 * 
 * Uses SocialData.tools API
 * Pricing: $0.20 per 1000 tweets
 */

import { loadBeats, saveBeats, mergeBeats, generateBeatId, formatDate } from './beats-utils.mjs';
import { execSync } from 'child_process';

// Configuration
const TWITTER_USERNAME = 'gregsfitzgerald';
const DAYS_BACK = 30;

// Load API key from env file
function getApiKey() {
  try {
    const envPath = '/home/gsfitzgerald/clawd-assistant/apify-skills/.env';
    const envContent = require('fs').readFileSync(envPath, 'utf-8');
    const match = envContent.match(/SOCIALDATA_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return process.env.SOCIALDATA_API_KEY || null;
  }
}

async function main() {
  console.log('💭 Importing tweets...');
  
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('❌ SOCIALDATA_API_KEY not found');
    console.error('   Set it in environment or in ~/clawd-assistant/apify-skills/.env');
    process.exit(1);
  }
  
  const since = new Date();
  since.setDate(since.getDate() - DAYS_BACK);
  const sinceStr = since.toISOString().split('T')[0];
  
  try {
    // Search for user's tweets
    const query = encodeURIComponent(`from:${TWITTER_USERNAME} since:${sinceStr}`);
    const url = `https://api.socialdata.tools/twitter/search?query=${query}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const tweets = data.tweets || [];
    
    console.log(`   Found ${tweets.length} tweets`);
    
    // Convert to beats (skip replies and retweets)
    const beats = [];
    for (const tweet of tweets) {
      // Skip replies
      if (tweet.in_reply_to_status_id) continue;
      
      // Skip retweets
      if (tweet.retweeted_status) continue;
      
      // Get tweet text, truncate if long
      let text = tweet.full_text || tweet.text || '';
      
      // Remove URLs from display text
      text = text.replace(/https?:\/\/\S+/g, '').trim();
      
      // Truncate
      if (text.length > 120) {
        text = text.substring(0, 117) + '...';
      }
      
      beats.push({
        id: generateBeatId('thought', tweet.id_str),
        type: 'thought',
        title: text,
        description: null,
        url: `https://twitter.com/${TWITTER_USERNAME}/status/${tweet.id_str}`,
        date: formatDate(tweet.tweet_created_at || tweet.created_at),
        source: 'Twitter',
        meta: {
          tweetId: tweet.id_str,
          likes: tweet.favorite_count,
          retweets: tweet.retweet_count
        }
      });
    }
    
    console.log(`   ${beats.length} original tweets (excluding replies/RTs)`);
    
    // Merge with existing beats
    const beatsData = loadBeats();
    const added = mergeBeats(beatsData, beats, 'twitter');
    saveBeats(beatsData);
    
    console.log(`✓ Added ${added} new thought beats`);
    
  } catch (e) {
    console.error('❌ Error fetching from Twitter:', e.message);
    process.exit(1);
  }
}

main();
