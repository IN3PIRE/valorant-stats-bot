import express from "express";
import logger from "./logger";

const app = express();
app.get("/health", (req,res)=>{
  res.json({status:"ok",timestamp:Date.now()});
});

const PORT = process.env.PORT ? parseInt(process.env.PORT,10):3000;
app.listen(PORT,()=>logger.info("Health endpoint listening on %d",PORT));
