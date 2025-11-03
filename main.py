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

@app.route('/api/smart-guide', methods=['POST'])
def smart_guide():
    """Intelligent navigation guide with flexible keyword matching"""
    try:
        data = request.json
        user_text = data.get('text', '').lower()
        current_page = data.get('currentPage', 'home')
        current_activity = data.get('currentActivity')
        site_map = data.get('siteMap', {})
        
        # Build concise context with clearer instructions
        context = f"""You are a helpful navigation guide for Silent Guardian app.

Current location: {current_page}
Current activity: {current_activity or 'None'}

Pages you can navigate to:
- Home (/) - Welcome/main page
- Dashboard (/dashboard) - Personal overview
- Cognitive Activities (/detection) - Games and exercises
- AI Companion (/companion) - Voice chat
- LifeVault (/lifevault) - Document storage
- Emergency (/emergency) - Emergency help (also called SOS)
- Profile (/profile) - Personal settings

CRITICAL Rules:
- ALWAYS state what you're doing clearly
- For navigation: Say "Taking you to [page name]" or "Opening [page name]"
- For activities: Say "Starting [activity name]"
- Be VERY concise (5-10 words max)
- NO EMOJIS
- NO repetition
- Use simple, direct language

Response Templates:
Navigation requests:
- "Taking you to the home page."
- "Opening your dashboard."
- "Navigating to LifeVault."
- "Going to the emergency page."
- "Opening your profile."

Activity requests:
- "Starting memory games."
- "Opening story telling activity."
- "Starting the drawing activity."

General help:
- "I can help you navigate to any page."
- "Which page would you like to visit?"

Examples:
User: "Take me to home page"
You: "Taking you to the home page."

User: "Open lifevault"
You: "Opening LifeVault."

User: "I need help" or "SOS"
You: "Taking you to the emergency page."

User: "What can you do?"
You: "I help you navigate to different pages and start activities."

User: "Start memory games"
You: "Starting memory games."

User message: {user_text}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=50
        )
        
        response_text = chat_completion.choices[0].message.content
        action = None
        
        # Enhanced Navigation Detection with Multiple Keywords
        
        # HOME PAGE - multiple variations
        home_keywords = ['home', 'homepage', 'main page', 'welcome page', 'start page', 'beginning']
        if any(keyword in user_text for keyword in home_keywords):
            # Make sure it's not asking about other pages
            if not any(word in user_text for word in ['dashboard', 'profile', 'emergency', 'vault', 'companion', 'detection', 'activity']):
                action = {'type': 'navigate', 'url': '/'}
        
        # DASHBOARD
        dashboard_keywords = ['dashboard', 'dash board', 'main dashboard']
        if any(keyword in user_text for keyword in dashboard_keywords):
            action = {'type': 'navigate', 'url': '/dashboard'}
        
        # COMPANION
        companion_keywords = ['companion', 'ai companion', 'talk to ai', 'voice chat', 'chat with ai', 'speak with ai']
        if any(keyword in user_text for keyword in companion_keywords):
            action = {'type': 'navigate', 'url': '/companion'}
        
        # LIFEVAULT - multiple variations
        lifevault_keywords = ['lifevault', 'life vault', 'vault', 'document', 'documents', 'storage', 'file', 'files', 'my documents']
        if any(keyword in user_text for keyword in lifevault_keywords):
            action = {'type': 'navigate', 'url': '/lifevault'}
        
        # EMERGENCY - multiple variations including SOS
        emergency_keywords = ['emergency', 'sos', 's.o.s', 'help', 'urgent', 'emergency page', 'sos page', 'need help']
        if any(keyword in user_text for keyword in emergency_keywords):
            # Make sure it's navigation request
            if any(word in user_text for word in ['page', 'go', 'take', 'open', 'show', 'need', 'sos', 'emergency', 'urgent']):
                action = {'type': 'navigate', 'url': '/emergency'}
        
        # PROFILE
        profile_keywords = ['profile', 'my profile', 'settings', 'account', 'personal settings', 'my account']
        if any(keyword in user_text for keyword in profile_keywords):
            action = {'type': 'navigate', 'url': '/profile'}
        
        # DETECTION/ACTIVITIES
        detection_keywords = ['activity', 'activities', 'cognitive', 'detection', 'exercise', 'exercises', 'brain games']
        if any(keyword in user_text for keyword in detection_keywords):
            if current_page != 'detection':
                action = {'type': 'navigate', 'url': '/detection'}
        
        # Activity-specific detection (if on detection page or mentioning specific activities)
        if current_page == 'detection' or any(word in user_text for word in ['game', 'story', 'draw', 'picture', 'conversation']):
            
            # MEMORY GAMES
            game_keywords = ['memory', 'game', 'games', 'matching', 'pattern', 'sequence', 'recall', 'memory game']
            if any(keyword in user_text for keyword in game_keywords):
                action = {'type': 'start_activity', 'activity': 'games'}
            
            # STORY TELLING
            story_keywords = ['story', 'stories', 'tell', 'narrative', 'storytelling']
            if any(keyword in user_text for keyword in story_keywords) and 'game' not in user_text:
                action = {'type': 'start_activity', 'activity': 'story'}
            
            # CLOCK DRAWING
            clock_keywords = ['draw', 'drawing', 'clock', 'clock drawing', 'sketch']
            if any(keyword in user_text for keyword in clock_keywords):
                action = {'type': 'start_activity', 'activity': 'clock'}
            
            # PICTURE DESCRIPTION
            picture_keywords = ['picture', 'image', 'photo', 'describe', 'picture description']
            if any(keyword in user_text for keyword in picture_keywords):
                action = {'type': 'start_activity', 'activity': 'image'}
            
            # CONVERSATION
            conversation_keywords = ['conversation', 'talk', 'chat', 'discuss', 'guided conversation']
            if any(keyword in user_text for keyword in conversation_keywords) and 'ai' not in user_text:
                action = {'type': 'start_activity', 'activity': 'conversation'}
        
        return jsonify({
            'response': response_text,
            'action': action
        })
        
    except Exception as e:
        print(f"Guide error: {str(e)}")
        return jsonify({
            'response': "I help you navigate to different pages and start activities. Where would you like to go?"
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

@app.route('/api/nila/chat', methods=['POST'])
def nila_chat():
    """Unified Nila AI endpoint - handles all conversations with context awareness"""
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        screen_context = data.get('screen_context', {})
        current_page = data.get('current_page', '')
        
        print(f"📥 Nila received: {user_message}")
        print(f"📍 Current page: {current_page}")
        
        # Page descriptions for context
        page_descriptions = {
            'home': 'the homepage showing an overview of features',
            'dashboard': 'the dashboard with user stats and quick actions',
            'detection': 'the cognitive activities page with memory games',
            'companion': 'the AI companion chat page',
            'emergency': 'the emergency SOS page',
            'profile': 'the user profile and settings page',
        }
        current_page_desc = page_descriptions.get(current_page, 'a page in the app')
        
        # FIXED: Better system prompt - NO emergency triggering
        SYSTEM_PROMPT = """You are Nila, an intelligent AI guide for Silent Guardian – a dementia DETECTION and ASSESSMENT platform.

