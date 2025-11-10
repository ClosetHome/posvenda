import {calculateMonthDates} from '../utils/monthCalculator'
import {calculateTriggerDates} from '../utils/dateCalculator';
import dotenv from 'dotenv';
import utils from '../utils/utils';
dotenv.config();

interface message { 
  modelo: string,
  message: string
}

export const backendUrl = process.env.BACKEND_URL;

export const mediaPre = [`${backendUrl}/api/files/videopre.mp4`, `${backendUrl}/api/files/foto1.jpeg`, `${backendUrl}/api/files/foto2.jpeg`, `${backendUrl}/api/files/foto3.jpeg`, `${backendUrl}/api/files/videoconhecerloja.mp4`, `${backendUrl}/api/files/followup1.mp4`]
export const modelsFirtsContact = ['RESPONSÁVEL PELO PÓS-VENDA (01° CONTATO)', 'ENTREGA VIA TRANSPORTADORA', 'CLIENTE RETIRA', 'DADOS PARA CADASTRO', 'CUPOM ESPECIAL']
export const modelsDirect = ['TUTORIAL MONTAGEM', 'INFORMAÇÕES DA ENTREGA', 'GARANTIA VITALÍCIA'];
export const modelsAniversary = ['ANIVERSÁRIO - INÍCIO DO MÊS', 'ANIVERSÁRIO - NO DIA', 'ANIVERSÁRIO - FINAL DO MÊS'];
export const modelsSchadules = [
  'FOLLOW-UP 01 - AVISO ENTREGA AMANHÃ',
  'TUTORIAL MONTAGEM 2',
  'FOLLOW-UP 02 - BUSCOU O CLOSET', 
  'FOLLOW-UP 02 - RECEBEU O CLOSET',
  'FOLLOW-UP 03 - MONTAGEM',
  'PESQUISA DE SATISFAÇÃO 30 DIAS',
  'LEMBRETE DO CUPOM - 2 MESES',
  'ÚLTIMO AVISO DO CUPOM',
  'DICAS DE ORGANIZAÇÃO - 2 MESES APÓS CUPOM'
];
 export const mediaMessages = [`${backendUrl}/api/files/montagem1.mp4`, `${backendUrl}/api/files/montagem2.mp4`, `${backendUrl}/api/files/montagem3.mp4`, `${backendUrl}/api/files/imagempos.jpg`, `${backendUrl}/api/files/retira_closet_branco.jpg`, `${backendUrl}/api/files/retira_closet_preto.jpg`, `${backendUrl}/api/files/codigocupom.jpg`, `${backendUrl}/api/files/cupomaniversario.jpg`, `${backendUrl}/api/files/organizacao.mp4`, `${backendUrl}/api/files/blacknovemberimage.jpg`]

export function treatMessageType(modelo:string){
 if(modelo === 'FOLLOW-UP 01 - AVISO ENTREGA AMANHÃ'){
   return 'recebeu o material'
 }
 if(modelo === 'FOLLOW-UP 02 - RECEBEU O CLOSET' || modelo === 'FOLLOW-UP 02 - BUSCOU O CLOSET'){
   return 'conseguiu montar'
 }
 if(modelo === 'FOLLOW-UP 03 - MONTAGEM'){
   return 'pesquisa de satisfação'
 }
  if(modelo === 'PESQUISA DE SATISFAÇÃO 30 DIAS'){
   return 'lembrete'
 }
  if(modelo === 'LEMBRETE DO CUPOM - 2 MESES'){
   return null
 }
  if(modelo === 'ÚLTIMO AVISO DO CUPOM'){
   return 'dica de organização'
 }
  if(modelo === 'DICAS DE ORGANIZAÇÃO - 2 MESES APÓS CUPOM'){
   return null
 }
   if(modelo === 'ANIVERSÁRIO - INÍCIO DO MÊS'){
   return 'aniversário 01'
 }
   if(modelo === 'ANIVERSÁRIO - NO DIA'){
   return 'aniversário dia'
 }
   if(modelo === 'ANIVERSÁRIO - FINAL DO MÊS'){
   return 'aniversário fim do mês'
 }
}

