const nodeVersion = +process.versions.node.split('.')[0];
const config = {
    require: [
        'ts-node/register',
        '@cspotcode/source-map-support/register-hook-require'
    ],
    fullTrace: true,
    watchExtensions: ['ts']
};
if (nodeVersion >= 22) {
    config['node-option'] = ['no-experimental-strip-types'];
}
module.exports = config;
