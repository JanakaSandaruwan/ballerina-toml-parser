/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 400:
/***/ ((module) => {

const ChoreoRepository = {
    CHOREO_MANAGE: "ChoreoManaged",
    USER_MANAGE: "UserManagedEmpty",
    USER_MANAGE_NON_EMPTY: "UserManagedNonEmpty",
}

const ChoreoBasicTemplates = ["service", "main", "webhook"]

module.exports = {
    ChoreoRepository: ChoreoRepository,
    ChoreoBasicTemplates: ChoreoBasicTemplates
}

/***/ }),

/***/ 8:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 467:
/***/ ((module) => {

module.exports = eval("require")("json2toml");


/***/ }),

/***/ 58:
/***/ ((module) => {

module.exports = eval("require")("toml");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(8);
// const github = require('@actions/github');
const fs = __nccwpck_require__(147);
const toml = __nccwpck_require__(58);
var json2toml = __nccwpck_require__(467);
var enums = __nccwpck_require__(400);

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
                    cloudToml.settings.thinJar = false
                } else {
                    cloudToml.settings = {
                        buildImage: false,
                        thinJar: false
                    };
                }
            } else {
                cloudToml = {
                    settings: {
                        buildImage: false,
                        thinJar: false
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

})();

module.exports = __webpack_exports__;
/******/ })()
;