//review /rating /createdAt /user /book
const mongoose = require('mongoose')
const Book = require('./bookModel')


const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        trim:true,
        required : true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    book:{
        type: mongoose.Schema.ObjectId,
        ref: 'Book',
        required: [true,'Review must belong to a book']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Review must belong to a User']
    }
},
{
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
})

reviewSchema.index({ book : 1,user : 1 },{ unique : true})

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select : 'name photo'
    })
    next()
})

reviewSchema.statics.calcAverageRatings = async function(bookId){
    // console.log(bookId)
    const stats  = await this.aggregate([
        {
            $match : { book : bookId }
        },
        {
            $group : {
                _id : '$book',
                nRating : { $sum : 1},
                avgRating : { $avg : '$rating'}
            }
        }
    ])
    // console.log(stats[0].avgRating)
  if(stats.length>0){
    await Book.findByIdAndUpdate(bookId,{
        ratingsQuantity : stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    })
  }else {
    await Book.findByIdAndUpdate(bookId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
}
}

reviewSchema.post('save',function(){
    this.constructor.calcAverageRatings(this.book)
    
})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  
  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.book);
  });

const Review = mongoose.model('Review',reviewSchema)

module.exports = Review