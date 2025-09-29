import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar o diretório de upload
const uploadDirectory = path.join(process.cwd(), 'files');

// Criar o diretório se não existir
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtro de arquivos para validar tipos permitidos
const fileFilter = (req: any, file: any, cb: any) => {
  // Tipos de arquivo permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'video/mp4',
    'video/avi',
    'video/mov',
    'audio/mp3',
    'audio/wav',
    'audio/ogg'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
    files: 5 // Máximo 5 arquivos por upload
  }
});

// Middleware para upload único
export const uploadSingle = upload.single('attachment');

// Middleware para múltiplos uploads
export const uploadMultiple = upload.array('attachments', 5);

// Middleware personalizado com tratamento de erros
export const handleUpload = (req: any, res: any, next: any) => {
  uploadSingle(req, res, (error: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Arquivo muito grande',
          message: 'O arquivo deve ter no máximo 50MB'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Muitos arquivos',
          message: 'Máximo 5 arquivos permitidos'
        });
      }
      return res.status(400).json({
        error: 'Erro no upload',
        message: error.message
      });
    }
    
    if (error) {
      return res.status(400).json({
        error: 'Erro no upload',
        message: error.message
      });
    }
    
    next();
  });
};

// Middleware para múltiplos uploads com tratamento de erros
export const handleMultipleUpload = (req: any, res: any, next: any) => {
  uploadMultiple(req, res, (error: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Arquivo muito grande',
          message: 'Cada arquivo deve ter no máximo 50MB'
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Muitos arquivos',
          message: 'Máximo 5 arquivos permitidos'
        });
      }
      return res.status(400).json({
        error: 'Erro no upload',
        message: error.message
      });
    }
    
    if (error) {
      return res.status(400).json({
        error: 'Erro no upload',
        message: error.message
      });
    }
    
    next();
  });
};

export default upload;
