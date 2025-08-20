document.getElementById("checkBtn").addEventListener("click", () => {
    const btn = document.getElementById("checkBtn");
    const resultEl = document.getElementById("result");
    const statusEl = document.getElementById("status");
    const subjectEl = document.getElementById("subject");
    const buttonIcon = document.getElementById("buttonIcon");
    const buttonText = document.getElementById("buttonText");
    
    // Start loading state with animations
    btn.disabled = true;
    buttonIcon.className = "spinner";
    buttonText.innerText = "Scanning...";
    
    // Animate result container
    resultEl.style.opacity = "0";
    resultEl.style.transform = "translateY(10px)";
    
    setTimeout(() => {
        resultEl.innerHTML = `
            <div class="spinner"></div>
            <span>Analyzing email content...</span>
        `;
        resultEl.className = "loading";
        resultEl.style.opacity = "1";
        resultEl.style.transform = "translateY(0)";
    }, 200);
    
    statusEl.innerText = "🔍 Checking current tab...";
    subjectEl.innerText = "";

    // First, get the active tab to see if we're on Gmail
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length === 0) {
            resultEl.innerText = "Error: No active tab found";
            resultEl.className = "error";
            statusEl.innerText = "";
            btn.disabled = false;
            return;
        }

        const currentTab = tabs[0];
        
        if (currentTab.url && currentTab.url.includes('mail.google.com')) {
            statusEl.innerText = "Analyzing current email...";
            // We're on Gmail, analyze the current email
            chrome.runtime.sendMessage({ 
                action: "analyzeEmail", 
                tabId: currentTab.id 
            }, (response) => {
                handleResponse(response);
            });
        } else {
            statusEl.innerText = "Authenticating with Google...";
            // Not on Gmail, fetch the latest email
            chrome.runtime.sendMessage({ 
                action: "analyzeEmail" 
            }, (response) => {
                handleResponse(response);
            });
        }
    });

    function handleResponse(response) {
        // Reset button state with animation
        const resetButton = () => {
            setTimeout(() => {
                buttonIcon.className = "fas fa-scan-virus button-icon";
                buttonText.innerText = "Scan Email";
                btn.disabled = false;
            }, 500);
        };
        
        if (chrome.runtime.lastError) {
            resultEl.style.opacity = "0";
            setTimeout(() => {
                resultEl.innerHTML = `
                    <i class="fas fa-exclamation-triangle result-icon"></i>
                    <span>Extension Error</span>
                `;
                resultEl.className = "error";
                resultEl.style.opacity = "1";
                statusEl.innerText = "❌ " + chrome.runtime.lastError.message;
                subjectEl.innerText = "";
            }, 300);
            resetButton();
            return;
        }
        
        if (response.status === "success") {
            // Show the subject with animation
            if (response.subject) {
                statusEl.innerText = "📧 Analyzing email subject...";
                setTimeout(() => {
                    subjectEl.innerText = "📋 " + response.subject;
                    subjectEl.style.opacity = "0";
                    subjectEl.style.opacity = "1";
                }, 800);
            }
            
            // Simulate analysis progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 20;
                if (progress <= 100) {
                    statusEl.innerText = `🔄 AI Analysis in progress... ${progress}%`;
                }
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Show final result with animation
                    setTimeout(() => {
                        resultEl.style.opacity = "0";
                        resultEl.style.transform = "scale(0.9)";
                        
                        setTimeout(() => {
                            if (response.result.includes("Phishing")) {
                                resultEl.innerHTML = `
                                    <i class="fas fa-exclamation-triangle result-icon"></i>
                                    <span>⚠️ PHISHING DETECTED!</span>
                                `;
                                resultEl.className = "phishing";
                                statusEl.innerText = "🚨 High risk detected - Be extremely cautious!";
                                
                                // Add warning sound effect (visual)
                                setTimeout(() => {
                                    resultEl.style.animation = "danger-pulse 0.5s ease-in-out 3";
                                }, 100);
                                
                            } else {
                                resultEl.innerHTML = `
                                    <i class="fas fa-shield-alt result-icon"></i>
                                    <span>✅ EMAIL IS SAFE</span>
                                `;
                                resultEl.className = "safe";
                                statusEl.innerText = "🛡️ No threats detected - Email appears legitimate";
                                
                                // Add success animation
                                setTimeout(() => {
                                    resultEl.style.animation = "safe-glow 0.6s ease-in-out";
                                }, 100);
                            }
                            
                            resultEl.style.opacity = "1";
                            resultEl.style.transform = "scale(1)";
                        }, 400);
                    }, 500);
                }
            }, 200);
            
        } else {
            resultEl.style.opacity = "0";
            setTimeout(() => {
                resultEl.innerHTML = `
                    <i class="fas fa-times-circle result-icon"></i>
                    <span>Analysis Failed</span>
                `;
                resultEl.className = "error";
                resultEl.style.opacity = "1";
                statusEl.innerText = "❌ " + response.message;
                subjectEl.innerText = "";
            }, 300);
        }
        
        resetButton();
    }
});