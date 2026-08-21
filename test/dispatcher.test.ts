import request from "supertest";
import server from 'src/dispatcher'
import {describe, it} from "node:test";
import assert from "assert";

describe('POST /users', () => {
    it('should return 200 OK on valid payload', async () => {
        const payload = {
            name: "Bodya",
            email: "myemail@gmail.com",
            age: 21,
        }
        const response = await request(server).post('/users').send(payload);
        assert.strictEqual(response.statusCode, 204);
    })
    it('should return 400 Bad Request on invalid payload', async () => {
        const payload = {
            name: "Bodya",
            age: 21,
        }
        const response = await request(server).post('/users').send(payload);
        assert.strictEqual(response.statusCode, 400);
    })
})

describe("GET /users", () => {
    it ('should return 200 OK and users', async () => {
        const response = await request(server).get('/users');
        const expected = [{
                id: "1",
                email: "myemail@gmail.com",
                age: 21,
                name: "Bodya",
        }];
        assert.deepStrictEqual(response.body, expected);
    })
    it ('should return 200 OK and user', async () => {
        const response = await request(server).get('/users/1');
        const expected = {
            id: "1",
            email: "myemail@gmail.com",
            age: 21,
            name: "Bodya",
        };
        assert.deepStrictEqual(response.body, expected);
    })
    it ('should return 400 Bad Request', async () => {
        const response = await request(server).get('/users/-1');
        assert.strictEqual(response.statusCode, 400);
    })
})