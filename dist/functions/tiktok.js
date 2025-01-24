"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.default = new forgescript_1.NativeFunction({
    name: "$getLatestTikTok",
    description: "Fetches the latest TikTok video from a given TikTok user profile URL.",
    version: "1.0.0",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "profileUrl",
            description: "The TikTok profile URL of the user.",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [profileUrl]) {
        try {
            // Validate the URL
            if (!profileUrl || !profileUrl.startsWith("https://www.tiktok.com/@")) {
                return this.customError("You must provide a valid TikTok profile URL.");
            }
            // Fetch the TikTok user profile page
            const response = await (0, node_fetch_1.default)(profileUrl);
            const pageContent = await response.text();
            // Extract the first video URL and thumbnail from the page content
            const videoUrlMatch = pageContent.match(/"video_url":"(https:\/\/www\.tiktok\.com\/.*?\/video\/\d+)"/);
            const thumbnailUrlMatch = pageContent.match(/"poster":"(https:\/\/p16-sign-va.tiktokcdn.com\/.*?\.jpg)"/);
            const descriptionMatch = pageContent.match(/"desc":"(.*?)"/);
            // Ensure we have found the necessary information
            if (!videoUrlMatch || !thumbnailUrlMatch) {
                return this.customError("Failed to fetch video details from TikTok.");
            }
            // Extract video URL, thumbnail, and description
            const videoUrl = videoUrlMatch[1];
            const thumbnailUrl = thumbnailUrlMatch[1];
            const description = descriptionMatch ? descriptionMatch[1] : "No description available";
            // Define the video details object
            const videoDetails = {
                title: "Latest TikTok Video",
                videoUrl: videoUrl || "No video URL available",
                thumbnail: thumbnailUrl || "No thumbnail available",
                description: description || "No description available",
                profileUrl: profileUrl,
            };
            console.log("Latest TikTok video details:", videoDetails);
            // Return the video details as JSON
            return this.success(JSON.stringify(videoDetails, null, 2));
        }
        catch (error) {
            // Handle errors
            if (error instanceof Error) {
                console.error("Error fetching TikTok profile:", error.message);
                return this.customError(`An error occurred: ${error.message}`);
            }
            else {
                console.error("Unknown error:", error);
                return this.customError("An unknown error occurred.");
            }
        }
    },
});
//# sourceMappingURL=tiktok.js.map