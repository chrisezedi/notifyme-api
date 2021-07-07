const User = require('../../../models/user');

let data = {
    firstname:"John",
    lastname:"doe",
    email:"johndoe@gmail.com",
    password:"123456789",
    occupation:"DevOps @ johndoeinc"
};

describe('USER MODEL', ()=>{
    test('SHOULD RETURN TRUE IF VERIFICATION EMAIL SENT SUCCESSFULLY', async ()=>{
        const response = await User.sendVerificationEmail(data);
        expect(response).toBeTruthy(); 
    });

    test('should decode valid jwt', async()=>{
        const user = new User(data);
        const { _id, email, firstname } = user;
        const payload = { id:_id, email, firstname }

        const token = await User.generateToken(payload);
        const decodedJwt = await User.verifyToken(token);
        expect(decodedJwt.payload).toHaveProperty('email','johndoe@gmail.com');
        expect(decodedJwt.payload).toHaveProperty('firstname','John');
    })
})