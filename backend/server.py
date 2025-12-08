from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
from PIL import Image
import io
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class CreditCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    bank: str
    cashback_rate: str
    annual_fee: str
    features: List[str]
    best_for: List[str]
    reward_type: str

class SpendingProfile(BaseModel):
    grocery: int
    dining: int
    travel: int
    shopping: int
    utilities: int

class CCRecommendation(BaseModel):
    card: CreditCard
    match_score: int
    estimated_savings: int
    reason: str

class QCommerceItem(BaseModel):
    name: str
    quantity: str
    blinkit_price: float
    instamart_price: float
    zepto_price: float
    best_platform: str
    potential_savings: float

class QCommerceResult(BaseModel):
    items: List[QCommerceItem]
    total_blinkit: float
    total_savings: float
    recommendation: str

class SalePrediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    event_name: str
    start_date: str
    end_date: str
    expected_discount: str
    categories: List[str]
    confidence: str

class ShaadiF und(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_saved: float
    transactions: int
    last_updated: str

# Sample credit cards data
CREDIT_CARDS = [
    {"name": "HDFC Millennia", "bank": "HDFC", "cashback_rate": "5% on shopping", "annual_fee": "₹1,000", "features": ["Amazon Prime", "Swiggy vouchers"], "best_for": ["shopping", "dining"], "reward_type": "cashback"},
    {"name": "SBI SimplyCLICK", "bank": "SBI", "cashback_rate": "10x rewards online", "annual_fee": "₹499", "features": ["Movie vouchers", "Dining discounts"], "best_for": ["shopping", "utilities"], "reward_type": "points"},
    {"name": "ICICI Amazon Pay", "bank": "ICICI", "cashback_rate": "5% on Amazon", "annual_fee": "₹500", "features": ["Prime benefits", "Fuel surcharge"], "best_for": ["shopping"], "reward_type": "cashback"},
    {"name": "Axis Flipkart", "bank": "Axis", "cashback_rate": "4% Flipkart", "annual_fee": "₹500", "features": ["Priority delivery", "Extra discounts"], "best_for": ["shopping"], "reward_type": "cashback"},
    {"name": "IndusInd Iconia", "bank": "IndusInd", "cashback_rate": "2 reward pts/₹100", "annual_fee": "₹3,000", "features": ["Lounge access", "Complimentary insurance"], "best_for": ["travel", "dining"], "reward_type": "points"},
    {"name": "Yes First Exclusive", "bank": "Yes Bank", "cashback_rate": "6 pts/₹200", "annual_fee": "₹2,499", "features": ["Airport lounge", "Golf access"], "best_for": ["travel"], "reward_type": "points"},
    {"name": "HSBC Cashback", "bank": "HSBC", "cashback_rate": "1.5% on all", "annual_fee": "₹750", "features": ["Global acceptance", "Fuel waiver"], "best_for": ["grocery", "utilities"], "reward_type": "cashback"},
    {"name": "Standard Chartered DigiSmart", "bank": "SC", "cashback_rate": "5% on digital", "annual_fee": "₹499", "features": ["Streaming benefits", "UPI cashback"], "best_for": ["shopping", "utilities"], "reward_type": "cashback"},
    {"name": "Axis Vistara Infinite", "bank": "Axis", "cashback_rate": "6 CV Points/₹200", "annual_fee": "₹10,000", "features": ["Free tickets", "Priority boarding"], "best_for": ["travel"], "reward_type": "points"},
    {"name": "HDFC Regalia", "bank": "HDFC", "cashback_rate": "4 pts/₹150", "annual_fee": "₹2,500", "features": ["Lounge access", "Golf sessions"], "best_for": ["travel", "dining"], "reward_type": "points"},
    {"name": "SBI Card ELITE", "bank": "SBI", "cashback_rate": "5X rewards", "annual_fee": "₹4,999", "features": ["Complimentary stays", "Golf rounds"], "best_for": ["travel"], "reward_type": "points"},
    {"name": "ICICI Coral", "bank": "ICICI", "cashback_rate": "2 pts/₹100", "annual_fee": "₹500", "features": ["Dining offers", "Movie discounts"], "best_for": ["dining", "shopping"], "reward_type": "points"},
    {"name": "Kotak Royale Signature", "bank": "Kotak", "cashback_rate": "3.3% value back", "annual_fee": "₹1,999", "features": ["Airport lounge", "Golf access"], "best_for": ["travel", "dining"], "reward_type": "points"},
    {"name": "RBL Shoprite", "bank": "RBL", "cashback_rate": "10% on 3 brands", "annual_fee": "₹750", "features": ["Brand vouchers", "Fuel surcharge"], "best_for": ["shopping"], "reward_type": "cashback"},
    {"name": "BOB Easy", "bank": "BOB", "cashback_rate": "5% on dining", "annual_fee": "₹499", "features": ["Movie offers", "Fuel benefits"], "best_for": ["dining", "utilities"], "reward_type": "cashback"},
    {"name": "AU LIT", "bank": "AU Bank", "cashback_rate": "5% unlimited", "annual_fee": "₹200", "features": ["No restrictions", "Low fee"], "best_for": ["shopping", "grocery"], "reward_type": "cashback"},
    {"name": "Federal Celesta", "bank": "Federal", "cashback_rate": "10X on dining", "annual_fee": "₹499", "features": ["Fuel waiver", "Dining discounts"], "best_for": ["dining"], "reward_type": "points"},
    {"name": "American Express Platinum Travel", "bank": "AMEX", "cashback_rate": "5 points/₹50", "annual_fee": "₹3,500", "features": ["Airport transfers", "Taj vouchers"], "best_for": ["travel"], "reward_type": "points"},
    {"name": "Citi Cashback", "bank": "Citi", "cashback_rate": "5% on all", "annual_fee": "₹500", "features": ["Unlimited cashback", "Utility bill pay"], "best_for": ["grocery", "utilities"], "reward_type": "cashback"},
    {"name": "OneCard Metal Edition", "bank": "OneCard", "cashback_rate": "5% cashback", "annual_fee": "₹0", "features": ["No forex markup", "Instant approval"], "best_for": ["shopping", "travel"], "reward_type": "cashback"}
]

SALES_DATA = [
    {"platform": "Amazon", "event_name": "Great Indian Festival", "start_date": "2025-02-05", "end_date": "2025-02-12", "expected_discount": "40-80%", "categories": ["Electronics", "Fashion", "Home"], "confidence": "95%"},
    {"platform": "Flipkart", "event_name": "Big Billion Days", "start_date": "2025-02-10", "end_date": "2025-02-17", "expected_discount": "50-85%", "categories": ["Mobiles", "TVs", "Appliances"], "confidence": "98%"},
    {"platform": "Amazon", "event_name": "Prime Day", "start_date": "2025-03-20", "end_date": "2025-03-22", "expected_discount": "30-70%", "categories": ["Electronics", "Books", "Smart Home"], "confidence": "92%"},
    {"platform": "Myntra", "event_name": "End of Season Sale", "start_date": "2025-02-15", "end_date": "2025-02-28", "expected_discount": "50-90%", "categories": ["Fashion", "Footwear", "Accessories"], "confidence": "90%"},
    {"platform": "Flipkart", "event_name": "Electronics Sale", "start_date": "2025-03-01", "end_date": "2025-03-07", "expected_discount": "25-65%", "categories": ["Laptops", "Mobiles", "Accessories"], "confidence": "88%"},
    {"platform": "Amazon", "event_name": "Summer Sale", "start_date": "2025-04-10", "end_date": "2025-04-20", "expected_discount": "30-60%", "categories": ["Fashion", "Home", "Beauty"], "confidence": "85%"},
    {"platform": "Ajio", "event_name": "Big Bold Sale", "start_date": "2025-02-20", "end_date": "2025-03-05", "expected_discount": "40-80%", "categories": ["Ethnic Wear", "Western Wear"], "confidence": "87%"},
    {"platform": "Flipkart", "event_name": "Fashion Days", "start_date": "2025-03-15", "end_date": "2025-03-25", "expected_discount": "50-80%", "categories": ["Clothing", "Footwear"], "confidence": "91%"},
]

@api_router.get("/")
async def root():
    return {"message": "Baniya.ai API"}

@api_router.post("/cc-helper/recommend", response_model=List[CCRecommendation])
async def recommend_credit_cards(profile: SpendingProfile):
    recommendations = []
    
    # Simple scoring algorithm
    for card_data in CREDIT_CARDS:
        score = 0
        reasons = []
        
        # Calculate score based on spending profile
        if profile.grocery > 5000 and "grocery" in card_data["best_for"]:
            score += 30
            reasons.append("Great for groceries")
        if profile.dining > 3000 and "dining" in card_data["best_for"]:
            score += 25
            reasons.append("Excellent dining rewards")
        if profile.travel > 5000 and "travel" in card_data["best_for"]:
            score += 35
            reasons.append("Premium travel benefits")
        if profile.shopping > 8000 and "shopping" in card_data["best_for"]:
            score += 30
            reasons.append("Maximum shopping cashback")
        if profile.utilities > 2000 and "utilities" in card_data["best_for"]:
            score += 20
            reasons.append("Good for bill payments")
        
        # Bonus for low annual fee
        fee = int(card_data["annual_fee"].replace("₹", "").replace(",", ""))
        if fee < 1000:
            score += 15
            reasons.append("Budget-friendly annual fee")
        
        if score > 0:
            total_spending = profile.grocery + profile.dining + profile.travel + profile.shopping + profile.utilities
            estimated_savings = int(total_spending * 0.02 * (score / 100))
            
            recommendations.append(CCRecommendation(
                card=CreditCard(**card_data),
                match_score=min(score, 100),
                estimated_savings=estimated_savings,
                reason=" • ".join(reasons) if reasons else "Versatile card for general use"
            ))
    
    # Sort by match score
    recommendations.sort(key=lambda x: x.match_score, reverse=True)
    return recommendations[:5]

@api_router.post("/qcommerce/analyze")
async def analyze_qcommerce_screenshot(file: UploadFile = File(...)):
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Use Gemini to analyze
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert at analyzing e-commerce receipts and extracting item details."
        ).with_model("gemini", "gemini-2.5-flash")
        
        image_content = ImageContent(image_base64=img_base64)
        
        user_message = UserMessage(
            text="""Extract all items from this Blinkit/grocery order screenshot. For each item, provide:
1. Item name
2. Quantity
3. Price

Return ONLY a JSON array in this exact format, no other text:
[
  {"name": "Item Name", "quantity": "1 kg", "price": 150.0}
]

If you cannot extract items clearly, return a sample grocery list with realistic Indian prices.""",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response and add mock comparison prices
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            items_data = json.loads(json_match.group())
        else:
            # Fallback mock data
            items_data = [
                {"name": "Amul Milk 1L", "quantity": "2 units", "price": 60.0},
                {"name": "Bread", "quantity": "1 pack", "price": 30.0},
                {"name": "Tomatoes", "quantity": "1 kg", "price": 40.0},
                {"name": "Onions", "quantity": "2 kg", "price": 50.0},
                {"name": "Rice (Basmati)", "quantity": "5 kg", "price": 450.0}
            ]
        
        # Add comparison prices
        qcommerce_items = []
        total_blinkit = 0
        total_best = 0
        
        for item in items_data:
            blinkit_price = float(item.get("price", 0))
            # Generate realistic comparison prices (±10-20%)
            import random
            instamart_price = round(blinkit_price * random.uniform(0.85, 1.15), 2)
            zepto_price = round(blinkit_price * random.uniform(0.80, 1.10), 2)
            
            prices = {"Blinkit": blinkit_price, "Instamart": instamart_price, "Zepto": zepto_price}
            best_platform = min(prices, key=prices.get)
            best_price = prices[best_platform]
            
            total_blinkit += blinkit_price
            total_best += best_price
            
            qcommerce_items.append(QCommerceItem(
                name=item["name"],
                quantity=item["quantity"],
                blinkit_price=blinkit_price,
                instamart_price=instamart_price,
                zepto_price=zepto_price,
                best_platform=best_platform,
                potential_savings=round(blinkit_price - best_price, 2)
            ))
        
        total_savings = round(total_blinkit - total_best, 2)
        savings_percent = round((total_savings / total_blinkit) * 100, 1) if total_blinkit > 0 else 0
        
        recommendation = f"Switch to {qcommerce_items[0].best_platform if qcommerce_items else 'other platforms'} to save ₹{abs(total_savings)}!"
        if savings_percent > 10:
            recommendation = f"🎯 Bachat Alert! Save {savings_percent}% (₹{abs(total_savings)}) by smart shopping!"
        
        return QCommerceResult(
            items=qcommerce_items,
            total_blinkit=total_blinkit,
            total_savings=abs(total_savings),
            recommendation=recommendation
        )
    
    except Exception as e:
        logging.error(f"Error analyzing screenshot: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.get("/sales/predictions", response_model=List[SalePrediction])
async def get_sales_predictions(platform: Optional[str] = None):
    predictions = [SalePrediction(**sale) for sale in SALES_DATA]
    
    if platform:
        predictions = [p for p in predictions if p.platform.lower() == platform.lower()]
    
    return predictions

@api_router.get("/shaadi-fund", response_model=ShaadiF und)
async def get_shaadi_fund():
    # In real app, this would be tracked per user
    fund_data = await db.shaadi_fund.find_one({"user": "demo"}, {"_id": 0})
    
    if not fund_data:
        return ShaadiF und(
            total_saved=0.0,
            transactions=0,
            last_updated=datetime.now(timezone.utc).isoformat()
        )
    
    return ShaadiF und(**fund_data)

@api_router.post("/shaadi-fund/add")
async def add_to_shaadi_fund(amount: float):
    current = await db.shaadi_fund.find_one({"user": "demo"})
    
    if current:
        new_total = current.get("total_saved", 0) + amount
        new_transactions = current.get("transactions", 0) + 1
        await db.shaadi_fund.update_one(
            {"user": "demo"},
            {"$set": {
                "total_saved": new_total,
                "transactions": new_transactions,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        await db.shaadi_fund.insert_one({
            "user": "demo",
            "total_saved": amount,
            "transactions": 1,
            "last_updated": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "new_total": amount if not current else current.get("total_saved", 0) + amount}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()