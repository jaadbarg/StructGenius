import React, { useState } from 'react';
import { Folder, File, Download, Info, Shield, Coffee, Edit, Save, X, Zap } from 'lucide-react';
import JSZip from 'jszip';

const StructGenius = () => {
  const [input, setInput] = useState('');
  const [structure, setStructure] = useState(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileContents, setFileContents] = useState({});

  const generateStructure = () => {
    try {
      const lines = input.split('\n').filter(line => line.trim());
      const root = { name: lines[0].split('/')[0], children: [], isDirectory: true };
      let currentPath = [root];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        const depth = (line.match(/│   /g) || []).length;
        const name = line.replace(/[│├──]/g, '').trim();

        while (currentPath.length > depth + 1) {
          currentPath.pop();
        }

        const newNode = { name, children: [], isDirectory: line.includes('/') };
        currentPath[currentPath.length - 1].children.push(newNode);

        if (newNode.isDirectory) {
          currentPath.push(newNode);
        }
      }

      setStructure(root);
      setError('');
    } catch (err) {
      setError('Invalid input format. Please check your tree diagram.');
    }
  };

  const renderTree = (node) => (
    <div key={node.name} className="ml-4">
      {node.isDirectory ? (
        <div className="flex items-center">
          <Folder className="inline-block mr-2" size={16} />
          <span>{node.name}</span>
        </div>
      ) : (
        <div className="flex items-center">
          <File className="inline-block mr-2" size={16} />
          <span className="mr-2">{node.name}</span>
          <button 
            onClick={() => openFileEditor(node)}
            className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition duration-300"
          >
            <Edit size={12} />
          </button>
        </div>
      )}
      {node.children && node.children.map(renderTree)}
    </div>
  );

  const openFileEditor = (file) => {
    setSelectedFile(file);
    setFileContent(fileContents[file.name] || '');
  };

  const handleContentSave = () => {
    setFileContents({
      ...fileContents,
      [selectedFile.name]: fileContent
    });
    setSelectedFile(null);
  };

  const generateZip = async () => {
    const zip = new JSZip();

    const addToZip = (node, currentPath) => {
      const newPath = currentPath + (currentPath ? '/' : '') + node.name;
      if (node.isDirectory) {
        node.children.forEach(child => addToZip(child, newPath));
      } else {
        zip.file(newPath, fileContents[node.name] || ''); // Use custom content if available
      }
    };

    addToZip(structure, '');

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${structure.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to generate zip file. Please try again.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 flex items-center">
        <Zap className="inline-block mr-2 text-yellow-500" size={36} />
        StructGenius
      </h1>
      <h2 className="text-xl text-gray-600 mb-6">Streamline Your Project, Amplify Your Genius</h2>
      
      <div className="mb-6 p-4 bg-blue-100 border border-blue-500 rounded shadow-md">
        <div className="flex items-center mb-3">
          <Info className="h-6 w-6 mr-2 text-blue-500" />
          <h2 className="text-2xl font-semibold">How to Use StructGenius</h2>
        </div>
        <p className="mb-3">
          Unleash your coding potential with StructGenius! Perfect for students and developers using AI language model (LLMs) tools in their projects. Here's how to get started:
        </p>
        <ol className="list-decimal list-inside mb-3 space-y-2">
          <li>Finish discussing and planning a project and its code with your LLM</li>
          <li>Ask your LLM to "print out a tree structure of our current code"</li>
          <li>Paste your LLM-generated file structure into the text area below</li>
          <li>Click "Generate Structure" to visualize your project blueprint</li>
          <li>Paste code to your files by clicking the edit icon next to each one</li>
          <li>Hit "Download as Zip" to get your genius structure ready to go in your IDE!</li>
        </ol>
        <p className="font-semibold">Example LLM Tree Structure Output:</p>
        <pre className="bg-gray-100 p-3 rounded text-sm shadow-inner">
{`my-genius-project/
  ├── src/
  │   ├── main.py
  │   └── utils.py
  ├── tests/
  │   └── test_main.py
  ├── README.md
  └── requirements.txt`}
        </pre>
      </div>
      
      <div className="mb-6 p-4 bg-green-100 border border-green-500 rounded shadow-md">
        <div className="flex items-center mb-2">
          <Shield className="h-6 w-6 mr-2 text-green-500" />
          <h2 className="text-2xl font-semibold">Genius Integrity</h2>
        </div>
        <p>
        For your safety and privacy, StructGenius operates entirely on the client-side. All file structure generation and ZIP file creation happen in your browser. No data is sent to or stored on any server.
        </p>
      </div>
      
      <textarea
        className="w-full h-64 p-3 border rounded shadow-inner"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your LLM-generated tree file structure here and watch the magic happen..."
      />
      <button
        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105"
        onClick={generateStructure}
      >
        Generate Genius Structure
      </button>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-500 rounded text-red-700 shadow-md">
          <h3 className="font-bold">Oops! Try Again</h3>
          <p>{error}</p>
        </div>
      )}
      {structure && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-3">Your Project Structure:</h2>
          {renderTree(structure)}
          <button
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105"
            onClick={generateZip}
          >
            <Download className="mr-2" size={20} />
            Download Zip
          </button>
        </div>
      )}
      
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit {selectedFile.name}</h3>
              <button onClick={() => setSelectedFile(null)}>
                <X size={20} />
              </button>
            </div>
            <textarea
              className="w-full h-64 p-2 border rounded mb-4"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Enter file content here..."
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              onClick={handleContentSave}
            >
              <Save className="mr-2" size={16} />
              Save Genius Content
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-semibold mb-3">Did I save you time?</h3>
        <a href="https://ko-fi.com/tfwtf" target="_blank" rel="noopener noreferrer">
          <button className="bg-yellow-500 text-white px-6 py-3 rounded flex items-center mx-auto hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105">
            <Coffee className="mr-2" size={20} />
            Buy Me a Coffee
          </button>
        </a>
      </div>
    </div>
  );
};

export default StructGenius;