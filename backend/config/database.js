const mongoose = require('mongoose');

const dbConnection = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully!")

    }
    catch(error){
        if(error) throw error;
        console.log("Database not connected!")
    }
}
module.exports = {dbConnection};