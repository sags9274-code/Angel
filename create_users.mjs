import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sgpjygzpebeigdqkqqcf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncGp5Z3J6cGViZWlnZHFrcWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjY3MTYsImV4cCI6MjEwNjAwMjcxNn0.UOQ6L7DAvU-HvA7T5gFWd5bs3xlvAuoTCaUHS4OMjIk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Creating Satwik...");
  const { data: d1, error: e1 } = await supabase.auth.signUp({
    email: 'sags9274@gmail.com',
    password: 'Satwik07'
  });
  console.log("Satwik signup result:", e1 ? e1.message : "Success");

  console.log("Creating Mikky...");
  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'goddessmikky23@gmail.com',
    password: '12345678'
  });
  console.log("Mikky signup result:", e2 ? e2.message : "Success");
}
main();
