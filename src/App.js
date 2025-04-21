import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ScriptGenerator from './components/ScriptGenerator';
import TitleGenerator from './components/TitleGenerator';
import TagsGenerator from './components/TagsGenerator';
import DescriptionGenerator from './components/DescriptionGenerator';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1>YouTube Content Generator</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/script">Script Generator</Link></li>
            <li><Link to="/title">Title Generator</Link></li>
            <li><Link to="/tags">Tags Generator</Link></li>
            <li><Link to="/description">Description Generator</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/script" element={<ScriptGenerator />} />
          <Route path="/title" element={<TitleGenerator />} />
          <Route path="/tags" element={<TagsGenerator />} />
          <Route path="/description" element={<DescriptionGenerator />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => (
  <div className="generator-container">
    <h2>Welcome to YouTube Content Generator</h2>
    <p>Select a tool from the navigation menu to get started!</p>
    <div className="features-list">
      <h3>Available Tools:</h3>
      <ul>
        <li>Script Generator - Create engaging video scripts</li>
        <li>Title Generator - Generate catchy, SEO-friendly titles</li>
        <li>Tags Generator - Generate relevant tags for better visibility</li>
        <li>Description Generator - Create professional video descriptions</li>
      </ul>
    </div>
  </div>
);

export default App;
