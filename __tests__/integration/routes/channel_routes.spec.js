const request = require('supertest');
const User = require('../../../models/user');
const testHelper = require("../../setup/db");

let app;


describe('/api/channels', ()=>{
    //connect to test database before all tests
    beforeAll(async()=> await testHelper.connectToTestDb());

    //retrieve app connection before each test
    beforeEach(()=>{
        app = require('../../../app');
    });

    //clear database after each test and close app
    afterEach(async()=>{
        await testHelper.clearTestDb();
    });

    //close mongoose connection and drop database after all test
    afterAll(async()=> await testHelper.closeTestDbConnection());
    
    describe('GET /', ()=>{
        test('should return 200', async()=>{
            const response = await request(app).get('/api/channels/categories')
            expect(response.status).toBe(200);
            expect(response.body[0]).toHaveProperty("isSelected",false);
            expect(response.body[0]).toHaveProperty("name","art");
            expect(response.body[1]).toHaveProperty("name","tech");
        })
})
    })