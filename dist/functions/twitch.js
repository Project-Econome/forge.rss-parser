"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const xml2js_1 = require("xml2js");
exports.default = new forgescript_1.NativeFunction({
    name: "$getLatestTwitch",
    description: "Fetches the latest video details from a Twitch RSS feed.",
    version: "1.0.0",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "channelName",
            description: "The Twitch channel name.",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [channelName]) {
        try {
            // Validate the channel name
            if (!channelName) {
                console.log("Channel name is required.");
                return this.customError("You must provide a channel name.");
            }
            // Construct the RSS feed URL
            const rssUrl = `https://twitchrss.appspot.com/vod/${channelName}`;
            // Fetch the RSS feed
            const response = await fetch(rssUrl);
            const xmlData = await response.text();
            // Parse the XML data
            const result = await (0, xml2js_1.parseStringPromise)(xmlData);
            // Ensure the feed has entries
            const feed = result.rss.channel[0];
            if (!feed || !feed.item || feed.item.length === 0) {
                console.log("No videos found in the RSS feed.");
                return this.customError("No videos found in the RSS feed.");
            }
            // Get the latest video entry
            const latestVideo = feed.item[0];
            // Extract the description which contains the thumbnail and URL
            const description = latestVideo.description?.[0] || "";
            const urlMatch = description.match(/href="(https:\/\/www\.twitch\.tv\/videos\/\d+)"/);
            const thumbnailMatch = description.match(/src="(https:\/\/static-cdn\.jtvnw\.net\/cf_vods[^"]+)"/);
            // Define videoDetails with the possible `videoUrl` and `thumbnail`
            const videoDetails = {
                title: latestVideo.title?.[0] || "No title available",
                url: latestVideo.link?.[0] || "No URL available",
                published: latestVideo.pubDate?.[0] || "No published date available",
                thumbnail: thumbnailMatch ? thumbnailMatch[1] : "No thumbnail available",
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
//# sourceMappingURL=twitch.js.map