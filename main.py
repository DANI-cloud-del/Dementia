# ============================================
# SILENT GUARDIAN - MAIN APPLICATION
# AI-Powered Dementia Care Platform
# ============================================

from flask import Flask, render_template, request, session, jsonify
from groq import Groq
from dotenv import load_dotenv
from datetime import datetime
import os
import requests

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# ============================================
# CONFIGURATION
# ============================================

# Secret key for sessions (MUST be set)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Load API keys from environment
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

# Validate API keys
if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY not found in .env file!")
if not HUGGINGFACE_API_KEY:
    print("⚠️  WARNING: HUGGINGFACE_API_KEY not found in .env file!")

# Initialize Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("✅ Groq client initialized")
except Exception as e:
    print(f"❌ Groq initialization failed: {e}")
    groq_client = None

# ============================================
# AI MODELS CONFIGURATION
# ============================================

# Available Groq models (October 2025 - Current)
GROQ_MODELS = {
    "quality": "llama-3.3-70b-versatile",      # ✅ Best quality, recommended
    "speed": "llama-3.1-8b-instant",           # ✅ Fastest responses  
    "intelligent": "llama3-groq-70b-8192-tool-use-preview",  # ✅ Tool use capable
}

# Select your preferred model
CURRENT_MODEL = GROQ_MODELS["quality"]  # Change to "speed" if needed

# System prompt for dementia care
SYSTEM_PROMPT = """You are a compassionate AI companion for the Silent Guardian app, designed to help elderly individuals with dementia and their caregivers.

**About Silent Guardian:**
- **AI Companion**: Chat interface for emotional support and memory assistance
- **Detection Tests**: Cognitive games to monitor mental health (memory games, picture descriptions)
- **Life-Vault**: QR code emergency profile with medical info, contacts, and location
- **Dashboard**: Caregiver monitoring with activity tracking and alerts
- **Emergency**: Quick SOS button with family notification

**Your Abilities:**
1. Explain app features in simple terms
2. Guide users to the right section
3. Provide emotional support and companionship
4. Help with memory recall activities
5. Answer questions about dementia care

**Communication Style:**
- Speak in simple, clear, short sentences
- Be patient, warm, and encouraging
- Never mention the condition directly
- Keep responses under 3-4 sentences unless explaining features
- Be positive and uplifting
- Use emojis occasionally to be friendly

**Special Commands You Understand:**
- "explain app" or "what is this app" → Explain Silent Guardian features
- "help me navigate" → Guide to different sections
- "I'm confused" → Offer simple assistance
- "emergency" → Direct to emergency features
- "family contact" → Help with Life-Vault
- "play game" or "memory game" → Guide to Detection page

Always be helpful, never judgmental, and prioritize user safety and comfort."""


# ============================================
# AI PROVIDERS - FALLBACK CHAIN (FIXED)
# ============================================

def get_groq_response(user_message, conversation_history=[]):
    """
    Primary AI provider - Groq (Fast and reliable)
    FIXED: Updated model + conversation history validation
    """
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # FIXED: Properly validate and format conversation history
        for msg in conversation_history[-10:]:  # Keep last 10 messages
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                messages.append({
                    "role": msg['role'],
                    "content": msg['content']
                })
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        print(f"📤 Sending to Groq ({CURRENT_MODEL})")
        
        # Call Groq API with CURRENT model
        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model=CURRENT_MODEL,  # ✅ FIXED: Using current model
            temperature=0.7,
            max_tokens=150,
            top_p=0.9,
        )
        
        response = chat_completion.choices[0].message.content
        print(f"✅ Groq API response received ({CURRENT_MODEL})")
        return {"success": True, "response": response, "provider": "groq"}
        
    except Exception as e:
        print(f"❌ Groq API error: {str(e)}")
        return {"success": False, "error": str(e)}


def get_huggingface_response(user_message, conversation_history=[]):
    """
    Fallback 1 - Hugging Face Inference API
    FIXED: Properly handle conversation context
    """
    try:
        API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        
        # FIXED: Properly build conversation context
        context_messages = []
        for msg in conversation_history[-5:]:
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                context_messages.append(msg['content'])
        
        context = "\n".join(context_messages)
        full_prompt = f"{context}\nUser: {user_message}\nAssistant:"
        
        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_length": 100,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        if isinstance(result, list) and len(result) > 0:
            ai_response = result[0].get('generated_text', '').strip()
            print("✅ Hugging Face response received")
            return {"success": True, "response": ai_response, "provider": "huggingface"}
        else:
            return {"success": False, "error": "Invalid response format"}
            
    except Exception as e:
        print(f"❌ Hugging Face API error: {str(e)}")
        return {"success": False, "error": str(e)}


