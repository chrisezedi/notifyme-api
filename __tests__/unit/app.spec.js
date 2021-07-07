const request = require('supertest');
const server = require('../../app.js');

describe("APP TEST", ()=>{
    it("Should return the valid string",async ()=>{
        const res = await request(server).get("/");
        expect(res.status).toBe(200);
        expect(res.body).toBe("app started successfully");
    })
})