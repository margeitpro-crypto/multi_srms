@echo off
REM Deployment script for Multi-School Result Management System

echo Preparing for deployment...

REM Build the frontend
echo Building frontend...
npm run build

REM Check if build was successful
if %errorlevel% == 0 (
    echo Frontend build successful!
) else (
    echo Frontend build failed!
    exit /b 1
)

REM Add all changes to git
echo Adding changes to git...
git add .

REM Check if there are changes to commit
git diff-index --quiet HEAD || (
    echo Committing changes...
    git commit -m "Deploy: %date% %time%"
) || (
    echo No changes to commit
)

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

echo Deployment complete! You can now deploy to Vercel.