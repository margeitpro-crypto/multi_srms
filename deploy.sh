#!/bin/bash

# Deployment script for Multi-School Result Management System

echo "Preparing for deployment..."

# Build the frontend
echo "Building frontend..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Frontend build successful!"
else
    echo "Frontend build failed!"
    exit 1
fi

# Add all changes to git
echo "Adding changes to git..."
git add .

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
    echo "Committing changes..."
    git commit -m "Deploy: $(date)"
else
    echo "No changes to commit"
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "Deployment complete! You can now deploy to Vercel."