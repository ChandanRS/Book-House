const mongoose = require('mongoose')
const dotenv = require('dotenv');


process.on('uncaughtException',err =>{
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPION')
    process.exit(1)
})

dotenv.config({path:'./config.env'})
const app = require('./app');

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
    useUnifiedTopology: true ,
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con => {
    console.log('DB connection Successful')
});

const port = process.env.PORT || 3000;
const server = app.listen(port,()=>{
    console.log(`The server is running at ${port}`);
})



process.on('unhandledRejection',err =>{
    console.log(err)
    console.log('UNHANDLED REJECTION')
    server.close(()=>{
        process.exit(1)
    })
})

//sh98Tvm2W5UXHGz4