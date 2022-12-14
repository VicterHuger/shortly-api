import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {userAuthenticationRepository} from '../repositories/userAuthenticationRepository.js'


async function signup(_req,res){
    const {name,email,password}=res.locals.body;
    try{
        const passwordHash = await bcrypt.hash(password, 10);
        const rowCount = await userAuthenticationRepository.insertUser(name,email,passwordHash);
        if(rowCount===1){
            return res.sendStatus(201);
        }
        console.log(rowCount);
        return res.status(500).send('Error on sign up a new user!');

    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

async function signin(_req,res){
    const {id}= res.locals.user;
    const JWT_SECRET = process.env.JWT_SECRET;
    
    try{
        const token=jwt.sign({id},JWT_SECRET,{expiresIn: 60*60*24*30 });
        return res.status(200).send({token});
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

export {signup, signin}; 