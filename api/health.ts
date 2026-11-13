import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";
export default async function handler(_req:VercelRequest,res:VercelResponse){try{await db().query("select 1");res.json({status:"ok",database:true})}catch{res.status(503).json({status:"error",database:false})}}
