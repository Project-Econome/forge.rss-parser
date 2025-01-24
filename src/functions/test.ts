import { ArgType, NativeFunction } from "@tryforge/forgescript";
import Parser from "rss-parser"

let parser = new Parser();

export default new NativeFunction({
    name: '$testParse',
    description: 'test parses a url',
    version: '1.0.0',
    brackets: true,
    unwrap: true,
    args: [
        {
            name: 'url',
            description: 'url',
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [url]) {
        
        let feed = await parser.parseURL(url);


        return this.success(JSON.stringify({ title: feed.title, description: feed.description, url: feed.content.url }, null, 2))
    },
});