#!/usr/bin/env python3

import requests
import sys
import json
import base64
from datetime import datetime
from pathlib import Path
from PIL import Image
import io

class BaniyaAPITester:
    def __init__(self, base_url="https://shaadi-fund-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200 and "Baniya.ai API" in response.text
            self.log_test("API Root", success, f"Status: {response.status_code}")
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_cc_helper_recommendations(self):
        """Test credit card recommendations"""
        try:
            # Test with valid spending profile
            profile = {
                "grocery": 5000,
                "dining": 3000,
                "travel": 8000,
                "shopping": 10000,
                "utilities": 2000
            }
            
            response = requests.post(
                f"{self.api_url}/cc-helper/recommend",
                json=profile,
                headers={"Content-Type": "application/json"},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                success = isinstance(data, list) and len(data) > 0
                if success and len(data) > 0:
                    # Validate structure of first recommendation
                    rec = data[0]
                    required_fields = ["card", "match_score", "estimated_savings", "reason"]
                    success = all(field in rec for field in required_fields)
                    if success:
                        card = rec["card"]
                        card_fields = ["name", "bank", "cashback_rate", "annual_fee"]
                        success = all(field in card for field in card_fields)
                
                self.log_test("CC Helper Recommendations", success, 
                            f"Status: {response.status_code}, Count: {len(data) if isinstance(data, list) else 0}")
            else:
                self.log_test("CC Helper Recommendations", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("CC Helper Recommendations", False, str(e))
            return False

    def test_cc_helper_empty_profile(self):
        """Test CC helper with empty profile"""
        try:
            profile = {
                "grocery": 0,
                "dining": 0,
                "travel": 0,
                "shopping": 0,
                "utilities": 0
            }
            
            response = requests.post(
                f"{self.api_url}/cc-helper/recommend",
                json=profile,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                # Should return empty list or minimal recommendations
                success = isinstance(data, list)
            
            self.log_test("CC Helper Empty Profile", success, f"Status: {response.status_code}")
            return success
            
        except Exception as e:
            self.log_test("CC Helper Empty Profile", False, str(e))
            return False

    def create_test_image(self):
        """Create a simple test image for Q-Commerce testing"""
        # Create a simple test image with some content
        img = Image.new('RGB', (400, 600), color='white')
        
        # Add some simple content to make it look like a receipt
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # Try to use default font, fallback to basic if not available
        try:
            font = ImageFont.load_default()
        except:
            font = None
        
        # Draw some receipt-like content
        draw.rectangle([20, 20, 380, 580], outline='black', width=2)
        draw.text((50, 50), "BLINKIT ORDER", fill='black', font=font)
        draw.text((50, 100), "Amul Milk 1L - Rs 60", fill='black', font=font)
        draw.text((50, 130), "Bread - Rs 30", fill='black', font=font)
        draw.text((50, 160), "Tomatoes 1kg - Rs 40", fill='black', font=font)
        draw.text((50, 190), "Onions 2kg - Rs 50", fill='black', font=font)
        draw.text((50, 220), "Rice 5kg - Rs 450", fill='black', font=font)
        draw.text((50, 280), "Total: Rs 630", fill='black', font=font)
        
        return img

    def test_qcommerce_analysis(self):
        """Test Q-Commerce screenshot analysis"""
        try:
            # Create test image
            img = self.create_test_image()
            
            # Convert to bytes
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='JPEG', quality=85)
            img_buffer.seek(0)
            
            # Prepare multipart form data
            files = {
                'file': ('test_receipt.jpg', img_buffer, 'image/jpeg')
            }
            
            response = requests.post(
                f"{self.api_url}/qcommerce/analyze",
                files=files,
                timeout=30  # Longer timeout for AI processing
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["items", "total_blinkit", "total_savings", "recommendation"]
                success = all(field in data for field in required_fields)
                
                if success and len(data["items"]) > 0:
                    # Validate item structure
                    item = data["items"][0]
                    item_fields = ["name", "quantity", "blinkit_price", "instamart_price", "zepto_price", "best_platform"]
                    success = all(field in item for field in item_fields)
                
                self.log_test("Q-Commerce Analysis", success, 
                            f"Status: {response.status_code}, Items: {len(data.get('items', []))}")
            else:
                self.log_test("Q-Commerce Analysis", False, f"Status: {response.status_code}, Response: {response.text[:200]}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Q-Commerce Analysis", False, str(e))
            return False

    def test_sales_predictions(self):
        """Test sales predictions endpoint"""
        try:
            response = requests.get(f"{self.api_url}/sales/predictions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = isinstance(data, list) and len(data) > 0
                
                if success and len(data) > 0:
                    # Validate structure of first prediction
                    prediction = data[0]
                    required_fields = ["platform", "event_name", "start_date", "end_date", "expected_discount", "categories", "confidence"]
                    success = all(field in prediction for field in required_fields)
                
                self.log_test("Sales Predictions", success, 
                            f"Status: {response.status_code}, Count: {len(data) if isinstance(data, list) else 0}")
            else:
                self.log_test("Sales Predictions", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Sales Predictions", False, str(e))
            return False

    def test_sales_predictions_filtered(self):
        """Test sales predictions with platform filter"""
        try:
            response = requests.get(f"{self.api_url}/sales/predictions?platform=Amazon", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = isinstance(data, list)
                
                # Check if all results are for Amazon
                if success and len(data) > 0:
                    success = all(item["platform"] == "Amazon" for item in data)
                
                self.log_test("Sales Predictions Filtered", success, 
                            f"Status: {response.status_code}, Amazon Count: {len(data) if isinstance(data, list) else 0}")
            else:
                self.log_test("Sales Predictions Filtered", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Sales Predictions Filtered", False, str(e))
            return False

    def test_shaadi_fund_get(self):
        """Test getting Shaadi Fund data"""
        try:
            response = requests.get(f"{self.api_url}/shaadi-fund", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_saved", "transactions", "last_updated"]
                success = all(field in data for field in required_fields)
                
                self.log_test("Shaadi Fund GET", success, 
                            f"Status: {response.status_code}, Total: {data.get('total_saved', 'N/A')}")
            else:
                self.log_test("Shaadi Fund GET", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Shaadi Fund GET", False, str(e))
            return False

    def test_shaadi_fund_add(self):
        """Test adding to Shaadi Fund"""
        try:
            amount = 100.50
            response = requests.post(f"{self.api_url}/shaadi-fund/add?amount={amount}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                success = "success" in data and data["success"] and "new_total" in data
                
                self.log_test("Shaadi Fund ADD", success, 
                            f"Status: {response.status_code}, New Total: {data.get('new_total', 'N/A')}")
            else:
                self.log_test("Shaadi Fund ADD", False, f"Status: {response.status_code}")
            
            return response.status_code == 200
            
        except Exception as e:
            self.log_test("Shaadi Fund ADD", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Baniya.ai Backend API Tests")
        print(f"🔗 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_api_root():
            print("❌ API Root test failed - stopping further tests")
            return False
        
        # Test all endpoints
        self.test_cc_helper_recommendations()
        self.test_cc_helper_empty_profile()
        self.test_qcommerce_analysis()
        self.test_sales_predictions()
        self.test_sales_predictions_filtered()
        self.test_shaadi_fund_get()
        self.test_shaadi_fund_add()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  • {test['test']}: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = BaniyaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())