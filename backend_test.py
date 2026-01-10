#!/usr/bin/env python3
"""
Backend API Testing for Legend Cities Consultant CRUD Operations
Tests all consultant endpoints with proper authentication flow
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://devam-project-2.preview.emergentagent.com/api"
ADMIN_CREDENTIALS = {
    "username": "admin", 
    "password": "LegendCities2025!"
}

class ConsultantAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_consultant_id = None
        self.test_franchise_id = None
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_admin_login(self) -> bool:
        """Test admin login and get auth token"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=ADMIN_CREDENTIALS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                if self.auth_token:
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    self.log_result("Admin Login", True, "Successfully logged in as admin")
                    return True
                else:
                    self.log_result("Admin Login", False, "No access token in response", data)
                    return False
            else:
                self.log_result("Admin Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Login request failed: {str(e)}")
            return False
    
    def test_get_franchises(self) -> bool:
        """Get franchises list to get a valid franchise_id"""
        try:
            response = self.session.get(f"{BASE_URL}/franchises", timeout=10)
            
            if response.status_code == 200:
                franchises = response.json()
                if franchises and len(franchises) > 0:
                    self.test_franchise_id = franchises[0]["id"]
                    self.log_result("Get Franchises", True, f"Found {len(franchises)} franchises, using franchise_id: {self.test_franchise_id}")
                    return True
                else:
                    self.log_result("Get Franchises", False, "No franchises found in response", franchises)
                    return False
            else:
                self.log_result("Get Franchises", False, f"Failed to get franchises, status: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Franchises", False, f"Get franchises request failed: {str(e)}")
            return False
    
    def test_get_all_consultants_empty(self) -> bool:
        """Test GET /consultants - should return empty array initially"""
        try:
            response = self.session.get(f"{BASE_URL}/consultants", timeout=10)
            
            if response.status_code == 200:
                consultants = response.json()
                if isinstance(consultants, list):
                    self.log_result("Get All Consultants (Empty)", True, f"Successfully retrieved consultants list (count: {len(consultants)})")
                    return True
                else:
                    self.log_result("Get All Consultants (Empty)", False, "Response is not a list", consultants)
                    return False
            else:
                self.log_result("Get All Consultants (Empty)", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get All Consultants (Empty)", False, f"Request failed: {str(e)}")
            return False
    
    def test_create_consultant(self) -> bool:
        """Test POST /consultants - Create a new consultant"""
        if not self.test_franchise_id:
            self.log_result("Create Consultant", False, "No franchise_id available")
            return False
            
        consultant_data = {
            "franchise_id": self.test_franchise_id,
            "name": "Ahmet Yılmaz",
            "title": "Gayrimenkul Danışmanı",
            "phone": "+90 532 123 4567",
            "email": "ahmet.yilmaz@legendcities.com",
            "bio": "10 yıllık deneyime sahip gayrimenkul uzmanı",
            "experience_years": 10,
            "specialization": ["Konut", "Villa"],
            "languages": ["Türkçe", "İngilizce"]
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/consultants",
                json=consultant_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "consultant" in data and "id" in data["consultant"]:
                    self.test_consultant_id = data["consultant"]["id"]
                    self.log_result("Create Consultant", True, f"Successfully created consultant with ID: {self.test_consultant_id}")
                    return True
                else:
                    self.log_result("Create Consultant", False, "No consultant ID in response", data)
                    return False
            else:
                self.log_result("Create Consultant", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create Consultant", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_consultant_by_id(self) -> bool:
        """Test GET /consultants/{consultant_id} - Get consultant by ID"""
        if not self.test_consultant_id:
            self.log_result("Get Consultant by ID", False, "No consultant_id available")
            return False
            
        try:
            response = self.session.get(f"{BASE_URL}/consultants/{self.test_consultant_id}", timeout=10)
            
            if response.status_code == 200:
                consultant = response.json()
                if consultant.get("id") == self.test_consultant_id:
                    self.log_result("Get Consultant by ID", True, f"Successfully retrieved consultant: {consultant.get('name')}")
                    return True
                else:
                    self.log_result("Get Consultant by ID", False, "Consultant ID mismatch", consultant)
                    return False
            else:
                self.log_result("Get Consultant by ID", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Consultant by ID", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_consultants_by_franchise(self) -> bool:
        """Test GET /franchises/{franchise_id}/consultants - Get consultants by franchise"""
        if not self.test_franchise_id:
            self.log_result("Get Consultants by Franchise", False, "No franchise_id available")
            return False
            
        try:
            response = self.session.get(f"{BASE_URL}/franchises/{self.test_franchise_id}/consultants", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "consultants" in data and isinstance(data["consultants"], list):
                    consultant_count = len(data["consultants"])
                    self.log_result("Get Consultants by Franchise", True, f"Successfully retrieved {consultant_count} consultants for franchise")
                    return True
                else:
                    self.log_result("Get Consultants by Franchise", False, "Invalid response format", data)
                    return False
            else:
                self.log_result("Get Consultants by Franchise", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get Consultants by Franchise", False, f"Request failed: {str(e)}")
            return False
    
    def test_update_consultant(self) -> bool:
        """Test PUT /consultants/{consultant_id} - Update consultant"""
        if not self.test_consultant_id:
            self.log_result("Update Consultant", False, "No consultant_id available")
            return False
            
        update_data = {
            "name": "Ahmet Yılmaz (Güncellendi)",
            "bio": "15 yıllık deneyime sahip gayrimenkul uzmanı - güncellendi",
            "experience_years": 15,
            "specialization": ["Konut", "Villa", "Ticari"]
        }
        
        try:
            response = self.session.put(
                f"{BASE_URL}/consultants/{self.test_consultant_id}",
                json=update_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "consultant" in data:
                    updated_consultant = data["consultant"]
                    if updated_consultant.get("name") == update_data["name"]:
                        self.log_result("Update Consultant", True, "Successfully updated consultant")
                        return True
                    else:
                        self.log_result("Update Consultant", False, "Update not reflected in response", data)
                        return False
                else:
                    self.log_result("Update Consultant", False, "No consultant in response", data)
                    return False
            else:
                self.log_result("Update Consultant", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Update Consultant", False, f"Request failed: {str(e)}")
            return False
    
    def test_get_all_consultants_with_data(self) -> bool:
        """Test GET /consultants - should now return the created consultant"""
        try:
            response = self.session.get(f"{BASE_URL}/consultants", timeout=10)
            
            if response.status_code == 200:
                consultants = response.json()
                if isinstance(consultants, list) and len(consultants) > 0:
                    # Check if our test consultant is in the list
                    found_consultant = any(c.get("id") == self.test_consultant_id for c in consultants)
                    if found_consultant:
                        self.log_result("Get All Consultants (With Data)", True, f"Successfully retrieved {len(consultants)} consultants including test consultant")
                        return True
                    else:
                        self.log_result("Get All Consultants (With Data)", False, "Test consultant not found in list", consultants)
                        return False
                else:
                    self.log_result("Get All Consultants (With Data)", False, "No consultants found", consultants)
                    return False
            else:
                self.log_result("Get All Consultants (With Data)", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get All Consultants (With Data)", False, f"Request failed: {str(e)}")
            return False
    
    def test_delete_consultant(self) -> bool:
        """Test DELETE /consultants/{consultant_id} - Delete consultant"""
        if not self.test_consultant_id:
            self.log_result("Delete Consultant", False, "No consultant_id available")
            return False
            
        try:
            response = self.session.delete(f"{BASE_URL}/consultants/{self.test_consultant_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Delete Consultant", True, "Successfully deleted consultant")
                    return True
                else:
                    self.log_result("Delete Consultant", False, "No message in response", data)
                    return False
            else:
                self.log_result("Delete Consultant", False, f"Failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Delete Consultant", False, f"Request failed: {str(e)}")
            return False
    
    def test_auth_protection(self) -> bool:
        """Test that protected endpoints require authentication"""
        # Create a session without auth token
        unauth_session = requests.Session()
        
        test_data = {
            "franchise_id": "test",
            "name": "Test User",
            "phone": "+90 555 123 4567",
            "email": "test@test.com"
        }
        
        try:
            # Test POST without auth
            response = unauth_session.post(f"{BASE_URL}/consultants", json=test_data, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Auth Protection (POST)", True, "POST endpoint properly protected - returns 401")
            else:
                self.log_result("Auth Protection (POST)", False, f"POST endpoint not protected - status: {response.status_code}")
                return False
            
            # Test PUT without auth
            response = unauth_session.put(f"{BASE_URL}/consultants/test-id", json=test_data, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Auth Protection (PUT)", True, "PUT endpoint properly protected - returns 401")
            else:
                self.log_result("Auth Protection (PUT)", False, f"PUT endpoint not protected - status: {response.status_code}")
                return False
            
            # Test DELETE without auth
            response = unauth_session.delete(f"{BASE_URL}/consultants/test-id", timeout=10)
            
            if response.status_code == 401:
                self.log_result("Auth Protection (DELETE)", True, "DELETE endpoint properly protected - returns 401")
                return True
            else:
                self.log_result("Auth Protection (DELETE)", False, f"DELETE endpoint not protected - status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Auth Protection", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all consultant CRUD tests"""
        print("🚀 Starting Legend Cities Consultant CRUD API Tests")
        print("=" * 60)
        
        # Test sequence as specified in review request
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Get Franchises", self.test_get_franchises),
            ("Get All Consultants (Empty)", self.test_get_all_consultants_empty),
            ("Create Consultant", self.test_create_consultant),
            ("Get Consultant by ID", self.test_get_consultant_by_id),
            ("Get Consultants by Franchise", self.test_get_consultants_by_franchise),
            ("Update Consultant", self.test_update_consultant),
            ("Get All Consultants (With Data)", self.test_get_all_consultants_with_data),
            ("Delete Consultant", self.test_delete_consultant),
            ("Auth Protection", self.test_auth_protection),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Consultant CRUD API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the details above.")
            
        return passed == total

def main():
    """Main test execution"""
    tester = ConsultantAPITester()
    success = tester.run_all_tests()
    
    # Print summary for easy parsing
    print("\n" + "=" * 60)
    print("SUMMARY FOR TESTING AGENT:")
    
    failed_tests = [r for r in tester.results if not r["success"]]
    if failed_tests:
        print("❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['message']}")
    else:
        print("✅ ALL TESTS PASSED")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())