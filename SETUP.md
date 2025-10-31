# ZiaanBlox Setup Guide

## Database Initialization

The database tables need to be created in Supabase before the application can function properly.

### Step 1: Run SQL Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project
3. Go to SQL Editor (left sidebar)
4. Click "New Query"
5. Copy the entire contents of `/scripts/001_init_database.sql`
6. Paste it into the SQL editor
7. Click "Run" button
8. Wait for the execution to complete successfully

### Step 2: Verify Installation

After running the SQL script, verify the tables were created:
- profiles
- scripts
- script_likes
- comments
- admin_users
- banned_users

### Step 3: Set Up Admin Account

To create a super admin account, insert the following into the `admin_users` table using the SQL Editor:

\`\`\`sql
-- Replace YOUR_USER_ID with your actual Supabase user ID
INSERT INTO admin_users (user_id, role, can_ban_user, can_delete_script, can_create_admin, can_manage_permissions, can_delete_comment, can_view_analytics)
VALUES ('YOUR_USER_ID', 'super_admin', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);
\`\`\`

### Step 4: Access the Application

Once the database is set up, you can:
1. Sign up a new account
2. Login to the application
3. Upload scripts
4. Browse and comment on other users' scripts

## Troubleshooting

If you see errors about "Could not find a relationship", it means the SQL migration hasn't been run yet. Follow Step 1 above.

If tables already exist and you want to reset them:

\`\`\`sql
DROP TABLE IF EXISTS banned_users CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS script_likes CASCADE;
DROP TABLE IF EXISTS scripts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
\`\`\`

Then run the migration again.
