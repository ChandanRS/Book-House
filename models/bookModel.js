const mongoose = require('mongoose')
const express=require('express')
const slugify = require('slugify');


const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A book name is must'],
        trim: true,
        unique: true,
        maxlength: [40, 'A book name must have less than or equal to 40chars'],
        minlength: [10, 'A book name must have  more or equal to 10chars']
    },
    slug: String,
    author:{
        type: String,
        trim: true,
        required: [true, 'A Name should be there, Type NA if not available'],
    },
    language: String,
    image: {
        type :String
        },
    images:[String],
    description:{
        type: String,
        trim: true,
        default:"This is a famous Novel in Kannada"
    },
    ratingsAverage: {
        type : Number,
        default:4.5,
        min: [1,'Rating must be greater than 1.0'],
        max: [5,'Rating must be smaller than 5.0'],
        set : val=> Math.round(val*10)/10
    },
    ratingsQuantity: {
        type : Number,
        default:1
    },
    price:{
        type: Number,
        required: [true,' Please mention the price of the book']
    },  
    uploadedAt :{
        type : Date,
        default: Date.now()
    },
    sold: Boolean,
    seller : {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    } 
},
{
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
}
)

bookSchema.index({ slug: 1 });

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
bookSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

//Virtual populate
bookSchema.virtual('reviews',{
    ref:'Review',
    foreignField : 'book',
    localField : '_id'
})

bookSchema.pre(/^find/,function(next){
    this.populate({
        path:'seller',
        select : '-__v -passwordChangedAt -email'
    })
    next()
})


const Book = mongoose.model('Book',bookSchema)

module.exports = Book;