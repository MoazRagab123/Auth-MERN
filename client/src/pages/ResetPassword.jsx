import  { useState,useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  
  const {backendUrl} = useContext(AppContext);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [newPassword,setNewPassword] = useState('');
  const [isEmailSent,setIsEmailSent] = useState('');
  const [otp,setOtp] = useState(0);
  const [isOtpSubmited,setIsOtpSubmited] = useState(false);
  

  const inputRef = useRef([])
  
    const handleInput = (e, index) => {
      if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
        inputRef.current[index + 1].focus()
      }
      if (e.target.value.length === 1 && index < 5) {
        inputRef.current[index + 1].focus()
      }
    }
  
    const handleKeyDown = (e, index) => {
      if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
        inputRef.current[index - 1].focus();
      }
    }
  
    const handlePaste = (e) => {
      const paste = e.clipboardData.getData('text');
      const pasteArray = paste.split('');
      pasteArray.forEach((char, index) => {
        if (inputRef.current[index]) {
          inputRef.current[index].value = char;
        }
      })
    }

    const onSubmitEmail = async (e)=>{
      e.preventDefault();
      try {
        const {data} = await axios.post(backendUrl+'/api/auth/send-reset-otp',
          {email})
          if(data.success){
            setIsEmailSent(true)
            toast.success(data.message)}
            else{
              toast.error(data.message)
            }
      } catch (error) {
         toast.error(error.message)
      }
    }
    const onSubmitOtp = async (e)=>{
      e.preventDefault();
      try {
        const otpArray = inputRef.current.map(e => e.value)
        setOtp(otpArray.join(''));
        toast.success('OTP submitted successfully');                  
        setIsOtpSubmited(true);
            
           
      } catch (error) {
         toast.error(error.message);
    }}
    const onSubmitNewPassword = async(e)=>{
      e.preventDefault();
      try {
        const password = newPassword;
        const {data} = await axios.post(backendUrl+'/api/auth/reset-password',
          {email,otp,password})
          if(data.success){
            
            toast.success(data.message)
             navigate('/login')}
            else{
              toast.error(data.message)
              
            }
      } catch (error) {
        toast.error(error.message)
    }
    }

    

  return (
    <div className='flex items-center justify-center min-h-screen flex-col
    sm:px-0 bg-gradient-to-br from from-blue-200 to bg-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} className='absolute left-5 sm:left-20
               top-5 w-28 sm:w-32 cursor-pointer'/>
   {/* enter email id */}
   {!isEmailSent && 
     <form onSubmit={onSubmitEmail} className='rounded-lg p-8 bg-slate-900 shadow-lg w-96 text-sm'>
     <h1 className='text-white text-2xl font-semibold
         text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5
        py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.mail_icon} className='w-3 h-3'/>
          <input value={email} required onChange={(e)=>setEmail(e.target.value)} type='email' placeholder='Email id'
          className='bg-transparent outline-none text-white'/>
        
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500
        to-indigo-900 text-white rounded-full mt-8'>Submit</button>
     </form> }
    
    {/* otp form tag */}
    {!isOtpSubmited && isEmailSent &&
    <form onSubmit={onSubmitOtp} className='rounded-lg p-8 bg-slate-900 shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold
         text-center mb-4'>Reset Password OTP</h1>
        <p className='text-center  mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => {
            return <input key={index} type='text' maxLength='1' className='w-12 h-12 text-center
              bg-[#333A5C] text-white text-xl rounded-lg focus:outline-none'
              required ref={e => inputRef.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)} />
          })}
        </div>
        <button type='submit' className='w-full
          bg-gradient-to-r from-indigo-500 to-indigo-900
          text-white py-2.5 rounded-full'>Submit</button>
      </form>
}
      {/* enter new password */}
      {isOtpSubmited && isEmailSent && 
      <form onSubmit={onSubmitNewPassword} className='rounded-lg p-8 bg-slate-900 shadow-lg w-96 text-sm'>
     <h1 className='text-white text-2xl font-semibold
         text-center mb-4'>New Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>
        <div className='mb-4 flex items-center gap-3 w-full px-5
        py-2.5 rounded-full bg-[#333A5C]'>
          <img src={assets.lock_icon} className='w-3 h-3'/>
          <input value={newPassword} required onChange={(e)=>{setNewPassword(e.target.value)}} type='password' placeholder='Password'
          className='bg-transparent outline-none text-white'/>
        
        </div>
        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500
        to-indigo-900 text-white rounded-full mt-8'>Submit</button>
     </form>}
    </div>
  )
}

export default ResetPassword