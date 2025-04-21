import React, { useState } from 'react';

const TitleGenerator = () => {
  const [scriptContent, setScriptContent] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTitles = async () => {
    try {
      setLoading(true);
      setError('');

      const prompt = `Generate 5 highly engaging, clickworthy YouTube titles for a video with the following content:
        "${scriptContent}"
        
        Requirements:
        - Make titles catchy and SEO-friendly
        - Include relevant keywords naturally
        - Keep titles between 40-60 characters
        - Use proven title formulas (How to, Numbers, Questions, etc.)
        - Make them emotional and curiosity-driven
        - Format each title on a new line
        - Add [Duration] tag if time-specific content`;

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

      const titles = data.candidates[0].content.parts[0].text
        .split('\n')
        .filter(title => title.trim());

      if (titles.length === 0) {
        throw new Error('No titles were generated');
      }

      setGeneratedTitles(titles);
    } catch (error) {
      console.error('Error details:', error);
      setError('Failed to generate titles. Please try again or check your internet connection.');
      setGeneratedTitles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>YouTube Title Generator</h2>
      <div className="generator-form">
        <div className="input-group">
          <label htmlFor="content">Video Content</label>
          <textarea
            id="content"
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            placeholder="Paste your video script or describe your content here..."
            rows={6}
            className="input-field"
          />
          <button 
            onClick={generateTitles} 
            disabled={!scriptContent || loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Titles'}
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

      {generatedTitles.length > 0 && (
        <div className="output-container">
          <h3>Generated Titles:</h3>
          <div className="titles-list">
            {generatedTitles.map((title, index) => (
              <div key={index} className="title-item">
                <span className="title-number">{index + 1}</span>
                <p>{title}</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(title)}
                  className="copy-btn"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleGenerator;