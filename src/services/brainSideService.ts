import axios from "axios";




async function envioPosPrimeiraEtapa(data:any){
    try{const config = {
    
                 method: 'post',
                 url: 'https://disparador-backend.xbfb3u.easypanel.host/webhook-executions/process',
                 headers: {
                   'Content-Type': 'application/json',
                   'x-api-key': 'a8114d2007e0dbdd6cbb325f40ce1c7c943174d21575fe72'

                 },
                 data: JSON.stringify(data)
               };
    const response = await axios(config.url, config);

     } catch (error) {
        console.error('Erro ao atualizar clickup:', error);
    }
}


async function sendEcommerceBrain(obj:any){
try {
  const config = {
                 method: 'post',
                 url: 'https://disparador-backend.xbfb3u.easypanel.host/webhook-executions/process',
                 headers: {
                   'Content-Type': 'application/json',
                   'x-api-key': '6c0551c6248c773c7fec4577bbbcc809368147c19441fa84'

                 },
                 data: JSON.stringify(obj)
               };
    const response = await axios(config.url, config);
   
    console.log(response.data)
              }catch(error){
                console.log(error)
              }
 }

async function sendMessageBrainsailes(phone: number, name:string, value:string): Promise<any> {
  try{
    const data = {
        "phone": phone,
        "name": name,
        "message": value
    }

const response = await axios.post(
  `https://disparador-backend.xbfb3u.easypanel.host/webhook-executions/process/b14f2ede656d4cb77d5ae2c1a1816a1669d065b46641cf15`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
);
return response.data;
}catch(error:any){
  console.log(error.message)
  return null
}
}

async function sendMessageBrainsailesMidias(phone: number, name:string, value:string): Promise<any> {
  try{
    const data = {
        "phone": phone,
        "name": name,
        "message": value
    }

const response = await axios.post(
  `https://disparador-backend.xbfb3u.easypanel.host/webhook-executions/process/f9ed0f78f668a373d20e03a24990e3ee1c6b4dafd2481f30`,
  data,
  {
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
);
return response.data;
}catch(error:any){
  console.log(error.message)
  return null
}
}


 export default {envioPosPrimeiraEtapa, sendEcommerceBrain, sendMessageBrainsailes, sendMessageBrainsailesMidias}