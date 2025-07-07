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
  Frown,
} from "lucide-react";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};
export const MainInbox = ({ messages }) => {

  const [currentMessage, setCurrentMessage] = useState([]);
  const handleClickMessage = (messageId) => {
    setCurrentMessage(messages.filter((message) => message._id === messageId));
  };

  return (
    <div className="h-[600px] w-full max-w-6xl hidden md:flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-lg">
      {/* Message List */}
      <div className="w-2/5 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <InboxIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h1 className="text-lg font-medium">Inbox ({messages.length})</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
              <Mailbox className="h-12 w-12 mb-3 text-gray-400" />
              <p className="text-lg">No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`p-4 border-b border-gray-100 cursor-pointer ${
                  currentMessage[0]?._id === message._id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
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
                  {message.text?.slice(0, 70) || "No text content"}...
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="w-3/5 flex flex-col">
        {currentMessage.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6 mt-14">
            <Mail className="h-12 w-12 mb-3 text-gray-400" />
            <p className="text-lg">Select a message</p>
          </div>
        ) : (
          currentMessage.map((message) => (
            <div key={message._id} className="flex-1 overflow-y-auto p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">
                {message.subject}
              </h2>

              <div className="flex items-center text-sm text-gray-600 mb-6">
                <User className="h-4 w-4 mr-1 text-gray-500" />
                <span className="font-medium mr-2">From:</span>
                <span className="mr-4">{message.from}</span>

                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                <span>{formatTime(message.receivedAt)}</span>
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
          ))
        )}
      </div>
    </div>
  );
};
