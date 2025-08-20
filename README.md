# MailSentinel - AI-Powered Phishing Detection

![MailSentinel](https://img.shields.io/badge/MailSentinel-Phishing%20Detection-brightgreen) 
![Version](https://img.shields.io/badge/version-1.0-blue) 
![License](https://img.shields.io/badge/license-MIT-green)

MailSentinel is a Chrome extension that leverages Google's Gemini AI to detect phishing attempts in your emails. It analyzes email content in real-time and alerts you if it detects suspicious characteristics.

## Features

- 🔍 **AI-Powered Analysis**: Uses Google's Gemini 1.5 Flash model to analyze email content
- ⚡ **Real-time Detection**: Scans emails directly in your browser
- 🛡️ **Privacy-Focused**: Processes data locally when possible
- 📧 **Multi-Platform Support**: Works with Gmail, Outlook, Yahoo Mail, and more
- 📊 **Clear Results**: Simple visual indicators for safe and phishing emails

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

```bash
git clone https://github.com/ayushsgit/MailSentinel-Chrome-Extension.git
cd MailSentinel-Chrome-Extension
```

## Configuration

Before using the extension, you need to set up your Gemini API key:

1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Replace the placeholder in `background.js`:

```javascript
const GEMINI_API_KEY = "your_actual_api_key_here";
```

## Usage

1. Navigate to your email client (Gmail, Outlook, etc.)
2. Click on an email you want to analyze
3. Click the MailSentinel extension icon in Chrome
4. Click "Analyze Email" to scan the content
5. View the results (Safe, Phishing, or Error)

## File Structure

```
MailSentinel-Chrome-Extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## How It Works

MailSentinel uses a combination of content extraction and AI analysis:

1. **Content Extraction**: The extension extracts text content from email elements
2. **API Integration**: Sends content to Gemini AI for analysis
3. **Result Processing**: Interprets the AI response to determine phishing likelihood
4. **Visual Feedback**: Displays clear results in the popup interface

## API Response Format

The extension expects a specific response format from the Gemini API:

```javascript
// Example API response
{
  "candidates": [
    {
      "content": {
        "parts": [
          {"text": "Safe"}
        ]
      }
    }
  ]
}
```

## Privacy & Security

- Email content is only sent to Google's API for analysis
- No data is stored or logged by the extension
- All API communications use HTTPS encryption
- You maintain control over your API usage and quotas

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Contact us at support@example.com

## Troubleshooting

Common issues and solutions:

**Extension won't load:**
- Make sure you've enabled Developer mode in Chrome extensions
- Check for any errors in the extension console

**API errors:**
- Verify your API key is correct and has sufficient quota
- Check that the Gemini API is enabled in your Google Cloud Console

**No email detected:**
- Ensure you're on a supported email client
- Refresh the page and try again

---

**Disclaimer**: This tool provides AI-based suggestions but should not be your only method of detecting phishing attempts. Always exercise caution with suspicious emails.
