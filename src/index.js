import { app } from "./app.js";
import {dbConnect} from "./db/index.js"
import dotenv from "dotenv"

dotenv.config({
    path: './.env',
})

const PORT = process.env.PORT || 8001

dbConnect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`server listening through port ${PORT}`);
    })
})
.catch((error)=>{
    console.log("database connection is unsucesfull\n", error);
})

