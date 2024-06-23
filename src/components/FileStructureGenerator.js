import React, { useState } from 'react';
import { Folder, File, Download, Info, Shield, Coffee } from 'lucide-react';
import JSZip from 'jszip';

const FileStructureGenerator = () => {
  const [input, setInput] = useState('');
  const [structure, setStructure] = useState(null);
  const [error, setError] = useState('');

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
        <Folder className="inline-block mr-2" size={16} />
      ) : (
        <File className="inline-block mr-2" size={16} />
      )}
      {node.name}
      {node.children && node.children.map(renderTree)}
    </div>
  );

  const generateZip = async () => {
    const zip = new JSZip();

    const addToZip = (node, currentPath) => {
      const newPath = currentPath + (currentPath ? '/' : '') + node.name;
      if (node.isDirectory) {
        node.children.forEach(child => addToZip(child, newPath));
      } else {
        zip.file(newPath, ''); // Create an empty file
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
      <h1 className="text-3xl font-bold mb-4">File Structure Generator</h1>
      
      <div className="mb-4 p-4 bg-blue-100 border border-blue-500 rounded">
        <div className="flex items-center mb-2">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold">How to Use This Tool</h2>
        </div>
        <p className="mb-2">
          This tool streamlines your workflow when working with AI language models (LLMs) for code generation. Follow these steps:
        </p>
        <ol className="list-decimal list-inside mb-2">
          <li>Ask your LLM to generate a tree diagram of a file structure. For example, you could say: "Give me a tree diagram of the file structure for a basic React application."</li>
          <li>Copy the output from the LLM and paste it into the text area below.</li>
          <li>Click "Generate Structure" to visualize the file structure.</li>
          <li>Click "Download as Zip" to get a zip file with the empty file structure.</li>
        </ol>
        <p className="font-semibold">Example LLM Output:</p>
        <pre className="bg-gray-100 p-2 rounded text-sm">
{`my-react-app/
  ├── public/
  │   ├── index.html
  │   ├── favicon.ico
  │   └── manifest.json
  ├── src/
  │   ├── components/
  │   │   └── App.js
  │   ├── styles/
  │   │   └── index.css
  │   └── index.js
  ├── package.json
  └── README.md`}
        </pre>
      </div>
      
      <div className="mb-4 p-4 bg-green-100 border border-green-500 rounded">
        <div className="flex items-center mb-2">
          <Shield className="h-5 w-5 mr-2 text-green-500" />
          <h2 className="text-xl font-semibold">Security Information</h2>
        </div>
        <p>
          For your safety and privacy, this application operates entirely on the client-side. All file structure generation and ZIP file creation happen in your browser. No data is sent to or stored on any server.
        </p>
      </div>
      
      <textarea
        className="w-full h-64 p-2 border rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your file structure here..."
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={generateStructure}
      >
        Generate Structure
      </button>
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-500 rounded text-red-700">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      {structure && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Structure:</h2>
          {renderTree(structure)}
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            onClick={generateZip}
          >
            <Download className="mr-2" size={16} />
            Download as Zip
          </button>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Find this tool helpful?</h3>
        <a href="https://ko-fi.com/tfwtf" target="_blank" rel="noopener noreferrer">
          <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center mx-auto hover:bg-blue-600">
            <Coffee className="mr-2" size={16} />
            Buy me a coffee
          </button>
        </a>
      </div>
    </div>
  );
};

export default FileStructureGenerator;