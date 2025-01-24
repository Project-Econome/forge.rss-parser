"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const xml2js_1 = require("xml2js");
exports.default = new forgescript_1.NativeFunction({
    name: "$testParse",
    description: "Parses an XML snippet and returns the full JSON structure.",
    version: "1.0.1",
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "xmlSnippet",
            description: "The XML snippet to parse.",
            type: forgescript_1.ArgType.String,
            required: true,
            rest: false,
        },
    ],
    async execute(ctx, [xmlSnippet]) {
        try {
            // Ensure the XML snippet is valid and non-empty
            if (!xmlSnippet || typeof xmlSnippet !== "string") {
                console.log("Invalid XML snippet provided.");
                return this.customError("You must provide a valid XML snippet as a string.");
            }
            // Parse the XML snippet into JSON
            const parsedResult = await (0, xml2js_1.parseStringPromise)(xmlSnippet);
            // Log and return the parsed JSON structure
            console.log("Parsed JSON structure:", parsedResult);
            return this.success(JSON.stringify(parsedResult, null, 2));
        }
        catch (error) {
            // Handle parsing errors
            if (error instanceof Error) {
                console.error("Error parsing XML snippet:", error.message);
                return this.customError(`An error occurred while parsing the XML snippet: ${error.message}`);
            }
            else {
                console.error("Unknown error:", error);
                return this.customError("An unknown error occurred while parsing the XML snippet.");
            }
        }
    },
});
//# sourceMappingURL=test.js.map