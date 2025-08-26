interface CompanyInfo {
  socios: string;
  cidade: string;
  estado: string;
}

function messagesReturn (name:string, index: number) {
const mensagens = [
    {modelo:'modelo 1', assunto: 'Sofrendo com mofo, prazos, e retrabalho em projetos?', message: `Boa tarde ${name}, tudo bem?
 
Muitos arquitetos parceiros têm nos procurado em busca de uma solução prática para evitar mofo, atrasos e dores de cabeça com marcenaria.
 
Por isso, desenvolvemos closets modulares com tecnologia contra umidade, montagem limpa (sem obra), visual moderno, prático e com garantia vitalícia.
 
Você prefere que eu te mostre mais detalhes da solução ou é melhor eu falar com alguém da sua equipe que cuida dessa parte?
 
Att, Kemoel – Closet Home`},
  {modelo:'modelo 2',assunto: 'Closet sem mofo e montagem limpa, já viu essa solução?', message: `Boa tarde equipe ${name}, tudo bem?
 
Alguns arquitetos parceiros tem enfrentado mofo, umidade, atrasos e montagem complicada em projetos de closet.
 
Por isso, criamos uma solução pronta: closets modulares com ventilação contra umidade, montagem limpa, visual moderno e garantia vitalícia.
 
Você é quem avalia esse tipo de solução nos projetos, ou posso encaminhar para alguém da sua equipe que cuida dessa parte?
 
Att, Kemoel – Closet Home`},
   {modelo:'modelo 3', assunto: 'Alternativa moderna e prática à marcenaria tradicional', message: `Boa tarde, ${name}, tudo bem?
 
Tenho conversado com vários arquitetos que estão em busca de soluções mais ágeis, seguras e funcionais para substituir a marcenaria principalmente por conta de mofo, imprevistos na montagem e atrasos de entrega.
 
Nós temos uma solução modular pronta, closets com ventilação inteligente, estética moderna, montagem rápida (sem obra!) e garantia vitalícia contra defeitos.
 
Você que cuidar dessa parte nos projetos, ou seria melhor eu falar com alguém do seu time?
 
Fico à disposição,
 Kemoel – Closet Home`}
]
return mensagens[index]
}

function messagesFollowUp (name:string, index: number) {
const mensagens = [
    {modelo:'follow-up 1', assunto: 'Sofrendo com mofo, prazos, e retrabalho em projetos?', message: `Boa tarde equipe ${name}, tudo bem?
 
Perguntando rapidinho para saber se conseguiu ver meu e-mail anterior.
 
Fico à disposição se quiser entender melhor a solução da Closet Home`},
  {modelo:'follow-up 2',assunto: 'Encaminhei certo?', message: `Boa tarde equipe ${name}, tudo bem?
 
Como não tive retorno, imagino que não seja o momento — tudo certo!
 
Se em algum projeto futuro precisar de uma alternativa prática ao sob medida, fico à disposição :)
 
Forte abraço,
 
Kemoel`},
   {modelo:'follow-up 3', assunto: 'Closet moderno, sem marcenaria e com entrega rápida', message: `Boa tarde equipe ${name}, tudo bem?
 
Entendo que a rotina pode estar corrida! Só reforçando: conseguimos entregar closets com visual premium e moderno em até 10 dias, sem obra ou marcenaria.
 Acha interessante marcar uma conversa rápida?   `}
]
return mensagens[index]
}


function extractCompanyInfo(text: string): CompanyInfo {
  const result: CompanyInfo = {
    socios: '',
    cidade: '',
    estado: ''
  };

  // Normalizar quebras de linha e espaços
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Extrair sócios/proprietários
  const sociosMatch = normalizedText.match(/sócios\/proprietarios?:\s*([^\n]+)/i);
  if (sociosMatch) {
    result.socios = sociosMatch[1].trim();
  }

  // Extrair cidade
  const cidadeMatch = normalizedText.match(/cidade:\s*([^\n]+)/i);
  if (cidadeMatch) {
    result.cidade = cidadeMatch[1].trim();
  }

  // Extrair estado
  const estadoMatch = normalizedText.match(/estado:\s*([^\n]+)/i);
  if (estadoMatch) {
    result.estado = estadoMatch[1].trim();
  }

  return result;
}


