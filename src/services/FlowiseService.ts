import posvendaMessages from './posvendaMessages'
import dotenv from 'dotenv';
import {CreateHistory} from '../utils/createhumanMessagePrompt.js'
dotenv.config();

const flowise_url = process.env.FLOWISE_URL as string
const flowise_token = process.env.FLOWISE_TOKEN as string
const messageService = new posvendaMessages()


function getSelectedArray(field: any): string[] {
  const sel = field?.selectedOptions;
  if (!sel) return [];
  // suporta [{name|label}] ou ["Branco"]
  if (Array.isArray(sel)) {
    return sel.map((v: any) => (typeof v === 'string' ? v : (v?.name ?? v?.label))).filter(Boolean);
  }
  // suporta string única
  if (typeof sel === 'string') return [sel];
  return [];
}

export async function query(data:any) {
    const response = await fetch(
        flowise_url,
        {
            headers: {
                Authorization: `Bearer ${flowise_token}`,
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

export async function historyCreate(lead:any){
 let sentHistory:any = await messageService.findByLeadId(lead.id, true);
     sentHistory = sentHistory.
     filter((m:any) => m.sent === true)
     .map((m:any) => m.message_text)
     const messageHistory = CreateHistory(sentHistory)
     const historyTransform = messageHistory.map((m) => `role:${m.role}\n content: ${m.content}`)
     const historyString = historyTransform.join(',')
// Sanitize control characters to avoid invalid JSON when Flowise parses promptValues
   const sanitizedHistoryString = historyString
  .replace(/[\u0000-\u001F\u007F]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
     return sanitizedHistoryString
    }

export function dadosPedido(lead:any){
     const customDataBot = lead.customFields.map((f: any) => {
        const vals = getSelectedArray(f).join(', ');
        return `${f.fieldName}: ${vals}`;
      });
      const customDataBotString = customDataBot.join('\n');
      return customDataBotString
}
