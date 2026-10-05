// Backend: serves db.json as a REST API.  Local: npm run server   Render: npm run serve
import jsonServer from "json-server";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const DB = process.env.DB_FILE || path.join(here, "..", "db.json");
const PORT = process.env.PORT || 3000;

const server = jsonServer.create();
server.use(jsonServer.defaults({ logger: false }));
server.use(jsonServer.router(DB));
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
