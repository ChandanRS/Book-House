const fs = require('fs');
const express = require('express');
const Book = require('./../models/bookModel');
const mongoose = require('mongoose');
const app=express();
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
//Get books from data.json
//const books = JSON.parse(fs.readFileSync('./dev-data/books.json','utf-8'))
// console.log(books)
// const books = Book.find({});

//BEST RATED BOOKS
exports.bestRatedBooks = async(req,res,next)=>{
    req.query.limit = 5, 
    req.query.sort = '-ratingsAverage',
    req.query.fields = 'ratingsAverage,name,author,price,image'
    next();
}

//GET BOOK STATS( Info about the Books written by a particular author)
exports.bookStats = catchAsync(async(req,res,next)=>{
    const stats = await Book.aggregate([
        {
            $match:{ ratingsAverage : { $gte : 4} }
        },
        {
            $group: {
                _id : { $toUpper : '$author'},
                // _id : '$ratingsAverage',
                numBooks : { $sum : 1},
                numRatings : { $sum : '$ratingsQuantity'},
                averageRating : { $avg : '$ratingsAverage'},
                averagePrice : { $avg :  '$price' },
                minPrice : { $min : '$price' },
                maxPrice : { $max : '$price' }
            }
        },
        {
            $sort: { averagePrice : 1} 
        }
        // {
        //     $match : { _id :{$ne : 'JAYANT KAYKINI' } }
        // }
    ])
    res.status(200).json({
        status:"Success",
        data:{
            stats
        }
    })
})

//GET ALL BOOKS
exports.getAllBooks = factory.getAll(Book)
exports.getBook = factory.getOne(Book,{ path: 'reviews'})
exports.createBook = factory.createOne(Book)
exports.updateBook = factory.updateOne(Book)
exports.deleteBook = factory.deleteOne(Book)


