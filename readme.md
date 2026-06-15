# FaceFile 💬  
Remember every face, every name — using science‑backed spaced repetition.

## What It Does
- Add colleagues with their **name**, **photo**, and **personal notes**
- Get **quizzed immediately** after adding someone (retrieval practice)
- See **scheduled reviews** via the **SM‑2 spaced repetition algorithm** right before you'd forget them
- Two quiz modes randomly mixed:
  - **Face → Name**
  - **Name → Face**
- Auto‑scheduled reminders appear on your dashboard when you log in

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 19 · standalone components · signals · Tailwind CSS v3 |
| Backend | Node.js + Express |
| Database | DynamoDB |
| Scheduling | node-cron hourly check |
| Spaced Repetition | SM‑2 algorithm |
| Deployment | AWS Lambda - dynamoDB - AWS API Gateway - Route53 - ALB - CloudFormation  | 
| Local Deployment | Node server - local dynamoDB | 

Note: The application can be run locally, or it can be run in AWS. The code has layer separation so that the AWS Lambda code is completely separate as plumbing from the endpoints exposed.

## Running Locally

**Prerequisites:** Node.js 22+

### 1. Backend

```bash
cd backend
cp .env.example .env      # configure DATABASE_URL, JWT secrets, FRONTEND_URL
npm install
npm run db:migrate        # creates SQLite DB and runs migrations
node prisma/seed.js       # seeds the default user (id=1)
npm run dev               # starts on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm install @rollup/rollup-win32-x64-msvc  # fixes npm optional-deps bug on Windows
npx @angular/cli@21 serve                  # starts on http://localhost:4200
```

Open [http://localhost:4200](http://localhost:4200) — API calls proxy automatically to the backend.


