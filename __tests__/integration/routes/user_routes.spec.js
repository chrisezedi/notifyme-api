const request = require('supertest');
const User = require('../../../models/user');
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

describe('/api/users', ()=>{
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
        test('should return 404, if cookie isn"t present', async()=>{
            const response = await request(app)
            .get('/api/users/access_token')
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("msg","no cookie present");  
        })

        test('should return 500, if invalid refresh token is used', async()=>{
            const user = new User(data);
            const { _id, email, firstname } = user;
            const payload = { id:_id, email, firstname }

            const response = await request(app)
            .get('/api/users/access_token')
            .set('Cookie', ['refreshToken=jfjdksdlsdjsdj'])
            expect(response.status).toBe(500);   
        })
        test('Should return 200, if access token is generated', async()=>{
            const user = new User(data);
            const { _id, email, firstname } = user;
            const payload = { id:_id, email, firstname }

            const token = await User.generateToken(payload);
                const response = await request(app)
                .get('/api/users/access_token')
                .set('Cookie', [`refreshToken=${token}`])
                expect(response.status).toBe(200);   
        })
    })

    describe('POST /', ()=>{
        test('Should return status 400, if validation fails', async()=>{
            const response = await request(app).post('/api/users').send({});
            expect(response.status).toBe(400);   
            expect(response).toHaveProperty('error');
        });

        test('should return 400 if user with given email already exists', async()=>{
            const user = new User(data);
            await user.save();
           
            const response = await request(app).post('/api/users').send(data);            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("msg");
        });

        test('should return 200, if registration succeeds', async()=>{
            const response = await request(app).post('/api/users').send(data);
            expect(response.status).toBe(200);

            const user = await User.find({});
            expect(user[0]).toHaveProperty('email','johndoe@gmail.com');
            expect(user.length).toBe(1);            
        })

        test('should return 200 if verification link is sent', async()=>{
            const user = new User(data);
            await user.save();
            const response = await request(app).post('/api/users/resend_verification_link').send({email:user.email});
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success",true);
            expect(response.body).toHaveProperty("msg","email sent");
        })
    })

    describe('POST /login', ()=>{
        test('should return 404 if user does not exist',async()=>{
            const response = await request(app).post('/api/users/login').send({email:'janendoe@gmail.com',password:'123456789'});
            expect(response.status).toBe(404);
        });

        test('should return 400 if passsword is incorrect',async()=>{
            const user = new User(data);
            await user.save();
            const response = await request(app).post('/api/users/login').send({email:'johndoe@gmail.com',password:'invalid password'});
            expect(response.status).toBe(400);
        });

        test('should return 400 if user is not verified', async()=>{
            const user = new User(data);
            await user.save();
            const res = await request(app).post('/api/users/login').send({email:'johndoe@gmail.com',password:'123456789'});
            expect(res.status).toBe(400);
        });

        test('should return 200 if login is successful', async()=>{
            data.isverified = true;
            const hash = await User.hashPassword(data.password);
            data.password = hash;
            const user = new User(data);
            await user.save();
            const response = await request(app).post('/api/users/login').send({email:data.email,password:'123456789'});
            expect(response.status).toBe(200);
        });
    })

    describe('PUT /', ()=>{
        test('should return 500, if verification fails', async()=>{
            const response = await request(app).put('/api/users/verify').send({token:"invalid token"});
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("success",false);
            expect(response.body).toHaveProperty("error");

        })

        test('should return 200, if verification succeeds', async()=>{
            const user = new User(data);
            const { _id, email, firstname } = user;
            const payload = { id:_id, email, firstname };

            const vToken = await User.generateVerificationToken(payload);

            user.verificationcode = vToken;

            await user.save();
            const response = await request(app).put('/api/users/verify').send({token:vToken});
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success",true);
            expect(response.body).toHaveProperty("token");
            expect(response.headers).toHaveProperty("set-cookie");

        })
    })

    describe('PUT /resend_verification_link', ()=>{
        test('should return 400, if user does not exist', async()=>{
            const response = await request(app).post('/api/users/resend_verification_link').send({email:data.email});
            expect(response.status).toBe(400);
        });

        test('should return 200, if verification mail is resent', async()=>{
            const user = new User(data);
            await user.save();
            const response = await request(app).post('/api/users/resend_verification_link').send({email:data.email});
            expect(response.status).toBe(200);
        });

        test('should return 500 if server error occurs', async()=>{
            sinon.stub(User,'sendVerificationEmail').throws(Error("Server error"));
            const user = new User(data);
            await user.save();
            const response = await request(app).post('/api/users/resend_verification_link').send({email:data.email});
            expect(response.status).toBe(500);
        });
    })
})