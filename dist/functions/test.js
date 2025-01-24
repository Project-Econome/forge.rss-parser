"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const rss_parser_1 = __importDefault(require("rss-parser"));
let parser = new rss_parser_1.default();
exports.default = new forgescript_1.NativeFunction({
    name: '$testParse',
    description: 'test parses a url',
    version: '1.0.0',
    brackets: true,
    unwrap: true,
    args: [
        {
            name: 'url',
            description: 'url',
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [url]) {
        let feed = await parser.parseURL(url);
        return this.success(feed.title);
    },
});
//# sourceMappingURL=test.js.map