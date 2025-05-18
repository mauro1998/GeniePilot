#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting File Server build script...${NC}"

# Restore dependencies
echo -e "${BLUE}Restoring dependencies...${NC}"
dotnet restore
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to restore dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencies restored successfully${NC}"

# Build solution
echo -e "${BLUE}Building solution...${NC}"
dotnet build --configuration Release --no-restore
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}Build completed successfully${NC}"

# Run tests (if any)
if find . -name "*.Tests.csproj" -type f | grep -q .; then
    echo -e "${BLUE}Running tests...${NC}"
    dotnet test --configuration Release --no-build
    if [ $? -ne 0 ]; then
        echo -e "${RED}Tests failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}Tests passed successfully${NC}"
else
    echo -e "${BLUE}No test projects found${NC}"
fi

# Run the application
echo -e "${BLUE}Would you like to run the application? (y/n)${NC}"
read answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
    echo -e "${BLUE}Running application...${NC}"
    dotnet run --project files-server/FileServer.csproj --configuration Release --no-build
fi

echo -e "${GREEN}Script completed successfully${NC}"
