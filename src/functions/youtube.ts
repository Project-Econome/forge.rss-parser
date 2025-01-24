import { ArgType, NativeFunction } from "@tryforge/forgescript";
import { parseStringPromise } from "xml2js";

export default new NativeFunction({
    name: "$getLatestYT",
    description: "Fetches the latest video details from a YouTube channel name or RSS feed URL.",
    version: "1.1.0",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "input",
            description: "The YouTube channel name or RSS feed URL.",
            type: ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [input]: [string]) {
        try {
            // Validate the input
            if (!input || typeof input !== "string") {
                console.log("Invalid input.");
                return this.customError("You must provide a valid channel name or RSS feed URL.");
            }

            let rssUrl = input;

            // Detect if the input is a channel name
            if (!input.startsWith("http")) {
                console.log("Assuming input is a channel name.");
                rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${input}`;
            }

            // Fetch the RSS feed
            const response = await fetch(rssUrl);
            if (!response.ok) {
                console.error(`Failed to fetch RSS feed. HTTP status: ${response.status}`);
                return this.customError("Failed to fetch the RSS feed.");
            }
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
            const entry = feed.entry[0];

            // Extract media:group information
            const mediaGroup = entry["media:group"] ? entry["media:group"][0] : null;

            // Map the JSON structure to extract required fields
            const videoDetails = {
                id: entry.id ? entry.id[0] : "No ID available",
                videoId: entry["yt:videoId"] ? entry["yt:videoId"][0] : "No video ID available",
                channelId: entry["yt:channelId"] ? entry["yt:channelId"][0] : "No channel ID available",
                title: entry.title ? entry.title[0] : "No title available",
                link: entry.link && entry.link[0] && entry.link[0].$ ? entry.link[0].$.href : "No link available",
                published: entry.published ? entry.published[0] : "No published date available",
                updated: entry.updated ? entry.updated[0] : "No updated date available",
                thumbnail:
                    mediaGroup && mediaGroup["media:thumbnail"] && mediaGroup["media:thumbnail"][0] && mediaGroup["media:thumbnail"][0].$ && mediaGroup["media:thumbnail"][0].$.url
                        ? mediaGroup["media:thumbnail"][0].$.url
                        : "No thumbnail available",
                description:
                    mediaGroup && mediaGroup["media:description"] && mediaGroup["media:description"][0]
                        ? mediaGroup["media:description"][0]
                        : "No description available",
                author: entry.author && entry.author[0] && entry.author[0].name ? entry.author[0].name[0] : "No author available",
                views:
                    mediaGroup && mediaGroup["media:community"] && mediaGroup["media:community"][0] && mediaGroup["media:community"][0]["media:statistics"] && mediaGroup["media:community"][0]["media:statistics"][0].$
                        ? mediaGroup["media:community"][0]["media:statistics"][0].$.views
                        : "No views available",
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
