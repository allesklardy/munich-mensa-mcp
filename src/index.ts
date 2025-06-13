import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getFacilities } from "./facilities.js";
import { getMensaMenu, getCurrentDate } from "./mensaApi.js";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Munich Mensa API",
		version: "1.0.0",
	});

	async init() {
		this.server.tool(
			"get_mensa_facilities",
			{
				filter: z.string().optional().describe("Filter facilities by name or location. Defaults to all facilities."),
			}, 
			async (args) => {
				try {
					const facilities = await getFacilities();
					let filteredFacilities = facilities;

					if (args.filter) {
						const filterLower = args.filter.toLowerCase();
						filteredFacilities = facilities.filter(facility => 
							facility.name.toLowerCase().includes(filterLower) ||
							facility.location.toLowerCase().includes(filterLower)
						);
					}

					const response = {
						total: filteredFacilities.length,
						facilities: filteredFacilities,
						...(args.filter && { filter: args.filter })
					};

					return {
						content: [{
							type: "text",
							text: JSON.stringify(response, null, 2)
						}]
					};
				} catch (error) {
					return {
						content: [{
							type: "text",
							text: JSON.stringify({
								success: false,
								error: `Failed to fetch facilities: ${error instanceof Error ? error.message : 'Unknown error'}`
							}, null, 2)
						}]
					};
				}
			}
		);

		this.server.tool(
			"get_mensa_menu",
			{
				apiName: z.string().describe("The API name of the facility (e.g., 'mensa-arcisstr')"),
				date: z.string().optional().describe("Date in YYYY-MM-DD format (e.g., '2025-05-25'). Defaults to today.")
			},
			async (args) => {
				try {
					const date = args.date || getCurrentDate();
					
					// Validate that the apiName exists in our facilities
					const facilities = await getFacilities();
					const facility = facilities.find(f => f.apiName === args.apiName);
					if (!facility) {
						return {
							content: [{
								type: "text",
								text: JSON.stringify({
									success: false,
									error: `Facility with API name '${args.apiName}' not found. Use get_mensa_facilities_list to see available facilities.`
								}, null, 2)
							}]
						};
					}

					const result = await getMensaMenu(args.apiName, date);
					
					// Add facility name to the response for better context
					if (result.success && result.data) {
						result.data.facilityName = facility.name;
						result.data.location = facility.location;
					}

					return {
						content: [{
							type: "text",
							text: JSON.stringify(result, null, 2)
						}]
					};
				} catch (error) {
					return {
						content: [{
							type: "text",
							text: JSON.stringify({
								success: false,
								error: `Failed to fetch menu: ${error instanceof Error ? error.message : 'Unknown error'}`
							}, null, 2)
						}]
					};
				}
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
