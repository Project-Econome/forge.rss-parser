import { ArgType, NativeFunction } from "@tryforge/forgescript";
import { parseStringPromise } from "xml2js";

export default new NativeFunction({
    name: "$getLatestTwitch",
    description: "Fetches the latest video details from a Twitch RSS feed URL.",
    version: "1.0.3",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "url",
            description: "The Twitch RSS feed URL.",
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
                return this.customError("You must provide a valid Twitch RSS feed URL.");
            }

            // Fetch the RSS feed
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Failed to fetch RSS feed. HTTP status: ${response.status}`);
                return this.customError("Failed to fetch the Twitch RSS feed.");
            }
            const xmlData = await response.text();

            // Parse the XML data to JSON
            const result = await parseStringPromise(xmlData);

            // Ensure the feed has entries
            const feed = result.rss && result.rss.channel ? result.rss.channel[0] : null;
            if (!feed || !feed.item || feed.item.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }

            // Get the latest video entry
            const entry = feed.item[0];

            // Extract thumbnail and URL from the description
            const descriptionHtml = entry.description ? entry.description[0] : "";
            const thumbnailMatch = descriptionHtml.match(/<img src="([^"]+)"/);
            const urlMatch = descriptionHtml.match(/<a href="([^"]+)"/);

            // Map the JSON structure to extract required fields
            const videoDetails = {
                title: entry.title ? entry.title[0] : "No title available",
                link: entry.link ? entry.link[0] : "No link available",
                pubDate: entry.pubDate ? entry.pubDate[0] : "No publication date available",
                thumbnail: thumbnailMatch ? thumbnailMatch[1] : "No thumbnail available",
                url: urlMatch ? urlMatch[1] : "No video URL available",
            };

            console.log("Latest Twitch video details:", videoDetails);

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
