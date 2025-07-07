import { useState } from "react";
import DOMPurify from "dompurify";
import {
  Inbox as InboxIcon,
  ArrowLeft,
  Mail,
  Clock,
  User,
  FileText,
  Mailbox,
} from "lucide-react";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
export const MobileInbox = ({ messages }) => {
  const [currentMessage, setCurrentMessage] = useState([]);

  const handleClickMessage = (messageId) => {
    setCurrentMessage(messages.filter((message) => message._id === messageId));
  };

  const onClickBackHandler = () => setCurrentMessage([]);

  return (
    <div className="md:hidden h-[500px] w-full border border-gray-200 rounded-lg bg-white overflow-hidden shadow-lg">
      {currentMessage.length === 0 ? (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <InboxIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h1 className="text-lg font-medium">Inbox ({messages.length})</h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                <Mailbox className="h-10 w-10 mb-3 text-gray-400" />
                <p>No messages found</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleClickMessage(message._id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {message.from}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTime(message.receivedAt)}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800 mb-1 truncate">
                    {message.subject}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {message.text?.slice(0, 50) || "No text content"}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center">
            <button
              onClick={onClickBackHandler}
              className="mr-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-gray-900 truncate">
              {currentMessage[0]?.subject}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentMessage.map((message) => (
              <div key={message._id} className="space-y-4">
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-medium mr-2">From:</span>
                    <span>{message.from}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{formatTime(message.receivedAt)}</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  {message.html ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(message.html),
                      }}
                      className="email-content"
                    />
                  ) : (
                    <div className="whitespace-pre-line text-gray-800">
                      {message.text}
                    </div>
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
