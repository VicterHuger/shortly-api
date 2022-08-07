import {nanoid} from 'nanoid';
import { stripHtml } from 'string-strip-html';
import connection from '../database/postgres.js';

export async function shortUrlCretor(_req,res){
    const {userId}=res.locals;
    const {url}=res.locals.body;
    try{
        const shortUrl=nanoid();
        const {rowCount}= await connection.query(`
        INSERT INTO "shortUrls"
        ("userId","shortUrl",url)
        VALUES
        ($1,$2,$3)`
        ,[userId, shortUrl, url]);
        if(rowCount===1) return res.status(201).send({shortUrl}); 
        return res.status(500).send('It was not possible to create a short URL');
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

export async function getUrlById(req,res){
    const {id}=res.locals;
    try{
        const {rows:shortUrl} = await connection.query(`
        SELECT id, "shortUrl", url 
        FROM "shortUrls"
        WHERE id=$1`,[id]);
        if(shortUrl.length===0) return res.sendStatus(404);
        return res.status(200).send(shortUrl[0]);
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function openUrlByShortUrl(req,res){
    if(typeof(req.params.shortUrl)!=='string') return res.status(404).send('Invalid shortUrl');
    const shortUrl=stripHtml(req.params.shortUrl)?.result.trim() || null;
    if(!shortUrl) return res.status(404).send('Invalid shortUrl');
    try{
        const {rows:existingShortUrl} = await connection.query(`
        SELECT url 
        FROM "shortUrls"
        WHERE "shortUrl"=$1`,[shortUrl]);
        
        if(existingShortUrl.length===0) return res.sendStatus(404);

        const {rowCount}= await connection.query(`
        UPDATE "shortUrls"
        SET "visitCount"="visitCount"+1
        WHERE "shortUrl"=$1`,[shortUrl]);
        if(rowCount===0) return res.status(500).send('It was not possible to update the visitCount');
        return res.redirect(`${existingShortUrl[0].url}`);
        
    }catch(err){
        console.log(err);
        res.sendStatus(500);
    }
}

export async function deleteShortUrl(_req,res){
    const {userId}=res.locals;
    const idShortUrl=stripHtml(res.locals.id)?.result.trim()||null;
    if(!idShortUrl || typeof(Number(idShortUrl))!=='number') return res.status(404).send('Invalid id');
    try{
        
        const {rows:shortUrlInfo} = await connection.query(`
            SELECT "userId" 
            FROM "shortUrls"
            WHERE id=$1`,[idShortUrl]
        );
        
        if(shortUrlInfo.length===0) return res.sendStatus(404);
        if(shortUrlInfo[0].userId===userId){
            const {rowCount} = await connection.query(`
            DELETE FROM "shortUrls"
            WHERE id=$1`,[idShortUrl]);
            if(rowCount===1) return res.sendStatus(204);
            return res.status(500).send('It was not possible to delete the shortUrl')
        }
        return res.sendStatus(401);
    }catch(err){
        console.log(err);
        return res.sendStatus(500);
    }
}