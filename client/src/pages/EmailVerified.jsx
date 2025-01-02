import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import { useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
const EmailVerified = () => {
  axios.defaults.withCredentials = true;

  const navigate = useNavigate()

  const { backendUrl, isLoggedIn, userData, getUserData } = useContext(AppContext)

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otp = inputRef.current.map(e => e.value).join('');
      const { data } = await axios.post(backendUrl 
        + '/api/auth/verify-account', { otp });

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate('/');
        
      }
      else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    isLoggedIn && userData.isAccountVerified && userData && navigate('/')
  },[isLoggedIn, userData])

  return (
    <div className='flex items-center justify-center min-h-screen flex-col
    sm:px-0 bg-gradient-to-br from from-blue-200 to bg-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} className='absolute left-5 sm:left-20
        top-5 w-28 sm:w-32 cursor-pointer'/>
      <form onSubmit={onSubmitHandler} className='rounded-lg p-8 bg-slate-900 shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold
         text-center mb-4'>Email verify OTP</h1>
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
          text-white py-2 rounded-full'>Verify</button>
      </form>
    </div>
  )
}

export default EmailVerified