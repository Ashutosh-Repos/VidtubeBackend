import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp/inc")
    },
    filename: function (req, file, cb) {
      const suffix = `${Date.now()}_${Math.random()*1E9}_input`
      cb(null, suffix+file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})