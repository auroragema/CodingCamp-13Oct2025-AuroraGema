"""
Flask To-Do List Application
Modern web app with Flask backend
"""

from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, 
            template_folder='.',
            static_folder='.')

# Configure Flask
app.config['SECRET_KEY'] = 'your-secret-key-here'

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory('js', filename)

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs('css', exist_ok=True)
    os.makedirs('js', exist_ok=True)
    
    print("=" * 60)
    print("🚀 Flask To-Do List Application")
    print("=" * 60)
    print("\n📋 Starting server...")
    print("🌐 Open your browser and go to: http://localhost:5000")
    print("⚡ Press CTRL+C to stop the server\n")
    print("=" * 60)
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)