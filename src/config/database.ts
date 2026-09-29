import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool=new Pool({
    user: process.env.DB_USER,
    host :process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.PASSWORD,
    port:parseInt(process.env.PORT || "5433")
});

export const query = (text:string , params?:any[]) => pool.query(text,params)

export const testDbConnection=async() =>{
    try{
        const client=await pool.connect()
        console.log('Database connection successful');
        client.release()
    }catch(error) {
        console.error('Unable to connect ti the database',error);
        process.exit(1)
    }
}