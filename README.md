<p>Test enviorment for Nest+Supabase implementation</p>
<p>Steps to create similar project:</p>

<p>
1- Install NestJs CLI globally
</p>
<p>
npm install -g @nestjs/cli
</p>
<p>
2- Create new project (npm, pnpm or yarn)
</p>
<p>
nest new supabase-backend
</p>

<p>
3- Install dependencies
</p>
<p>
npm install dotenv class-validator class-transformer jsonwebtoken @supabase/supabase-js
</p>
<p>
npm install --save-dev @types/multer
</p>

<p>
4- Start dev server to check proper instalation
</p>
<p>
npm run start:dev
</p>

<p>
5- Create supabase project and extract API KEY and PROJECT URL and place them in the .env
</p>
<p>
6- Create trigger in Supabase for user signup (run SQL code)
</p>
<p>
7- Create TABLES specific for the project (edit SQL code for tables)
</p>
<p>
8- Define bussines logic in NEST and create triggers connecting to supabase for the rest
</p>
<p>
9- Create Tests for services and controllers used in NEST
</p>
