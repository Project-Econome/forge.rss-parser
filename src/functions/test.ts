import { ArgType, NativeFunction } from "@tryforge/forgescript";
import Parser from "rss-parser";

let parser = new Parser();

export default new NativeFunction({
    name: '$testParse',
    description: 'Parses an RSS feed from a given URL.',
    version: '1.1.0',
    brackets: false,
    unwrap: true,
    args: [
        {
            name: 'url',
            description: 'The RSS feed URL to parse.',
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [url]: [string]) {
        try {
            // Ensure the URL is valid and non-empty
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
                console.log("Invalid URL provided.");
                return this.customError("You must provide a valid URL starting with http or https.");
            }

            // Attempt to parse the RSS feed
            const feed = await parser.parseURL(url);

            // Validate and format the response
            if (feed) {
                const title = feed.title || "No title available";
                const description = feed.description || "No description available";
                const link = feed.link || "No link available";

                console.log("Feed successfully parsed:", { title, description, link });

                // Return the parsed feed details
                return this.success(
                    JSON.stringify(
                        {
                            title,
                            description,
                            link
                        },
                        null,
                        2
                    )
                );
            } else {
                console.log("Feed object is null or undefined.");
                return this.customError("Failed to retrieve the feed details.");
            }
        } catch (error) {
            // Ensure proper type assertion for the error
            if (error instanceof Error) {
                console.error("Error parsing RSS feed:", error.message);
                return this.customError(`An error occurred while parsing the RSS feed: ${error.message}`);
            } else {
                console.error("Unknown error:", error);
                return this.customError("An unknown error occurred while parsing the RSS feed.");
            }
        }
    },
});
