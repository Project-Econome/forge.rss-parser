import { ArgType, NativeFunction } from "@tryforge/forgescript";
import Parser from "rss-parser";

// Define custom fields for the RSS feed items
interface CustomFeedItem {
    title?: string;
    link?: string;
    pubDate?: string;
    "media:thumbnail"?: { url: string };
    "media:description"?: string;
    author?: { name: string; uri: string };
}

// Extend the parser with the custom fields
const parser = new Parser({
    customFields: {
        item: [
            "media:thumbnail",
            "media:description",
            "author",
        ],
    },
});

export default new NativeFunction({
    name: "$getLatestVideo",
    description: "Fetches the latest video details from a YouTube RSS feed.",
    version: "1.1.2",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "The YouTube RSS feed URL.",
            type: ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [url]: [string]) {
        try {
            // Validate the URL
            if (!url || typeof url !== "string" || !url.startsWith("http")) {
                console.log("Invalid RSS feed URL.");
                return this.customError("You must provide a valid RSS feed URL.");
            }

            // Parse the feed
            const feed = await parser.parseURL(url);

            // Ensure the feed has entries
            if (!feed.items || feed.items.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }

            // Get the latest video entry
            const latestVideo: CustomFeedItem = feed.items[0];

            // Extract the required fields
            const videoDetails = {
                title: latestVideo.title || "No title available",
                url: latestVideo.link || "No link available",
                published: latestVideo.pubDate || "No published date available",
                thumbnail:
                    latestVideo["media:thumbnail"]?.url || "No thumbnail available",
                description:
                    latestVideo["media:description"] || "No description available",
                author: latestVideo.author?.name || feed.title || "No author available",
                authorIcon: latestVideo.author?.uri || "No author icon available",
            };

            console.log("Latest video details:", videoDetails);

            // Return the video details as JSON
            return this.success(JSON.stringify(videoDetails, null, 2));
        } catch (error) {
            // Handle errors
            if (error instanceof Error) {
                console.error("Error fetching or parsing RSS feed:", error.message);
                return this.customError(`An error occurred: ${error.message}`);
            } else {
                console.error("Unknown error:", error);
                return this.customError("An unknown error occurred.");
            }
        }
    },
});
