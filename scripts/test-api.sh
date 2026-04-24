#!/bin/bash
# Real User Testing Tool - simulates user flows

BASE_URL="http://localhost:3000/api/v1"

echo "🧪 WorkAI - Real User Testing Tool"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -X $method "$BASE_URL$endpoint" -H 'Content-Type: application/json' -d "$data")
    fi
    
    if echo "$response" | grep -q '"error"'; then
        echo -e "${RED}❌ $name${NC}"
        echo "   $response" | head -100
    else
        echo -e "${GREEN}✅ $name${NC}"
    fi
}

echo ""
echo "📋 Step 1: Browse Marketplace"
echo "----------------------------"

test_api "Get Offers" "GET" "/offers"
test_api "Get Requests" "GET" "/requests"  

echo ""
echo "📋 Step 2: User Authentication"
echo "----------------------------"

# Register new user
USER_DATA='{"email":"testuser'"$(date +%s)"'@example.com","password":"Test1234!","role":"member","displayName":"Test User"}'
test_api "Register User" "POST" "/auth/register" "$USER_DATA"

# Login would return token in real app
echo -e "${YELLOW}→ Login returns JWT token${NC}"

echo ""
echo "📋 Step 3: Create Offer"
echo "---------------------"

OFFER_DATA='{"title":"React Developer Needed","description":"Build React web app","price":5000,"skills":["React","JavaScript","Node.js"],"pricingType":"fixed","deliveryTime":14}'
test_api "Create Offer" "POST" "/offers" "$OFFER_DATA"

echo ""
echo "📋 Step 4: Create Request"
echo "-----------------------"

REQUEST_DATA='{"title":"Need React Developer","description":"Build e-commerce site","budget":{"min":3000,"max":7000},"skills":["React","JavaScript"],"urgency":"medium"}'
test_api "Create Request" "POST" "/requests" "$REQUEST_DATA"

echo ""
echo "📋 Step 5: AI Features"
echo "--------------------"

test_api "AI Match" "POST" "/ai/match" '{"title":"Build web app","skills":["React","Node.js"],"budget":{"min":3000,"max":7000}}'
test_api "AI Price" "POST" "/ai/price" '{"title":"Build dashboard","skills":["React","TypeScript"],"providerLevel":"expert"}'
test_api "AI Support" "POST" "/ai/support" '{"message":"cannot login to my account"}'

echo ""
echo "📋 Step 6: Trust & Reviews"
echo "----------------------"

test_api "Get Trust Profile" "GET" "/trust/user_1"
test_api "Get Reviews" "GET" "/reviews"

echo ""
echo "📋 Step 7: Transaction Flow"
echo "---------------------------"

test_api "Get Transactions" "GET" "/transactions"

echo ""
echo "========================================"
echo "🧪 Testing Complete!"
echo ""
echo "💡 Run mobile app to test full UI:"
echo "   cd mobile && npx expo start"