# itb-nim-finder-scrapper
My script to scrap ITB students ID (NIM). Currently scrap for HMIF Students from year 2017 to 2019.

## Prerequisite

All you need to is install the prerequisite library
- `axios`
- `cheerio`
- `form-data`
- `dotenv`

You can do it by run `npm install` in the root of project

## Run script

- Create file `.env` and copy  `.env.sample` into `.env`.
- Replace `COOKIE` and `NICITB` as you have
- Run `index.js`

You can found the result of scrapping in file `output.json`