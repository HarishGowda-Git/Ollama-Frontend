import { useState, useRef, useEffect } from 'react';

export default function EnhancedOllamaChat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('Llama 3');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Previous chat about React", date: "April 25, 2025" },
    { id: 2, title: "Help with JavaScript", date: "April 24, 2025" },
    { id: 3, title: "Python coding assistance", date: "April 23, 2025" },
  ]);
  const [currentChatId, setCurrentChatId] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const username = "Harish";
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() && selectedFiles.length === 0) return;
    
    const userMessage = {
      role: 'user',
      content: inputValue,
      files: selectedFiles
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedFiles([]);
    setShowFileUpload(false);
    setIsLoading(true);
    
    try {
      if (currentChatId === 0 && messages.length === 0) {
        const newChat = {
          id: chatHistory.length > 0 ? Math.max(...chatHistory.map(chat => chat.id)) + 1 : 1,
          title: inputValue.substring(0, 30) + (inputValue.length > 30 ? "..." : ""),
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        };
        setChatHistory(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
      }
      
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.toLowerCase().replace(/\s/g, ''),
          messages: [...messages, { role: 'user', content: inputValue }],
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message.content,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, there was an error processing your request. Please check that your Ollama server is running at http://localhost:11434",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
  };

  const selectModel = (modelName) => {
    setModel(modelName);
    setShowModelDropdown(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(0);
    setShowSidebar(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const loadChat = (chatId) => {
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages([
        { role: 'user', content: `[This is where the loaded messages for "${selectedChat.title}" would appear]` },
        { role: 'assistant', content: "This is a placeholder for chat history. In a production app, you would load the actual conversation from your database or local storage." }
      ]);
      setCurrentChatId(chatId);
      setShowSidebar(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (fileName) => {
    setSelectedFiles(selectedFiles.filter(file => file.name !== fileName));
  };

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
    if (!showFileUpload && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative'
    }}>
      {/* Sidebar / Chat History */}
      {showSidebar && (
        <div style={{ 
          width: '250px', 
          backgroundColor: '#222',
          borderRight: '1px solid #333',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '15px', 
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0 }}>Chat History</h2>
            <button 
              onClick={toggleSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                lineHeight: '1'
              }}
              aria-label="Close sidebar"
            >
              ×
            </button>
          </div>
          
          <button 
            onClick={startNewChat}
            style={{
              display: 'block',
              width: '90%',
              margin: '10px auto',
              padding: '8px',
              backgroundColor: '#444',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            + New Chat
          </button>
          
          <div style={{ padding: '10px' }}>
            {chatHistory.map(chat => (
              <div 
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: currentChatId === chat.id ? '#333' : 'transparent',
                  borderRadius: '4px',
                  marginBottom: '5px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.title}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{chat.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with menu button */}
        <header style={{ padding: '10px', borderBottom: '1px solid #333' }}>
          <button 
            onClick={toggleSidebar}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        </header>

        
        {/* Plan info */}
        <div style={{ padding: '10px 15px', fontSize: '14px' }}>
          <span>Free plan · </span>
          <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Upgrade</span>
        </div>
        
        {/* Greeting */}
        <div style={{ padding: '0 15px', marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 'normal',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#f97316', marginRight: '10px' }}>✺</span> 
            Hey there, {username}
          </h1>
        </div>
        
        {/* Chat area */}
        <div 
          ref={chatContainerRef}
          style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '0 15px', 
            marginBottom: '10px'
          }}
        >
          {messages.map((message, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div>{message.content}</div>
              
              {/* Display file attachments */}
              {message.files && message.files.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
                    Attached files:
                  </div>
                  {message.files.map((file, fileIndex) => (
                    <div key={fileIndex} style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      backgroundColor: '#333',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '5px',
                      marginBottom: '5px'
                    }}>
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && <div style={{ color: '#888' }}>Thinking...</div>}
        </div>
        
        {/* File upload area */}
        {showFileUpload && selectedFiles.length > 0 && (
          <div style={{ 
            padding: '10px 15px', 
            backgroundColor: '#222',
            borderTop: '1px solid #333'
          }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>Selected files:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedFiles.map((file, index) => (
                <div key={index} style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#333',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  <span>{file.name}</span>
                  <button 
                    onClick={() => removeFile(file.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#aaa',
                      marginLeft: '5px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div style={{ padding: '10px 15px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              multiple
            />
            
            <button 
              type="button" 
              onClick={toggleFileUpload}
              style={{ 
                background: 'none',
                border: 'none',
                color: showFileUpload ? '#f97316' : 'white',
                padding: '5px',
                marginRight: '5px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              +
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="How can I help you today?"
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                borderRadius: '3px',
                color: 'white'
              }}
              disabled={isLoading}
            />
            
            <div style={{ position: 'relative', marginLeft: '5px' }}>
              <button 
                type="button"
                onClick={toggleModelDropdown}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                {model} {showModelDropdown ? '▲' : '▼'}
              </button>
              
              {showModelDropdown && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: '0',
                  backgroundColor: '#222',
                  border: '1px solid #444',
                  borderRadius: '3px',
                  width: '150px',
                  zIndex: 10
                }}>
                  {['Llama 3', 'Mistral', 'Phi-3'].map(modelName => (
                    <button
                      key={modelName}
                      type="button"
                      onClick={() => selectModel(modelName)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        background: modelName === model ? '#333' : 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {modelName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '5px',
                marginLeft: '5px',
                cursor: isLoading || (!inputValue.trim() && selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
                opacity: isLoading || (!inputValue.trim() && selectedFiles.length === 0) ? 0.5 : 1,
                fontSize: '18px'
              }}
              disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
            >
              ➤
            </button>
          </form>
          
          {/* Category buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { icon: '📝', label: 'Write' },
              { icon: '📚', label: 'Learn' },
              { icon: '⌨️', label: 'Code' },
              { icon: '💡', label: 'Life stuff' },
              { icon: '✨', label: 'AI choice' }
            ].map(category => (
              <button
                key={category.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  backgroundColor: 'transparent',
                  border: '1px solid #444',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}