import {Request, Response} from 'express'
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();
const webhook_secret = process.env.OPENAI_WEBHOOK_SECRET || "";
const client = new OpenAI({ webhookSecret: webhook_secret });


export async function opaenAiHook(req:Request, res:Response){
    try{
      console.log(req)
    const event:any = await client.webhooks.unwrap(req.body, req.headers,  webhook_secret );
    console.log(event)

    if (event.type === "response.completed") {
      const response_id = event.data.id;
      const response = await client.responses.retrieve(response_id);
      const output_text = response.output
        .filter((item) => item.type === "message")
        .flatMap((item) => item.content)
        .filter((contentItem) => contentItem.type === "output_text")
        .map((contentItem) => contentItem.text)
        .join("");

      console.log("Response output:", output_text);
    }
    res.status(200).send();
  } catch (error) {
    if (error instanceof OpenAI.InvalidWebhookSignatureError) {
      console.error("Invalid signature", error);
      res.status(400).send("Invalid signature");
    } else {
      throw error;
    }
  }
}