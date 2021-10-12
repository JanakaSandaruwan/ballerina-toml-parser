const core = require('@actions/core');
// const github = require('@actions/github');
const fs = require('fs');
const toml = require('toml');
var json2toml = require('json2toml');

try {
    const type = core.getInput('type');
    const config = toml.parse(fs.readFileSync('./Ballerina.toml', 'utf-8'));

    switch (type) {
        case 'edit':
            const name = core.getInput('name');
            const org = core.getInput('org');
            var package = new Object();
            if (config.package) {
                package = config.package;
            }
            package.name = name;
            package.org = org;
            package.version = '1.0.0';
            config.package = package;
            fs.writeFileSync('./Ballerina.toml', json2toml(config, { indent: 2, newlineAfterSection: true }));
            break;
        case 'read':
            var workspace = 'workspace';
            if (config.package) {
                if (config.package.name) {
                    workspace = config.package.name
                }
            }
            fs.writeFileSync('./workspace.txt', workspace);
            break;
        default:
            break;
    }
} catch (error) {
    console.log(error, "Ballerinal.toml file not found!");
}