import os
import sys

# Add the Backend directory to the path so we can import app
sys.path.append(r'c:\Users\ASUS\OneDrive\Desktop\Ticket - Copy\Backend')

from app import classify_priority, configure_llm

def test_priority_classification():
    print("Testing Priority Classification...")
    
    # Test 1: Fallback logic (No API Key)
    print("\nTest 1: Fallback Logic (No API Key)")
    if 'GEMINI_API_KEY' in os.environ:
        del os.environ['GEMINI_API_KEY']
    
    title = "System is down"
    description = "Nobody can access the server"
    priority = classify_priority(title, description)
    print(f"Title: {title}")
    print(f"Priority: {priority}")
    assert priority == 'High', f"Expected High, got {priority}"
    
    # Test 2: LLM Logic (Mocking behavior by setting an invalid key to trigger the try/except block)
    print("\nTest 2: LLM Logic Path (Invalid API Key -> Fallback)")
    os.environ['GEMINI_API_KEY'] = 'invalid_key'
    
    # We expect it to print an error about the key but still return a priority via fallback
    title = "I have a question about the printer"
    description = "How do I change the toner?"
    priority = classify_priority(title, description)
    print(f"Title: {title}")
    print(f"Priority: {priority}")
    assert priority == 'Low', f"Expected Low, got {priority}"
    
    print("\nVerification Successful!")

if __name__ == "__main__":
    test_priority_classification()
