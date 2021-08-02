const request = require('supertest');
const User = require('../../../models/user');
const Channel = require("../../../models/channel");
const testHelper = require("../../setup/db");
const sinon = require("sinon");

let app;
let data = {
    firstname:"John",
    lastname:"doe",
    email:"johndoe@gmail.com",
    password:"123456789",
    occupation:"DevOps @ johndoeinc"
};

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
    
    describe('GET /',()=>{
        test('should return 200',async()=>{
            const user = new User(data);
            const {_id, firstname} = user;
            const payload = {_id,firstname};
            const token = User.generateToken(payload);
            const response = await request(app).get('/api/channels/categories').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body[0]).toHaveProperty("isSelected",false);
            expect(response.body[0]).toHaveProperty("name","art");
            expect(response.body[1]).toHaveProperty("name","tech");
        });

        test('should return 500, if server error occurs', async()=>{
            sinon.stub(Channel,'channelCategories').throws(Error('Server error occured'));
            const user = new User(data);
            const {_id, firstname} = user;
            const payload = {_id,firstname};
            const token = User.generateToken(payload);
            const response = await request(app).get('/api/channels/categories').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });
})
    })