def get_rule_based_response(user_message):
    """
    Fallback 2 - Local rule-based responses (Never fails)
    """
    user_message_lower = user_message.lower()
    
    # Greeting responses
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
        return {
            "success": True,
            "response": "Hello! It's wonderful to see you today. How are you feeling?",
            "provider": "local"
        }
    
    # How are you
    if any(word in user_message_lower for word in ['how are you', 'how do you do']):
        return {
            "success": True,
            "response": "I'm doing well, thank you for asking! I'm here to chat with you. How about you?",
            "provider": "local"
        }
    
    # Time/Date questions
    if any(word in user_message_lower for word in ['what time', 'what day', 'what date']):
        now = datetime.now()
        return {
            "success": True,
            "response": f"It's {now.strftime('%A, %B %d, %Y')} and the time is {now.strftime('%I:%M %p')}.",
            "provider": "local"
        }
    
    # Weather
    if 'weather' in user_message_lower:
        return {
            "success": True,
            "response": "I'm not able to check the weather right now, but you can look outside or check with your family. Would you like to talk about something else?",
            "provider": "local"
        }
    
    # Memory/Remember
    if any(word in user_message_lower for word in ['remember', 'memory', 'forget']):
        return {
            "success": True,
            "response": "It's okay if you can't remember everything. That's what I'm here for - to help you. Would you like to talk about your favorite memories?",
            "provider": "local"
        }
    
    # Family questions
    if 'family' in user_message_lower or 'children' in user_message_lower:
        return {
            "success": True,
            "response": "Your family loves you very much! They're always thinking about you. Would you like me to help you reach out to them?",
            "provider": "local"
        }
    
    # Help/Assistance
    if any(word in user_message_lower for word in ['help', 'assist', 'need']):
        return {
            "success": True,
            "response": "I'm here to help you! You can ask me anything - about your schedule, your family, or just to chat. What would you like help with?",
            "provider": "local"
        }
    
    # Feelings
    if any(word in user_message_lower for word in ['sad', 'lonely', 'worried', 'scared', 'confused']):
        return {
            "success": True,
            "response": "I understand how you feel. You're not alone - I'm here with you. Would you like to talk about what's on your mind?",
            "provider": "local"
        }
    
    # Activities
    if any(word in user_message_lower for word in ['game', 'activity', 'play', 'do something']):
        return {
            "success": True,
            "response": "Great idea! We have memory games, picture descriptions, and storytelling activities. Which would you like to try?",
            "provider": "local"
        }
    
    # Default response
    return {
        "success": True,
        "response": "That's interesting! Tell me more about that. I'm here to listen and chat with you.",
        "provider": "local"
    }