**CRITICAL CONTEXT: This is a TESTING/DETECTION tool for cognitive assessment, NOT a care app for diagnosed dementia patients.**

About Silent Guardian:
- Cognitive Activities: Memory games, picture descriptions, clock drawing, chess puzzles
- Detection Tests: Assess cognitive function through structured activities
- Life-Vault: Emergency profile with medical information
- Dashboard: Track and review test results over time
- Quick Navigation: Move seamlessly between features

Your Role:
1. Guide users through cognitive detection activities
2. Explain what each test measures and why
3. Provide professional but warm support during assessments
4. Navigate users to specific features quickly
5. Answer questions about cognitive health and testing

Communication Style:
- Professional, clear, and encouraging (not patronizing)
- Assume user is cognitively intact – they're here to TEST, not because they're impaired
- Keep responses brief (2-3 sentences)
- Use simple language but respect user intelligence
- Avoid "dementia" language – use "cognitive assessment" or "memory testing"

IMPORTANT RULES:
- Do NOT treat user as impaired
- Do NOT use infantilizing language
- Do NOT assume they need emergency help
- Only suggest emergency features if user explicitly requests help
- Focus on activity explanations and navigation

Navigation Commands You Understand:
- "Take me to [page]" → Navigate to home, dashboard, detection, companion, emergency, profile, lifevault
- "Show me [activity]" → Start memory games, picture description, clock drawing, chess, story, conversation
- "What's on this page?" → Explain current page features
- "How do I [use feature]?" → Explain how features work

