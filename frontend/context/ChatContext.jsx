import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //function to get all users for side bar
  const getUsers = async () => {
    try {
      const { data } = await axios.get(`/api/messages/users`);
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to get messages for selected users

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to send message to selected user
  const sendMessages = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to subscribe to messages for selected user
  const subscribeToMessage = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  //function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  //function to generate chat summary
  const generateSummary = async (conversationId, user) => {
    try {
      const response = await axios.post("/api/summary/generate", {
        conversationId,
        user,
      });
      return response.data;
    } catch (error) {
      toast.error("Failed to generate summary");
      return { success: false, message: error.message };
    }
  };

  //function to transcribe audio using Groq Whisper
  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice.webm");
      const { data } = await axios.post("/api/voice/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      toast.error("Transcription failed");
      return { success: false, message: error.message };
    }
  };

  //function to get smart replies
  const getSmartReplies = async (lastMessages) => {
    try {
      const response = await axios.post("/api/smart-reply/generate", { lastMessages });
      return response.data;
    } catch (error) {
      toast.error("Failed to generate smart replies");
      return { success: false, message: error.message };
    }
  };

  //function to translate a message via Groq
  const translateMessage = async (text, targetLanguage = "English") => {
    try {
      const { data } = await axios.post("/api/translate/translate", { text, targetLanguage });
      return data;
    } catch (error) {
      toast.error("Translation failed");
      return { success: false, message: error.message };
    }
  };

  //function to rewrite a message in a given tone via Groq
  const rewriteMessage = async (text, tone) => {
    try {
      const { data } = await axios.post("/api/rewrite/rewrite", { text, tone });
      return data;
    } catch (error) {
      toast.error("Rewrite failed");
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    subscribeToMessage();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    generateSummary,
    transcribeAudio,
    getSmartReplies,
    translateMessage,
    rewriteMessage,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
