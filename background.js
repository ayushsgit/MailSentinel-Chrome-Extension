const GEMINI_API_KEY = "your-api-key";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "analyzeEmail") {
        if (request.tabId) {
            // We have a specific tab ID (from Gmail)
            analyzeCurrentGmailEmail(request.tabId)
                .then(({content, subject}) => {
                    return analyzeWithGemini(content)
                        .then(result => ({result, subject}));
                })
                .then(({result, subject}) => sendResponse({ 
                    status: "success", 
                    result, 
                    subject 
                }))
                .catch(err => {
                    console.error("Error:", err);
                    sendResponse({ status: "error", message: err.message });
                });
        } else {
            // Fallback to the original method (fetch latest email)
            authenticate()
                .then(token => fetchLatestEmailWithSubject(token))
                .then(({content, subject}) => {
                    return analyzeWithGemini(content)
                        .then(result => ({result, subject}));
                })
                .then(({result, subject}) => sendResponse({ 
                    status: "success", 
                    result, 
                    subject 
                }))
                .catch(err => {
                    console.error("Error:", err);
                    sendResponse({ status: "error", message: err.message });
                });
        }
        return true; // Keep message channel open
    }
});
async function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({
            interactive: true,
            scopes: ['https://www.googleapis.com/auth/gmail.readonly']
        }, (token) => {
            if (chrome.runtime.lastError) {
                reject(new Error("Authentication failed: " + chrome.runtime.lastError.message));
                return;
            }
            
            if (!token) {
                reject(new Error("No authentication token received"));
                return;
            }
            
            resolve(token);
        });
    });
}
async function analyzeCurrentGmailEmail(tabId) {
    return new Promise((resolve, reject) => {
        // Execute script in the Gmail tab to extract the current email content and subject
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: extractCurrentEmailContentAndSubject
        }, (results) => {
            if (chrome.runtime.lastError) {
                reject(new Error("Failed to extract email content: " + chrome.runtime.lastError.message));
                return;
            }
            
            if (!results || !results[0] || !results[0].result) {
                reject(new Error("Could not extract email content from the page"));
                return;
            }
            
            const {content, subject} = results[0].result;
            if (!content) {
                reject(new Error("No email content found on this page"));
                return;
            }
            
            resolve({content, subject: subject || "Unknown Subject"});
        });
    });
}

// This function runs in the context of the Gmail page
function extractCurrentEmailContentAndSubject() {
    // Extract subject
    const subjectSelectors = [
        'h2[data-thread-perm-id]', // Gmail subject
        'h2.hP', // Gmail subject class
        '.ha h2', // Alternative subject selector
        '[data-legacy-subject]', // Legacy subject
        'div[aria-label="Subject"]', // ARIA label subject
        '.gD', // Subject in some Gmail versions
        'input[name="subjectbox"]' // Subject input field
    ];
    
    let subject = "Unknown Subject";
    for (const selector of subjectSelectors) {
        const element = document.querySelector(selector);
        if (element && (element.textContent || element.value)) {
            subject = element.textContent || element.value;
            break;
        }
    }
    
    // Clean up subject
    subject = subject.trim();
    if (subject.length > 50) {
        subject = subject.substring(0, 50) + '...';
    }

    // Extract email content
    const contentSelectors = [
        '.a3s', // Gmail's email content container
        '[role="main"] .ii', // Main email content
        '.nH .a3s', // Alternative container
        '.adn.ads', // Another possible container
        '.ii.gt', // Email body
        'div[data-message-id]', // Message container
        '.msg' // General message class
    ];
    
    let content = null;
    for (const selector of contentSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.trim().length > 0) {
            content = element.textContent.trim();
            break;
        }
    }
    
    // If specific selectors don't work, try to find the largest text container
    if (!content) {
        const allElements = document.querySelectorAll('div, p, span');
        let largestElement = null;
        let maxLength = 0;
        
        for (const el of allElements) {
            if (el.textContent && el.textContent.trim().length > maxLength) {
                maxLength = el.textContent.trim().length;
                largestElement = el;
            }
        }
        
        content = largestElement ? largestElement.textContent.trim() : null;
    }
    
    return {content, subject};
}

async function fetchLatestEmailWithSubject(token) {
    try {
        const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=1", {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`Gmail API error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const data = await res.json();
        if (!data.messages || data.messages.length === 0) {
            throw new Error("No emails found in inbox");
        }
        
        const messageId = data.messages[0].id;
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!msgRes.ok) {
            const errorData = await msgRes.json().catch(() => ({}));
            throw new Error(`Gmail message API error: ${msgRes.status} ${msgRes.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        const msgData = await msgRes.json();
        
        // Extract subject from headers
        let subject = "Unknown Subject";
        if (msgData.payload && msgData.payload.headers) {
            const subjectHeader = msgData.payload.headers.find(header => 
                header.name.toLowerCase() === 'subject'
            );
            if (subjectHeader) {
                subject = subjectHeader.value;
                if (subject.length > 50) {
                    subject = subject.substring(0, 50) + '...';
                }
            }
        }
        
        // Extract email content
        let emailContent = msgData.snippet || "";
        
        // Try to get more content from the payload if available
        if (msgData.payload) {
            if (msgData.payload.body && msgData.payload.body.data) {
                try {
                    const decodedBody = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                    emailContent += " " + decodedBody;
                } catch (e) {
                    console.log("Could not decode email body:", e);
                }
            }
            
            if (msgData.payload.parts) {
                for (const part of msgData.payload.parts) {
                    if (part.body && part.body.data) {
                        try {
                            const decodedPart = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
                            emailContent += " " + decodedPart;
                        } catch (e) {
                            console.log("Could not decode email part:", e);
                        }
                    }
                }
            }
        }
        
        return {
            content: emailContent || "No content available",
            subject: subject
        };
    } catch (error) {
        console.error("Error fetching email:", error);
        throw error;
    }
}

// Keep your existing analyzeWithGemini() function
async function analyzeWithGemini(emailText) {
    try {
        const truncatedText = emailText.length > 5000 
            ? emailText.substring(0, 5000) + "... [truncated]" 
            : emailText;
            
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze this email for phishing attempts. Respond ONLY with "Phishing" if it contains suspicious elements like urgent requests for personal information, financial details, or suspicious links. Respond with "Safe" if it appears legitimate. Email content:\n${truncatedText}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text.trim();
        } else if (data.promptFeedback) {
            throw new Error("Content blocked for safety reasons");
        } else {
            console.error("Unexpected API response:", data);
            throw new Error("Unexpected API response format");
        }
    } catch (error) {
        console.error("Error with Gemini API:", error);
        throw error;
    }
}
