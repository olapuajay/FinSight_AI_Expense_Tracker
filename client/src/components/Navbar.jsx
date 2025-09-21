import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Bell, CircleUser, House, CirclePlus, List, ChartNoAxesColumnIncreasing, Settings, LogOut, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

import AddExpenseModal from "./AddExpenseModal";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  }

  return (
    <nav className='relative bg-white shadow-md md:px-16 md:py-3 px-2 py-2 flex items-center justify-between'>
      <div className='inline-flex items-center'>
        <img src={logo} className='md:w-15 w-10 h-full' alt="" />
        <h1 className='md:font-bold font-semibold md:text-2xl text-lg text-[#2563EB]'>FinSight</h1>
      </div>

      <div className='hidden md:flex space-x-8'>
        <Link to="/dashboard">
          <div className='flex flex-col items-center hover:text-[#2563EB]'>
            <House className='w-5 h-5' />
            <p className='text-xs'>DASHBOARD</p>
          </div>
        </Link>
        <button onClick={() => setModalOpen(true)}>
          <div className='flex flex-col items-center hover:text-[#2563EB] cursor-pointer'>
            <CirclePlus className='w-5 h-5' />
            <p className='text-xs'>ADD EXPENSE</p>
          </div>
        </button>
        <Link to="/dashboard">
          <div className='flex flex-col items-center hover:text-[#2563EB]'>
            <List className='w-5 h-5' />
            <p className='text-xs'>EXPENSE LIST</p>
          </div>
        </Link>
        <Link to="/dashboard">
          <div className='flex flex-col items-center hover:text-[#2563EB]'>
            <ChartNoAxesColumnIncreasing className='w-5 h-5' />
            <p className='text-xs'>REPORTS</p>
          </div>
        </Link>
      </div>

      <div className='flex items-center space-x-4'>
        <button className='relative'>
          <Bell className='w-5 h-5 hover:text-[#2563EB]' />
          <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1'>
            3
          </span>
        </button>

        <div className='relative'>
          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className='flex items-center space-x-1'>
            <CircleUser className='w-5 h-5' />
          </button>
          {isDropdownOpen && (
            <div className='absolute right-0 w-36 mt-2 bg-white shadow-lg rounded-md p-2'>
              <div className='flex gap-2 items-center'>
                <CircleUser className='w-8 h-8 text-[#2563EB]' />
                <div className='flex flex-col'>
                  <p className='text-xs'>HEY,</p>
                  <p className='text-sm'>{user?.name.length >= 14 ? user?.name.split(" ")[0] || "User" : user?.name || "User"}</p>
                </div>
              </div>
              <hr className='mt-2' />
              <div className='flex flex-col items-center'>
                <Link to="/settings" className='block px-4 py-2'>
                  <button className='px-2 py-1 font-medium hover:bg-[#2563EB] hover:text-white rounded-md flex items-center gap-1 cursor-pointer'>
                    <Settings className='w-5 h-5' />
                    <span>SETTINGS</span>
                  </button>
                </Link>
                <button onClick={handleLogout} className='px-2 py-1 font-medium hover:bg-red-500 hover:text-white rounded-md flex items-center gap-1 cursor-pointer'>
                  <LogOut className='w-5 h-5' />
                  <span>LOGOUT</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button className='md:hidden' onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </div>

      {menuOpen && (
        <div className='absolute top-full left-0 w-full bg-white shadow-md md:hidden z-40'>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className='block px-4 py-2 '>Dashboard</Link>
          <button 
            onClick={() => { setModalOpen(true); setMenuOpen(false); }} 
            className='block px-4 py-2  w-full text-left'
          >
            Add Expense
          </button>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className='block px-4 py-2 '>Expense List</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className='block px-4 py-2 '>Reports</Link>
          <Link to="/settings" onClick={() => setMenuOpen(false)} className='block px-4 py-2 '>Settings</Link>
          <button 
            onClick={handleLogout} 
            className='block px-4 py-2 hover:bg-red-500 hover:text-white w-full text-left'
          >
            Logout
          </button>
        </div>
      )}

      <AddExpenseModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </nav>
  )
}

export default Navbar
