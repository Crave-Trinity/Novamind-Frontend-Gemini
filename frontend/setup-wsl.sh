#!/bin/bash
# Setup script for Novamind Digital Twin Frontend in WSL2

echo "🚀 Setting up Novamind Digital Twin Frontend..."
echo "Using Node.js $(node -v) and npm $(npm -v)"

# Navigate to the frontend directory - adjust this path to match your WSL path
cd /mnt/c/Users/JJ/Desktop/NOVAMIND-DIGITALTWIN/frontend

# Install dependencies
echo "📦 Installing dependencies... This may take a few minutes."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo "" 
echo "🌟 Welcome to Novamind Digital Twin Frontend! 🌟"
echo "Your premium psychiatric digital twin platform is ready to run."
echo "" 
echo "To start the development server, run:"
echo "cd /mnt/c/Users/JJ/Desktop/NOVAMIND-DIGITALTWIN/frontend"
echo "npm run dev"
echo "" 
echo "The application will be available at: http://localhost:3000"
echo "Demo login credentials:"
echo "Email: demo@novamind.health"
echo "Password: (any value will work)"
echo "" 
echo "Enjoy exploring your Digital Twin platform! 🧠✨"
