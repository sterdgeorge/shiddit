@echo off
echo Deploying Firestore rules...

REM Deploy Firestore rules
firebase deploy --only firestore:rules

echo Firestore rules deployed successfully!
echo Voting should now work for all authenticated users.
pause
