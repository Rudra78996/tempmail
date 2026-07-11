import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Copy, RefreshCw, Github, Sparkles, InboxIcon, Clock, User, Mailbox, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import DOMPurify from "dompurify";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(BACKEND_URL);

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

export default function App() {
  const [email, setEmail] = useState("Generating...");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Custom Slider State
  const [leftWidth, setLeftWidth] = useState(35);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 20 && newWidth <= 70) {
        setLeftWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const generateNewEmail = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(BACKEND_URL + "/api/email/create-inbox", {
        method: "POST",
      });
      const data = await res.json();
      setEmail(data.address);
      setMessages([]);
      setCurrentMessageId(null);
    } catch (err) {
      toast.error("Try again after some time");
    } finally {
      setIsGenerating(false);
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
      if (data.success && data.data.emails) {
        setMessages(data.data.emails.reverse());
      }
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
    
    const joinRoom = () => {
      socket.emit("join_inbox", email.split("@")[0]);
    };

    // Join immediately if already connected, otherwise wait for connection
    if (socket.connected) {
      joinRoom();
    }
    
    // Re-join on every reconnect
    socket.on("connect", joinRoom);

    const handleNewEmail = (data) => {
      setMessages((prev) => [data.email, ...prev]);
      toast.success("New email received!");
    };

    socket.on("new_email", handleNewEmail);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new_email", handleNewEmail);
    };
  }, [email]);

  useEffect(() => {
    if (email !== "Generating...") {
      fetchInbox(email);
      localStorage.setItem("temp-email", email);
    }
  }, [email]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    toast.success("Copied to clipboard!");
  };

  const currentMessage = messages.find(m => m._id === currentMessageId);

  const inboxListContent = (
    <div className="flex flex-col h-full w-full bg-background/50 relative min-w-[250px]">
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Temporary Address</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={email}
              className="flex-1 bg-background/50 border border-border/50 rounded-lg py-2 px-3 text-sm font-medium text-foreground outline-none cursor-default truncate"
            />
            <Button onClick={copyToClipboard} size="icon" variant="secondary" className="h-9 w-9 rounded-lg shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={generateNewEmail} disabled={isGenerating} size="icon" variant="outline" className="h-9 w-9 rounded-lg shrink-0">
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-border/50 flex items-center justify-between shrink-0 bg-background/40">
        <div className="flex items-center gap-2">
          <InboxIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight">Inbox</span>
        </div>
        <Badge variant="secondary" className="px-2 py-0 text-[10px] rounded-full">
          {messages.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center animate-in fade-in duration-500">
            <div className="h-12 w-12 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
              <Mailbox className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">Inbox is empty</p>
            <p className="text-xs mt-1">Waiting for emails...</p>
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1">
            {messages.map((message) => {
              const isActive = currentMessageId === message._id;
              return (
                <div
                  key={message._id}
                  onClick={() => setCurrentMessageId(message._id)}
                  className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card hover:bg-secondary border-transparent hover:border-border/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`font-semibold text-sm truncate pr-2 ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                      {message.from}
                    </span>
                    <span className={`text-[10px] whitespace-nowrap pt-0.5 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {formatTime(message.receivedAt)}
                    </span>
                  </div>
                  <p className={`font-medium mb-1 text-xs truncate ${isActive ? "text-primary-foreground/90" : "text-foreground/90"}`}>
                    {message.subject || "(No Subject)"}
                  </p>
                  <p className={`text-xs truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {message.text?.slice(0, 60) || "No text content"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const emailViewContent = (
    <div className="flex flex-col h-full w-full bg-card/30 relative min-w-0">
      {!currentMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
          <div className="h-16 w-16 bg-background rounded-2xl shadow-xl shadow-primary/5 border border-border/50 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-lg font-medium text-foreground">Select an email to read</p>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 sm:p-6 border-b border-border/50 bg-background/40 shrink-0">
            <div className="flex items-center gap-3 mb-4 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMessageId(null)} className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Back to Inbox</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 leading-tight break-words">
              {currentMessage.subject || "(No Subject)"}
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
              <div className="flex items-center text-foreground/80 bg-background/50 px-3 py-2 rounded-md border border-border/50">
                <User className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                <span className="font-medium mr-2">From:</span>
                <span className="truncate max-w-[200px]">{currentMessage.from}</span>
              </div>
              <div className="flex items-center text-foreground/80 bg-background/50 px-3 py-2 rounded-md border border-border/50 w-fit">
                <Clock className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                <span className="font-medium mr-2">Received:</span>
                <span>{new Date(currentMessage.receivedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              {currentMessage.html ? (
                <div className="bg-white text-black p-4 sm:p-6 rounded-lg border shadow-sm overflow-x-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(currentMessage.html),
                    }}
                    className="email-content prose max-w-none prose-sm"
                  />
                </div>
              ) : (
                <div className="bg-background/50 border border-border/50 p-4 sm:p-6 rounded-lg whitespace-pre-wrap text-foreground/90 font-mono text-xs shadow-inner">
                  {currentMessage.text}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen max-h-screen bg-background text-foreground font-poppins flex flex-col w-screen overflow-hidden selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <nav className="h-14 border-b border-border/40 bg-background/60 backdrop-blur-xl shrink-0">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Temp<span className="text-primary font-bold">Mail</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground hidden sm:flex">
             <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Expires in 15m</span>
             </div>
          </div>

          <a href="https://github.com/Rudra78996/tempmail" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-2 rounded-full border-border/50 hover:bg-secondary/80 hover:text-primary transition-all h-8 text-xs">
              <Github className="h-3 w-3" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
          </a>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden p-2 sm:p-4 relative">
        <div className="h-full w-full border border-border/50 bg-card/40 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden relative">
            {isMobile ? (
              // Mobile View
              <div className="h-full w-full">
                {currentMessageId ? emailViewContent : inboxListContent}
              </div>
            ) : (
              // Desktop View: Custom bulletproof resizable layout
              <div className="flex h-full w-full">
                <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden shrink-0">
                  {inboxListContent}
                </div>
                <div 
                  onMouseDown={() => setIsDragging(true)}
                  className={`w-1.5 shrink-0 bg-border hover:bg-primary transition-colors cursor-col-resize z-10 ${isDragging ? 'bg-primary' : ''}`}
                />
                <div style={{ width: `calc(100% - ${leftWidth}%)` }} className="h-full overflow-hidden shrink-0">
                  {emailViewContent}
                </div>
              </div>
            )}
        </div>
      </main>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          },
        }}
      />
    </div>
  );
}
