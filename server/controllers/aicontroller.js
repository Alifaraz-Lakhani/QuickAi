import "../env.js";
import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import { PDFParse } from "pdf-parse";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});



export const generateArticle = async(req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, length} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        const wordCount = Number(length);

        if(!prompt || !wordCount || wordCount <= 0){
            return res.json({success: false, message: 'Prompt and valid article length are required!'})
        }

        if(wordCount > 2000){
            return res.json({success: false, message: 'Article length cannot exceed 2000 words!'})
        }

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'Free usage limit reached! Please upgrade to continue!'})
        }

        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[
                {
                    "role": "user",
                    "content": `Write a complete article about "${prompt}" in exactly ${wordCount} words. Keep the article natural, structured, and finish with a proper conclusion.`,
                },
            ],
            temperature:0.7,
        });

        const content = response.choices[0].message.content;
        
        await sql `Insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'article')`;
        
        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({success: true, content});

        

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: 'Failed to generate content!',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
}

export const generateBlogTitle = async(req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if(plan !== 'premium' && free_usage >= 10){
            return res.json({success: false, message: 'Free usage limit reached! Please upgrade to continue!'})
        }

        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature:0.7,
        });

        const content = response.choices[0].message.content;
        
        await sql `Insert into creations (user_id, prompt, content, type) values (${userId}, ${prompt}, ${content}, 'blog-title')`;
        
        if(plan !== 'premium'){
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({success: true, content});

        

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: 'Failed to generate content!',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
}

export const generateImage = async(req, res) => {
    try {
        const {userId} = req.auth();
        const {prompt, publish} = req.body;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({success: false, message: 'Only available to Premium users!'})
        }

        if(!prompt){
            return res.json({success: false, message: 'Prompt is required!'})
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const {data} = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
            },
            responseType: 'arraybuffer',
        })

        const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

        const {secure_url} = await cloudinary.uploader.upload(base64Image)

        await sql `Insert into creations (user_id, prompt, content, type, publish) values (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({success: true, secure_url});        

    } catch (error) {
        console.log(error.message);
        const apiError = error.response?.data
            ? Buffer.from(error.response.data).toString('utf8')
            : error.message;
        res.json({
            success: false,
            message: 'Failed to generate content!',
            error: process.env.NODE_ENV === 'production' ? undefined : apiError
        });
    }
}


export const removeImageBackground = async(req, res) => {
    try {
        const {userId} = req.auth();
        const image = req.file;
        const plan = req.plan;

        if(plan !== 'premium'){
            return res.json({success: false, message: 'Only available to Premium users!'})
        }

        if(!image){
            return res.json({success: false, message: 'Image file is required!'})
        }

        const {secure_url} = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: "background_removal",
                    background_removal: 'remove the background'
                }
            ]
        })

        await sql `Insert into creations (user_id, prompt, content, type) values (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({success: true, content: secure_url});        

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message,
        });
    }
}


export const removeImageObject = async(req, res) => {
    try {
        const {userId} = req.auth();
        const {object} = req.body;
        const image = req.file;
        const plan = req.plan;
        

        if(plan !== 'premium'){
            return res.json({success: false, message: 'Only available to Premium users!'})
        }

        if(!image){
            return res.json({success: false, message: 'Image file is required!'})
        }

        if(!object){
            return res.json({success: false, message: 'Object name is required!'})
        }

        const {public_id} = await cloudinary.uploader.upload(image.path)

        const imageUrl = cloudinary.url(public_id,{
            transformation: [{effect:`gen_remove:prompt_${object}`}],
            resource_type: 'image',
            secure: true
        })

        await sql `Insert into creations (user_id, prompt, content, type) values (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({success: true, content: imageUrl});        

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message,
        });
    }
}


export const resumeReview = async(req, res) => {
    try {
        const {userId} = req.auth();
        const resume = req.file;
        const plan = req.plan;
        

        if(plan !== 'premium'){
            return res.json({success: false, message: 'Only available to Premium users!'})
        }

        if(!resume){
            return res.json({success: false, message: 'Resume file is required!'})
        }

        if(resume.size > 5 * 1024 * 1024){
            return res.json({success: false, message: 'Resume file size cannot exceed 5MB!'})
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const parser = new PDFParse({ data: dataBuffer })
        const pdfData = await parser.getText()
        await parser.destroy()

        const prompt = `Review my resume and provide constructive feedback for its strength, weakness and area of improvement. Make it sound professional. Here is the content of my resume:\n\n${pdfData.text}`


        const response = await AI.chat.completions.create({
            model:"gemini-2.5-flash",
            messages:[{role: "user", content: prompt,}],
            temperature:0.7,
        });

        const content = response.choices[0].message.content;


        await sql `Insert into creations (user_id, prompt, content, type) values (${userId}, 'Review the uploaded Resume', ${content}, 'resume-review')`;

        res.json({success: true, content});        

    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message,
        });
    }
}