export function treatMessageDate(message:message, deliverDate?:string, leadCustom?:any){
 let messageData = null
 if(modelsDirect.includes(message.modelo)){
   messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: true,
        leadId: leadCustom.id
    }
 }
 if(!deliverDate) return messageData
 const dates = calculateTriggerDates(deliverDate)
  if(message.modelo === 'TUTORIAL MONTAGEM 2'){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.oneDayBefore),
        leadId: leadCustom.id
    }
    }
 if(message.modelo === 'FOLLOW-UP 01 - AVISO ENTREGA AMANHÃ'){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.oneDayBefore),
        leadId: leadCustom.id
    }
    }
    if(message.modelo === 'FOLLOW-UP 02 - BUSCOU O CLOSET' && leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Sim"){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.twoDaysAfter),
        leadId: leadCustom.id
  } 
}
   if(message.modelo === 'FOLLOW-UP 02 - RECEBEU O CLOSET'  && leadCustom.customFields.find((field: { fieldName: string; }) => field.fieldName === "⚠️ Cliente Retira").selectedOptions[0]?.name === "Não"){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.twoDaysAfter),
        leadId: leadCustom.id
    }
}   
     if(message.modelo === 'FOLLOW-UP 03 - MONTAGEM'){
          messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.tenDaysAfter),
        leadId: leadCustom.id
    }
    }
      if(message.modelo === 'PESQUISA DE SATISFAÇÃO 30 DIAS'){
         messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.thirtyDaysAfter),
        leadId: leadCustom.id
    }
    }
      if(message.modelo === 'LEMBRETE DO CUPOM - 2 MESES'){
         messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.sixtyDaysAfter),
        leadId: leadCustom.id
    }
    }
      if(message.modelo === 'ÚLTIMO AVISO DO CUPOM'){
         messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.eightyEightDaysAfter),
        leadId: leadCustom.id
    }
    }
       if(message.modelo === 'DICAS DE ORGANIZAÇÃO - 2 MESES APÓS CUPOM'){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(dates.oneHundredAndtwentyDaysAfter),
        leadId: leadCustom.id
    }
    }
    return messageData
}

export function treatMessageBirthday(message:message, birthDate:string, leadCustom:any){
 const datesBirthday = calculateMonthDates(birthDate)
 let messageData = null

 if(message.modelo === 'ANIVERSÁRIO - INÍCIO DO MÊS'){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.firstDayOfMonth),
        leadId: leadCustom.id
    }
  }
     if(message.modelo === 'ANIVERSÁRIO - NO DIA'){
         messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.anniversaryDay),
        leadId: leadCustom.id
    }
  }
    if(message.modelo === 'ANIVERSÁRIO - FINAL DO MÊS'){
    messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.twoDaysBeforeEndOfMonth),
        leadId: leadCustom.id
    }
  }
    return messageData
}

export function treatMessageDirect(message:message, leadCustom:any, birthDate:string, ){
 const datesBirthday = calculateMonthDates(birthDate)
 let messageData = null
 if(message.modelo === 'ANIVERSÁRIO - INÍCIO DO MÊS'){
      messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.firstDayOfMonth),
        leadId: leadCustom.id
    }
  }
     if(message.modelo === 'ANIVERSÁRIO - NO DIA'){
         messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.anniversaryDay),
        leadId: leadCustom.id
    }
  }
    if(message.modelo === 'ANIVERSÁRIO - FINAL DO MÊS'){
    messageData = {
        title: message.modelo,
        message_text: message.message,
        sent: false,
        schadule: utils.parseDate(datesBirthday.twoDaysBeforeEndOfMonth),
        leadId: leadCustom.id
    }
  }
    return messageData
}

