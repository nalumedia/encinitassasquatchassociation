/* Public site config. The Supabase key here is the publishable (anon) key —
   it can only INSERT into esa_*_submissions via RLS. Never put a service
   or secret key in this file. */
window.ESA_CONFIG = {
  supabaseUrl: "https://cvmfspalbgymymjrzdvt.supabase.co",
  supabaseKey: "sb_publishable_S5_HovwtztrjoAXsqGk2gQ_6F2kxFkw",
  joinTable: "esa_join_submissions",
  rsvpTable: "esa_rsvp_submissions",
};
