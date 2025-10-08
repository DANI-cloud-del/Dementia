from flask import Flask, render_template, request, session, jsonify, url_for
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this!

@app.route('/')
def home():
    """Homepage"""
    # Set a default user name if not in session
    if 'user_name' not in session:
        session['user_name'] = 'Friend'
    
    # Get time-based greeting
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

# API Endpoints
@app.route('/api/chat', methods=['POST'])
def chat_api():
    """Handle chat messages"""
    data = request.json
    user_message = data.get('message', '')
    language = data.get('language', 'en')
    
    # TODO: Integrate with your AI/LLM here
    # For now, return a simple response
    ai_response = {
        'message': f"I heard you say: {user_message}. How can I help you with that?",
        'timestamp': datetime.now().isoformat(),
        'sentiment': 'positive'
    }
    
    return jsonify(ai_response)

@app.route('/api/voice-to-text', methods=['POST'])
def voice_to_text():
    """Convert voice audio to text"""
    # TODO: Implement voice recognition
    # This would process audio files and return text
    audio_file = request.files.get('audio')
    
    return jsonify({
        'text': 'This is a placeholder transcription',
        'confidence': 0.95
    })

@app.route('/logout')
def logout():
    """Logout user"""
    return render_template('logout.html')

if __name__ == '__main__':
    app.run(debug=True)
