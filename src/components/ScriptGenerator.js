import React, { useState } from 'react';

const ScriptGenerator = () => {
  const [topic, setTopic] = useState('');
  const [scriptLength, setScriptLength] = useState('short');
  const [generatedScript, setGeneratedScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateScript = async () => {
    try {
      setLoading(true);
      setError('');

      // Adjust prompt to be more direct and structured
      const prompt = `Create a ${scriptLength} YouTube video script about "${topic}". 
        Just give me the script. No greetings, no explanations.
        
        Use these markers:
        - Use [Timestamp XX:XX] for timestamps
        - Use ** for bold text
        - Use • for bullet points (one per line)
        - Use ### for section headers
        
        Keep the script ${scriptLength} (exactly 3-5 minutes for short, 7-10 for medium, 12-15 for long).`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      // Clean and format the script
      const rawScript = data.candidates[0].content.parts[0].text;
      const formattedScript = rawScript
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^•\s(.*)$/gm, '<li>$1</li>')
        .replace(/((?:^•.*\n)+)/gm, '<ul>$1</ul>')
        .replace(/###\s(.*)$/gm, '<h3>$1</h3>')
        .replace(/\[Timestamp (.*?)\]/g, '<span class="timestamp">[Timestamp $1]</span>')
        .trim();

      setGeneratedScript(formattedScript);
    } catch (error) {
      console.error('Error details:', error);
      setError('Failed to generate script. Please try again or check your internet connection.');
      setGeneratedScript('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>YouTube Script Generator</h2>
      <div className="generator-form">
        <div className="input-group">
          <label htmlFor="topic">Video Topic</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your video topic (e.g., 'How to Start Programming')"
            className="input-field"
          />
          <label htmlFor="length">Script Length</label>
          <select 
            id="length"
            value={scriptLength} 
            onChange={(e) => setScriptLength(e.target.value)}
            className="select-field"
          >
            <option value="short">Short (3-5 minutes)</option>
            <option value="medium">Medium (7-10 minutes)</option>
            <option value="long">Long (12-15 minutes)</option>
          </select>
          <button 
            onClick={generateScript} 
            disabled={!topic || loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {generatedScript && (
        <div className="output-container">
          <div className="script-output" 
               dangerouslySetInnerHTML={{ __html: generatedScript }}
          />
          <button 
            onClick={() => navigator.clipboard.writeText(generatedScript.replace(/<\/?strong>/g, '**'))}
            className="copy-btn"
          >
            Copy Script
          </button>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;