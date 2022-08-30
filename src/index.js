// @ts-check
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const dashifySymbols = (name) => `${name.replace(/https?:\/\//, '').replace(/[^\w\d]/ig, '-')}`;

export default (url, outdir) => axios.get(url)
  .then(({ data }) => {
    const fileName = `${dashifySymbols(url)}.html`;
    const filePath = path.join(outdir, fileName);
    return fs.writeFile(filePath, data);
  });