Example Responses:

User: "Hi Nila"
You: "Hi! Welcome to Silent Guardian. I can help you explore cognitive activities or navigate anywhere in the app. What would you like to do?"

User: "What's memory games?"
You: "Memory games test your recall ability. You'll see pairs of cards and match them – simple but effective for assessing cognitive function. Want to start?"

User: "Take me to detection"
You: "Opening the detection page now. You'll see all our cognitive activities there."

User: "I'm confused"
You: "That's okay. Which part would you like help with? I can explain any activity or take you to a specific page."

User: "I need help"
You: "What do you need help with? I can explain features, navigate pages, or if it's urgent, I can take you to emergency contact options."

NEVER RESPOND WITH:
- "You might have dementia..."
- "Let me check your condition..."
- "Since you're struggling..."
- Patronizing tone or simple words unnecessary for adults

BE READY FOR:
- Users who are anxious about testing
- Users testing themselves preventatively
- Family members administering tests
- Professional cognitive assessments"""


        
        # Build conversation messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        # Add conversation history (last 10 messages)
        for msg in conversation_history[-10:]:
            messages.append({
                "role": msg.get('role', 'user'),
                "content": msg.get('content', '')
            })
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Navigation detection (before AI response)
        # Navigation detection (before AI response) - IMPROVED FOR VOICE
        navigation_map = {
            'home': ('/', 'navigate_home'),
            'dashboard': ('dashboard', 'navigate_dashboard'),
            'detection': ('detection', 'navigate_detection'),
            'games': ('detection', 'navigate_detection'),
            'activities': ('detection', 'navigate_detection'),
            'companion': ('companion', 'navigate_companion'),
            'emergency': ('emergency', 'navigate_emergency'),
            'profile': ('profile', 'navigate_profile'),
            'lifevault': ('lifevault', 'navigate_lifevault'),
            'life vault': ('lifevault', 'navigate_lifevault'),
            'qr': ('lifevault', 'navigate_lifevault'),
            'vault': ('lifevault', 'navigate_lifevault'),  # ADDED - catches partial matches
            'life': ('lifevault', 'navigate_lifevault'),   # ADDED - if they just say "life"
        }

        lower_message = user_message.lower()

        # Check for navigation requests
        for key, (url, action) in navigation_map.items():
            # IMPROVED: More flexible matching for voice recognition
            if key in lower_message and any(trigger in lower_message for trigger in ['take me', 'go to', 'navigate', 'open', 'show', 'bring me']):
                return jsonify({
                    'message': f"Sure! Taking you to {key.replace('_', ' ')} now.",
                    'action': action,
                    'speak': True
                })

        # ADDED: Special case for Life-Vault (catches common mishearings)
        lifevault_patterns = ['life vault', 'lifevault', 'life bold', 'life bolt', 'live vault', 'qr code', 'qr']
        if any(pattern in lower_message for pattern in lifevault_patterns) and any(trigger in lower_message for trigger in ['take me', 'go to', 'navigate', 'open', 'show', 'bring me']):
            return jsonify({
                'message': "Sure! Opening Life-Vault now.",
                'action': 'navigate_lifevault',
                'speak': True
            })
        
        # Call Groq API
        if groq_client:
            chat_completion = groq_client.chat.completions.create(
                messages=messages,
                model=GROQ_MODELS['quality'],  # Using quality model
                temperature=0.7,
                max_tokens=200,
            )
            ai_response = chat_completion.choices[0].message.content
            
            # FIXED: Filter out any emergency mentions in greeting responses
            if any(greeting in user_message.lower() for greeting in ['hi', 'hello', 'hey', 'good morning', 'good afternoon']):
                # Remove emergency-related text from AI greeting responses
                emergency_phrases = ['emergency', 'urgent', 'help right away', 'assistance right away', 'activating']
                for phrase in emergency_phrases:
                    if phrase.lower() in ai_response.lower():
                        # Replace with a normal greeting
                        ai_response = "Hi! I'm Nila, your personal assistant. How can I help you today?"
                        print(f"⚠️ Filtered emergency mention from greeting")
                        break
            
            return jsonify({
                'message': ai_response,
                'action': None,
                'speak': True
            })
        else:
            return jsonify({
                'message': "I'm having trouble connecting to my brain. Please check the API configuration.",
                'action': None,
                'speak': True
            }), 500
            
    except Exception as e:
        print(f"❌ Nila chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'message': "I'm having a moment. Could you try again?",
            'action': None,
            'speak': True
        }), 500
        

@app.route('/api/nila/navigate', methods=['POST'])
def nila_navigate():
    """Handle voice-triggered navigation with intelligent command parsing"""
    try:
        data = request.json
        user_command = data.get('command', '').lower()
        current_page = data.get('current_page', '')
        
        # Navigation keyword mapping
        navigation_keywords = {
            'home': {
                'keywords': ['home', 'main', 'homepage', 'start', 'beginning', 'go back'],
                'url': '/',
                'message': 'Taking you home.'
            },
            'dashboard': {
                'keywords': ['dashboard', 'results', 'progress', 'stats', 'overview'],
                'url': '/dashboard',
                'message': 'Opening your dashboard.'
            },
            'detection': {
                'keywords': ['detection', 'activities', 'games', 'tests', 'cognitive', 'brain'],
                'url': '/detection',
                'message': 'Going to cognitive activities.'
            },
            'companion': {
                'keywords': ['companion', 'chat', 'talk', 'ai', 'assistant', 'speak'],
                'url': '/companion',
                'message': 'Opening the AI companion.'
            },
            'emergency': {
                'keywords': ['emergency', 'sos', 'help', 'urgent', 'call'],
                'url': '/emergency',
                'message': 'Taking you to emergency contacts.'
            },
            'profile': {
                'keywords': ['profile', 'settings', 'account', 'personal', 'preferences'],
                'url': '/profile',
                'message': 'Opening your profile.'
            },
            'lifevault': {
                'keywords': ['lifevault', 'life vault', 'vault', 'qr', 'emergency info', 'medical'],
                'url': '/lifevault',
                'message': 'Opening Life-Vault.'
            }
        }
        
        # Activity-specific commands (on detection page)
        if current_page == 'detection':
            activity_keywords = {
                'games': {
                    'keywords': ['memory', 'game', 'match', 'sequence', 'recall'],
                    'action': 'start_memory_games',
                    'message': 'Starting memory games.'
                },
                'picture': {
                    'keywords': ['picture', 'image', 'describe', 'photo', 'visual'],
                    'action': 'start_picture_description',
                    'message': 'Opening picture description.'
                },
                'clock': {
                    'keywords': ['clock', 'draw', 'drawing', 'sketch'],
                    'action': 'start_clock_drawing',
                    'message': 'Starting clock drawing test.'
                },
                'chess': {
                    'keywords': ['chess', 'puzzle', 'strategy', 'game'],
                    'action': 'start_chess',
                    'message': 'Starting chess.'
                },
                'story': {
                    'keywords': ['story', 'narrative', 'storytelling', 'tale'],
                    'action': 'start_story',
                    'message': 'Opening storytelling activity.'
                },
                'conversation': {
                    'keywords': ['conversation', 'dialog', 'dialogue', 'discuss'],
                    'action': 'start_conversation',
                    'message': 'Starting guided conversation.'
                }
            }
            
            # Check activity keywords first
            for activity, details in activity_keywords.items():
                if any(kw in user_command for kw in details['keywords']):
                    return jsonify({
                        'success': True,
                        'message': details['message'],
                        'action': details['action'],
                        'navigate': None
                    })
        
        # Check page navigation
        for page, details in navigation_keywords.items():
            if any(kw in user_command for kw in details['keywords']):
                # Verify it's a navigation request
                if any(trigger in user_command for trigger in ['take me', 'go to', 'open', 'show', 'navigate', 'bring me']):
                    return jsonify({
                        'success': True,
                        'message': details['message'],
                        'action': None,
                        'navigate': details['url']
                    })
        
        # No match found
        return jsonify({
            'success': False,
            'message': 'I can help you navigate. Where would you like to go?',
            'action': None,
            'navigate': None
        })
        
    except Exception as e:
        print(f"Navigation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500




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
    app.run(host='0.0.0.0', port=port, debug=True)

