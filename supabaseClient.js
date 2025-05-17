// Make sure the Supabase JS library is loaded via CDN before this script!
const SUPABASE_URL = 'https://maxavwnmszjyhahhgbzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGF2d25tc3pqeWhhaGhnYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTY4NTgsImV4cCI6MjA2Mjg5Mjg1OH0.Kxo53BVFW2r9G9GX4hqVTS2vEV-YkUb15xcIN2T7RsI';

// Initialize and expose globally
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);