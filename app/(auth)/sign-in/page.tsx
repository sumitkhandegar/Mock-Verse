import React from 'react';
// Update the import path below if AuthForm is located elsewhere
import { AuthForm } from '@/components/ui/AuthForm';

const page = () => {
  return <AuthForm type={"sign-in"} />;
}

export default page