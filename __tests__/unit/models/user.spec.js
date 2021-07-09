const bcrypt = require ('bcrypt');

const User = require("../../../models/user");

let testUser = {
    "firstname":"john",
    "lastname":"doe",
    "email":"johndoe@gmail.com",
    "password":"password1234",
    "occupation":"DevOps Engineer"
}; 

describe('USER MODEL', ()=>{

  test('should validate a user', ()=>{
    const response = User.validateUser(testUser);
    expect(response.error).toBe(null);
  }); 
  
  test('should return true if password is properly hashed', async()=>{
    const password = 'tegrksgdgzj';
    const hash = await User.hashPassword(password);
    const isMatch = await bcrypt.compare(password,hash);
    expect(isMatch).toBeTruthy();
});

test('should return a valid jwt', ()=>{
    const payload = {email:testUser.email,fullname:testUser.firstname};
    const token = User.generateToken(payload);
    const decodedJwt = User.verifyToken(token);
    expect(decodedJwt.payload).toMatchObject(payload);
});
})