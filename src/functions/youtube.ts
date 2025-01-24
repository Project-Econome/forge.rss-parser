import { ArgType, NativeFunction } from "@tryforge/forgescript";
import { parseStringPromise } from "xml2js";

// Define custom fields for the RSS feed items
interface CustomFeedItem {
    title?: string[];
    link?: { $: { href: string } }[]; // Corrected link type
    pubDate?: string[];
    "media:thumbnail"?: { $: { url: string } }[]; // Corrected for media:thumbnail
    "media:description"?: string[];
    author?: { name: string }[];
    published?: string[]; // Added the 'published' field to the interface
}

// Define the function
export default new NativeFunction({
    name: "$getLatestVideo",
    description: "Fetches the latest video details from a YouTube RSS feed.",
    version: "1.0.2",
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

            // Fetch the RSS feed
            const response = await fetch(url);
            const xmlData = await response.text();

            // Parse the XML data to JSON
            const result = await parseStringPromise(xmlData);

            // Ensure the feed has entries
            const feed = result.feed;
            if (!feed || !feed.entry || feed.entry.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }

            // Get the latest video entry
            const latestVideo: CustomFeedItem = feed.entry[0];

            // Extract the required fields
            const videoDetails = {
                title: latestVideo.title && latestVideo.title[0] ? latestVideo.title[0] : "No title available",
                url: latestVideo.link && latestVideo.link[0] && latestVideo.link[0].$ && latestVideo.link[0].$.href ? latestVideo.link[0].$.href : "No link available",
                published: latestVideo.published && latestVideo.published[0] ? latestVideo.published[0] : "No published date available",
                thumbnail: latestVideo["media:thumbnail"] && latestVideo["media:thumbnail"][0] && latestVideo["media:thumbnail"][0].$ && latestVideo["media:thumbnail"][0].$.url ? latestVideo["media:thumbnail"][0].$.url : "No thumbnail available",
                description: latestVideo["media:description"] && latestVideo["media:description"][0] ? latestVideo["media:description"][0] : "No description available",
                author: latestVideo.author && latestVideo.author[0] && latestVideo.author[0].name && latestVideo.author[0].name[0] ? latestVideo.author[0].name[0] : "No author available",
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
