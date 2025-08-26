import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

// Create an MCP server
const server = new McpServer({
    name: "weather-server",
    version: "1.0.0"
});

server.tool(
    'get-weather', //id de la herramienta
    'Obtiene el clima de una ciudad', //descripcion de la herramienta
    { //esquema de entrada
        city: z.string().describe('El nombre la ciudad para obtener el clima'),
        
    },
    async ({city}) => { //implementacion de la herramienta
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es&format=json`)
        const data = await response.json();

        const {latitude, longitude} = data.results[0];
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,rain`)

        const weatherData = await weatherResponse.json();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(weatherData, null, 2)
                }
            ]
        };
    }
)

const transport = new StdioServerTransport();
server.connect(transport);