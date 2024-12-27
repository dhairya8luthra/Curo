import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Welcome to MediChat AI Doctor. Please note that I am an AI assistant and not a real doctor. I can provide general health information, but for any serious concerns, always consult with a qualified healthcare professional.",
};

export default function MediChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      // Simulate an AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "This is a simulated response. In a real application, this would be the response from the AI.",
          },
        ]);
      }, 800);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center">
  <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl rounded-xl bg-white/90 backdrop-blur-lg border border-gray-200">
    {/* Header */}
    <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-400 text-white rounded-t-xl p-4 shadow-md">
      <CardTitle className="text-center text-2xl font-bold">
        MediChat - AI Doctor
      </CardTitle>
      <p className="text-center text-sm text-gray-100 mt-1">
        Remember: I’m not a real doctor. For serious concerns, consult a healthcare professional.
      </p>
    </CardHeader>

    {/* Chat Messages */}
    <CardContent className="flex flex-col flex-grow h-full">
      <div
        className="flex-grow overflow-y-auto p-4 space-y-4"
        ref={scrollRef}
        style={{ maxHeight: "70vh" }}
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const bubbleClasses = isUser
            ? "bg-blue-500 text-white shadow-lg rounded-br-lg rounded-tl-lg"
            : "bg-gray-100 text-gray-800 shadow-md rounded-bl-lg rounded-tr-lg";

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-2 ${isUser ? "flex-row-reverse" : ""}`}>
                <Avatar
                  className={`${
                    isUser ? "ml-3" : "mr-3"
                  } h-10 w-10 shadow-md`}
                >
                  <AvatarImage src="" alt="Avatar" />
                  <AvatarFallback>
                    {isUser ? <User /> : <Bot />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-sm px-4 py-2 ${bubbleClasses} transform transition-transform hover:scale-105`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="bg-gray-50 rounded-b-xl flex items-center p-4 border-t border-gray-200 shadow-inner">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          onClick={handleSend}
          className="ml-4 bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105 rounded-full p-3"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
  );
}
