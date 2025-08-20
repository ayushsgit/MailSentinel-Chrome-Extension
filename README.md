# MailSentinel Chrome Extension

MailSentinel is a modern, minimalist Chrome extension designed to detect phishing attempts in your emails. With a clean, professional interface and powerful detection capabilities, it helps keep your inbox secure.

![MailSentinel](https://img.shields.io/badge/Version-1.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Extension-Chrome-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- **Phishing Detection**: Advanced algorithms to detect potential phishing attempts in emails
- **Modern UI**: Clean, professional design with smooth animations and transitions
- **Dark Mode**: Beautiful dark theme with toggle functionality for comfortable viewing
- **Multiple States**: Comprehensive status indicators (loading, safe, phishing, error)
- **Email Client Detection**: Automatically detects when you're using supported email services
- **Real-time Analysis**: Quick analysis with visual feedback
- **Cross-Platform Support**: Works with Gmail, Outlook, and Office 365

## Supported Email Services

- Gmail (mail.google.com)
- Outlook (outlook.live.com)
- Office 365 (outlook.office.com)

## Installation

1. **Download the extension files** and create a new folder for them
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** by toggling the switch in the top right corner
4. **Click "Load unpacked"** and select the folder containing the extension files
5. **The extension will now appear** in your Chrome toolbar

## How to Use

1. **Navigate to your email** service (Gmail, Outlook, or Office 365)
2. **Open an email** you want to check for phishing attempts
3. **Click the MailSentinel icon** in your Chrome toolbar
4. **Click "Check Email"** to analyze the email content
5. **View the results** which will indicate if the email is safe, suspicious, or if an error occurred

## Project Structure
``` 
MailSentinelExtension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.css             # Styles for the popup
├── popup.js              # Popup functionality
├── background.js         # Background processes
├── content.js            # Content script for email extraction
└── icons/                # Extension icons
    ├── icon16.png        # 16x16 icon
    ├── icon48.png        # 48x48 icon
    └── icon128.png       # 128x128 icon
```

## Technical Details

MailSentinel uses a combination of content scripts and background processes to analyze email content:

1. **Content Script**: Extracts email content from supported webmail services
2. **Background Process**: Performs the phishing analysis (currently simulated)
3. **Popup Interface**: Provides a clean UI for initiating scans and viewing results

The extension features a responsive design with smooth animations and a comprehensive state management system to provide clear feedback during the scanning process.

## Privacy

MailSentinel respects your privacy:
- All analysis happens locally in your browser
- No email content is sent to external servers
- No personal data is collected or stored

## Contributing

We welcome contributions to improve MailSentinel! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions about MailSentinel, please open an issue on our GitHub repository.

---

**Stay safe online with MailSentinel - your first line of defense against phishing attempts!**
