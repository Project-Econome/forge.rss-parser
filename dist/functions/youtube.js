"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const rss_parser_1 = __importDefault(require("rss-parser"));
// Extend the parser with the custom fields
const parser = new rss_parser_1.default({
    customFields: {
        item: [
            "media:thumbnail",
            "media:description",
            "author",
        ],
    },
});
exports.default = new forgescript_1.NativeFunction({
    name: "$getLatestVideo",
    description: "Fetches the latest video details from a YouTube RSS feed.",
    version: "1.1.2",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "The YouTube RSS feed URL.",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [url]) {
        try {
            // Validate the URL
            if (!url || typeof url !== "string" || !url.startsWith("http")) {
                console.log("Invalid RSS feed URL.");
                return this.customError("You must provide a valid RSS feed URL.");
            }
            // Parse the feed
            const feed = await parser.parseURL(url);
            // Debug the parsed feed to see its structure
            console.log("Parsed feed structure:", JSON.stringify(feed, null, 2));
            // Ensure the feed has entries
            if (!feed.items || feed.items.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }
            // Get the latest video entry
            const latestVideo = feed.items[0];
            // Debug the latest video entry
            console.log("Latest video entry:", JSON.stringify(latestVideo, null, 2));
            // Extract the required fields
            const videoDetails = {
                title: latestVideo.title || "No title available",
                url: latestVideo.link || "No link available",
                published: latestVideo.pubDate || "No published date available",
                thumbnail: latestVideo["media:thumbnail"]?.url || "No thumbnail available",
                description: latestVideo["media:description"] || "No description available",
                author: latestVideo.author?.name || feed.title || "No author available",
                authorIcon: latestVideo.author?.uri || "No author icon available",
            };
            console.log("Latest video details:", videoDetails);
            // Return the video details as JSON
            return this.success(JSON.stringify(videoDetails, null, 2));
        }
        catch (error) {
            // Handle errors
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