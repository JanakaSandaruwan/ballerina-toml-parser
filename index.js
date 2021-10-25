const core = require('@actions/core');
// const github = require('@actions/github');
const fs = require('fs');
const toml = require('toml');
var json2toml = require('json2toml');
const { exec } = require("child_process");

try {
    const type = core.getInput('type');
    const config = toml.parse(fs.readFileSync('./Ballerina.toml', 'utf-8'));

    switch (type) {
        case 'edit':
            const name = core.getInput('name').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            const org = core.getInput('org').replace(/[^\w-_]+/g, "").replace(/[^\w]+/g, "_");
            var package = new Object();
            if (config.package) {
                package = config.package;
            }
            package.name = name;
            package.org = org;
            // package.version = '1.0.0';
            config.package = package;
            fs.writeFileSync('./Ballerina.toml', json2toml(config, { indent: 2, newlineAfterSection: true }));
            const cloudToml = {
                settings: {
                    buildImage: false
                }
            };
            fs.writeFileSync('./Cloud.toml', json2toml(cloudToml, { indent: 2, newlineAfterSection: true }));
            break;
        case 'read':
            const contex = '[ballerina]\
  [ballerina.observe]\
    enabled = true\
    provider = "choreo"\

[ballerinax]\

  [ballerinax.choreo]\
    reporterHostname = "periscope.preview-dv.choreo.dev"\
    reporterPort = 443';
            var workspace = 'workspace';
            if (config.package) {
                // 1. replace default workspace name
                if (config.package.name) {
                    workspace = config.package.name
                }
                // 2. generate choreo.toml
                if (config.package.name && config.package.org) {
//                     var data = fs.readFileSync('./ChoreoTemplate.toml', 'utf-8');
//                     var dataWithOrg = data.replace(/{{orgName}}/g, config.package.org);
//                     const contex = dataWithOrg.replace(/{{appName}}/g, config.package.name);
                    fs.writeFileSync('.choreo/Choreo.toml', contex, 'utf-8');
                }
            }
            fs.writeFileSync('workspace.txt', workspace, 'utf-8');
            break;
        default:
            break;
    }
} catch (error) {
    console.log(error, "Ballerinal.toml not found!");
}
