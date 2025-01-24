"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const rss_parser_1 = __importDefault(require("rss-parser"));
// Create an instance of the parser
const parser = new rss_parser_1.default();
exports.default = new forgescript_1.NativeFunction({
    name: '$getLatestVideo',
    description: 'Fetches the latest video details from a YouTube RSS feed.',
    version: '1.0.0',
    brackets: false,
    unwrap: true,
    args: [
        {
            name: 'url',
            description: 'The YouTube RSS feed URL.',
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [url]) {
        try {
            // Validate the provided URL
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
                console.log("Invalid RSS feed URL.");
                return this.customError("You must provide a valid RSS feed URL.");
            }
            // Parse the RSS feed
            const feed = await parser.parseURL(url);
            // Ensure the feed has entries
            if (!feed.items || feed.items.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }
            // Get the latest video (first entry in the items array)
            const latestVideo = feed.items[0];
            // Extract relevant details
            const videoDetails = {
                title: latestVideo.title || "No title available",
                url: latestVideo.link || "No link available",
                published: latestVideo.pubDate || "No published date available",
                description: latestVideo.contentSnippet || "No description available",
            };
            console.log("Latest video details:", videoDetails);
            // Return video details as JSON
            return this.success(JSON.stringify(videoDetails, null, 2));
        }
        catch (error) {
            // Handle errors gracefully
            if (error instanceof Error) {
                console.error("Error fetching or parsing RSS feed:", error.message);
                return this.customError(`An error occurred: ${error.message}`);
            }
            else {
                console.error("Unknown error:", error);
                return this.customError("An unknown error occurred.");
            }
        }
    },
});
//# sourceMappingURL=youtube.js.map