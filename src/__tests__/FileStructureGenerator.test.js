teaimport React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FileStructureGenerator from '../components/FileStructureGenerator';

// Mock JSZip
jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => {
    return {
      file: jest.fn(),
      generateAsync: jest.fn().mockResolvedValue(new Blob()),
    };
  });
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Folder: () => <div data-testid="folder-icon" />,
  File: () => <div data-testid="file-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Info: () => <div data-testid="info-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Coffee: () => <div data-testid="coffee-icon" />,
}));

describe('FileStructureGenerator', () => {
  it('renders without crashing', () => {
    render(<FileStructureGenerator />);
    expect(screen.getByText('File Structure Generator')).toBeInTheDocument();
  });

  it('displays instructions and example', () => {
    render(<FileStructureGenerator />);
    expect(screen.getByText('How to Use This Tool')).toBeInTheDocument();
    expect(screen.getByText('Example LLM Output:')).toBeInTheDocument();
  });

  it('displays security information', () => {
    render(<FileStructureGenerator />);
    expect(screen.getByText('Security Information')).toBeInTheDocument();
  });

  it('generates correct structure for a simple tree', () => {
    render(<FileStructureGenerator />);
    const input = screen.getByPlaceholderText('Paste your file structure here...');
    fireEvent.change(input, { target: { value: 
`root/
  file1.txt
  dir1/
    file2.txt
  file3.txt`
    }});
    fireEvent.click(screen.getByText('Generate Structure'));
    
    expect(screen.getByText('root')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('dir1')).toBeInTheDocument();
    expect(screen.getAllByText('file2.txt')[0]).toBeInTheDocument();
    expect(screen.getByText('file3.txt')).toBeInTheDocument();
  });

  it('handles trees with branch characters', () => {
    render(<FileStructureGenerator />);
    const input = screen.getByPlaceholderText('Paste your file structure here...');
    fireEvent.change(input, { target: { value: 
`root/
├── file1.txt
├── dir1/
│   └── file2.txt
└── file3.txt`
    }});
    fireEvent.click(screen.getByText('Generate Structure'));
    
    expect(screen.getByText('root')).toBeInTheDocument();
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('dir1')).toBeInTheDocument();
    expect(screen.getAllByText('file2.txt')[0]).toBeInTheDocument();
    expect(screen.getByText('file3.txt')).toBeInTheDocument();
  });

  it('displays error for invalid input', () => {
    render(<FileStructureGenerator />);
    const input = screen.getByPlaceholderText('Paste your file structure here...');
    fireEvent.change(input, { target: { value: 'invalid input' }});
    fireEvent.click(screen.getByText('Generate Structure'));
    
    expect(screen.getByText('Invalid input format. Please check your tree diagram.')).toBeInTheDocument();
  });

  it('shows download button after generating structure', () => {
    render(<FileStructureGenerator />);
    const input = screen.getByPlaceholderText('Paste your file structure here...');
    fireEvent.change(input, { target: { value: 'root/' }});
    fireEvent.click(screen.getByText('Generate Structure'));
    
    expect(screen.getByText('Download as Zip')).toBeInTheDocument();
  });

  it('displays tip jar section', () => {
    render(<FileStructureGenerator />);
    expect(screen.getByText('Find this tool helpful?')).toBeInTheDocument();
    expect(screen.getByText('Buy me a coffee')).toBeInTheDocument();
  });
});