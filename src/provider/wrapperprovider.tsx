'use client';

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

import { StyleProvider } from '@ant-design/cssinjs';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/app/store';
  
import { ToastContainer  } from 'react-toastify';
export default function WrapperProvider({ children }: { children: React.ReactNode }) {
   

   return (
      <StyleProvider hashPriority="high">
        <ReduxProvider store={store}>
          <SessionProvider>
            <ThemeProvider>
             <ToastContainer />
                {children}
            
               
            </ThemeProvider>
          </SessionProvider>
        </ReduxProvider>
      </StyleProvider>
   )
}