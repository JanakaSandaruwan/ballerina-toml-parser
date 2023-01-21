const core = require('@actions/core');
// const github = require('@actions/github');
const fs = require('fs');
const toml = require('toml');
var json2toml = require('json2toml');

try {
    const subPath = core.getInput('subPath');
    const type = core.getInput('type');
    const config = toml.parse(fs.readFileSync(`${subPath}/Ballerina.toml`, 'utf-8'));

    switch (type) {
        case 'edit':
            const name = core.getInput('name').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            const org = core.getInput('org').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            const template = core.getInput('template');

            const isCloudTomlExists = fs.existsSync(`${subPath}/Cloud.toml`);
            let cloudToml = {};
            if (isCloudTomlExists) {
                cloudToml = toml.parse(fs.readFileSync(`${subPath}/Cloud.toml`, 'utf-8'));
                if (cloudToml.settings) {
                    cloudToml.settings.buildImage = false
                } else {
                    cloudToml.settings = {
                        buildImage: false
                    };
                }
            } else {
                cloudToml = {
                    settings: {
                        buildImage: false
                    }
                };
            }
            
            var package = new Object();
            if (config.package) {
                package = config.package;
            }
            
            package.name = name;
            package.org = org;
            config.package = package;
            if(template != 'service' || template != 'main' || template != 'webhook') {
                package.export = [name]
            }
            
            fs.writeFileSync(`${subPath}/Ballerina.toml`, json2toml(config, { indent: 2, newlineAfterSection: true }));
            fs.writeFileSync(`${subPath}/Cloud.toml`, json2toml(cloudToml, { indent: 2, newlineAfterSection: true }));
            break;
            
        case 'read':
            const contex = '\
            [ballerina]\n\
                [ballerina.observe]\n\
                    enabled = true\n\
                    provider = "choreo"\n\
            [ballerinax]\n\
                [ballerinax.choreo]\n\
                    reporterHostname = "periscope.preview-dv.choreo.dev"\n\
                    reporterPort = 443';
            var workspace = 'workspace';
            if (config.package) {
                // Replace default workspace name
                if (config.package.name) {
                    workspace = config.package.name
                }
            }
            fs.writeFileSync(`${subPath}/Config.toml`, contex, 'utf-8');
            fs.writeFileSync(`${subPath}/workspace.txt`, workspace, 'utf-8');
            break;
        default:
            break;
    }
} catch (error) {
    console.log(error, "Ballerinal.toml not found!");
}
