#!/bin/bash
source render.env
render-cli create service --name professor-ai-backend --type web --repo https://github.com/krishankshh/professor-ai --branch main --dir backend --env-file backend/.env --plan free