export function messagesReturn(name: string,  models:string[], dataentrega?: string, ninetyTwoDaysAfter?: string) {
  try{
const mensagens = [
  {
    modelo: 'RESPONSÁVEL PELO PÓS-VENDA (01° CONTATO)',
    message: `Oii ${name} como está? Esperamos que esteja bem! 😄
Sou assistente virtual de pós-venda da Closet Home. Parabéns pela sua compra!
`,
    messageBot: `Olá, ${name}. Sou do pós-venda da Closet Home. Parabéns pela compra. Estou à disposição para apoiar no que precisar.`
  },
  {
    modelo: 'ENTREGA VIA TRANSPORTADORA',
    message: `Iniciamos a separação do seu pedido.
Você receberá o seu closet no dia ${dataentrega}, entretanto, não podemos garantir um horário específico para a entrega.`,
    messageBot: `Iniciamos a produção das peças restantes. O que já está pronto foi embalado. Entrega prevista para ${dataentrega}. A transportadora não informa horário.`
  },
  {
    modelo: 'CLIENTE RETIRA',
    message: `Iniciamos a separação do seu pedido e poderá ser retirado a partir do dia ${dataentrega} aqui na loja!😁
Estaremos esperando por você!`,
    messageBot: `As peças estarão disponíveis para retirada em ${dataentrega}, na loja.`
  },
  {
    modelo: 'DADOS PARA CADASTRO',
    message: `${name}, para emissão da nota fiscal do seu pedido, precisamos dos seguintes dados. POR FAVOR, PREENCHA AS INFORMAÇÕES AO LADO E ENVIE NOVAMENTE:
Nome completo:
Data de Nascimento:
CPF:
Telefone:
E-mail:
Cidade:
Bairro:
Rua:
Número:
CEP:`,
    messageBot: `${name}, para cadastro e emissão da NF, envie:
Nome completo:
Data de Nascimento:
CPF:
Telefone:
E-mail:
Cidade:
Bairro:
Rua:
Número:
CEP:`
  },
  {
    modelo: 'CLIENTE JÁ CADASTRADO',
    message: `${name}, dei uma olhada no sistema, e vi que você já tem cadastro aqui na loja, então para confirmar esse cadastro e emitir a sua nota fiscal, vou pedir que você me envie seu CPF!`,
    messageBot: `${name}, seu cadastro já existe. Para confirmar e emitir a NF, envie seu CPF.`
  },
  {
    modelo: 'PEDIDO DE AVALIAÇÃO NO GOOGLE', 
    message: `${name}, que ótimo que tudo deu certo! 😊
Se possível, gostaríamos de pedir um grande favor: que tal compartilhar sua experiência avaliando nossa empresa no Google? Sua opinião é muito importante e ajuda outras pessoas a confiarem no nosso trabalho!
É simples e rápido! Basta clicar no link abaixo para deixar sua avaliação:
https://bit.ly/3CU8zZI`,
    messageBot: `${name}, deu tudo certo? Se puder, avalie nossa empresa no Google: https://bit.ly/3CU8zZI`
  },
  {
    modelo: 'CUPOM ESPECIAL',
    message: `Obrigada pelas informações! 😊`,
    messageBot: `Obrigada pelas informações! 😊`
  },
  {
    modelo: 'TUTORIAL MONTAGEM',
    message: `Para facilitar a montagem do seu closet, vou te enviar um link dos tutoriais de montagem.
Link: https://www.youtube.com/playlist?list=PLj51EHGGXOSy2I8Am81Db9mHaBTxu1PLI`,
    messageBot: `Enviarei um vídeo com o passo a passo da montagem. Os gabaritos acompanham os módulos.`
  },
  {
    ////// apenas se for entrega
    modelo: 'INFORMAÇÕES DA ENTREGA',
    message: `${name}, IMPORTANTE! 
Na entrega, se notar dano na caixa, peça para o entregador esperar, abra e verifique as peças.
Se houver avarias, anote no verso do papel do entregador e devolva a caixa. Assim a transportadora se responsabiliza.`,
    messageBot: `${name}, na entrega: se a caixa estiver danificada, peça ao entregador para aguardar, abra e confira. Havendo avaria, anote no verso do canhoto e devolva a caixa.`
  },
  { 
    modelo: 'GARANTIA VITALÍCIA',
    message: `Para finalizar, apresento nossa Garantia Vitalícia 🛡️.
Guarde este Termo junto à Nota Fiscal em local de fácil acesso, garantindo tranquilidade e segurança com seu closet.`,
    messageBot: `Nossa Garantia é Vitalícia. Guarde o Termo junto à Nota Fiscal.`
  },
  {
    modelo: 'ENCERRAMENTO DO 1º CONTATO',
    message: `${name}, gostaria de garantir que todas as suas dúvidas foram esclarecidas.
Você tem mais alguma pergunta ou algo que não tenha ficado claro para você?`,
    messageBot: `${name}, posso ajudar com mais alguma dúvida?`
  },
  {
    modelo: 'RÉPLICA A DÚVIDA',
    message: `Fico feliz em ajudar! Por favor, sinta-se à vontade para me perguntar qualquer coisa. Estou aqui para garantir que você tenha todas as informações necessárias.`,
    messageBot: `Estou à disposição. Envie sua dúvida e eu resolvo.`
  },
  {
    modelo: 'SEM DÚVIDAS',
    message: `Perfeito! Se surgir qualquer dúvida no futuro ou se precisar de mais alguma informação, não hesite em me contatar. Estou sempre à disposição para ajudar.`,
    messageBot: `Perfeito. Se precisar, é só chamar.`
  },
  {
    modelo: 'CÓDIGO DE RASTREAMENTO',
    message: `Vamos lá ${name}, referente ao seu código de rastreio você vai entrar neste link, selecionar Nota Fiscal, digitar o número da sua nota, juntamente com seu CPF:
https://portaldocliente.expressosaomiguel.com.br:2041/track
Depois é só confirmar a sequência de letras que o sistema pedir, e prontinho! Você terá acesso a todas as informações do seu envio e vai poder acompanhar este pedido até a sua casa!`,
    messageBot: `Rastreie em: https://portaldocliente.expressosaomiguel.com.br:2041/track > selecione “Nota Fiscal” > informe nº da NF + CPF > confirme o captcha.`
  },
  {
    modelo: 'FOLLOW-UP 01 - AVISO ENTREGA AMANHÃ',
    message: `${name}, tenho uma ótima notícia, a entrega do seu closet está programada para amanhã. 😁
Não conseguimos prever o horário de entrega, por isso peço que certifique se terá alguém em casa para receber o seu closet!`,
    messageBot: `Entrega prevista para amanhã, ${name}. Garanta alguém no local para receber.`
  },
    {
    modelo: 'TUTORIAL MONTAGEM 2',
    message: `Para facilitar a montagem do seu closet, vou te enviar um link dos tutoriais de montagem.
Link: https://www.youtube.com/playlist?list=PLj51EHGGXOSy2I8Am81Db9mHaBTxu1PLI`,
    messageBot: `Enviarei um vídeo com o passo a passo da montagem. Os gabaritos acompanham os módulos.`
  },
  {
    modelo: 'FOLLOW-UP 02 - RECEBEU O CLOSET',
    message: `Oii, ${name}! Espero que esteja tudo bem. Estou entrando em contato para certificar que você recebeu seu closet.
Como foi a entrega? Ocorreu conforme o esperado?
Para deixar eu pedido ainda mais especial, você está recebendo um cupom de 15% OFF para acessórios como colmeias e caixas organizadoras.
É válido por 3 meses, para você completar seu closet do seu jeito! 🎁
para acessar a loja e usar o cupom, acesse: https://closethome.com.br/categoria-produto/acessorios/`,
    messageBot: `Olá, ${name}. Você recebeu o closet? A entrega ocorreu conforme esperado?`
  },
  {
    modelo: 'FOLLOW-UP 02 - BUSCOU O CLOSET',
    message: `Oii, ${name}!Espero que esteja tudo bem. Estou entrando em contato para certificar que você retirou seu Closet. Tudo certo com o produto? Ocorreu conforme o esperado?
Para deixar Para deixar eu pedido ainda mais especial, você está recebendo um cupom de 15% OFF para acessórios como colmeias e caixas organizadoras.
É válido por 3 meses, para você completar seu closet do seu jeito! 🎁
para acessar a loja e usar o cupom, acesse: https://closethome.com.br/categoria-produto/acessorios/`,
    messageBot: `Olá, ${name}. Você retirou o closet? Tudo certo com o produto?`
  },
  {
    modelo: 'FOLLOW-UP 03 - MONTAGEM',
    message: `Oii, ${name}, tudo certo? Já se passaram alguns dias da entrega do seu Closet!
Como foi realizar a montagem? O vídeo explicativo e os gabaritos fornecidos foram suficientes?
Para nós é importante ter esse feedback para poder auxiliar nossos clientes da melhor forma possível!`,
    messageBot: `Como foi a montagem, ${name}? O vídeo e os gabaritos foram suficientes? Seu feedback é importante.`
  },
   {
    modelo: 'AVALIAÇÃO GOOGLE',
    message: `${name}, que ótimo que tudo deu certo! É muito gratificante saber que conseguimos atender às suas expectativas! 😊
Se possível, gostaríamos de pedir um grande favor: que tal compartilhar sua experiência avaliando nossa empresa no Google? Sua opinião é muito importante e ajuda outras pessoas a confiarem no nosso trabalho!
É simples e rápido! Basta clicar no link abaixo para deixar sua avaliação: https://www.google.com/search?sca_esv=7b640742644021d7&sxsrf=AE3TifNArfihhjOBmaKENPEYOQn5Cm7kCQ:1750265114087&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E35ZwIOdXYbmfLUc8cjjiRIvFvMhPDH6f3usPkrBCJCfJul_xLQUIEF9iOc0Hd4HW49Do0UjUpiL1AhkFg7WTAzHvYoP6J2s4o3RyyBxogUHwUaZjA%3D%3D&q=Closet+home+Coment%C3%A1rios&sa=X&ved=2ahUKEwj5go3TtfuNAxW0pZUCHUNXJ5cQ0bkNegQIKhAE&biw=1920&bih=911&dpr=1 Agradecemos imensamente pela confiança e pelo carinho. Sempre que precisar, estaremos à disposição para ajudar!`,
    messageBot: `"${name}, que bom que deu tudo certo! 😊 Pode nos ajudar deixando uma avaliação no Google? Isso fortalece nossa credibilidade e ajuda outras pessoas a confiarem em nós. É rápido, basta clicar: https://www.google.com/search?sca_esv=7b640742644021d7&sxsrf=AE3TifNArfihhjOBmaKENPEYOQn5Cm7kCQ:1750265114087&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-E35ZwIOdXYbmfLUc8cjjiRIvFvMhPDH6f3usPkrBCJCfJul_xLQUIEF9iOc0Hd4HW49Do0UjUpiL1AhkFg7WTAzHvYoP6J2s4o3RyyBxogUHwUaZjA%3D%3D&q=Closet+home+Coment%C3%A1rios&sa=X&ved=2ahUKEwj5go3TtfuNAxW0pZUCHUNXJ5cQ0bkNegQIKhAE&biw=1920&bih=911&dpr=1"
Quer que eu monte também uma variação mais curta ainda, estilo push notification de WhatsApp?`
  },
  {
     modelo: 'AVALIAÇÃO SITE',
    message: `Oi ${name}! Tudo bem? Aqui é da Closet Home 😊

Queremos saber se deu tudo certo com a entrega e se o closet atendeu suas expectativas. Se ele realmente te ajudou e você gostou da experiência com a gente, queria te pedir uma ajudinha:

Você pode entrar no nosso site e deixar uma avaliação? Pode ser positiva ou negativa — o importante é sua opinião sincera. Isso nos ajuda muuuito a crescer, alcançar mais pessoas e continuar entregando um atendimento de qualidade! 💬✨

Segue o link direto para avaliar: closethome.com.br

Desde já, muito obrigado! `,
    messageBot: `Oi ${name}! Tudo certo? Queremos saber se o closet atendeu suas expectativas. Se puder, deixe sua avaliação no nosso site (positiva ou negativa). Sua opinião nos ajuda a crescer! 💬✨ Link: closethome.com.br`
  },
  {
    modelo: 'PESQUISA DE SATISFAÇÃO 30 DIAS',
    message: `Oii, ${name}, Bom dia!
Gostaria de saber sua opinião sobre três coisas importantes para nós:
1° Está tudo certinho com seu produto? Tem alguma sugestão de melhoria?
2° O que mais influenciou sua decisão de escolher nosso produto e nossa empresa?
Sua avaliação nos ajuda bastante!😊`,
    messageBot: `${name}, sua opinião é importante: 1) Produto ok? Alguma melhoria? 2) O que mais influenciou sua escolha? 3) Falta algo na sua rotina com o closet?`
  },
  {
    modelo: 'LEMBRETE DO CUPOM - 2 MESES',
    message: `Oi, ${name}! Passando aqui para compartilhar algumas inspirações incríveis de clientes que já montaram seus closets e deixaram tudo super organizado. Dá uma olhada! 👀
Seu cupom de 15% continua ativo até ${ninetyTwoDaysAfter}! Me chama se quiser ajuda para usar. 😉`,
    messageBot: `Seu cupom de 15% vale até ${ninetyTwoDaysAfter}. Inspirações: [link]. Precisa de ajuda para usar?`
  },
  {
    modelo: 'ÚLTIMO AVISO DO CUPOM',
    message: `Oi, ${name}! Tudo bem?
Passando para te lembrar que seu cupom exclusivo de 15% de desconto expira em 2 dias!
Ainda temos algumas opções disponíveis para o seu espaço, mas o cupom está quase expirando.
🔗 [Inserir link dos combos ou produtos]
Se precisar de sugestão, estou aqui para te ajudar! 😊`,
    messageBot: `${name}, seu cupom de 15% expira em 2 dias. Opções: [link]. Quer sugestões para o seu espaço?`
  },
  {
    modelo: 'DICAS DE ORGANIZAÇÃO - 2 MESES APÓS CUPOM',
    message: `Oi, ${name}! Tudo bem? 😊
Quero te enviar um guia exclusivo de organização para deixar seu closet ainda mais funcional! 📖✨
Ele está cheio de dicas práticas para te ajudar a aproveitar cada cantinho do seu espaço da melhor forma.
🔗 [Inserir link do guia]
Depois me conta qual delas foi mais útil para você! Vou adorar saber. 😉`,
    messageBot: `Guia rápido de organização para otimizar seu closet: [link]. Depois me conte o que foi mais útil.`
  },
  {
    modelo: 'ANIVERSÁRIO - INÍCIO DO MÊS',
    message: `Olá, ${name}!
Sabemos que este mês é muito especial para você, e não poderíamos deixar passar em branco. 🎉
Seu presente de aniversário é frete grátis em compras acima de R$ 300! Essa condição exclusiva é válida até o ultimo dia deste mês. Se quiser saber mais, estou por aqui! 💛`,
    messageBot: `Este mês é seu aniversário, ${name}. Frete grátis em compras acima de R$ 300 até o ultimo dia deste mês. Posso ajudar?`
  },
  {
    modelo: 'ANIVERSÁRIO - NO DIA',
    message: `Parabéns, ${name}! 🎈🎂
Hoje é o seu dia, e espero que esteja cercado de pessoas queridas e bons momentos! Que este novo ciclo traga ainda mais conquistas e alegrias.
Aproveite cada instante! 🥂💛`,
    messageBot: `Parabéns, ${name}. Desejamos um ótimo dia.`
  },
  {
    modelo: 'ANIVERSÁRIO - FINAL DO MÊS',
    message: `Oi, ${name}!
Passamos aqui para lembrar que seu presente de aniversário continua disponível, mas só até [data]! 🎉
Frete grátis em compras acima de R$ 300 até o fim do mês! Me avise se quiser ajuda para aproveitar. 😊`,
    messageBot: `Últimos dias do seu presente: frete grátis em compras acima de R$ 300 até [data]. Precisa de ajuda?`
  }
];
    return mensagens.filter((message) => models.includes(message.modelo))
  } catch (error) {
    console.error('mensagem não encontrada');
    return null
  }
}


