import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';

export default function AdminScreen() {
  const { isOperator } = useAuth();

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access the admin OS." />;
  }

  return <Redirect href="/admin/overview" />;
}
