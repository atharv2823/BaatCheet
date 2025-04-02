"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Load chats from localStorage on component mount
  useEffect(() => {
    const savedChats = JSON.parse(
      localStorage.getItem("baatcheet-chats") || "[]"
    );
    setChats(savedChats);

    // Load last chat if exists
    if (savedChats.length > 0) {
      const lastChat = savedChats[savedChats.length - 1];
      setCurrentChatId(lastChat.id);
      setMessages(lastChat.messages);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("baatcheet-chats", JSON.stringify(chats));
  }, [chats]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input;
    setInput("");

    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      setChats((prev) => [...prev, { id: newChatId, messages: [] }]);
    }

    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      const newMessages = [
        ...updatedMessages,
        { role: "assistant", content: text },
      ];
      setMessages(newMessages);

      // Update chats in storage
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
        )
      );
    } catch (error) {
      console.error("Error:", error);
      const errorMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ];
      setMessages(errorMessages);
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: errorMessages }
            : chat
        )
      );
    }
    setIsLoading(false);
  }

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setMessages([]);
    setInput("");
    setChats((prev) => [...prev, { id: newChatId, messages: [] }]);
  };

  const loadChat = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
    setIsLoading(false);
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSubmit({ preventDefault: () => {} });
  };

   const handleDeleteChat = (chatId, e) => {
     e.preventDefault();
     e.stopPropagation();
     setChats((prev) => prev.filter((chat) => chat.id !== chatId));
     if (currentChatId === chatId) {
       setCurrentChatId(null);
       setMessages([]);
     }
   };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Chat List Dropdown */}
        <div className="mb-4">
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200"
              >
                <button
                  onClick={() => loadChat(chat.id)}
                  className={`flex-1 text-left px-2 py-1 ${
                    currentChatId === chat.id
                      ? "text-[#00B5B5]"
                      : "text-gray-700"
                  }`}
                >
                  {chat.messages && chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 50) +
                      (chat.messages[0].content.length > 50 ? "..." : "")
                    : `New Chat (${new Date(
                        parseInt(chat.id)
                      ).toLocaleString()})`}
                </button>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  title="Delete chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/baatcheet-logo.png"
                alt="BaatCheet Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-xl font-semibold text-[#00B5B5]">
                BaatCheet
              </span>
            </div>
            <button
              onClick={handleNewChat}
              className="text-[#00B5B5] hover:text-[#009595] flex items-center gap-2 px-3 py-1 rounded-full border border-[#00B5B5] hover:bg-[#00B5B5]/5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </button>
          </div>

          {/* Update the pulsing orb colors to match the brand */}
          <div className="flex flex-col items-center justify-center space-y-4 mb-6">
            {messages.length === 0 ? (
              <>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00B5B5] to-[#008080] shadow-lg flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#00B5B5] animate-pulse"></div>
                </div>

                <p className="text-gray-600 text-center">
                  What do you want to know?
                </p>

                <div className="flex flex-col gap-2 w-full max-w-sm">
                  <button
                    onClick={() => handleSuggestionClick("Generate a summary")}
                    className="w-full bg-white text-gray-700 border border-gray-200 rounded-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Generate Summary
                  </button>
                  <button
                    onClick={() =>
                      handleSuggestionClick(
                        "Are they a good fit for my job post?"
                      )
                    }
                    className="w-full bg-white text-gray-700 border border-gray-200 rounded-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Are they a good fit for my job post?
                  </button>
                  <button
                    onClick={() =>
                      handleSuggestionClick("What is their training style?")
                    }
                    className="w-full bg-white text-gray-700 border border-gray-200 rounded-full px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    What is their training style?
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-[#00B5B5] flex items-center justify-center mr-2">
                        <Image
                          src="/baatcheet-logo.png"
                          alt="BaatCheet"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 relative group shadow-sm ${
                        message.role === "user"
                          ? "bg-[#00B5B5] text-white rounded-br-none"
                          : "bg-white border border-gray-100 rounded-bl-none"
                      }`}
                    >
                      <div
                        className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          message.role === "user" ? "text-white" : "text-black"
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.role === "assistant" && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(message.content)
                          }
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-full"
                          title="Copy response"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-[#00B5B5] flex items-center justify-center ml-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#00B5B5] flex items-center justify-center">
                      <Image
                        src="/baatcheet-logo.png"
                        alt="BaatCheet"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg rounded-bl-none p-4 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#00B5B5] animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-[#00B5B5] animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-[#00B5B5] animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full border border-gray-200 rounded-full px-4 py-2 pr-20 focus:outline-none focus:border-green-500 text-black"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 px-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
