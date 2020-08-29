const axios = require('axios');
const FormData = require('form-data');
const { emit } = require('process');
const cheerio = require('cheerio');
const fs = require('fs');

require('dotenv').config();

// Setup scrapper
const major = {
    '135': 'Teknik Informatika',
    '182': 'Sistem dan Teknologi Informasi'
};
const majorCodes = Object.keys(major);
const yearWantToScrape = [17, 18, 19];

const createStandardNim = (majorCode, yearCode, id) =>{
    let studentNim = majorCode + yearCode;
    for (let i = 0; i < 3-id.toString().length; ++i){
        studentNim = studentNim + '0';
    }
    studentNim = studentNim + id;

    return studentNim;
}

// Setup connection
const endpoint = 'https://ditsti.itb.ac.id/nic/manajemen_akun/pengecekan_user';
const requestOption = {
    url: endpoint,
    method: 'POST',
    headers: {
        'Cookie': process.env.COOKIE
    }
}

//scrap function
const scrap = (html) => {
    const $ = cheerio.load(html);
    const contents = $('#content').find('form').get();
    
    if (contents.length === 1) {
        return "Not Found!";
    } else {
        const data = $(contents[1]).find('div').map((i, el) => {
            const inputTag = $(el).find('input').get(0);
            const element = inputTag.attribs.placeholder;

            if (i === 3) {
                return {'NIM': element};
            } else if (i === 5) {
                return {'Nama': element};
            } else if (i === 9) {
                return {'Unit/Organisasi': element};
            }
        }).get().reduce((prev, curr) => {
            const key = Object.keys(curr)[0];

            if (key === 'NIM') {
                const splitNIM = curr[key].split(',').map(el => el.trim());
                prev = {
                    ...prev,
                    'NIM_TPB': splitNIM[0],
                    'NIM_Jurusan': splitNIM[1]
                };
            } else if (key === 'Unit/Organisasi') {
                const splitUnit = curr[key].split('-').map(el => el.trim());
                prev = {
                    ...prev,
                    'Fakultas': splitUnit[0],
                    'Jurusan': splitUnit[1]
                };
            } else {
                prev = {
                    ...prev,
                    ...curr
                };
            }

            return prev;
        }, {});
        
        return data;
    }
}


const mainScrap = async () => {
    const result = [];
    for (let i = 0; i < majorCodes.length; ++i){
        console.log(`${new Date().toISOString()}: Start scrapping for major ${major[majorCodes[i]]}`);

        for (let j = 0; j < yearWantToScrape.length; ++j){
            let isResponseOK = true;
           
            console.log(`\t ${new Date().toISOString()}: Start scrapping for year 20${yearWantToScrape[j].toString()}`);
           
            for (let k = 1; isResponseOK && k <= 300; ++k) {
                let studentNim = createStandardNim(majorCodes[i], yearWantToScrape[j], k);      
    
                const formData = new FormData();
                formData.append('NICitb', process.env.NICITB);
                formData.append('uid', studentNim);
                requestOption.data = formData;
                requestOption.headers['Content-Type'] = `multipart/form-data; boundary=${formData._boundary}`;
    
                const response = await axios(requestOption);
                const htmlResponse = response.data;

                const resultScrapper = scrap(htmlResponse);
                if (resultScrapper === "Not Found!") {
                    isResponseOK = false;
                } else {
                    result.push(resultScrapper);
                }
            }
        }
    }
    
    // console.log(result);
    fs.writeFile('output.json', JSON.stringify(result), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`${new Date().toISOString()}: Scrapping Success!`);
        }
    })
}

mainScrap();