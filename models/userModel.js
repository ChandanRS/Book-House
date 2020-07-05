const crypto = require('crypto')
const  mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : String,
    email : {
        type: String,
        required: [true,'Email Id Must Be Specified'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail,'Please provide a valid Emal Id']
    },
    photo :{
        type: String,
        default: 'default.jpg'        
    },
    role:{
        type: String,
        enum: ['seller','user','moderator'],
        default: 'user'
    },
    password: {
        type : String,
        required: [true,'Please provide a password '],
        minlength : 8,
        select:false
    },
    passwordConfirm : {
        type : String,
        required: [true,'Please provide a password '],
        validate:{
            //THIS WORKS ONLY ON SAVE!!!
            validator : function(el){
                return el === this.password;
            },
            message: 'The passwords are not the same'
        }
       
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type: Boolean,
        default:true,
        select:false
    }
    
})

//Document middleware
userSchema.pre('save',async function(next){
    //ONLY RUN THIS WHEN THE PASSWORD IS CHANGED
    if(!this.isModified('password')) return next();

    //HASH THE PASSWORD WITH COST OF 12
    this.password = await bcrypt.hash(this.password,12)

    //DELETE THE PASSWORD CONFIRM FIELD
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangedAt = Date.now()-1000
    next();
})

userSchema.pre(/^find/,function(next){
    //This points to current query
    this.find({active:{$ne : false}});
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}


userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10)

    return JWTTimestamp < changedTimestamp;
    }
    return false
}

userSchema.methods.createPasswordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex')

this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

this.passwordResetExpires = Date.now()+ 10*60*1000;

return resetToken;
}

const User = mongoose.model('User',userSchema)
module.exports = User;
