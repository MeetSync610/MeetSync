require('dotenv').config(); // ⚠️ importante
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabaseAdmin;
