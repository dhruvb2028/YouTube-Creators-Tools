import React, { useState } from 'react';

const TagsGenerator = () => {
  const [videoInfo, setVideoInfo] = useState('');
  const [generatedTags, setGeneratedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateTags = async () => {
    try {
      setLoading(true);
      setError('');
      setCopySuccess(false);

      const prompt = `Generate 15-20 highly relevant YouTube tags for a video with the following content:
        "${videoInfo}"
        
        Requirements:
        - Include both broad and specific keywords
        - Make tags SEO-friendly
        - Use a mix of short and long-tail keywords
        - Include trending/popular relevant terms
        - Separate each tag with a comma
        - Keep individual tags under 30 characters
        - Make tags relevant to YouTube search
        
        Format: Return only the tags, separated by commas`;

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

      const tags = data.candidates[0].content.parts[0].text
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 30);
      
      if (tags.length === 0) {
        throw new Error('No valid tags were generated');
      }
      setGeneratedTags(tags);
    } catch (error) {
      console.error('Error details:', error);
      setError('Failed to generate tags. Please try again or check your internet connection.');
      setGeneratedTags([]);
    } finally {
      setLoading(false);
    }
  };

  const copyAllTags = () => {
    const tagsText = generatedTags.join(', ');
    navigator.clipboard.writeText(tagsText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="generator-container">
      <h2>YouTube Tags Generator</h2>
      <div className="generator-form">
        <div className="input-group">
          <label htmlFor="videoInfo">Video Details</label>
          <textarea
            id="videoInfo"
            value={videoInfo}
            onChange={(e) => setVideoInfo(e.target.value)}
            placeholder="Enter your video title and brief description for relevant tags..."
            rows={4}
            className="input-field"
          />
          <button 
            onClick={generateTags} 
            disabled={!videoInfo || loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Tags'}
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

      {copySuccess && (
        <div className="success-message">
          <p>Tags copied to clipboard!</p>
          <button onClick={() => setCopySuccess(false)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {generatedTags.length > 0 && (
        <div className="output-container">
          <h3>Generated Tags:</h3>
          <div className="tags-output">
            <div className="tags-list">
              {generatedTags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <button onClick={copyAllTags} className="copy-btn">
              Copy All Tags
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsGenerator;