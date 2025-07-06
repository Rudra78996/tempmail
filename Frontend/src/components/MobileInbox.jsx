import { useState } from "react";
import DOMPurify from "dompurify";

export const MobileInbox = ({ messages }) => {
  const [currentMessage, setCurrentMessage] = useState([]);
  
  const handleClickMessage = (e) => {
    const messageId = e.currentTarget.id;
    setCurrentMessage(messages.filter((message) => message._id === messageId));
  };
  
  const onClickBackHandler = () => {
    setCurrentMessage([]);
  };

  return (
    <div className="md:hidden h-[500px] w-full border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      {currentMessage.length === 0 ? (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Inbox</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message._id}
                className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleClickMessage}
                id={message._id}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900 truncate">{message.from}</span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">{message.receivedAt}</span>
                </div>
                <p className="font-semibold text-gray-800 mb-1 truncate">Subject: {message.subject}</p>
                <p className="text-sm text-gray-600 truncate">{message.text.slice(0, 40)}...</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <button 
              onClick={onClickBackHandler}
              className="mr-2 p-1 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {currentMessage[0]?.subject}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {currentMessage.map((message) => (
              <div key={message._id}>
                <div className="mb-4">
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">From:</span> {message.from}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-semibold">Date:</span> {message.receivedAt}
                  </p>
                </div>
                
                <div className="prose max-w-none">
                  {message.text && (
                    <div className="whitespace-pre-line text-gray-800 mb-4">
                      {message.text}
                    </div>
                  )}
                  {message.html && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(message.html),
                      }}
                      className="email-content text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};