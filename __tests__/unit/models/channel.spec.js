const Channel = require("../../../models/channel");
let testChannel = {
    "name":"channel one",
    "description":"this is channel one",
    "category":"tech"
}
describe('CHANNEL MODEL', ()=>{
  test('should validate a channel', ()=>{
    const response = Channel.validateChannel(testChannel);
    expect(response.error).toBe(null);
  }); 
})