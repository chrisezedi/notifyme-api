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
let user;
let token;

describe('/api/channels', ()=>{
    //connect to test database before all tests
    beforeAll(async()=> await testHelper.connectToTestDb());

    //retrieve app connection before each test
    beforeEach(()=>{
        app = require('../../../app');
        user = new User(data);
        const {_id, firstname} = user;
        const payload = {id:_id,firstname};
        token = User.generateToken(payload);
    });

    //clear database after each test and close app
    afterEach(async()=>{
        await testHelper.clearTestDb();
    });

    //close mongoose connection and drop database after all test
    afterAll(async()=> await testHelper.closeTestDbConnection());
    
    describe('GET /',()=>{
        test('should return 200',async()=>{
            const response = await request(app).get('/api/channels/categories').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body[0]).toHaveProperty("isSelected",false);
            expect(response.body[0]).toHaveProperty("name","art");
            expect(response.body[1]).toHaveProperty("name","tech");
        });

        test('should return 500, if server error occurs', async()=>{
            sinon.stub(Channel,'channelCategories').throws(Error('Server error occured'));
            const response = await request(app).get('/api/channels/categories').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(500);
        });

        test('should return 404, if channels not found ', async()=>{
            const response = await request(app).get('/api/channels/my-channels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
        });

        test('should return user"s channels', async()=>{
            const channels = [
                {
                    name:"channel one",
                    description:"This is channel one",
                    category:"tech",
                    admin:user._id
                },

                {
                    name:"channel two",
                    description:"This is channel two",
                    category:"art",
                    admin:user._id
                }
            ];

            await Channel.insertMany(channels);
            const response = await request(app).get('/api/channels/my-channels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBeTruthy();
            expect(response.body.channels.length).toBe(2);
            expect(response.body.channels[0].name).toBe(channels[0].name)
            expect(response.body.channels[0].category).toBe(channels[0].category)
            expect(response.body.channels[1].name).toBe(channels[1].name)
            expect(response.body.channels[1].category).toBe(channels[1].category)
        });

        test('should return 404 if channel not found', async()=>{
            const channel = new Channel({
                name:"channel one",
                description:"this is channel one",
                category:"art"
            });

            const response = await request(app).get('/api/channels/' + channel._id).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
        });

        test('should return 200 if channel with given is found', async()=>{
            const channel = new Channel({
                name:"channel one",
                description:"this is channel one",
                category:"art",
                admin:user._id
            });
            await channel.save();
            const response = await request(app).get('/api/channels/' + channel._id).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.channel).toHaveProperty('name','channel one');
        });
    });

    describe('POST /', ()=>{
        test('should return 500, if a server error occurs', async()=>{
            const channel = {
                namfe:"channel 1",
                description:"this is channel 1",
                category:"business",
            };
            const response = await request(app).post('/api/channels/').set('Authorization', `Bearer ${token}`).send(channel);
            expect(response.status).toBe(500);
        });
    
        test('should return 200 if channel is successfully created', async()=>{
            const channel = {
                name:"channel one",
                description:"this is channel one",
                category:"business",
            };
            const response = await request(app).post('/api/channels').set('Authorization', `Bearer ${token}`).send(channel);
            expect(response.status).toBe(200);
            expect(response.body.success).toBeTruthy();
        });
    });

    describe('PUT /', ()=>{
        test('should return 200 if channel is updated successfully', async()=>{
            const channel = new Channel({
                name:"channel one",
                description:"this is channel one",
                category:"business",
                admin:user._id
            });
            await channel.save();

            const response = await request(app).put('/api/channels/'+channel._id).set('Authorization', `Bearer ${token}`).send({
                name:"new name",
                description:"this is channel one",
                category:"business",
            });
            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /', ()=>{
        test('should return 200 if channel is deleted successfully', async()=>{
            const channel = new Channel({
                name:"channel one",
                description:"this is channel one",
                category:"business",
                admin:user._id
            });
            await channel.save();

            const response = await request(app).delete('/api/channels/'+channel._id).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
        });
    });
})