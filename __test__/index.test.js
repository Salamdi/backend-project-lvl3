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
import loadPage from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();

describe('page loader', () => {
  const host = 'https://ru.hexlet.io';
  const pagePath = '/courses';
  const url = `${host}${pagePath}`;
  let outdir;
  beforeEach(async () => {
    outdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  it('loads page', async () => {
    const fileName = `${url.replace(/https?:\/\//, '').replace(/[^\w\d]/ig, '-')}.html`;
    const filePath = path.join(outdir, fileName);
    const fixturePage = await fs.readFile(getFixturePath(fileName), 'utf-8');
    const scope = nock(host)
      .get(pagePath)
      .reply(200, fixturePage, { 'Content-Type': 'text/html' });
    await expect(fs.stat(filePath)).rejects.toHaveProperty('code', 'ENOENT');
    await loadPage(url, outdir);
    await expect(fs.stat(filePath)).resolves.toBeInstanceOf(Stats);
    expect(scope.isDone()).toBe(true);
    expect(await fs.readFile(filePath, 'utf-8')).toBe(fixturePage);
  });
});
