import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
export default async function handler(req:VercelRequest,res:VercelResponse){if(req.method!=="POST")return res.status(405).json({error:"method_not_allowed"});try{const {answers=[],primaryTalent,score}=req.body||{};const r=await db().query("insert into assessment_attempts(user_id,answers,primary_talent,score) values($1,$2,$3,$4) returning *",[1,JSON.stringify(answers),primaryTalent,score]);res.status(201).json(r.rows[0])}catch{res.status(500).json({error:"database_error"})}}
