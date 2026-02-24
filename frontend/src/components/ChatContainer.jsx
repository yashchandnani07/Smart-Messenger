import React, { useContext, useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import SummaryModal from "./SummaryModal";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessages,
    getMessages,
    generateSummary,
    transcribeAudio,
    getSmartReplies,
    translateMessage,
    rewriteMessage,
  } = useContext(ChatContext);
  const { authUser, onlineUsers, socket } = useContext(AuthContext);
  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // --- Feature: Typing Indicator ---
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // --- Feature: Voice Messages ---
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // --- Feature: Smart Replies ---
  const [smartReplies, setSmartReplies] = useState([]);

  // --- Feature: Message Translation ---
  // translations = { [msgIndex]: "translated text" | "loading" }
  const [translations, setTranslations] = useState({});

  // --- Feature: AI Rewrite ---
  const [isRewriting, setIsRewriting] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
    await sendMessages({ text: input.trim() });
    setInput("");
    setSmartReplies([]);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !selectedUser) return;
    socket.emit("typing", { receiverId: selectedUser._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessages({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSummary = async () => {
    if (!selectedUser) {
      toast.error("Please select a conversation first");
      return;
    }
    setShowSummaryModal(true);
    setSummaryLoading(true);
    setSummary("");
    try {
      const result = await generateSummary(selectedUser._id, authUser.fullName);
      if (result.success) {
        setSummary(result.summary);
        setMessageCount(result.messageCount || 0);
      } else {
        toast.error(result.message || "Failed to generate summary");
        setShowSummaryModal(false);
      }
    } catch (error) {
      toast.error("Failed to generate summary");
      setShowSummaryModal(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isTranscribing) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioChunksRef.current = [];
        const result = await transcribeAudio(audioBlob);
        setIsTranscribing(false);
        if (result.success && result.text) {
          setInput(result.text.trim());
          toast.success("Voice transcribed!");
        } else {
          toast.error(result.message || "Could not transcribe audio");
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const handleTranslate = async (index, text) => {
    // Toggle off if already translated
    if (translations[index] && translations[index] !== "loading") {
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      return;
    }
    setTranslations((prev) => ({ ...prev, [index]: "loading" }));
    const result = await translateMessage(text);
    if (result.success) {
      setTranslations((prev) => ({ ...prev, [index]: result.translatedText }));
    } else {
      setTranslations((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleRewrite = async (tone) => {
    if (!input.trim() || isRewriting) return;
    setIsRewriting(true);
    const result = await rewriteMessage(input.trim(), tone);
    if (result.success) setInput(result.rewrittenText);
    setIsRewriting(false);
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      setIsTyping(false);
      setSmartReplies([]);
    }
  }, [selectedUser]);

  // Typing socket listeners
  useEffect(() => {
    if (!socket) return;
    const onTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
    };
    const onStopTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(false);
    };
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStopTyping);
    return () => {
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStopTyping);
    };
  }, [socket, selectedUser]);

  // Smart replies — trigger when the last message is from the other user
  useEffect(() => {
    if (!messages || messages.length === 0 || !authUser) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== authUser._id) {
      const recentText = messages
        .filter((m) => m.text)
        .slice(-5)
        .map((m) => ({
          sender: m.senderId === authUser._id ? "Me" : "Them",
          text: m.text,
        }));
      if (recentText.length > 0) {
        getSmartReplies(recentText).then((res) => {
          if (res.success && res.replies) setSmartReplies(res.replies);
        });
      }
    } else {
      setSmartReplies([]);
    }
  }, [messages, authUser]);

  // Auto-scroll
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 flex-shrink-0">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <button
          onClick={handleGenerateSummary}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-1 rounded-full transition-colors mr-2"
          title="Generate Chat Summary"
        >
          📋 Summary
        </button>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className=".md:hidden max-w-7" />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* Chat area — flex-1 fills all space between header and bottom bar */}
      <div className="flex-1 overflow-y-scroll p-3 pb-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && "flex-row-reverse"
              }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <div className={`flex flex-col mb-8 ${msg.senderId === authUser._id ? "items-end" : "items-start"}`}>
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </p>
                {/* Translate button */}
                <button
                  onClick={() => handleTranslate(index, msg.text)}
                  className="text-[10px] text-gray-400 hover:text-violet-300 transition-colors mt-0.5 px-1"
                  title="Translate to English"
                >
                  {translations[index] === "loading" ? "⏳" : translations[index] ? "✕ hide" : "🌐 translate"}
                </button>
                {/* Translation result */}
                {translations[index] && translations[index] !== "loading" && (
                  <p className="text-[11px] text-gray-300 italic mt-1 max-w-[200px] break-words px-1 bg-white/5 rounded-md py-1">
                    {translations[index]}
                  </p>
                )}
              </div>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-end gap-2 justify-end flex-row-reverse mb-4">
            <div className="px-4 py-3 rounded-lg bg-violet-500/30 rounded-bl-none flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
            </div>
            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-7 rounded-full" />
          </div>
        )}

        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom section — stacks naturally below chat area */}
      <div className="flex-shrink-0">
        {/* Smart reply chips */}
        {smartReplies.length > 0 && (
          <div className="flex gap-2 px-4 pt-2 pb-1 overflow-x-auto">
            {smartReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(reply);
                  setSmartReplies([]);
                }}
                className="text-xs px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 text-white rounded-full transition-all flex-shrink-0 whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* AI Rewrite tone buttons — only show when input has text */}
        {input.trim().length > 0 && (
          <div className="flex items-center gap-2 px-4 pt-1 pb-1 overflow-x-auto">
            <span className="text-[10px] text-gray-500 flex-shrink-0">Rewrite:</span>
            {[
              { tone: "professional", label: "💼 Professional" },
              { tone: "casual", label: "😊 Casual" },
              { tone: "funny", label: "😂 Funny" },
            ].map(({ tone, label }) => (
              <button
                key={tone}
                onClick={() => handleRewrite(tone)}
                disabled={isRewriting}
                className="text-[10px] px-3 py-1 bg-white/8 hover:bg-white/15 border border-gray-600/50 text-gray-300 hover:text-white rounded-full transition-all flex-shrink-0 whitespace-nowrap disabled:opacity-50"
              >
                {isRewriting ? "⏳" : label}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="flex items-center gap-3 p-3">
          <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
            <input
              onChange={handleInputChange}
              value={input}
              onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
              type="text"
              placeholder="send a message"
              className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            />
            <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
            <label htmlFor="image">
              <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
            </label>

            {/* Mic button */}
            <button
              type="button"
              onClick={handleVoiceRecord}
              disabled={isTranscribing}
              title={isRecording ? "Stop recording" : "Record voice message"}
              className={`mr-2 flex items-center justify-center w-6 h-6 rounded-full transition-all ${isRecording
                ? "text-red-400 animate-pulse"
                : isTranscribing
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-300 hover:text-white"
                }`}
            >
              {isTranscribing ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : isRecording ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 1a4 4 0 014 4v7a4 4 0 01-8 0V5a4 4 0 014-4zm0 18a7 7 0 007-7h-2a5 5 0 01-10 0H5a7 7 0 007 7zm-1 2h2v2h-2v-2z" />
                </svg>
              )}
            </button>
          </div>

          <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
        </div>
      </div>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        summary={summary}
        loading={summaryLoading}
        messageCount={messageCount}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src="/favicon.svg" alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
