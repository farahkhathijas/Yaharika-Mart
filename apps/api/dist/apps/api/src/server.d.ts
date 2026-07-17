import 'dotenv/config';
import http from 'http';
declare const app: import("express-serve-static-core").Express;
declare const httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export { app, httpServer };
//# sourceMappingURL=server.d.ts.map