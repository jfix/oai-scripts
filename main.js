const { getPdfs, getUrls } = require('./utils');

const options = {
    inDir: '../oai-data/wb',
    outDir: './pdf/wb',
    urlMatcher: '<dc:identifier>(https?:\/\/[^<]+)</dc:identifier>',
    maxFiles: 2,
    // startAt: 10
};

(async () => {
    try {
        const listOfUrls = await getUrls(options);
        console.log(`**URLs: ${JSON.stringify(listOfUrls.length)}`)
        const res = await getPdfs({
            urls: listOfUrls,
            dir: './pdf/wb'
        })
    } catch (err) {
        console.log(err)
    }
})();


// const a = getPdfs(listOfUrls, options);