export function mensagemEcommerce(name:string){ 
return`Olá ${name}, aqui é a Lara do time da Closet Home. 
Conseguiu acessar nossa loja on-line, posso te ajudar com alguma coisa?
`}


export function blacknovemberMessages(name:string, index:number){
const mensagens = [
  {
modelo: 'Primeira mensagem black',
message:`Oi ${name}! Tudo bem por aí?
Passando rapidinho pra te contar que liberamos a Black Novembro da Closet Home 🎉
E como você já é nosso cliente, tem acesso VIP às ofertas.
👉 Prateleiras, cabideiros e gavetas pra ampliar seu closet
👉 Organizadores internos pra deixar as roupas íntimas no lugar certo
👉 Cabides padronizados pra um visual mais elegante
E o melhor:
🎟️ 15% OFF com o cupom BLACKVIP15
🚚 Frete grátis acima de R$500 com o cupom ZEROFRETE
Tá tudo lá no site:
🛒 www.closethome.com.br
Se quiser ajuda pra escolher, tô por aqui 😉
`
},
{
modelo: 'Segunda mensagem black',
message:`Oi ${name}!
Conseguiu dar uma olhada no site?
As ofertas do Black Novembro estão ativas, com até 15% OFF e frete grátis a partir de R$500!
Utilize seu cupom exclusivo. 
🎟️ BLACKVIP15
🚚 ZEROFRETE
🛒 www.closethome.com.br
Se tiver dúvida ou quiser dica de combinação de módulos, só me chamar aqui! 😊
`
},
{
modelo: 'Terceira mensagem black',
message:`Oi ${name}! 
Nossa Black também vale pra outros ambientes da casa:
✨ Quarto infantil 
🪑 Escritório 
🧺 Lavanderia 
🛋️ Sala de estar 
🔧 Garagem
🎟️ 15% OFF – BLACKVIP15
🚚 Frete grátis acima de R$500 – ZEROFRETE
🛒 www.closethome.com.br/categoria-produto/organizadores/
Se precisar de algo, é só chamar 😉
`
},
{
modelo: 'Quarta mensagem black',
message:`Oi ${name}! 
Últimos dias da nossa Black! Ainda dá tempo de melhorar a organização e ampliar seu closet. 
🎟️ 15% OFF – BLACKVIP15
🚚 Frete grátis acima de R$500 – ZEROFRETE
🛒 www.closethome.com.br/categoria-produto/organizadores/
Se quiser ajuda pra montar o kit, é só me chamar! 😉
`
}
]
return mensagens[index]
}