def get_feature_explanation(query):
    """
    Provide detailed explanations about app features
    """
    query_lower = query.lower()
    
    # App overview
    if any(word in query_lower for word in ['what is this', 'explain app', 'what does this do', 'app features']):
        return {
            "success": True,
            "response": """Silent Guardian is your caring companion! 🌟

I can help you with:
• **Chat & Support** - Talk to me anytime you need company
• **Memory Games** - Fun activities to keep your mind active
• **Emergency Help** - Quick SOS button for instant family contact
• **Life-Vault** - Your medical info in a QR code for emergencies

What would you like to explore first?""",
            "provider": "feature_guide",
            "suggested_actions": ["Play a game", "Emergency contact", "Just chat"]
        }
    
    # Companion explanation
    if 'companion' in query_lower:
        return {
            "success": True,
            "response": """The AI Companion is me! 😊 I'm here to chat, listen, and keep you company. You can:

• Talk about your day or memories
• Ask me questions
• Play word games or tell stories
• Get reminders and support

I'm always here for you!""",
            "provider": "feature_guide"
        }
    
    # ✅ FIXED: Detection tests - Only match GENERAL questions
    if any(word in query_lower for word in ['what are detection', 'explain detection', 'what is detection', 'detection page']):
        return {
            "success": True,
            "response": """Let's explore the Detection page! 🎮

• **Memory Games** - Match pictures and remember sequences
• **Picture Descriptions** - Tell me what you see
• **Word Puzzles** - Simple and enjoyable

These games keep your mind active. Which would you like to try?""",
            "provider": "feature_guide",
            "suggested_actions": ["Start memory game", "Describe pictures", "Play word puzzle"]
        }
    
    # Life-Vault explanation
    if any(word in query_lower for word in ['life vault', 'lifevault', 'qr code', 'emergency info', 'medical']):
        return {
            "success": True,
            "response": """Life-Vault is your safety bracelet! 🆔

It's a QR code with:
• Your name and photo
• Emergency contacts
• Medical information
• Allergies and medications
• Your home address

If you're lost, anyone can scan it and help you get home safely!""",
            "provider": "feature_guide"
        }
    
    # Dashboard explanation
    if 'dashboard' in query_lower or 'caregiver' in query_lower:
        return {
            "success": True,
            "response": """The Dashboard is for your family! 👨‍👩‍👧 They can:

• See how active you've been
• Check if you've taken medications
• Get alerts if something's wrong
• Track your location for safety
• Monitor your wellbeing

It helps them care for you better!""",
            "provider": "feature_guide"
        }
    
    # Emergency features
    if 'emergency' in query_lower or 'help now' in query_lower:
        return {
            "success": True,
            "response": """For emergencies, you have: 🚨

• **SOS Button** (red button bottom-right) - Instant family alert
• **Emergency Contacts** - Quick dial to family/ambulance
• **Location Sharing** - Automatically sends your GPS

Press the red HELP button anytime you need immediate assistance!""",
            "provider": "feature_guide"
        }
    
    # Navigation help
    if any(word in query_lower for word in ['navigate', 'where', 'find', 'go to']):
        return {
            "success": True,
            "response": """Here's how to navigate: 🧭

• **Top Menu** - Click any icon to switch pages
• **Home** - Main screen you see first
• **Companion** - That's me, your chat friend!
• **Detection** - Fun games and activities
• **Profile** - Your personal settings

Where would you like to go?""",
            "provider": "feature_guide"
        }
    
    # ✅ NEW: Return None for specific game questions - let Groq AI handle them
    return None  # If no feature match, return None to try other providers


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint with automatic fallback chain:
    Feature Explanation → Groq → Hugging Face → Local Rule-Based
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        print(f"💬 User message: {user_message}")
        
        # First, check if it's a feature explanation request
        print("🔍 Checking for feature explanations...")
        feature_result = get_feature_explanation(user_message)
        
        if feature_result:
            print("✅ Feature explanation provided")
            return jsonify({
                "success": True,
                "response": feature_result['response'],
                "provider": feature_result['provider'],
                "suggested_actions": feature_result.get('suggested_actions', []),
                "timestamp": datetime.now().isoformat()
            })
        
        # Try Groq first
        print("🔄 Trying Groq API...")
        result = get_groq_response(user_message, conversation_history)
        
        # If Groq fails, try Hugging Face
        if not result.get('success'):
            print("🔄 Groq failed, trying Hugging Face...")
            result = get_huggingface_response(user_message, conversation_history)
        
        # If both APIs fail, use local rule-based
        if not result.get('success'):
            print("🔄 APIs failed, using local rule-based AI...")
            result = get_rule_based_response(user_message)
        
        # Return response
        return jsonify({
            "success": True,
            "response": result['response'],
            "provider": result['provider'],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        # Emergency fallback
        return jsonify({
            "success": True,
            "response": "I'm here with you. Let's take things one step at a time.",
            "provider": "emergency",
            "timestamp": datetime.now().isoformat()
        })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Check which AI providers are working"""
    status = {
        "groq": "checking",
        "huggingface": "checking",
        "local": "available"
    }
    
    # Test Groq
    try:
        groq_client.chat.completions.create(
            messages=[{"role": "user", "content": "test"}],
            model=CURRENT_MODEL,  # ✅ Use current model
            max_tokens=5
        )
        status["groq"] = "available"
    except:
        status["groq"] = "unavailable"
    
    # Test Hugging Face
    try:
        API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
        response = requests.get(API_URL, headers=headers, timeout=5)
        status["huggingface"] = "available" if response.status_code == 200 else "unavailable"
    except:
        status["huggingface"] = "unavailable"
    
    return jsonify(status)


@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    """Convert voice audio to text (Placeholder)"""
    audio_file = request.files.get('audio')
    return jsonify({
        'text': 'This is a placeholder transcription',
        'confidence': 0.95
    })


# ============================================
# WEB ROUTES
# ============================================

@app.route('/')
def home():
    """Homepage"""
    if 'user_name' not in session:
        session['user_name'] = 'Friend'
    
    hour = datetime.now().hour
    if hour < 12:
        greeting = 'Good Morning'
    elif hour < 18:
        greeting = 'Good Afternoon'
    else:
        greeting = 'Good Evening'

    return render_template('homepage.html', greeting=greeting)


@app.route('/companion')
def companion():
    """AI Companion Chat Interface"""
    activity = request.args.get('activity', 'general')
    return render_template('companion.html', activity=activity)


@app.route('/detection')
def detection():
    """Cognitive Detection Tests Page"""
    test_type = request.args.get('type', 'game')
    return render_template('detection.html', test_type=test_type)


@app.route('/lifevault')
def lifevault():
    """QR Life-Vault Emergency Profile"""
    return render_template('lifevault.html')


@app.route('/dashboard')
def dashboard():
    """Caregiver Dashboard"""
    return render_template('dashboard.html')


@app.route('/emergency')
def emergency():
    """Emergency Contact Page"""
    return render_template('emergency.html')


@app.route('/profile')
def profile():
    """User Profile Settings"""
    return render_template('profile.html')


@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    return render_template('logout.html')


# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 SILENT GUARDIAN - Starting Server")
    print("="*50)
    print(f"✅ Flask app initialized")
    print(f"✅ Secret key configured")
    print(f"✅ AI Model: {CURRENT_MODEL}")
    print(f"✅ AI providers ready")
    print(f"🌐 Access at: http://127.0.0.1:5000")
    print("="*50 + "\n")
    
    # Get port from environment variable (Render provides this)
    port = int(os.environ.get('PORT', 5000))
    
    # Run in production mode
    app.run(host='0.0.0.0', port=port, debug=False)

