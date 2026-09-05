#!/usr/bin/env node

const password = process.env.AUTHORING_DEPLOY_PASSWORD;

if (!password) process.exit(1);
process.stdout.write(`${password}\n`);
