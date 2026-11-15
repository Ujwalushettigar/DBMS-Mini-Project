import React from 'react';
import { GovTopBar } from './GovTopBar';
import { GovHeader } from './GovHeader';
import { MainNav } from './MainNav';

export function Navbar() {
  return (
    <>
      <GovTopBar />
      <GovHeader />
      <MainNav />
    </>
  );
}

export default Navbar;
