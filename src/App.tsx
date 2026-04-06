import { useState, useEffect, useRef } from 'react';
import './App.css'; // Optional: for styling

function App() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Added a ref to programmatically trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Define your Cloudinary credentials
  const cloudName: string = 'dpmvfstim'; 
  const uploadPreset: string = 'my_paste_app'; 
  
  // 2. Define your fixed resolution
  const targetWidth: number = 800;
  const targetHeight: number = 600;

  useEffect(() => {
    // Listen for paste events anywhere on the window
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    let imageFile: File | null = null;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageFile = items[i].getAsFile();
        break;
      }
    }

    if (imageFile) {
      uploadToCloudinary(imageFile);
    }
  };

  // Handle manual file selection from the input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToCloudinary(file);
    }
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger the hidden file input when the icon/area is clicked
  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    setError('');
    setImageUrl('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const baseUrl = data.secure_url.split('/upload/');
        const resizedUrl = `${baseUrl[0]}/upload/c_fill,w_${targetWidth},h_${targetHeight}/${baseUrl[1]}`;
        
        setImageUrl(resizedUrl);
      } else {
        setError('Failed to upload image.');
      }
    } catch (err) {
      setError('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Upload or Paste an Image!</h2>
      <p>Press <strong>Ctrl+V</strong> (or <strong>Cmd+V</strong>) to paste, or click the icon below to select a photo.</p>

      {/* Hidden file input for manual uploads */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />

      {/* Visual Feedback Area */}
      <div style={{ 
        marginTop: '2rem', 
        minHeight: '200px', 
        border: '2px dashed #ccc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        {isUploading && <p>Uploading and resizing...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {imageUrl && !isUploading && (
          <>
            <p><strong>Success! Here is your URL:</strong></p>
            <input 
              type="text" 
              readOnly 
              value={imageUrl} 
              style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <div>
              <img src={imageUrl} alt="Uploaded and resized" style={{ maxWidth: '100%', borderRadius: '8px' }} />
            </div>
            
            {/* Allow uploading another image easily */}
            <button 
              onClick={handleIconClick}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Upload Another
            </button>
          </>
        )}

        {/* The Clickable Empty State */}
        {!imageUrl && !isUploading && !error && (
          <div 
            onClick={handleIconClick} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              color: '#888'
            }}
          >
            {/* SVG Upload Icon */}
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginBottom: '10px' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p style={{ margin: 0 }}>Click here to browse files, or paste an image</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;