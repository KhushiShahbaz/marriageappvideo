
import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalCallHandler from './Phase_2/GlobalCallHandler';

const RootLayout = () => {
  return (
    <>
      <GlobalCallHandler />
      <Outlet />
    </>
  );
};

export default RootLayout;
