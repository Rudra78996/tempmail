import { useState } from "react";
import DOMPurify from "dompurify";
import {
  Inbox as InboxIcon,
  ArrowLeft,
  Clock,
  User,
  Mailbox,
  Mail
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export const MobileInbox = ({ messages }) => {
  const [currentMessageId, setCurrentMessageId] = useState(null);
  
  const currentMessage = messages.find(m => m._id === currentMessageId);

  const onClickBackHandler = () => setCurrentMessageId(null);

  return (
    <Card className="md:hidden h-[600px] w-full border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl flex flex-col relative">
      {!currentMessage ? (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <InboxIcon className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
            </div>
            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full font-medium">
              {messages.length}
            </Badge>
          </div>

          <ScrollArea className="flex-1 bg-background/30">
            {messages.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                  <Mailbox className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-lg font-medium text-foreground">No messages found</p>
                <p className="text-sm mt-1">Waiting for incoming emails...</p>
              </div>
            ) : (
              <div className="p-3 flex flex-col gap-2">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => setCurrentMessageId(message._id)}
                    className="group p-4 rounded-xl cursor-pointer transition-all duration-200 border bg-card hover:bg-secondary border-border/50 hover:border-border active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-foreground truncate pr-4">
                        {message.from}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                        {formatTime(message.receivedAt)}
                      </span>
                    </div>
                    <p className="font-medium text-foreground/90 mb-1 truncate text-sm">
                      {message.subject || "(No Subject)"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {message.text?.slice(0, 60) || "No text content"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClickBackHandler}
              className="rounded-full hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-foreground truncate flex-1 pr-4">
              {currentMessage.subject || "(No Subject)"}
            </h2>
          </div>

          <ScrollArea className="flex-1 bg-card/30">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2 bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center text-sm text-foreground/80">
                  <User className="h-4 w-4 mr-3 text-primary shrink-0" />
                  <span className="font-medium mr-2 text-foreground">From:</span>
                  <span className="truncate">{currentMessage.from}</span>
                </div>
                <div className="flex items-center text-sm text-foreground/80">
                  <Clock className="h-4 w-4 mr-3 text-primary shrink-0" />
                  <span className="font-medium mr-2 text-foreground">Time:</span>
                  <span>{new Date(currentMessage.receivedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-2">
                {currentMessage.html ? (
                  <div className="bg-white text-black p-4 sm:p-6 rounded-xl border shadow-inner overflow-x-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(currentMessage.html),
                      }}
                      className="email-content prose max-w-none prose-sm"
                    />
                  </div>
                ) : (
                  <div className="bg-background/50 border border-border/50 p-4 rounded-xl whitespace-pre-wrap text-foreground/90 font-mono text-sm shadow-inner overflow-x-auto">
                    {currentMessage.text}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
};
