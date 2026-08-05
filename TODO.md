# Task: Allow Sign-in with both Mobile Number and Email

## Steps

- [x] Analyzed repository and relevant files (AuthScreen, authAPI, authcontroller, User model)
- [x] Confirmed plan with user
- [x] Backend: Update `login` handler in `Backend/controller/authcontroller.js` to support phone lookup
- [x] Frontend: Update `src/app/api/authAPI.js` JSDoc for `loginUser`
- [x] Frontend: Add Email/Mobile toggle + phone field to login view in `src/app/pages/public/AuthScreen.jsx`
- [x] Frontend: Update `handleLogin` to send email or phone based on selected method
- [x] Cleared default login email
- [x] Split password validation: strict for register, simple required check for login
- [x] Restart backend server and test both login methods
