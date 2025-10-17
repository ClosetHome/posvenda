export interface DadosPessoais {
  nomeCompleto?: string;
  dataDeNascimento?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  tipoResidencia?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  numero?: string;
  cep?: string;
}

export function extrairDadosPessoais(texto: string): DadosPessoais {
  const dados: DadosPessoais = {};
   let nomeMatch:any
   let dataMatch:any
   let cpfMatch:any
   let telefoneMatch:any
   let emailMatch:any
   let residenciaMatch:any
   let cidadeMatch:any
   let bairroMatch:any
   let ruaMatch:any
   let numeroMatch:any
   let cepMatch:any
  // Extração do nome completo
  nomeMatch = texto.match(/Nome completo:\s*(.+?)(?=\s*,|\s*$)/i);
  if (!nomeMatch){
    nomeMatch = texto.match(/Nome completo:\s*(.+)/i);
  }
  if (nomeMatch) dados.nomeCompleto = nomeMatch[1].trim();

  // Extração da data de nascimento
  dataMatch = texto.match(/Data de Nascimento:\s*(\d{2}\/\d{2}\/\d{4})(?=\s*,|\s*$)/i);
  if (!dataMatch){
   dataMatch = texto.match(/Data de Nascimento:\s*(.+)/i);
  }
   if(dataMatch) dados.dataDeNascimento = dataMatch[1].trim();
  // Extração do CPF
  cpfMatch = texto.match(/CPF:\s*(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})(?=\s*,|\s*$)/i);
  if (!cpfMatch){
    cpfMatch = texto.match(/CPF:\s*(.+)/i);
  }
  if (cpfMatch) dados.cpf = cpfMatch[1].trim();

  // Extração do telefone
  telefoneMatch = texto.match(/Telefone:\s*(.+?)(?=\s*,\s*E-mail:|\s*$)/i);
  if (!telefoneMatch){
    telefoneMatch = texto.match(/Telefone:\s*(.+)/i);
  }
  if (telefoneMatch) dados.telefone = telefoneMatch[1].trim();

  // Extração do email
  emailMatch = texto.match(/E-mail:\s*([^\s,]+@[^\s,]+\.[^\s,]+)(?=\s*,|\s*$)/i);
  if (!emailMatch){
    emailMatch = texto.match(/E-mail:\s*(.+)/i);
  }
  if (emailMatch) dados.email = emailMatch[1].trim();

  // Extração do tipo de residência
  residenciaMatch = texto.match(/Casa própria ou alugada\:\s*(.+?)(?=\s*,\s*Cidade:|\s*$)/i);
  if (!residenciaMatch){
    residenciaMatch = texto.match(/Casa própria ou alugada\:\s*(.+)/i);
  }
  if (residenciaMatch) dados.tipoResidencia = residenciaMatch[1].trim();

  // Extração da cidade
  cidadeMatch = texto.match(/Cidade:\s*(.+?)(?=\s*,\s*Bairro:|\s*$)/i);
  if (!cidadeMatch){
    cidadeMatch = texto.match(/Cidade:\s*(.+)/i);
  }
  if (cidadeMatch) dados.cidade = cidadeMatch[1].trim();

  // Extração do bairro
  bairroMatch = texto.match(/Bairro:\s*(.+?)(?=\s*,\s*Rua:|\s*$)/i);
  if (!bairroMatch){
    bairroMatch = texto.match(/Bairro:\s*(.+)/i);
  }
  if (bairroMatch) dados.bairro = bairroMatch[1].trim();

  // Extração da rua
  ruaMatch = texto.match(/Rua:\s*(.+?)(?=\s*,\s*Número:|\s*Número:|\s*$)/i);
  if (!ruaMatch){
    ruaMatch = texto.match(/Rua:\s*(.+)/i);
  }
  if (ruaMatch) dados.rua = ruaMatch[1].trim();

  // Extração do número
  numeroMatch = texto.match(/Número:\s*(\d+)(?=\s*,|\s*$)/i);
  if (!numeroMatch){
    numeroMatch = texto.match(/Número:\s*(.+)/i);
  }
  if (numeroMatch) dados.numero = numeroMatch[1].trim();

  // Extração do CEP
  cepMatch = texto.match(/CEP:\s*(\d{5}-?\d{3})(?=\s*,|\s*$)/i);
  if (!cepMatch){
    cepMatch = texto.match(/CEP:\s*(.+)/i);
  }
  if (cepMatch) dados.cep = cepMatch[1].trim();

  return dados;
}

// Função para validar dados extraídos
export function validarDados(dados: DadosPessoais): boolean {
  const temDadosObrigatorios = dados.nomeCompleto && dados.cpf && dados.email;
  return !!temDadosObrigatorios;
}

// Função utilitária para formatar CPF
export function formatarCPF(cpf: string): string {
  const apenasNumeros = cpf.replace(/\D/g, '');
  return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função utilitária para formatar CEP
export function formatarCEP(cep: string): string {
  const apenasNumeros = cep.replace(/\D/g, '');
  return apenasNumeros.replace(/(\d{5})(\d{3})/, '$1-$2');
}


// 1) extrair o bloco ```json ... ```
const extractJson = (text: string) => {
  const m = text.match(/```json([\s\S]*?)```/);
  return (m ? m[1] : text).trim();
};

// 2) normalizar aspas e escapar quebras **apenas dentro de strings**
const escapeNewlinesInStrings = (raw: string) => {
  let out = '', inStr = false, esc = false;
  for (const ch of raw
    .replace(/[\u201C\u201D]/g, '"')   // aspas duplas curvas → "
    .replace(/[\u2018\u2019]/g, "'")   // aspas simples curvas → '
  ) {
    if (!inStr) {
      if (ch === '"') { inStr = true; out += ch; }
      else out += ch;
    } else { // dentro da string
      if (!esc && ch === '"') { inStr = false; out += ch; }
      else if (!esc && ch === '\n') out += '\\n';
      else { out += ch; }
      esc = (!esc && ch === '\\');
    }
  }
  return out;
};

// 3) parse + schema (Zod/Ajv) para garantir forma e chaves
const safeParseJson = (text: string) => {
  const raw = extractJson(text);
  const cleaned = escapeNewlinesInStrings(raw);
  return JSON.parse(cleaned);
};


export const pickJson = (t: string) => {
  const m = t.match(/<JSON>([\s\S]*?)<\/JSON>/);
  if (!m) throw new Error('JSON não encontrado');
  return JSON.parse(
    m[1]
      .replace(/[\u201C\u201D]/g, '"') // aspas curvas → "
      .replace(/\n/g, '\\n')           // proteção extra se vier quebra bruta
  );
};