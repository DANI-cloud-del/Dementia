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

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')

if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY not found in .env file!")
if not HUGGINGFACE_API_KEY:
    print("⚠️  WARNING: HUGGINGFACE_API_KEY not found in .env file!")

try:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print("✅ Groq client initialized")
except Exception as e:
    print(f"❌ Groq initialization failed: {e}")
    groq_client = None

# ============================================
# AI MODELS CONFIGURATION
# ============================================

GROQ_MODELS = {
    "quality": "llama-3.3-70b-versatile",
    "speed": "llama-3.1-8b-instant",
    "intelligent": "llama3-groq-70b-8192-tool-use-preview",
}

CURRENT_MODEL = GROQ_MODELS["quality"]

# ============================================
# GLOBAL SYSTEM PROMPT (used by /api/chat)
# ============================================

SYSTEM_PROMPT = """You are a warm, caring AI companion named Nila for the Silent Guardian app — a cognitive health platform designed to support elderly individuals and their caregivers.

**About Silent Guardian:**
- **AI Companion (You)**: A friendly chat interface for emotional support, daily conversation, and gentle memory activities
- **Cognitive Activities**: Fun, low-pressure games (memory matching, picture descriptions, clock drawing, storytelling) that help monitor brain health
- **Life-Vault**: A QR code emergency profile containing the user's medical info, contacts, and location — scannable by anyone in an emergency
- **Dashboard**: A caregiver view with activity summaries, alerts, and wellness tracking
- **Emergency**: A one-tap SOS button that instantly notifies family members

**Your Personality:**
- Warm, patient, and genuinely caring — like a trusted friend
- Use simple, clear language but never talk down to the user
- Be encouraging, never alarming
- Occasionally use gentle emojis to feel friendly 😊
- Keep responses short (2–4 sentences) unless the user asks for more detail

**Your Abilities:**
1. Have natural, supportive conversations
2. Explain any part of the app in plain terms
3. Guide users to the correct section when they ask
4. Help with light memory recall activities (e.g., "What's today's date?", "Tell me a happy memory")
5. Answer general questions about cognitive health kindly

**Navigation — when a user wants to go somewhere, confirm and guide them:**
- "Take me to games / detection / activities" → Cognitive Activities page
- "Open Life-Vault / QR / emergency profile" → Life-Vault page
- "Show dashboard / caregiver view" → Dashboard
- "Emergency / SOS / I need help urgently" → Emergency page
- "Go to profile / settings" → Profile page
- "Talk to AI / open companion" → AI Companion page

**Important Rules:**
- Never mention a diagnosis or imply the user is impaired
- Never trigger emergency features unless the user clearly asks
- If unsure what the user needs, ask one simple clarifying question
- Always respond — never leave the user without a reply

**Example Responses:**
User: "Take me to the detection page"
You: "Sure! Taking you to the Cognitive Activities page now. 🎮"

User: "I feel lonely today"
You: "I'm really glad you're here. You're never alone when I'm around. Would you like to chat, or maybe play a gentle memory game together?"

User: "What is the Life-Vault?"
You: "Life-Vault is like a digital safety card 🆔. It stores your name, medical info, and emergency contacts in a QR code — so if you ever need help, anyone can scan it and know exactly how to assist you."
"""


# ============================================
# NILA SYSTEM PROMPT (used by /api/nila/chat)
# ============================================

