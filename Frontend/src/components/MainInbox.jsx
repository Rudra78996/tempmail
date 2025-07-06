import { useState } from "react";
import DOMPurify from "dompurify";

export const MainInbox = ({messages}) => {
  const [currentMessage, setCurrentMessage] = useState([]);
  const handleClickMessage = (e) => {
    const messageId = e.currentTarget.id;
    setCurrentMessage(messages.filter((message) => message.id === messageId));
  };

  return (
    <div className="h-[600px] w-full max-w-6xl hidden md:flex shadow-lg rounded-lg overflow-hidden">
      {/* Message List */}
      <div className="w-2/5 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-semibold text-gray-800">Inbox</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                currentMessage[0]?.id === message.id ? 'bg-blue-50' : 'bg-white'
              }`}
              onClick={handleClickMessage}
              id={message.id}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900 truncate">{message.from}</span>
                <span className="text-sm text-gray-500 whitespace-nowrap">{message.receivedAt}</span>
              </div>
              <p className="font-semibold text-gray-800 mb-1 truncate">Subject: {message.subject}</p>
              <p className="text-sm text-gray-600 truncate">{message.text.slice(0, 50)}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="w-3/5 bg-white flex flex-col">
        {currentMessage.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a message to read</p>
          </div>
        ) : (
          currentMessage.map((message) => (
            <div key={message.id} className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{message.subject}</h2>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">From:</span> {message.from}
                  </p>
                  <p className="text-gray-500 text-sm">{message.receivedAt}</p>
                </div>
              </div>
              
              <div className="prose max-w-none">
                {message.text && (
                  <div className="whitespace-pre-line text-gray-800 mb-6">
                    {message.text}
                  </div>
                )}
                {message.html && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(message.html),
                    }}
                    className="email-content"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};