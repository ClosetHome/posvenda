
function followUpReturn(stage:string){
    let config:any ={}
 if(stage === 'follow-up 1'){
    config = {
      cacheKey:'followup1:lastMessage',
      inativ1: 1 * 60 * 1000, 
      inativ2: 1 * 60 * 1000,
      inativMessage1: 'Vamos dar sequencia? por favor responda e pergunta solicitada',
      inativMessage2: 'Hum... Parece que você não está disponível agora. Voltaremos a conversar em breve!'
    }
 }
 if(stage === 'follow-up 2'){
    config = {
      cacheKey:'followup2:lastMessage',
      inativ1: 1 * 60 * 1000, 
      inativ2: 1 * 60 * 1000
    }
 }
 if(stage === 'follow-up 3'){
    config = {
      cacheKey:'followup3:lastMessage',
      inativ1: 1 * 60 * 1000, 
      inativ2: 1 * 60 * 1000
    }
 }
 if(stage === 'follow-up 4'){
    config = {
      cacheKey:'followup4:lastMessage',
      inativ1: 1 * 60 * 1000, 
      inativ2: 1 * 60 * 1000
    }
 }
}