NILA_SYSTEM_PROMPT = """You are Nila, a friendly and intelligent AI guide for Silent Guardian — a cognitive health and dementia detection platform.

**Who Uses This App:**
- People proactively monitoring their own cognitive health
- Family members running assessments for elderly relatives
- Healthcare professionals administering structured cognitive tests
- Caregivers who want to track a loved one's progress over time

**App Pages & What They Do:**
- **Home** (/): Welcome screen, quick overview of the app
- **Cognitive Activities** (/detection): Memory games, picture descriptions, clock drawing, chess puzzles, storytelling — these are the core assessment tools
- **AI Companion** (/companion): Supportive chat, emotional conversation, daily check-ins
- **Life-Vault** (/lifevault): QR code emergency profile with medical data and contacts
- **Dashboard** (/dashboard): Results history, activity trends, caregiver alerts
- **Emergency** (/emergency): SOS button and quick-dial emergency contacts
- **Profile** (/profile): Personal settings, preferences, user info

**Your Role:**
1. Help users navigate quickly to any page or activity
2. Explain what each cognitive test measures and why it matters
3. Answer questions about brain health and the assessment process
4. Provide warm encouragement without being patronizing
5. Keep conversations efficient and action-oriented

**Communication Style:**
- Confident, warm, and clear — not clinical or robotic
- Treat every user as a capable adult
- Keep responses to 2–3 sentences unless more detail is needed
- Never assume the user has memory problems — they may be a caregiver or proactive tester
- Use natural language, occasional light emojis are fine 😊

**Navigation — When user wants to go somewhere, navigate them immediately:**
- "Take me to / go to / open / show / navigate to [page]" → Navigate right away
- Common aliases: "games/activities/detection/brain games" → /detection
- "vault/life vault/QR/medical info" → /lifevault
- "SOS/help urgently/emergency" → /emergency
- "results/progress/stats" → /dashboard
- "companion/chat/talk to AI" → /companion
- "home/start/beginning" → /

**Activity Shortcuts (when on or near detection page):**
- "memory game / matching / cards" → start memory games
- "picture / describe image / photo" → start picture description
- "clock / draw a clock / clock test" → start clock drawing
- "chess / puzzle" → start chess
- "story / storytelling / tell a story" → start storytelling
- "conversation / guided talk / discuss" → start guided conversation

**Example Interactions:**

User: "Hi Nila"
Nila: "Hi there! 👋 I'm Nila, your guide for Silent Guardian. I can take you to any activity or page — what would you like to do?"

User: "Take me to the detection page"
Nila: "Sure! Opening the Cognitive Activities page now. 🎮"

User: "What does the clock drawing test check?"
Nila: "The clock drawing test is a classic cognitive assessment — it checks spatial reasoning, memory, and planning by asking you to draw a clock showing a specific time. It's quick and surprisingly revealing."

User: "I'm not sure what to do"
Nila: "No problem! You can start a cognitive activity, check your results on the dashboard, or just explore the app. What sounds most interesting?"

User: "I need help"
Nila: "Of course! Do you need help navigating the app, understanding an activity, or is this an urgent emergency? I want to make sure I help you with the right thing."

**NEVER Say:**
- Anything implying the user has dementia or cognitive decline
- Overly simple, infantilizing phrases
- Unsolicited emergency alerts or warnings
- Long paragraphs when a short sentence will do
"""


# ============================================
# INTENT DETECTION HELPER
# ============================================

def is_navigation_intent(text):
    """
    Returns True if the user's message expresses intent to navigate somewhere.
    This must be checked BEFORE feature explanation to avoid intercepting nav requests.
    """
    nav_triggers = [
        'take me', 'go to', 'navigate', 'open', 'show me', 'bring me',
        'i want to go', 'can you take', 'let me go', 'redirect', 'switch to',
        'move to', 'head to', 'get to', 'jump to', 'load', 'launch'
    ]
    return any(trigger in text.lower() for trigger in nav_triggers)


# ============================================
# AI PROVIDERS - FALLBACK CHAIN
# ============================================

def get_groq_response(user_message, conversation_history=[]):
    """Primary AI provider - Groq"""
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in conversation_history[-10:]:
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                messages.append({"role": msg['role'], "content": msg['content']})

        messages.append({"role": "user", "content": user_message})

        print(f"📤 Sending to Groq ({CURRENT_MODEL})")

        chat_completion = groq_client.chat.completions.create(
            messages=messages,
            model=CURRENT_MODEL,
            temperature=0.7,
            max_tokens=150,
            top_p=0.9,
        )

        response = chat_completion.choices[0].message.content
        print(f"✅ Groq response received ({CURRENT_MODEL})")
        return {"success": True, "response": response, "provider": "groq"}

    except Exception as e:
        print(f"❌ Groq API error: {str(e)}")
        return {"success": False, "error": str(e)}


