#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Base canonical domain for the application.
// Defaults to the production canonical domain (https://morphologymaster.app)
// while allowing overrides via SITE_URL or CANONICAL_URL in production environments.
const rawBaseUrl = 
  process.env.SITE_URL || 
  process.env.CANONICAL_URL || 
  (process.env.APP_URL && !process.env.APP_URL.includes('.run.app') ? process.env.APP_URL : '') ||
  'https://morphologymaster.app';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Today's ISO date string (YYYY-MM-DD)
const todayDate = new Date().toISOString().split('T')[0];

/**
 * Key public routes for search engine indexing.
 * Includes both clean paths and key educational views.
 */
const routes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    description: 'Home - Sandwich Learning & Morphology Dashboard'
  },
  {
    path: '/phonics',
    priority: '0.9',
    changefreq: 'weekly',
    description: 'Phonics Lab - 4 Core Pronunciation & Syllable Rules'
  },
  {
    path: '/analyzer',
    priority: '0.9',
    changefreq: 'weekly',
    description: 'Morphology Dissection Lab & Etymology Analyzer'
  },
  {
    path: '/flashcards',
    priority: '0.8',
    changefreq: 'daily',
    description: 'SRS Flashcards - Spaced Repetition Vocabulary Decks'
  },
  {
    path: '/word-tree',
    priority: '0.8',
    changefreq: 'weekly',
    description: 'Word Family Tree - Visual Root & Derivative Branches'
  },
  {
    path: '/garden',
    priority: '0.7',
    changefreq: 'weekly',
    description: 'Word Garden - Visual Progress & Vocabulary Forest'
  },
  {
    path: '/puzzles',
    priority: '0.7',
    changefreq: 'weekly',
    description: 'Logic Puzzles - Root Word Riddles & Challenges'
  },
  {
    path: '/tutor',
    priority: '0.8',
    changefreq: 'weekly',
    description: 'Professional AI Tutor - Job-Specific Lexicon Master'
  },
  {
    path: '/review',
    priority: '0.7',
    changefreq: 'daily',
    description: 'Adaptive SRS Morpheme Review & Error Remediation'
  },
  {
    path: '/upgrade',
    priority: '0.6',
    changefreq: 'monthly',
    description: 'Upgrade - Morphology Master Pro Plan & Features'
  }
];

function generateSitemapXml() {
  const urlEntries = routes
    .map((route) => {
      const loc = `${BASE_URL}${route.path}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>
`;
}

function run() {
  console.log(`[Sitemap Generator] Generating sitemap for base URL: ${BASE_URL}...`);
  const xmlContent = generateSitemapXml();

  // Target 1: public/sitemap.xml (ensures Vite copies it to dist on build)
  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xmlContent, 'utf-8');
  console.log(`[Sitemap Generator] Successfully written: ${publicSitemapPath} (${routes.length} URLs)`);

  // Target 2: dist/sitemap.xml (if dist folder already exists from prior builds)
  const distDir = path.join(rootDir, 'dist');
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, xmlContent, 'utf-8');
    console.log(`[Sitemap Generator] Also updated in build output: ${distSitemapPath}`);
  }

  console.log('[Sitemap Generator] Sitemap generation completed successfully.');
}

run();
