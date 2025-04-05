const FS = require('fs');
const CRX = require('crx');

const BUILD_NAME = `build_${Date.now().toFixed().toString()}`;

async function crxBuilder() {
    const options = {};
    const keyExists = FS.existsSync('key.pem');
    console.log('\n~~~~~ key.pem exists -', keyExists, '~~~~~\n');
    if (keyExists) {
        options.privateKey = FS.readFileSync('key.pem');
    }
    const extension = new CRX(options);
    if (!FS.existsSync('dist')) {
        throw new Error('dist folder not found');
    }
    await extension.load('dist');
    const data = await extension.pack();
    if (!FS.existsSync('builds')) {
        FS.mkdirSync('builds');
    }
    FS.writeFileSync(`builds/${BUILD_NAME}.crx`, data);
}

crxBuilder().catch(console.error);