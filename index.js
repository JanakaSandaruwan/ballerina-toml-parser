const core = require('@actions/core');
// const github = require('@actions/github');
const fs = require('fs');
const toml = require('toml');
var json2toml = require('json2toml');
var enums = require('./enums');

try {
    const componentType = core.getInput('componentType');
    const subPath = core.getInput('subPath');
    const type = core.getInput('type');
    const config = toml.parse(fs.readFileSync(`${subPath}/Ballerina.toml`, 'utf-8'));

    switch (type) {
        case 'edit':
            const name = core.getInput('name').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            const org = core.getInput('org').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            const template = core.getInput('template');

            var package = new Object();
            if (config.package) {
                package = config.package;
            }

            if (componentType === enums.ChoreoRepository.USER_MANAGE_NON_EMPTY) {
                !package.name ? package.name = name : null;
                !package.org ? package.org = org : null;
            } else {
                package.name = name;
                package.org = org;
                if (enums.ChoreoBasicTemplates.indexOf(template) === -1) {
                    package.export = [name]
                    // Hack for breaking changes of ballerina 2201.1.1 update 
                    fs.readFile(`${subPath}/Dependencies.toml`, 'utf8', function (err, data) {
                        if (err) {
                            return console.log(err);
                        }
                        var result = data.replace(/choreo/g, org);
                        result = result.replace(/proj/g, name);

                        fs.writeFile(`${subPath}/Dependencies.toml`, result, 'utf8', function (err) {
                            if (err) return console.log(err);
                        });
                    });
                }
            }
            config.package = package;

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
