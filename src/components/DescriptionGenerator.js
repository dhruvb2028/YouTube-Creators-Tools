import React, { useState } from 'react';

const DescriptionGenerator = () => {
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    mainPoints: '',
    links: '',
    customInfo: ''
  });
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateDescription = async () => {
    try {
      setLoading(true);
      setError('');
      setCopySuccess(false);

      const prompt = `Create an engaging YouTube video description for:
        Title: "${videoDetails.title}"
        Main Points: ${videoDetails.mainPoints}
        Links to Include: ${videoDetails.links}
        Additional Info: ${videoDetails.customInfo}
        
        Requirements:
        1. Start with a compelling hook (first 2-3 lines visible in search)
        2. Include chapter timestamps if main points are provided
        3. Add relevant links with proper formatting
        4. Include a clear call-to-action for subscribing
        5. Add 3-5 relevant hashtags at the end
        6. Keep it engaging and SEO-friendly
        7. Format with proper spacing and sections
        
        Follow YouTube's best practices for descriptions.`;

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

      const generatedText = data.candidates[0].content.parts[0].text;
      if (!generatedText) {
        throw new Error('Generated content is empty');
      }
      setGeneratedDescription(generatedText);
    } catch (error) {
      console.error('Error details:', error);
      setError('Failed to generate description. Please try again or check your internet connection.');
      setGeneratedDescription('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  return (
    <div className="generator-container">
      <h2>YouTube Description Generator</h2>
      <div className="generator-form">
        <div className="input-group">
          <label htmlFor="title">Video Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={videoDetails.title}
            onChange={handleInputChange}
            placeholder="Enter your video title"
            className="input-field"
          />

          <label htmlFor="mainPoints">Main Points (One per line)</label>
          <textarea
            id="mainPoints"
            name="mainPoints"
            value={videoDetails.mainPoints}
            onChange={handleInputChange}
            placeholder="List the main points or chapters of your video"
            rows={4}
            className="input-field"
          />

          <label htmlFor="links">Important Links (One per line)</label>
          <textarea
            id="links"
            name="links"
            value={videoDetails.links}
            onChange={handleInputChange}
            placeholder="Add links to resources mentioned in the video"
            rows={3}
            className="input-field"
          />

          <label htmlFor="customInfo">Additional Information</label>
          <textarea
            id="customInfo"
            name="customInfo"
            value={videoDetails.customInfo}
            onChange={handleInputChange}
            placeholder="Any additional information to include (social media, merch, etc.)"
            rows={2}
            className="input-field"
          />

          <button 
            onClick={generateDescription} 
            disabled={!videoDetails.title || loading}
            className="generate-btn"
          >
            {loading ? 'Generating...' : 'Generate Description'}
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
          <p>Description copied to clipboard!</p>
          <button onClick={() => setCopySuccess(false)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {generatedDescription && (
        <div className="output-container">
          <h3>Generated Description:</h3>
          <div className="description-output">
            <pre className="script-output">{generatedDescription}</pre>
            <button onClick={copyToClipboard} className="copy-btn">
              Copy Description
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionGenerator;