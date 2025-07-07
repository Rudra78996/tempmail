import { useEffect, useState } from "react";
import { Inbox } from "./components/Inbox";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Info } from "lucide-react";

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
    } catch (err) {
      toast.error("Try gain after some time");
    }
  };

  const checkEmailValidity = async (localStorageEmail) => {
    try {
      const res = await fetch(BACKEND_URL + "/api/email/isValid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inboxEmail }),
      });
      const data = await res.json();
      if (data.success && data.data.emails)
        setMessages(data.data.emails.reverse());
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const localStorageEmail = localStorage.getItem("temp-email");
    if (!localStorageEmail) generateNewEmail();
    else checkEmailValidity(localStorageEmail);
  }, []);

  useEffect(() => {
    if (!email || email === "Generating...") return;
    socket.emit("join_inbox", email.split("@")[0]);

    socket.on("new_email", (data) => {
      setMessages((prev) => [data.email, ...prev]);
    });

    return () => socket.off("new_email");
  }, [email]);

  useEffect(() => {
    fetchInbox(email);
    localStorage.setItem("temp-email", email);
  }, [email]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    toast.success("Copied");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-poppins flex flex-col w-screen">
      <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center ml-2 sm:ml-8">
          <Mail size={36} className="text-blue-600" />
          <span className="text-xl font-semibold">
            <span className="text-blue-600 font-bold">&nbsp;Temp</span>
            <span className="text-gray-900">Mails</span>
          </span>
        </div>

        <div className="flex items-center mr-2 sm:mr-8 text-sm ">
          <a href="https://github.com/Rudra78996/tempmail" target="_blank">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors">
              GitHub
            </button>
          </a>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Free Temporary Email
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Instantly create disposable email addresses. <br/> Secure, private, and
            easy.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex justify-between items-center border w-full max-w-2xl p-6 rounded-lg gap-4  bg-blue-50 border-blue-200">
            <div className="flex-1 flex items-center border border-gray-300 rounded-md overflow-hidden bg-white">
              <div className="px-4 py-2 truncate text-gray-900 font-medium flex-1">
                {email}
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 transition-colors border-blue-600"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>
            <button
              className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
              onClick={generateNewEmail}
            >
              Change Email
            </button>
          </div>
        </div>

        <div className="mt-12">
          <Inbox messages={messages} />
        </div>
        <div className="flex flex-row items-center space-x-1  text-center justify-center text-sm text-gray-500 mt-12">
            <Info size={20} className="mx-1"/>
            <p>
              Email address and inbox will expire after 15 minutes.
              </p>
        </div>
      </main>

      <footer className="bg-white py-4 text-center text-gray-500 border-t border-gray-200">
        <p>– Built by Rudra Pratap Singh –</p>
      </footer>

      <Toaster />
    </div>
  );
}
