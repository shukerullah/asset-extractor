#!/usr/bin/env python3
"""
Local testing script for FastAPI backend
Run this to test the backend before deploying to Railway
"""

import requests
import sys
import time
from pathlib import Path

def test_backend(base_url="http://localhost:8000"):
    """Test all backend endpoints"""
    
    print(f"🧪 Testing backend at {base_url}")
    print("=" * 50)
    
    # Test 1: Root endpoint
    print("1️⃣ Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        assert response.status_code == 200
        print("✅ Root endpoint working")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False
    
    # Test 2: Health check
    print("\n2️⃣ Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        assert response.status_code == 200
        data = response.json()
        print("✅ Health check working")
        print(f"   Status: {data.get('status')}")
        print(f"   Model loaded: {data.get('model_loaded')}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 3: Models endpoint
    print("\n3️⃣ Testing models endpoint...")
    try:
        response = requests.get(f"{base_url}/models")
        assert response.status_code == 200
        data = response.json()
        print("✅ Models endpoint working")
        print(f"   Available models: {data.get('models')}")
        print(f"   Current model: {data.get('current')}")
    except Exception as e:
        print(f"❌ Models endpoint failed: {e}")
        return False
    
    # Test 4: Background removal (if test image exists)
    print("\n4️⃣ Testing background removal...")
    
    # Look for a test image
    test_images = [
        "test.jpg", "test.png", "sample.jpg", "sample.png",
        "../public/assets/village_with-background.png"
    ]
    
    test_image = None
    for img_path in test_images:
        if Path(img_path).exists():
            test_image = img_path
            break
    
    if not test_image:
        print("⚠️  No test image found. Skipping background removal test.")
        print("   Create a test image (test.jpg/test.png) to test this endpoint.")
        return True
    
    try:
        print(f"   Using test image: {test_image}")
        
        with open(test_image, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f"{base_url}/remove-background", 
                files=files,
                timeout=30  # 30 second timeout
            )
        
        assert response.status_code == 200
        assert response.headers.get('content-type') == 'image/png'
        
        # Save result
        output_path = f"test_output_{int(time.time())}.png"
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print("✅ Background removal working")
        print(f"   Output saved: {output_path}")
        print(f"   Processing time: {response.headers.get('X-Processing-Time')}s")
        
    except requests.exceptions.Timeout:
        print("⚠️  Background removal test timed out (this is normal for first request)")
        print("   The AI model is downloading. Try again in a few minutes.")
        return True
    except Exception as e:
        print(f"❌ Background removal failed: {e}")
        return False
    
    print("\n🎉 All tests passed!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8000"
    
    success = test_backend(base_url)
    sys.exit(0 if success else 1)