def get_huggingface_response(user_message, conversation_history=[]):
    """Fallback 1 - Hugging Face Inference API"""
    try:
        API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

        context_messages = []
        for msg in conversation_history[-5:]:
            if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                context_messages.append(msg['content'])

        context = "\n".join(context_messages)
        full_prompt = f"{context}\nUser: {user_message}\nAssistant:"

        payload = {
            "inputs": full_prompt,
            "parameters": {"max_length": 100, "temperature": 0.7, "return_full_text": False}
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
    """Fallback 2 - Local rule-based responses (Never fails)"""
    m = user_message.lower()

    if any(w in m for w in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
        return {"success": True, "response": "Hello! It's lovely to see you. How are you feeling today? 😊", "provider": "local"}

    if any(w in m for w in ['how are you', 'how do you do', 'how r u']):
        return {"success": True, "response": "I'm doing wonderfully, thank you for asking! I'm here whenever you need me. How about you?", "provider": "local"}

    if any(w in m for w in ['what time', 'what day', 'what date', "today's date", "what's today"]):
        now = datetime.now()
        return {"success": True, "response": f"Today is {now.strftime('%A, %B %d, %Y')} and the time is {now.strftime('%I:%M %p')}.", "provider": "local"}

    if 'weather' in m:
        return {"success": True, "response": "I can't check live weather, but you could peek outside or ask a family member. Is there something else I can help with?", "provider": "local"}

    if any(w in m for w in ['remember', 'memory', 'forget', 'forgot']):
        return {"success": True, "response": "It's perfectly okay. I'm here to help you with whatever you need. Would you like to try a gentle memory activity together?", "provider": "local"}

    if any(w in m for w in ['family', 'children', 'son', 'daughter', 'spouse', 'wife', 'husband']):
        return {"success": True, "response": "Your family cares about you very much. Would you like help reaching out to them through the emergency contacts or Life-Vault?", "provider": "local"}

    if any(w in m for w in ['sad', 'lonely', 'worried', 'scared', 'anxious', 'confused', 'lost', 'upset']):
        return {"success": True, "response": "I hear you, and I'm glad you said something. You're not alone — I'm right here. Would you like to talk, or would a calming activity help?", "provider": "local"}

    if any(w in m for w in ['game', 'activity', 'play', 'something to do', 'bored']):
        return {"success": True, "response": "Great idea! We have memory card games, picture descriptions, storytelling, and more. Which sounds fun to you?", "provider": "local"}

    if any(w in m for w in ['help', 'assist', 'what can you do', 'support']):
        return {"success": True, "response": "I'm here to help! I can chat with you, guide you to any part of the app, or start a cognitive activity. What would you like?", "provider": "local"}

    if any(w in m for w in ['thank', 'thanks', 'thank you']):
        return {"success": True, "response": "You're so welcome! I'm always happy to help. 😊", "provider": "local"}

    if any(w in m for w in ['bye', 'goodbye', 'see you', 'take care']):
        return {"success": True, "response": "Take care! I'll be here whenever you need me. Have a wonderful day! 🌟", "provider": "local"}

    return {"success": True, "response": "That's interesting — tell me more. I'm here and I'm listening.", "provider": "local"}


def get_feature_explanation(query):
    """
    Provide detailed explanations about app features.
    IMPORTANT: Only called when there is NO navigation intent in the query.
    """
    q = query.lower()

    if any(w in q for w in ['what is this app', 'explain app', 'what does this app do', 'app features', 'what is silent guardian', 'about this app']):
        return {
            "success": True,
            "response": """Silent Guardian is your cognitive health companion! 🌟

Here's what I can do for you:
• **Cognitive Activities** — Memory games, picture tests, and more to keep your mind active
• **AI Companion** — That's me! Always here to chat and support you
• **Life-Vault** — Your medical info and emergency contacts in a handy QR code
• **Dashboard** — Track your activity and progress over time
• **Emergency** — One-tap SOS to alert your family instantly

What would you like to explore first?""",
            "provider": "feature_guide",
            "suggested_actions": ["Start an activity", "View my profile", "Chat with Nila"]
        }

    if 'what is the companion' in q or 'what is ai companion' in q or ('what is' in q and 'companion' in q):
        return {
            "success": True,
            "response": """The AI Companion is me, Nila! 😊

I'm here to:
• Have friendly, supportive conversations
• Help you remember things or just chat
• Guide you to any part of the app
• Be a calm presence whenever you need one

You can talk to me about anything — big or small. I'm always listening.""",
            "provider": "feature_guide"
        }

    if any(w in q for w in ['what are cognitive activities', 'what is detection', 'explain detection', 'what are the activities', 'what games', 'what tests']):
        return {
            "success": True,
            "response": """The Cognitive Activities page has several fun exercises 🎮:

• **Memory Games** — Match pairs of cards to test recall
• **Picture Descriptions** — Describe what you see in an image
• **Clock Drawing** — A classic test of spatial and planning ability
• **Storytelling** — Listen and recall parts of a short story
• **Guided Conversation** — A structured chat that gently assesses language and memory

Each activity is designed to be enjoyable while providing useful insight. Want to try one?""",
            "provider": "feature_guide",
            "suggested_actions": ["Start memory game", "Try clock drawing", "Picture description"]
        }

    if any(w in q for w in ['what is life vault', 'what is lifevault', 'what is the qr', 'explain life vault', 'what is the vault']):
        return {
            "success": True,
            "response": """Life-Vault is your digital safety profile 🆔

It creates a QR code that contains:
• Your full name and photo
• Emergency contacts (family, doctor)
• Medical conditions and allergies
• Current medications
• Home address

If you're ever in an emergency, anyone can scan this code and instantly know how to help you get home safely.""",
            "provider": "feature_guide"
        }

    if 'what is the dashboard' in q or ('explain' in q and 'dashboard' in q) or ('what does' in q and 'dashboard' in q):
        return {
            "success": True,
            "response": """The Dashboard is your caregiver's overview 👨‍👩‍👧

Family members or caregivers can:
• See a summary of completed activities
• Track progress and trends over time
• Receive alerts if something unusual is detected
• Monitor overall wellbeing at a glance

It helps everyone stay informed and connected.""",
            "provider": "feature_guide"
        }

    if any(w in q for w in ['what is emergency', 'explain emergency', 'what is sos', 'how does sos work']):
        return {
            "success": True,
            "response": """The Emergency page gives you instant help 🚨

• **SOS Button** — One tap sends an alert with your location to all family contacts
• **Quick Dial** — Direct call buttons for family and emergency services
• **Location Sharing** — Automatically shares your GPS coordinates

If you ever feel unsafe or lost, just press the red SOS button.""",
            "provider": "feature_guide"
        }

    return None  # No feature match — let Groq AI handle it


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint with automatic fallback chain:
    Navigation Check → Feature Explanation → Groq → Hugging Face → Local Rule-Based
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        print(f"💬 User message: {user_message}")

        # Only check feature explanations if this is NOT a navigation request
        if not is_navigation_intent(user_message):
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

        print("🔄 Trying Groq API...")
        result = get_groq_response(user_message, conversation_history)

        if not result.get('success'):
            print("🔄 Groq failed, trying Hugging Face...")
            result = get_huggingface_response(user_message, conversation_history)

        if not result.get('success'):
            print("🔄 APIs failed, using local rule-based AI...")
            result = get_rule_based_response(user_message)

        return jsonify({
            "success": True,
            "response": result['response'],
            "provider": result['provider'],
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        return jsonify({
            "success": True,
            "response": "I'm here with you. Let's take things one step at a time. 💙",
            "provider": "emergency",
            "timestamp": datetime.now().isoformat()
        })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Check which AI providers are working"""
    status = {"groq": "checking", "huggingface": "checking", "local": "available"}

    try:
        groq_client.chat.completions.create(
            messages=[{"role": "user", "content": "test"}],
            model=CURRENT_MODEL,
            max_tokens=5
        )
        status["groq"] = "available"
    except:
        status["groq"] = "unavailable"

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
    return jsonify({'text': 'This is a placeholder transcription', 'confidence': 0.95})


@app.route('/api/smart-guide', methods=['POST'])
def smart_guide():
    """Intelligent navigation guide with flexible keyword matching"""
    try:
        data = request.json
        user_text = data.get('text', '').lower()
        current_page = data.get('currentPage', 'home')
        current_activity = data.get('currentActivity')

        context = f"""You are a helpful navigation guide for Silent Guardian app.

Current location: {current_page}
Current activity: {current_activity or 'None'}

Pages you can navigate to:
- Home (/) - Welcome/main page
- Dashboard (/dashboard) - Results and progress
- Cognitive Activities (/detection) - Games and exercises
- AI Companion (/companion) - Voice chat
- LifeVault (/lifevault) - Emergency QR profile
- Emergency (/emergency) - SOS and emergency contacts
- Profile (/profile) - Personal settings

Rules:
- For navigation: Say "Taking you to [page name]." (concise, 5-10 words max)
- For activities: Say "Starting [activity name]."
- For general help: "I can take you to any page or start an activity. Where to?"
- NO emojis, NO long explanations, NO repetition

User message: {user_text}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": context},
                {"role": "user", "content": user_text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=50
        )

        response_text = chat_completion.choices[0].message.content
        action = None

        # HOME
        if any(kw in user_text for kw in ['home', 'homepage', 'main page', 'welcome', 'start page', 'beginning']):
            if not any(w in user_text for w in ['dashboard', 'profile', 'emergency', 'vault', 'companion', 'detection']):
                action = {'type': 'navigate', 'url': '/'}

        # DASHBOARD
        if any(kw in user_text for kw in ['dashboard', 'results', 'progress', 'stats', 'overview']):
            action = {'type': 'navigate', 'url': '/dashboard'}

        # COMPANION
        if any(kw in user_text for kw in ['companion', 'ai companion', 'voice chat', 'chat with ai', 'talk to ai']):
            action = {'type': 'navigate', 'url': '/companion'}

        # LIFEVAULT
        if any(kw in user_text for kw in ['lifevault', 'life vault', 'vault', 'qr code', 'qr', 'medical info', 'emergency profile']):
            action = {'type': 'navigate', 'url': '/lifevault'}

        # EMERGENCY
        if any(kw in user_text for kw in ['emergency', 'sos', 's.o.s', 'urgent', 'emergency page', 'help urgently']):
            action = {'type': 'navigate', 'url': '/emergency'}

        # PROFILE
        if any(kw in user_text for kw in ['profile', 'settings', 'account', 'my profile', 'personal settings']):
            action = {'type': 'navigate', 'url': '/profile'}

        # DETECTION/ACTIVITIES
        if any(kw in user_text for kw in ['detection', 'activity', 'activities', 'cognitive', 'brain games', 'exercises', 'tests']):
            action = {'type': 'navigate', 'url': '/detection'}

        # Activity-specific (on detection page or mentioning specific activities)
        if current_page == 'detection' or any(w in user_text for w in ['memory game', 'story', 'clock', 'picture', 'chess', 'conversation']):
            if any(kw in user_text for kw in ['memory', 'game', 'games', 'matching', 'cards', 'pattern', 'recall']):
                action = {'type': 'start_activity', 'activity': 'games'}
            if any(kw in user_text for kw in ['story', 'stories', 'storytelling', 'narrative']) and 'game' not in user_text:
                action = {'type': 'start_activity', 'activity': 'story'}
            if any(kw in user_text for kw in ['clock', 'draw', 'drawing', 'sketch']):
                action = {'type': 'start_activity', 'activity': 'clock'}
            if any(kw in user_text for kw in ['picture', 'image', 'photo', 'describe']):
                action = {'type': 'start_activity', 'activity': 'image'}
            if any(kw in user_text for kw in ['conversation', 'discuss', 'guided conversation']) and 'ai' not in user_text:
                action = {'type': 'start_activity', 'activity': 'conversation'}
            if any(kw in user_text for kw in ['chess', 'puzzle', 'strategy']):
                action = {'type': 'start_activity', 'activity': 'chess'}

        return jsonify({'response': response_text, 'action': action})

    except Exception as e:
        print(f"Guide error: {str(e)}")
        return jsonify({'response': "I can take you to any page or start an activity. Where would you like to go?"})


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
# NILA AI ENDPOINTS
# ============================================

@app.route('/api/nila/chat', methods=['POST'])
def nila_chat():
    """Unified Nila AI endpoint - handles all conversations with context awareness"""
    try:
        data = request.json
        user_message = data.get('message', '')
        conversation_history = data.get('history', [])
        current_page = data.get('current_page', '')

        print(f"📥 Nila received: {user_message}")

        lower_message = user_message.lower()

        # ============================================================
        # STEP 1: Navigation intent check — MUST run before everything else
        # This prevents feature explanations from intercepting nav requests
        # ============================================================
        navigation_map = {
            # Page name aliases → (url_path, action_key)
            'home':        ('/',           'navigate_home'),
            'dashboard':   ('/dashboard',  'navigate_dashboard'),
            'detection':   ('/detection',  'navigate_detection'),
            'games':       ('/detection',  'navigate_detection'),
            'activities':  ('/detection',  'navigate_detection'),
            'cognitive':   ('/detection',  'navigate_detection'),
            'brain games': ('/detection',  'navigate_detection'),
            'tests':       ('/detection',  'navigate_detection'),
            'companion':   ('/companion',  'navigate_companion'),
            'emergency':   ('/emergency',  'navigate_emergency'),
            'sos':         ('/emergency',  'navigate_emergency'),
            'profile':     ('/profile',    'navigate_profile'),
            'settings':    ('/profile',    'navigate_profile'),
            'lifevault':   ('/lifevault',  'navigate_lifevault'),
            'life vault':  ('/lifevault',  'navigate_lifevault'),
            'vault':       ('/lifevault',  'navigate_lifevault'),
            'qr':          ('/lifevault',  'navigate_lifevault'),
            'life':        ('/lifevault',  'navigate_lifevault'),
        }

        nav_triggers = [
            'take me', 'go to', 'navigate', 'open', 'show me', 'bring me',
            'i want to go', "let's go", 'head to', 'switch to', 'move to',
            'launch', 'load', 'get to', 'jump to', 'redirect'
        ]

        has_nav_intent = any(trigger in lower_message for trigger in nav_triggers)

        # Also treat bare page name commands as navigation (e.g. "detection", "dashboard")
        # when message is short and matches a page directly
        is_bare_nav = False
        matched_nav_key = None
        for key in navigation_map:
            if lower_message.strip() == key or lower_message.strip() == f"go {key}":
                is_bare_nav = True
                matched_nav_key = key
                break

        if has_nav_intent or is_bare_nav:
            # Find which page they want
            for key, (url, action) in navigation_map.items():
                if key in lower_message:
                    page_display = key.replace('_', ' ').title()
                    print(f"🗺️ Navigation detected → {url}")
                    return jsonify({
                        'message': f"Sure! Taking you to {page_display} now. 🎮" if url == '/detection'
                                   else f"Sure! Opening {page_display} now.",
                        'action': action,
                        'speak': True
                    })

        # ============================================================
        # STEP 2: Feature explanation — only if NOT a navigation request
        # ============================================================
        if not has_nav_intent:
            print("🔍 Checking for feature explanations...")
            feature_result = get_feature_explanation(user_message)
            if feature_result:
                print("✅ Feature explanation matched")
                return jsonify({
                    'message': feature_result['response'],
                    'action': None,
                    'speak': True
                })

        # ============================================================
        # STEP 3: Groq AI response with Nila system prompt
        # ============================================================
        page_descriptions = {
            'home': 'the homepage showing an overview of features',
            'dashboard': 'the dashboard with results and activity tracking',
            'detection': 'the cognitive activities page with games and tests',
            'companion': 'the AI companion chat page',
            'emergency': 'the emergency SOS page',
            'profile': 'the user profile and settings page',
            'lifevault': 'the Life-Vault emergency QR profile page',
        }
        current_page_desc = page_descriptions.get(current_page, 'a page in the app')

        # Inject current page context into Nila's system prompt
        contextual_prompt = NILA_SYSTEM_PROMPT + f"\n\n**Current Page:** The user is currently on {current_page_desc}."

        messages = [{"role": "system", "content": contextual_prompt}]

        for msg in conversation_history[-10:]:
            messages.append({
                "role": msg.get('role', 'user'),
                "content": msg.get('content', '')
            })

        messages.append({"role": "user", "content": user_message})

        if groq_client:
            chat_completion = groq_client.chat.completions.create(
                messages=messages,
                model=GROQ_MODELS['quality'],
                temperature=0.65,
                max_tokens=200,
            )
            ai_response = chat_completion.choices[0].message.content

            # Safety filter: prevent unsolicited emergency mentions in greetings
            if any(g in lower_message for g in ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']):
                for phrase in ['emergency', 'urgent', 'activating', 'help right away']:
                    if phrase in ai_response.lower():
                        ai_response = "Hi! I'm Nila, your Silent Guardian guide. 👋 What would you like to do today?"
                        print("⚠️ Filtered unexpected emergency mention from greeting")
                        break

            return jsonify({'message': ai_response, 'action': None, 'speak': True})
        else:
            return jsonify({
                'message': "I'm having trouble connecting. Please check the API configuration.",
                'action': None,
                'speak': True
            }), 500

    except Exception as e:
        print(f"❌ Nila chat error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': "I'm having a moment. Could you try again?", 'action': None, 'speak': True}), 500


@app.route('/api/nila/navigate', methods=['POST'])
def nila_navigate():
    """Handle voice-triggered navigation with intelligent command parsing"""
    try:
        data = request.json
        user_command = data.get('command', '').lower()
        current_page = data.get('current_page', '')

        navigation_keywords = {
            'home':      {'keywords': ['home', 'main', 'homepage', 'start', 'beginning', 'go back'], 'url': '/',           'message': 'Taking you home.'},
            'dashboard': {'keywords': ['dashboard', 'results', 'progress', 'stats', 'overview'],     'url': '/dashboard',  'message': 'Opening your dashboard.'},
            'detection': {'keywords': ['detection', 'activities', 'games', 'tests', 'cognitive', 'brain', 'exercises'], 'url': '/detection', 'message': 'Going to cognitive activities.'},
            'companion': {'keywords': ['companion', 'chat', 'talk', 'ai', 'assistant', 'speak'],     'url': '/companion',  'message': 'Opening the AI companion.'},
            'emergency': {'keywords': ['emergency', 'sos', 'help', 'urgent', 'call'],                'url': '/emergency',  'message': 'Taking you to emergency contacts.'},
            'profile':   {'keywords': ['profile', 'settings', 'account', 'personal', 'preferences'],'url': '/profile',    'message': 'Opening your profile.'},
            'lifevault': {'keywords': ['lifevault', 'life vault', 'vault', 'qr', 'emergency info', 'medical'], 'url': '/lifevault', 'message': 'Opening Life-Vault.'},
        }

        if current_page == 'detection':
            activity_keywords = {
                'games':        {'keywords': ['memory', 'game', 'match', 'sequence', 'recall', 'cards'],     'action': 'start_memory_games',       'message': 'Starting memory games.'},
                'picture':      {'keywords': ['picture', 'image', 'describe', 'photo', 'visual'],            'action': 'start_picture_description', 'message': 'Opening picture description.'},
                'clock':        {'keywords': ['clock', 'draw', 'drawing', 'sketch'],                        'action': 'start_clock_drawing',       'message': 'Starting clock drawing test.'},
                'chess':        {'keywords': ['chess', 'puzzle', 'strategy'],                               'action': 'start_chess',               'message': 'Starting chess.'},
                'story':        {'keywords': ['story', 'narrative', 'storytelling', 'tale'],                'action': 'start_story',               'message': 'Opening storytelling activity.'},
                'conversation': {'keywords': ['conversation', 'dialog', 'dialogue', 'discuss', 'guided'],   'action': 'start_conversation',        'message': 'Starting guided conversation.'},
            }

            for activity, details in activity_keywords.items():
                if any(kw in user_command for kw in details['keywords']):
                    return jsonify({'success': True, 'message': details['message'], 'action': details['action'], 'navigate': None})

        nav_triggers = ['take me', 'go to', 'open', 'show', 'navigate', 'bring me', 'head to', 'switch to']

        for page, details in navigation_keywords.items():
            if any(kw in user_command for kw in details['keywords']):
                if any(trigger in user_command for trigger in nav_triggers) or user_command.strip() in details['keywords']:
                    return jsonify({'success': True, 'message': details['message'], 'action': None, 'navigate': details['url']})

        return jsonify({'success': False, 'message': 'I can help you navigate. Where would you like to go?', 'action': None, 'navigate': None})

    except Exception as e:
        print(f"Navigation error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================
# REMINDERS ROUTE
# ============================================

@app.route('/reminders')
def reminders():
    """Display all reminders for the user"""
    reminders_data = [
        {
            'id': 1,
            'title': 'Take Medication',
            'type': 'medication',
            'time': '10:30 AM',
            'medicine': 'Aspirin',
            'dosage': '500mg',
            'note': 'Take with water after breakfast',
            'completed': False
        },
        {
            'id': 2,
            'title': 'Doctor Appointment',
            'type': 'appointment',
            'time': '2:00 PM',
            'doctor': 'Dr. Sharma',
            'specialty': 'Neurologist',
            'location': 'City Medical Center, Room 304',
            'completed': False
        }
    ]
    return render_template('reminders.html', reminders=reminders_data)


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
    print(f"✅ Nila system prompt loaded")
    print(f"✅ AI providers ready")
    print(f"🌐 Access at: http://127.0.0.1:5000")
    print("="*50 + "\n")

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
