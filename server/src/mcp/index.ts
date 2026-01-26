import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools";

// Create an MCP server
const server = new McpServer({
    name: "MeatBar Analytics MCP Server",
    version: "1.0.0"
});

// Register tools
registerTools(server);

// Connect using StdioServerTransport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in MCP server:", error);
    process.exit(1);
});
