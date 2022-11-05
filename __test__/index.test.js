// @ts-check
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import {
  beforeEach, describe, expect, it,
} from '@jest/globals';
import nock from 'nock';
import { fileURLToPath } from 'url';
import { Stats } from 'fs';
import * as cheerio from 'cheerio';
import loadPage from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (...paths) => path.join(__dirname, '..', '__fixtures__', ...paths);

nock.disableNetConnect();

describe('page loader', () => {
  const host = 'https://ru.hexlet.io';
  const pagePath = '/courses';
  const imgPath = '/assets/professions/nodejs.png';
  const url = `${host}${pagePath}`;
  let outdir;
  beforeEach(async () => {
    outdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  it('loads the page and its resources', async () => {
    const fileName = 'ru-hexlet-io-courses.html';
    const actualFilePath = path.join(outdir, fileName);
    const actualDestAssetsPath = path.join(outdir, 'ru-hexlet-io-courses_files');
    const actualDestImagePath = path.join(
      actualDestAssetsPath,
      'ru-hexlet-io-assets-professions-nodejs.png',
    );
    const srcPage = await fs.readFile(getFixturePath('src', 'courses', 'index.html'), 'utf-8');
    const expectedDestPage = await fs.readFile(getFixturePath('dest', fileName));
    const pageScope = nock(host)
      .get(pagePath)
      .reply(200, srcPage, { 'Content-Type': 'text/html' });
    const imgScope = nock(host)
      .get(imgPath)
      .replyWithFile(200, getFixturePath('src', 'courses', 'assets', 'professions', 'nodejs.png'));
    await expect(fs.stat(actualFilePath)).rejects.toHaveProperty('code', 'ENOENT');
    await expect(fs.stat(actualDestAssetsPath)).rejects.toHaveProperty('code', 'ENOENT');
    await expect(fs.stat(actualDestAssetsPath)).rejects.toHaveProperty('code', 'ENOENT');
    await loadPage(url, outdir);
    await expect(fs.stat(actualFilePath)).resolves.toBeInstanceOf(Stats);
    await expect(fs.stat(actualDestAssetsPath)).resolves.toBeInstanceOf(Stats);
    await expect(fs.stat(actualDestImagePath)).resolves.toBeInstanceOf(Stats);
    expect(pageScope.isDone()).toBe(true);
    expect(imgScope.isDone()).toBe(true);
    const actualDestPage = await fs.readFile(actualFilePath, 'utf-8');
    const $ = cheerio.load(actualDestPage);
    expect($.html()).toBe(cheerio.load(expectedDestPage).html());
    expect($('img').attr('src')).toBe('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  });
});
