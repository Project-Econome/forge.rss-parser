"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeMC = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const package_json_1 = require("../package.json");
class ForgeMC extends forgescript_1.ForgeExtension {
    name = 'Forge.MC';
    description = 'A forgescript extension that allows you to view Minecraft Server Statistics';
    version = package_json_1.version;
    init() {
        this.load(__dirname + '/functions');
    }
    ;
}
exports.ForgeMC = ForgeMC;
;
//# sourceMappingURL=index.js.map