const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser= require('cookie-parser')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controller/errorController')
const bookRouter = require('./routes/bookRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoutes')

// const pug = require('pug');


//Use Express
const app=express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


//SET SECURITY HTTP HEADERS
app.use(helmet())

//BODY PARSER
app.use(express.json({limit : '10kb'}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser())

// MIDDLE WARES
//Serving static files
app.use(express.static(path.join(__dirname ,'public')))


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  

//Data sanitization against noSQL query injection
app.use(mongoSanitize())

//Data sanitization against 
app.use(xss())

app.use(hpp({
    whitelist: [
        'author','ratingsAverage','price'
    ]
}))

const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP,Please try again in a n hour'
})

app.use('/api',limiter)


//TEST MIDDLEWARE
app.use((req,res,next)=>{
     req.requestTime = new Date().toISOString().replace(/:/g, '-');
    // console.log(req.cookies)
    next();
})

//ROUTES
app.use('/',viewRouter)
app.use('/api/v1/books',bookRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)

app.all('*', ( req,res,next) => {
//   const err= new Error(`Cannot find the URL ${req.originalUrl} routeee `)
//     err.status = 'fail',
//     err.statusCode = 404
    
next(new AppError(`Cannot find the URL ${req.originalUrl} routeee `))

})

app.use(globalErrorHandler)

module.exports = app;