function isOlderThanTwoDays(timestamp: string | number, dias:number): boolean {
    const timestampMs = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const currentTime = Date.now();
    const twoDaysInMs = dias * 24 * 60 * 60 * 1000; // 2 dias em milissegundos
    
    const timeDifference = currentTime - timestampMs;
    
    return timeDifference > twoDaysInMs;
}

 const formatTimestampToSaoPaulo = (timestamp:string, options:any = {}) => {
  const {
    format = 'full', // 'full', 'date', 'time', 'datetime', 'relative'
    locale = 'pt-BR'
  } = options;
  
  const timestampNumber = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const date = new Date(timestampNumber);
  
  const timeZone = 'America/Sao_Paulo';
  
  switch (format) {
    case 'full':
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
      
    case 'date':
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
      
    case 'time':
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
      
    case 'datetime':
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date);
      
    case 'relative':
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'agora mesmo';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos atrás`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
      
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
      
    default:
      return date.toLocaleString(locale, { timeZone });
  }
};

const convertTimestampToDateEmalis = (timestamp:string) => {
  const timestampNumber = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  return new Date(timestampNumber);
};


const convertTimestampToDate = (timestamp:string) => {
  try{
  const timestampNumber = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const date = new Date(timestampNumber);

const data = date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).slice(0, 10)

  return data;
  } catch(error){
   console.log(error)
   return null
  }
};
function replaceTagsLead(
    value: string,
    lead?: any,
  ): string {
    return value
      .replace(/\$\{lead\.(\w+)\}/g, (match, p1) => {
        return toTitleCaseWithPrepositions(lead && lead[p1] !== undefined && lead[p1] !== null
          ? lead[p1]
          : match); // Return original tag if value is undefined or null
      })
}

  function cleanTelefone(telefone: string): string {
  return telefone.replace(/[^\d\s]/g, '').replace(/\s+/g, '');
}


/////////////////////////  tawk utils //////////////////////


interface LeadData {
  chatId: string;
  name: string;
  city: string;
  phone: string;
  source: any;
  messages: any[];
  description?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

function validateLeadData(leadData: LeadData): ValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  if (!leadData.chatId) {
    missingFields.push('chatId');
  }

  if (!leadData.name || leadData.name.trim() === '') {
    missingFields.push('name');
  }

  if (!leadData.phone || leadData.phone.trim() === '') {
    missingFields.push('phone');
  }

  // Campos opcionais mas importantes (warnings)
  if (!leadData.city || leadData.city.trim() === '') {
    warnings.push('city');
  }

  if (!leadData.messages || leadData.messages.length === 0) {
    warnings.push('messages');
  }

  if (!leadData.source) {
    warnings.push('source');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}

// Função para validar e processar apenas leads válidos
function shouldProcessLead(leadData: LeadData, options: { skipInvalid: boolean } = { skipInvalid: true }): boolean {
  const validation = validateLeadData(leadData);
  
  if (!validation.isValid) {
    console.warn(`Lead ${leadData.chatId || 'unknown'} possui campos obrigatórios faltando:`, validation.missingFields);
    
    if (options.skipInvalid) {
      return false;
    }
  }

  if (validation.warnings.length > 0) {
    console.warn(`Lead ${leadData.chatId} possui campos opcionais faltando:`, validation.warnings);
  }

  return true;
}
function formatChatMessage(data:any) {
  let messages:any = []
  data.messages.forEach((item: { sender: { n: any; }; msg: any, data:any, type:any; }) => {
    messages.push({
      sender: item.sender.n || data.visitor.name ,
      message: item.msg || item.data || item.type,
    })
  })
  return messages
}

function extractPhoneFromString(text?: string): string {
  // Normalizar quebras de linha e espaços
  if(!text) return ''
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Buscar por padrão "Telefone : " seguido de números
  const phoneMatch = normalizedText.match(/telefone\s*:\s*([^\n]+)/i);
  
  if (phoneMatch) {
    // Limpar o telefone extraído (remover espaços extras)
    return `+${phoneMatch[1].trim()}`;
  }
  
  return '';
}

function findPhoneInMessages(messages: any[]): string {
  // Percorre todas as mensagens procurando por telefone
  for (const message of messages) {
    if (message?.msg) {
      const phone = extractPhoneFromString(message.msg);
      if (phone) {
        return phone;
      }
    }
  }
  return '';
}

function formatEcomS(data: any): LeadData {
  const chatObj: LeadData = {
    chatId: data.id,
    name: data.visitor.name,
    city: data.location.city,
    phone: findPhoneInMessages(data.messages),
    source: data.messages[0].data,
    messages: formatChatMessage(data),
  }
  return chatObj;
}

  

  function formatMessagesToString(data: any[]): string {
  let messagesString = '';
  
  data.forEach((item, index) => {
    let message

     if(!item.message.url){
        message = item.message
    } else {
        message = item.message.url
    }
    const sender = item.sender || 'Desconhecido';
   
    messagesString += `Enviado por: ${sender}
    Mensagem:${message}\n`;
    
    // Adiciona quebra de linha se não for a última mensagem
    if (index < data.length - 1) {
      messagesString += '\n';
    }
  });
  
  return messagesString;
}

const toTitleCaseWithPrepositions = (text: string): string => {
  if (!text) return '';
  
  const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'para', 'por'];
  
  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (word.length === 0) return word;
      
      // Primeira palavra sempre maiúscula, preposições ficam minúsculas (exceto se for a primeira)
      if (index > 0 && prepositions.includes(word)) {
        return word;
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const isHtmlMessage = (message: string): boolean => {
  // Verifica se contém tags HTML comuns
  const htmlTags = /<\/?(?:html|body|div|p|br|img|table|tr|td|th|thead|tbody|span|strong|b|i|em|a|ul|ol|li|h[1-6])\b[^>]*>/i;
  return htmlTags.test(message);
};

const addTrackingPixelToHtml = (htmlContent: string, trackingPixel: string): string => {
  // Tenta adicionar o pixel antes da tag de fechamento </body>
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', `${trackingPixel}</body>`);
  }
  
  // Se não encontrar </body>, tenta adicionar antes de </html>
  if (htmlContent.includes('</html>')) {
    return htmlContent.replace('</html>', `${trackingPixel}</html>`);
  }
  
  // Se não encontrar nenhuma das tags, adiciona no final
  return htmlContent + trackingPixel;
};


function formatBrazilianPhoneNumber(phoneNumber: string) {
    // Remove todos os caracteres não numéricos, exceto o +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Verifica se começa com +55 (código do Brasil)
    if (!cleaned.startsWith('+55')) {
        throw new Error('Número deve começar com +55');
    }
    
    // Remove o +55 para trabalhar só com os dígitos
    let digits = cleaned.substring(3);
    
    // Verifica o comprimento e aplica a formatação adequada
    if (digits.length === 11) {
        // Celular: XX 9XXXX-XXXX (11 dígitos após +55)
        const areaCode = digits.substring(0, 2);
        const firstPart = digits.substring(2, 7);
        const lastPart = digits.substring(7, 11);
        return `+55 ${areaCode} ${firstPart} ${lastPart}`;
    } 
    else if (digits.length === 10) {
        // Telefone fixo: XX XXXX-XXXX (10 dígitos após +55)
        const areaCode = digits.substring(0, 2);
        const firstPart = digits.substring(2, 6);
        const lastPart = digits.substring(6, 10);
        return `+55 ${areaCode} ${firstPart} ${lastPart}`;
    }
    else {
        throw new Error(`Número com ${digits.length} dígitos não é válido. Deve ter 10 (fixo) ou 11 (celular) dígitos após +55`);
    }
}

function formatPhoneNumberFlexible(input:string) {
    try {
        return formatBrazilianPhoneNumber(input);
    } catch (error:any) {
        console.error(`Erro ao formatar ${input}: ${error.message}`);
        return input; // Retorna o número original se não conseguir formatar
    }
}

 function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    // Cria a data no fuso horário de São Paulo (UTC-3)
    const date = new Date(year, month - 1, day); // month é 0-indexed
    return date;
  }

   const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


   function extractCustomFields(customFields:any[]){
    const customfields = customFields.map((customField: { value:any; type_config: { options: any[]; }; type: string; id: any; name: any; }) => {
  
  let selectedOptions = [];
  if (customField.value && !customField.type_config?.options) {
 
    const custom = {
    fieldId: customField.id,
    fieldName: customField.name,
    fieldType: customField.type,
    selectedOptions: customField.value
    }
    if(customField.type === 'date'){
      const data:any = convertTimestampToDate(customField.value)
       custom.selectedOptions = data
  }

      return custom
  }
  // Para campos do tipo "labels" (value é array de IDs)
  if (customField.type === "labels" && Array.isArray(customField.value)) {
    selectedOptions = customField.type_config.options.filter((option) =>
      customField.value.includes(option.id)
    );
  }
  // Para campos do tipo "drop_down" (value é índice numérico)
  else if (customField.type === "drop_down" && typeof customField.value === "number") {
    const selectedOption = customField.type_config.options[customField.value];
    if (selectedOption) {
      selectedOptions = [selectedOption];
    }
  }
  return selectedOptions.length > 0 ? {
    fieldId: customField.id,
    fieldName: customField.name,
    fieldType: customField.type,
    selectedOptions: selectedOptions
  } : null;
}).filter(Boolean);
  return customfields
   }

function extractFirstName(fullName: string): string {
  const names = fullName.split(' ');
  if (names.length > 0) {
    return names[0];
  } else {
    return ""; // or throw an error, depending on desired behavior
  }
}

function extractLastName(fullName: string): string {
  const names = fullName.split(' ');
  if (names.length > 1) {
    return names[names.length - 1];
  } else {
    return ""; // or throw an error, depending on desired behavior
  }
}

export default {extractCompanyInfo, isOlderThanTwoDays, formatTimestampToSaoPaulo, convertTimestampToDate, replaceTagsLead, cleanTelefone, formatEcomS,formatMessagesToString, shouldProcessLead, toTitleCaseWithPrepositions, isHtmlMessage, addTrackingPixelToHtml, formatPhoneNumberFlexible, convertTimestampToDateEmalis, parseDate, delay, extractPhoneFromString, extractCustomFields, extractFirstName, extractLastName}

