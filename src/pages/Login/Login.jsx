import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup,login } from '../../config/firebase'

const Login = () => {
  
  const [currstate,setcurrstate] = useState('Sign up');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [username,setUsername] = useState('');

  const onsubmitHandler =(event)=>{
    event.preventDefault();//prevent page from reloading when submit form
    if(currstate=="Sign up"){
      signup(username,email,password);
  }else{
      login(email,password);
  }
}

  return (
    <div className='login'>
        <img src={assets.logo_big} alt="" className='logo'/>
        <form onSubmit={onsubmitHandler} className="login-form">
            <h2>{currstate}</h2>
            {currstate=="Sign up"?<input onChange={(e)=>{setUsername(e.target.value)}} value={username} type="text" placeholder='username' className="form-input" required/>:null}
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='Email Address' className="form-input" />
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='password' className="form-input" />
            <button type="submit">{currstate=="Sign up"?"Create account":"Login Now"}</button>
            <div className="login-term">
                <input type="checkbox" />
                <p>Agree to the terms of use & privacy policy</p>
            </div>
            <div className="login-forgot">
                {currstate=="Sign up"?<p className="login-toggle">Already have an account <span onClick={()=>{setcurrstate("Login")}}>Login here</span></p>:
                 <p className="login-toggle">Create an account <span onClick={()=>{setcurrstate("Sign up")}}>click here</span></p> 
                }
            </div>
        </form>
    </div>
  )
}

export default Login