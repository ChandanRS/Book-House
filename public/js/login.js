import axios from 'axios';
import { showAlert} from './alerts'
// import { get } from '../../routes/userRoutes';



export const login = async (email,password) =>{
  
   try{
    //alert(email,password)
    //console.log(email,password)
    const res = await axios({
        method: 'POST',
        url: 'http://127.0.0.1:3000/api/v1/users/login',
        data:{
            email,
            password
        } 
   });
//console.log(res.data);
  console.log(`res.data: ${res.data}`)
   if( res.data.status === 'success'){
    showAlert('success', 'Logged in Successfully!');
    window.setTimeout(()=>{
        location.assign('/')
    },5000)
   }
   } catch(err){
    showAlert('error', err.response.data.message);
   }
   
}

export const logout = async () =>{
    try{
        const res = await axios({
            method : 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        })

    if((res.data.status === 'success')) location.reload(true)
    }catch(err){
       showAlert('error', 'Error logging out try again')
    }
}



export const signup = async (name,email,password,passwordConfirm) =>{
  
    try{
        console.log(res)
        //alert(email,password)
        console.log(email,password)
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signup',
            data:{
               name,
                email ,
                password,
                passwordConfirm
            } 
    });
    console.log(res)
    console.log(`res.data: ${res.data}`)
    if( res.data.status ===  'Success'||  'success' ){
     showAlert('success', 'Welcome to the Book House!');
     window.setTimeout(()=>{
         location.assign('/')
     },5000)
    }
    } catch(err){
     showAlert('error', err.response.data.message);
    }

//     const token = signToken(user._id);
//    // console.log(token);
//    // console.log(statusCode);
//    const signToken =id =>{
//     return jwt.sign({ id }, process.env.JWT_SECRET ,{
//         expiresIn : process.env.JWT_EXPIRES_IN
//     })
// }
//     const cookieOptions = {
//         expires: new Date(
//             Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true
//     }

//     if(process.env.NODE_ENV === 'production')
//     cookieOptions.secure = true
//     res.cookie('jwt',token,cookieOptions)

//     //Remove the password
//     user.password = undefined;


 //console.log(res.data);
 
    
 }