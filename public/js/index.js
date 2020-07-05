import '@babel/polyfill';
import {login, logout, signup} from './login'
import { updateSettings} from './updateSettings';
import { buyBook } from './stripe';
//DOM ELEMENTS

const signupForm =  document.querySelector('.form--signup')
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.btn-logout');
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const buyBtn = document.getElementById('buy-book')


if(loginForm)
document.querySelector('.form--login').addEventListener('submit',e=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email,password)
    // document.getElementById('email').value='';
    // document.getElementById('password').value='';
})

if(logOutBtn) logOutBtn.addEventListener('click',logout);

if(userDataForm) 
userDataForm.addEventListener('submit',e=>{
     e.preventDefault();
    const form = new FormData();
    form.append('name',document.getElementById('name').value)
    form.append('email',document.getElementById('email').value)
    form.append('photo',document.getElementById('photo').files[0])
    console.log(form)
    
    updateSettings(form,'data')
    window.setTimeout(()=>{
        location.reload();
    },5000)
})

if(userPasswordForm)
userPasswordForm.addEventListener('submit',async e=>{
    e.preventDefault();
   document.querySelector('.btn--save-password').textContent = 'Updating...'
   const passwordCurrent = document.getElementById('password-current').value;
   const password = document.getElementById('password').value;
   const passwordConfirm = document.getElementById('password-confirm').value;

   await updateSettings({passwordCurrent,password,passwordConfirm},'password')
   document.querySelector('.btn--save-password').textContent = 'Save Password'
   document.getElementById('password-current').value = '';
   document.getElementById('password').value = '';
   document.getElementById('password-confirm').value = '';
})

if(signupForm)
signupForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    await signup(name,email,password,passwordConfirm)
})


if (buyBtn)
  buyBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { bookId } = e.target.dataset;
    buyBook(bookId);
  });
