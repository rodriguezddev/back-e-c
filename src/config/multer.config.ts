import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: join(process.cwd(),'src','images'),
    filename: (req, file, callback) => {
      const name = uuidv4()
      const ext = extname(file.originalname)
      const filename = `${name}${ext}`
      callback(null, filename)
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Solo se permiten archivos de imagen.'), false)
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024 * 5, //5MB
  },
};