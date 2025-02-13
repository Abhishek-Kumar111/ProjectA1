const mongoose = require("mongoose");
const Initdata = require("./data.js");
const Listing = require("../Model/listing.js");

main()
.then(() => {
    console.log("connected");
})
.catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}
const initDB = async ()=>{
    await Listing.deleteMany({});//pahle se existing data ko delete than insert
    Initdata.data = Initdata.data.map((obj)=>({...obj,owner:"67190fee6f6c987902353f8f"}));
    await Listing.insertMany(Initdata.data);
    console.log("data inserted");

} 
initDB();
