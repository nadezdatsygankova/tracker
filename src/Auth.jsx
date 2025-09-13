// Auth.jsx
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';
import React from 'react';

export default function AuthUI() {
  return (
    <div className="max-w-sm mx-auto mt-12 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Sign in</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        theme="light"
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Sign in',
              link_text: 'Already have an account? Sign in',
            },
            sign_up: {
              link_text: "Don't have an account? Sign up",
            },
          },
        }}
      />
    </div>
  );
}
