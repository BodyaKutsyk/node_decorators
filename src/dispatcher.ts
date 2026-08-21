import 'reflect-metadata'
import { createServer } from 'node:http';
import { Router } from "src/router";
import { Method } from "src/types";
import { isJSON } from "src/utils/isJSON";

const server= createServer((req, res) => {
    const path = new URL(req.url || '', `http://${req.headers.host}`);
    const router = new Router({ path: path.pathname, method: req.method as Method, queries: path.searchParams })
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    })

    req.on('end', async () => {
        const contentType = req.headers['content-type'];
        if (contentType === 'application/json' && isJSON(body)) {
            body = JSON.parse(body);
        }


        const result = router.findRoute();
        if (result) {
            const { route, paramsMatch } = result;

            try {
                const result = await router.prepareHandler({ body, route, paramsMatch })

                if (result) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                } else {
                    res.statusCode = 204;
                    res.end();
                }
            } catch (e) {
                res.statusCode = 400
                res.statusMessage = 'Bad Request';
            }
            res.end()
        } else {
            res.statusCode = 404
            res.statusMessage = 'Not Found';
            res.end();
        }

        body = ''
    })
});

export default server;