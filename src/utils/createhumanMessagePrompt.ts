
export function CreateHistory(messages:any[]){
   return messages.map((m) =>({
    role: "apiMessage",
    content: m
   }))
}