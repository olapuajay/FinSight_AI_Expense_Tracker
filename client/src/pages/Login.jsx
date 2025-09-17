import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import loginImage from "../assets/login.png";
import logo from "../assets/logo.png";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    // console.log(result)
    if(result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    }
  };
  
  return (
    <div className='min-h-screen flex items-center justify-between bg-gray-50 px-4'>
      <div>
        <img src={loginImage} className='w-140 h-full md:block hidden' alt="Login Image" />
      </div>
      <div className='max-w-lg w-full bg-white shadow-lg rounded-2xl p-6'>
        <div className='flex flex-col items-center justify-center'>
          <img src={logo} className='w-20 mb-4' alt="" />
          <h2 className='text-2xl font-bold text-center text-gray-900 mb-6'>
            Welcome back to FinSight
          </h2>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Email</label>
            <input 
              type="email"
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full mt-1 px-3 py-2 border rounded-md shadow-sm outline-0 focus:border-blue-500 focus:border-2'
              placeholder='you@example.com'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Password</label>
            <input 
              type="password"
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full mt-1 px-3 py-2 border rounded-md shadow-sm outline-0 focus:border-blue-500 focus:border-2'
              placeholder='••••••••'
            />
          </div>
          {error && (
            <p className='text-red-500 text-sm mt-2'>{error}</p>
          )}

          <button type='submit' disabled={loading} className='w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition duration-300'>
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-4'>
          New to FinSight?{" "}
          <a href="/signup" className='text-blue-600 hover:underline'>Sign up</a>
        </p>

        <p className='text-center text-xs text-gray-600 mt-4 italic'>
          Your data is encrypted and never shared without your consent
        </p>
      </div>
    </div>
  )
}

export default Login
