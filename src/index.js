// @ts-check
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

const dashifySymbols = (name) => name
  .replace(/https?:\/\//, '')
  .replace(/\/$/, '')
  .replace(/[^\w\d]/ig, '-');

export default (address, outdir) => axios.get(address)
  .then(({ data }) => {
    const url = new URL(address);
    const prefix = dashifySymbols(url.href);
    const fileName = `${prefix}.html`;
    const filePath = path.join(outdir, fileName);
    const $ = cheerio.load(data);
    const images = $('img');
    let promise = Promise.resolve();
    if (images.length) {
      const filesDirName = `${prefix}_files`;
      const filesDirPath = path.join(outdir, filesDirName);
      promise = fs.mkdir(filesDirPath)
        .then(() => {
          const promises = images.map((_, img) => {
            const imgSrc = $(img).attr('src');
            const parsedPath = path.parse(imgSrc);
            const dashedBase = dashifySymbols(parsedPath.dir).slice(1);
            const dashedOrigin = dashifySymbols(url.origin);
            const imgName = `${dashedOrigin}-${dashedBase}-${parsedPath.base}`;
            const imgPath = path.join(filesDirPath, imgName);
            return axios.get(`${url.origin}${imgSrc}`, { responseType: 'stream' })
              .then((response) => fs.writeFile(imgPath, response.data))
              .then(() => $(img).attr('src', path.join(filesDirName, imgName)))
              .catch(console.error);
          });
          return Promise.all(promises);
        });
    }
    return promise.then(() => fs.writeFile(filePath, $.html()))
      .then(() => console.log(
        `Page was successfully downloaded into ${filePath}`,
      ));
  });
