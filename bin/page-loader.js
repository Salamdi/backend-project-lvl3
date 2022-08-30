#!/usr/bin/env node
// @ts-check
import { Command } from 'commander';
import loadPage from '../src/index.js';

const command = new Command();

command
  .version('1.0.0')
  .description('Page loader utility')
  .argument('<url>', 'webpage url to load')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) => {
    loadPage(url, output);
  })
  .parse();
