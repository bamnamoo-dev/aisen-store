@echo off
echo ===================================================
echo             Aisen Store Internet Update
echo ===================================================
echo.

echo [Current Changes]
git status -s
echo.
echo ===================================================
echo.

set "commit_msg="
set /p commit_msg="Enter update message (Press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update chatbot link and menu

echo.
echo ---------------------------------------------------
echo [1/3] Staging changes...
git add .

echo.
echo [2/3] Committing...
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing to GitHub...
git push origin main
echo ---------------------------------------------------

echo.
echo ===================================================
echo   Update Completed! Live website will update soon.
echo ===================================================
echo.
pause
