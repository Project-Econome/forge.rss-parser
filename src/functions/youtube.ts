import { ArgType, NativeFunction } from "@tryforge/forgescript";
import Parser, { Item } from "rss-parser";

// Extend the default Item type to include the custom fields
interface CustomItem extends Item {
    "media:thumbnail"?: { url: string };
    author?: string;
}

interface CustomFeed {
    image?: { url: string };
    title?: string;
}

// Create an instance of the parser with the custom item type
const parser: Parser<CustomFeed, CustomItem> = new Parser({
    customFields: {
        item: ['media:thumbnail', 'author'],
        feed: ['image'],
    },
});

export default new NativeFunction({
    name: '$getLatestVideo',
    description: 'Fetches the latest video details from a YouTube RSS feed, including thumbnail, author, and author icon.',
    version: '1.1.1',
    brackets: false,
    unwrap: true,
    args: [
        {
            name: 'url',
            description: 'The YouTube RSS feed URL.',
            type: ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [url]: [string]) {
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

            // Extract thumbnail (media:thumbnail field)
            const thumbnailUrl = latestVideo['media:thumbnail']?.url || "No thumbnail available";

            // Extract author name and author icon
            const authorName = latestVideo.author || feed.title || "No author available";
            const authorIcon = feed.image?.url || "No author icon available"; // Use feed-level image for author icon if available

            // Extract relevant details
            const videoDetails = {
                title: latestVideo.title || "No title available",
                url: latestVideo.link || "No link available",
                published: latestVideo.pubDate || "No published date available",
                description: latestVideo.contentSnippet || "No description available",
                thumbnail: thumbnailUrl,
                author: authorName,
                authorIcon: authorIcon,
            };

            console.log("Latest video details:", videoDetails);

            // Return video details as JSON
            return this.success(JSON.stringify(videoDetails, null, 2));
        } catch (error) {
            // Handle errors gracefully
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
