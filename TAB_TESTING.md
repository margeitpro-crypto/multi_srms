# Testing Admin Settings Page Tabs

## Prerequisites
1. Both backend and frontend servers must be running
2. Database must be initialized with academic years

## Servers
- Frontend: http://localhost:3002/
- Backend API: http://localhost:3002/api/

## How to Test Tab Functionality

1. **Access the Application**
   - Open your browser and navigate to http://localhost:3002/
   - Log in as an administrator (use the test credentials)

2. **Navigate to Admin Settings**
   - Click on the "Settings" link in the admin navigation menu
   - You should see the Admin Settings Page with multiple tabs

3. **Verify Tab Functionality**
   - The page should load with the "General" tab active by default
   - Click on each tab to verify that:
     - The tab becomes visually active (highlighted with blue border/indicator)
     - The content area updates to show the correct tab content
     - All 8 tabs work properly:
       1. General
       2. Grading
       3. Year Setup
       4. School Page Controller
       5. Appearance
       6. Security
       7. Payment
       8. Data

4. **Test Year Setup Tab Specifically**
   - Click on the "Year Setup" tab
   - You should see:
     - A form to add new academic years
     - A table listing existing academic years
     - Ability to edit, delete, and toggle active status of academic years
   - Try adding a new academic year to verify functionality

5. **Verify Responsiveness**
   - Resize the browser window to test responsive behavior
   - On smaller screens, tabs should be horizontally scrollable

## Expected Behavior
- Tab switching should be instantaneous
- Each tab should display its unique content
- Active tab should be visually distinct
- No errors should occur when switching between tabs
- Year Setup tab should properly interact with the database

## Troubleshooting
If tabs are not working:
1. Check browser console for JavaScript errors
2. Verify that all API endpoints are accessible
3. Ensure database connection is working
4. Confirm that academic years are properly initialized in the database