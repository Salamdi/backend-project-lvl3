#!/usr/bin/env node

import { Command } from 'commander';

const command = new Command();

command
  .version('1.0.0')
  .description('Page loader utility')
  .argument('<url>', 'webpage url to load')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) => {
    console.log(url);
    console.log(output);
  })
  .parse();
