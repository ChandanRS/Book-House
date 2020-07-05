const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Book = require('../models/bookModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked book
  const book = await Book.findById(req.params.bookId);
  console.log(book);
  book.sold = true;
  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-books/?book=${
      req.params.bookId
    }&user=${req.user.id}&price=${book.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/book/${book.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.bookId,
    line_items: [
      {
        name: `${book.name} Book`,
        description: book.summary,
        images: [`https://www.bookhouse.dev/images/${book.image}`],
//http://127.0.0.1:3000/images/book-img-1.jpg
        amount: book.price * 100,
        currency: 'inr',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { book, user, price } = req.query;

  if (!book && !user && !price) return next();
  await Booking.create({ book, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
