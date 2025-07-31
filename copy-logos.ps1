# Create the images directory if it doesn't exist
New-Item -Path "public/images" -ItemType Directory -Force

# Copy the logo files
Copy-Item -Path "AuraVote Logo 2.png" -Destination "public/images/auravote-logo.png" -Force
Copy-Item -Path "ew.png" -Destination "public/images/no-signal-logo.png" -Force
Copy-Item -Path "1746727867564.png" -Destination "public/images/weekly-logo.png" -Force

Write-Host "Logo files copied successfully!" 