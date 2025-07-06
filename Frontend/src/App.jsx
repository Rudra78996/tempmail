import { useEffect, useState } from "react";
import { Inbox } from "./components/Inbox";
import {io} from "socket.io-client"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);

export default function App() {
  const [email, setEmail] = useState("Generating...");
  const [messages, setMessages] = useState([]);

  const generateNewEmail = async () => {
    try {
      const res = await fetch(BACKEND_URL + "/api/email/create-inbox", {
        method: "POST",
      });
      const data = await res.json();
      setEmail(data.address);
      console.log(data.address);
    } catch (err) {
      if (err.message.includes("Too many")) {
        alert("Too many request");
      } else {
        alert("Server Error, Try again letter");
      }
    }
  };
  const checkEmailValidity = async (localStorageEmail) => {
    try {
      const res = await fetch(BACKEND_URL + "/api/email/isValid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: localStorageEmail }),
      });
      const data = await res.json();
      if (data.isValid) {
        setEmail(localStorageEmail);
        fetchInbox(localStorageEmail);
      } else {
        await generateNewEmail();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchInbox = async (inboxEmail) => {
    try {
      const res = await fetch(BACKEND_URL + "/api/email/inbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: inboxEmail }),
      });
      const data = await res.json();
      console.log(data.data.emails);
      
      if(data.success && data.data.emails) setMessages(data.data.emails);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const localStorageEmail = localStorage.getItem("temp-email");
    if (!localStorageEmail) {
      generateNewEmail();
    } else {
      checkEmailValidity(localStorageEmail);
    }
  }, []);

  useEffect(() => {
    fetchInbox(email);
    localStorage.setItem("temp-email", email);
  }, [email]);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-600">TEMPMAIL.TODAY</h1>
        <div className="flex items-center space-x-6">
          <p className="text-gray-600 hover:text-emerald-600 cursor-pointer">
            About
          </p>
          <p className="text-gray-600 hover:text-emerald-600 cursor-pointer">
            Contact
          </p>
          <p className="text-gray-600 hover:text-emerald-600 cursor-pointer">
            Working
          </p>
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Github
          </button>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Free Temporary Email
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Receive emails anonymously with our free, private, and secure
            temporary email address generator.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex justify-between items-center mt-12 border w-full max-w-2xl p-4 rounded-md gap-4 bg-green-50">
            <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-2 truncate text-gray-800 font-medium flex-1">
                {email}
              </div>
              <button
                className="bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition-colors whitespace-nowrap"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>
            <button
              className="bg-white border border-emerald-600 text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
              onClick={generateNewEmail}
            >
              Change email
            </button>
          </div>
        </div>

        <div className="mt-12">
          <Inbox messages={messages} />
        </div>
      </main>

      <footer className="bg-white py-4 text-center text-gray-500 border-t">
        <p>- By Rudra Pratap Singh-</p>
      </footer>
    </div>
  );
}
