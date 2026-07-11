import { useState } from "react";
import DOMPurify from "dompurify";
import {
  Inbox as InboxIcon,
  Mail,
  Clock,
  User,
  Mailbox,
  ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  const [currentMessageId, setCurrentMessageId] = useState(null);
  
  const currentMessage = messages.find(m => m._id === currentMessageId);

  return (
    <Card className="h-[600px] w-full max-w-6xl hidden md:flex border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
      {/* Sidebar - Message List */}
      <div className="w-2/5 flex flex-col bg-background/50 border-r border-border/50 relative">
        <div className="p-5 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <InboxIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Inbox</h2>
          </div>
          <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full font-medium">
            {messages.length}
          </Badge>
        </div>

        <ScrollArea className="flex-1">
          {messages.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center animate-in fade-in duration-500">
              <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                <Mailbox className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium text-foreground">Inbox is empty</p>
              <p className="text-sm mt-1">Waiting for incoming emails...</p>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {messages.map((message) => {
                const isActive = currentMessageId === message._id;
                return (
                  <div
                    key={message._id}
                    onClick={() => setCurrentMessageId(message._id)}
                    className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card hover:bg-secondary border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-semibold truncate pr-4 ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                        {message.from}
                      </span>
                      <span className={`text-xs whitespace-nowrap pt-1 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {formatTime(message.receivedAt)}
                      </span>
                    </div>
                    <p className={`font-medium mb-1 truncate text-sm ${isActive ? "text-primary-foreground/90" : "text-foreground/90"}`}>
                      {message.subject || "(No Subject)"}
                    </p>
                    <p className={`text-sm truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.text?.slice(0, 80) || "No text content"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content - Message View */}
      <div className="w-3/5 flex flex-col bg-card/30 relative">
        {!currentMessage ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            <div className="h-20 w-20 bg-background rounded-2xl shadow-xl shadow-primary/5 border border-border/50 flex items-center justify-center mb-6 animate-pulse">
              <Mail className="h-10 w-10 text-primary/40" />
            </div>
            <p className="text-xl font-medium text-foreground">Select an email to read</p>
            <p className="text-sm mt-2 max-w-sm">
              Click on any email from the list on the left to view its full contents here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-8 border-b border-border/50 bg-background/40">
              <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">
                {currentMessage.subject || "(No Subject)"}
              </h2>

              <div className="flex flex-col gap-3">
                <div className="flex items-center text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50">
                  <User className="h-4 w-4 mr-3 text-primary" />
                  <span className="font-medium mr-2 text-foreground">From:</span>
                  <span className="truncate">{currentMessage.from}</span>
                </div>

                <div className="flex items-center text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50 w-fit">
                  <Clock className="h-4 w-4 mr-3 text-primary" />
                  <span className="font-medium mr-2 text-foreground">Received:</span>
                  <span>{new Date(currentMessage.receivedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8">
                {currentMessage.html ? (
                  <div className="bg-white text-black p-6 rounded-xl border shadow-inner overflow-x-auto email-content-wrapper">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(currentMessage.html),
                      }}
                      className="email-content prose max-w-none prose-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-background/50 border border-border/50 p-6 rounded-xl whitespace-pre-wrap text-foreground/90 font-mono text-sm shadow-inner">
                    {currentMessage.text}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </Card>
  );
};
