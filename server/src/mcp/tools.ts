import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { addConsumption, getAllUsers } from "../services/analytics.service";

export function registerTools(server: McpServer) {

  server.registerTool(
    "add_consumption",
    {
      title: "Add Consumption",
      description: "Add a new consumption record",
      inputSchema: {
        person_name: z.string().describe("Name of the person (e.g. Bob)"),
        type: z.string().describe("Type of meat bar (e.g. beef, bison, lamb)"),
        eaten_at: z.string().describe("ISO-8601 date string (e.g. 2025-01-01T12:00:00Z)")
      } as any
    },
    async (args: any) => {
      const { person_name, type, eaten_at } = args;
      try {
        const result = await addConsumption(person_name, type, eaten_at);
        return {
          content: [{
            type: "text" as const,
            text: `Successfully recorded consumption. ID: ${result.id}`
          }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error adding consumption: ${err.message}` }]
        };
      }
    }
  );

  server.registerTool(
    "get_all_users",
    {
      title: "Get All Users",
      description: "Get all users",
      inputSchema: {} as any
    },
    async (_args: any) => {
      try {
        const users = await getAllUsers();
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(users, null, 2)
          }]
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error getting users: ${err.message}` }]
        };
      }
    }
  );
}
