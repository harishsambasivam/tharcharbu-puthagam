import dotenv from 'dotenv'
import { App } from 'aws-cdk-lib'
import { SiteStack } from '../lib/site-stack.js'

// Secrets for the Lambda come from backend/.env (ADMIN_PASSWORD_HASH, JWT_SECRET).
dotenv.config({ path: new URL('../../backend/.env', import.meta.url) })

const app = new App()
new SiteStack(app, 'TharcharbuPuthagam', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION },
})
