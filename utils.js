const fs = require('fs').promises;
const oldStyleFs = require('fs');

const got = require('got');
const { load } = require('cheerio');
const path = require('path');

const getPdf = async (url, outDir) => {
    try {
        const prefix = (new URL(url)).pathname.substring(1).replace('/', '-')
        const response = await got(url);
        const $ = load(response.body);
        const pdfUrl = $('meta[name=citation_pdf_url]').attr('content');
        const pdfFilename = prefix + '-' + pdfUrl.substring(pdfUrl.lastIndexOf('/')+1)
        console.log(`Now saving this ${pdfUrl} ...`)
        got.stream(pdfUrl).pipe(oldStyleFs.createWriteStream(path.resolve(outDir, pdfFilename)));
    } catch (err) {
        console.log(err);
    }
}

const getUrls = async (opts) => {
    const startAt = opts.startAt || 0
    const limit = opts.maxFiles || false
    const dir = opts.inDir
    const regex = new RegExp(opts.urlMatcher || '<dc:identifier>(https?:\/\/[^<]+)</dc:identifier>')
    let counter = 0;
    const list = [];

    return new Promise(async (resolve, reject) => {
        try {
            const filenames = await fs.readdir(dir)
            const max = limit || filenames.length

            for (let i = startAt; i < max + startAt; i++) {
                const filename = filenames[i]
                const p = path.resolve(dir, filename)
                const content = await fs.readFile(p, 'utf-8')
                if (content) {
                    // we only want the second element of the returned matches
                    const [, url] = content.match(regex);
                    list.push(url);
                }
            }
            resolve(list);
        } catch(err) {
            reject(err);
        }
    });
};

const getPdfs = async (opts) => {
    const outDir = opts.dir
    const urls = opts.urls

    return new Promise( (resolve, reject) => {
        try {
            urls.forEach(async url => {
                await getPdf(url, outDir)
            })
            resolve()
        } catch(err) {
            reject(err)
        }
    })
};

module.exports.getPdfs = getPdfs;
module.exports.getUrls = getUrls;
