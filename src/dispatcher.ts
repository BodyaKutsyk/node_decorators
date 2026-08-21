import 'reflect-metadata'
import { createServer } from 'node:http';
import { Router } from "src/router";
import { Method } from "src/types";
import { isJSON } from "src/utils/isJSON";

createServer((req, res) => {
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
                await router.prepareHandler({ body, route, paramsMatch })
            } catch (e) {
                console.log(e)
                res.statusCode = 400
                res.statusMessage = 'Validation error';
                res.end()
            }
            res.end()
        } else {
            res.statusCode = 404
            res.statusMessage = 'Not Found';
            res.end();
        }

        body = ''
    })
}).listen(Number(process.env.API_INTERNAL_PORT))