import { mediaPre } from './clickupMessages'

export function preMessages(status:string, leadName:string):any{
const mensagens = [
  {
    status: 'follow-up 1',
    message: `Bom dia ${leadName}, tudo bem?`,
    type: 'text'
  },
  {
    status: 'follow-up 1',
    message: `Lara do Time da Closet Home aqui. O que voce achou dos nossos closets, fazem sentido para o que voce esta precisando?`,
    type: 'text'
  },
  {
    status: 'follow-up 1',
    message:`${mediaPre[5]}`,
    type: 'file'
  },
  {
    status: 'follow-up 2',
    message:  `Bom dia ${leadName}, tudo bem?`,
    type: 'text'
  },
    {
    status: 'follow-up 3',
    message: `Ola! Nao estou conseguindo uma resposta sua. Estou a disposicao para te ajudar, voce ainda quer seguir com este atendimento?`,
    type: 'text'
  },
  {
    status: 'follow-up 4',
    message: `Oi ${leadName}, tudo bem? Como nao tivemos retorno por aqui, vamos encerrar esse atendimento por agora`,
    type: 'text'
  },
  {
    status: 'follow-up 4',
    message: `Se em algum momento voce quiser retomar ou tiver interesse em seguir com o projeto, e so me chamar por aqui. Estarei a disposicao!`,
    type: 'text'
  }
]
  return mensagens.find(mensagem => mensagem.status === status)
}
