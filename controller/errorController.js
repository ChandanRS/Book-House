const AppError = require('./../utils/appError')

const handleCastErrorDB= err =>{
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message,400)
}

const handleValidationError = err =>{
    const message = `${err.name} : ${err.message}`
    return new AppError(message,400)
}

const handleDuplicateFieldsDB = err =>{
    let value = err.message.match(/".*"/)
    const message = `Duplicate field value ${value} please enter another value`
    return new AppError(message,400)
}

const handleJsonWebTokenError = () => new AppError('Invalid token. Please login again',401)

const handleTokenExpiredError = () =>  new AppError('Token expired!!. Please login again',401)

// const sendErrorDev = (err,res)=>{
//     res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         errCode: err.code,
//         name: err.name,
//         stack: err.stack,
//         message: err.message,
//     })
// }

const sendErrorDev = (err, req, res) => {
    // A) API
    console.log(req.originalUrl)
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    }
  
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  };
  


// const sendErrorProd = (err,res)=>{
//     //Operational, trusted
//     if(err.isOperational){
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message
//         })   
//     }
//     //Programming or other unknown error
//     else{

//         //1) LOG ERROR
//         //console.log('ERROR',err);

//         //2)Send generic message
//         res.status(500).json({
//             status: 'error',
//             message: 'Something went very wrong'
//         })
//     }
    
// }


const sendErrorProd = (err, req, res) => {
    // A) API

   
    if (req.originalUrl.startsWith('/api')) {
      // A) Operational, trusted error: send message to client
      if (err.isOperational) {
        return res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      }
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
      console.error('ERROR 💥', err);
      // 2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
}



module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req,res)
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = err 
        console.log(error.name)
        if(error.name === 'CastError') 
        error = handleCastErrorDB(error)

        if(error.name === 'ValidationError') 
        error = handleValidationError(error)

        if(error.code == '11000')
        error = handleDuplicateFieldsDB(error)

        if(error.name === 'JsonWebTokenError') 
        error = handleJsonWebTokenError()

        
        if(error.name === 'TokenExpiredError') 
        error = handleTokenExpiredError()

        sendErrorProd(error,req,res)
    }
}