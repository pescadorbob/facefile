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



