import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import io from "socket.io-client";
import ServerSidebar from "./components/ServerSidebar";
import ChannelContent from "./components/ChannelContent";
import MembersList from "./components/MembersList";
import CreateChannelModal from "./components/CreateChannelModal";
import CreateCategoryModal from "./components/CreateCategoryModal";
import ServerSettingsModal from "./components/ServerSettingsModal";
import "./Server.css";

const Server = () => {
  const { serverId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useRef();
  
  const [server, setServer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageReplying, setMessageReplying] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [memberPermissions, setMemberPermissions] = useState({
    canManageChannels: false,
    canManageServer: false,
    canManageMessages: false
  });

  // Connect to socket server
  useEffect(() => {
    socket.current = io("http://localhost:8800");
    
    // Listen for real-time events
    socket.on("message-edited", handleMessageEdited);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("reaction-updated", handleReactionUpdated);
    socket.on("pin-updated", handlePinUpdated);
    socket.on("thread-created", handleThreadCreated);
    socket.on("typing-update", handleTypingUpdate);
    socket.on("get-users", handleUsersUpdate);
    socket.on("voice-state-updated", handleVoiceStateUpdated);
    socket.on("user-mentioned", handleUserMentioned);
    
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Join server socket room when serverId changes
  useEffect(() => {
    if (!serverId || !socket.current) return;
    
    // Leave previous server if any
    if (server && server._id !== serverId) {
      socket.current.emit("leave-server", server._id);
    }
    
    // Join new server room
    socket.current.emit("join-server", serverId);
    
    // Fetch server data
    fetchServerData();
    
    return () => {
      if (serverId) {
        socket.current.emit("leave-server", serverId);
      }
    };
  }, [serverId]);

  // Join channel socket room when selectedChannel changes
  useEffect(() => {
    if (!selectedChannel || !socket.current) return;
    
    // Join channel room
    socket.current.emit("join-channel", selectedChannel._id);
    
    // Fetch channel messages
    fetchChannelMessages();
    
    // Fetch pinned messages
    fetchPinnedMessages();
    
    return () => {
      if (selectedChannel) {
        socket.current.emit("leave-channel", selectedChannel._id);
      }
    };
  }, [selectedChannel]);

  // Socket event handlers
  const handleMessageEdited = (data) => {
    if (selectedChannel && data.channelId === selectedChannel._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, text: data.text, isEdited: true, editedAt: data.editedAt, mentions: data.mentions }
            : msg
        )
      );
    }
  };

  const handleMessageDeleted = (data) => {
    if (selectedChannel && data.channelId === selectedChannel._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isDeleted: true }
            : msg
        )
      );
    }
  };

  const handleReactionUpdated = (data) => {
    if (selectedChannel && data.channelId === selectedChannel._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    }
  };

  const handlePinUpdated = (data) => {
    if (selectedChannel && data.channelId === selectedChannel._id) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isPinned: data.isPinned }
            : msg
        )
      );
      
      // Refresh pinned messages
      fetchPinnedMessages();
    }
  };

  const handleThreadCreated = (data) => {
    if (selectedChannel) {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.parentMessageId 
            ? { ...msg, threadId: data.threadId }
            : msg
        )
      );
    }
  };

  const handleTypingUpdate = (data) => {
    if (selectedChannel && data.chatId === selectedChannel._id) {
      setTypingUsers(data.typingUsers.filter(id => id !== user._id));
    }
  };

  const handleUsersUpdate = (users) => {
    setOnlineUsers(users);
  };

  const handleVoiceStateUpdated = (data) => {
    // Update voice channel state
    setChannels(prev => 
      prev.map(channel => 
        channel._id === data.channelId && channel.type === "voice"
          ? { ...channel, activeUsers: data.users }
          : channel
      )
    );
  };

  const handleUserMentioned = (data) => {
    // Handle notifications when user is mentioned
    if (data.senderId !== user._id) {
      // Show a notification
      const notification = new Notification(`You were mentioned in ${server?.name}`, {
        body: data.text,
        icon: server?.iconUrl || "/discord-icon.png"
      });
      
      notification.onclick = () => {
        navigate(`/server/${serverId}/channel/${data.channelId}`);
      };
    }
  };

  // API calls
  const fetchServerData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/server/${serverId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServer(data.server);
        setCategories(data.categories);
        setChannels(data.channels);
        
        // Set default selected channel if none is selected
        if (!selectedChannel && data.channels.length > 0) {
          const textChannels = data.channels.filter(c => c.type === "text");
          if (textChannels.length > 0) {
            setSelectedChannel(textChannels[0]);
          }
        }
        
        // Set members
        setMembers(data.server.members);
        
        // Calculate user permissions
        calculatePermissions(data.server);
      } else {
        console.error("Failed to fetch server data");
      }
    } catch (error) {
      console.error("Error fetching server data:", error);
    }
  };

  const fetchChannelMessages = async () => {
    if (!selectedChannel) return;
    
    try {
      const response = await fetch(`http://localhost:3000/message?channelId=${selectedChannel._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch channel messages");
      }
    } catch (error) {
      console.error("Error fetching channel messages:", error);
    }
  };

  const fetchPinnedMessages = async () => {
    if (!selectedChannel) return;
    
    try {
      const response = await fetch(`http://localhost:3000/message/${selectedChannel._id}/pinned`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPinnedMessages(data);
      } else {
        console.error("Failed to fetch pinned messages");
      }
    } catch (error) {
      console.error("Error fetching pinned messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChannel) return;
    
    try {
      // Extract mentions from text
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        const mentionedMember = members.find(m => 
          m.nickname?.toLowerCase() === match[1].toLowerCase() || 
          m.userId.toLowerCase() === match[1].toLowerCase()
        );
        
        if (mentionedMember) {
          mentions.push(mentionedMember.userId);
        }
      }
      
      const messageData = {
        channelId: selectedChannel._id,
        serverId: serverId,
        senderId: user._id,
        text: newMessage,
        mentions,
        replyTo: messageReplying ? messageReplying._id : null,
        formattingType: newMessage.includes("```") ? "markdown" : "plaintext"
      };
      
      const response = await fetch("http://localhost:3000/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(messageData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data]);
        setNewMessage("");
        setMessageReplying(null);
        
        // Clear typing indication
        socket.current.emit("typing", {
          chatId: selectedChannel._id,
          userId: user._id,
          isTyping: false
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // User actions
  const handleMessageEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.text);
  };

  const saveMessageEdit = async () => {
    if (!editingMessage || !newMessage.trim()) return;
    
    try {
      // Extract mentions from text
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(newMessage)) !== null) {
        const mentionedMember = members.find(m => 
          m.nickname?.toLowerCase() === match[1].toLowerCase() || 
          m.userId.toLowerCase() === match[1].toLowerCase()
        );
        
        if (mentionedMember) {
          mentions.push(mentionedMember.userId);
        }
      }
      
      const response = await fetch(`http://localhost:3000/message/${editingMessage._id}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          text: newMessage,
          userId: user._id,
          mentions,
          formattingType: newMessage.includes("```") ? "markdown" : "plaintext"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data._id ? data : msg
          )
        );
        
        // Broadcast the edit via socket
        socket.current.emit("edit-message", {
          messageId: editingMessage._id,
          text: newMessage,
          senderId: user._id,
          channelId: selectedChannel._id,
          serverId: serverId,
          mentions
        });
        
        // Reset edit state
        setEditingMessage(null);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleMessageDelete = async (message) => {
    if (!message) return;
    
    try {
      const response = await fetch(`http://localhost:3000/message/${message._id}/delete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user._id
        })
      });
      
      if (response.ok) {
        // Broadcast the deletion via socket
        socket.current.emit("delete-message", {
          messageId: message._id,
          senderId: user._id,
          channelId: selectedChannel._id,
          serverId: serverId
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleReaction = async (message, emoji) => {
    try {
      const response = await fetch(`http://localhost:3000/message/${message._id}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          emoji,
          userId: user._id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Broadcast the reaction via socket
        socket.current.emit("add-reaction", {
          messageId: message._id,
          emoji,
          userId: user._id,
          channelId: selectedChannel._id,
          serverId: serverId
        });
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handlePinMessage = async (message) => {
    try {
      const response = await fetch(`http://localhost:3000/message/${message._id}/pin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user._id,
          channelId: selectedChannel._id
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Broadcast the pin via socket
        socket.current.emit("pin-message", {
          messageId: message._id,
          userId: user._id,
          channelId: selectedChannel._id,
          serverId: serverId
        });
      }
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const createThread = async (message, title, initialMessage) => {
    try {
      const response = await fetch(`http://localhost:3000/message/${message._id}/thread`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user._id,
          title,
          initialMessage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Broadcast the thread creation via socket
        socket.current.emit("create-thread", {
          messageId: message._id,
          userId: user._id,
          title,
          initialMessage,
          threadId: data._id
        });
        
        // Navigate to thread
        navigate(`/server/${serverId}/channel/${selectedChannel._id}/thread/${data._id}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Check for mention suggestions
    const lastWord = e.target.value.split(" ").pop();
    if (lastWord.startsWith("@")) {
      const query = lastWord.substring(1).toLowerCase();
      setMentionQuery(query);
      
      if (query) {
        const filteredMembers = members.filter(m => 
          (m.nickname?.toLowerCase().includes(query) || 
           m.userId.toLowerCase().includes(query)) && 
          m.userId !== user._id
        );
        setMentionSuggestions(filteredMembers.slice(0, 5));
      } else {
        setMentionSuggestions([]);
      }
    } else {
      setMentionSuggestions([]);
    }
    
    // Emit typing status
    socket.current.emit("typing", {
      chatId: selectedChannel._id,
      userId: user._id,
      isTyping: true
    });
    
    // Clear typing status after 2 seconds of inactivity
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.current.emit("typing", {
        chatId: selectedChannel._id,
        userId: user._id,
        isTyping: false
      });
    }, 2000);
  };

  const applyMention = (member) => {
    const words = newMessage.split(" ");
    words.pop(); // Remove the partial @mention
    const newText = [...words, `@${member.nickname || member.userId}`].join(" ") + " ";
    setNewMessage(newText);
    setMentionSuggestions([]);
  };

  // Permission calculation
  const calculatePermissions = (server) => {
    if (!server || !user) return;
    
    // Find the current user in members
    const currentMember = server.members.find(m => m.userId === user._id);
    if (!currentMember) return;
    
    // Check if user is owner
    const isOwner = server.ownerId === user._id;
    
    // Default permissions
    let permissions = {
      canManageChannels: isOwner,
      canManageServer: isOwner,
      canManageMessages: isOwner
    };
    
    // Check role permissions
    currentMember.roles.forEach(roleId => {
      const role = server.roles.find(r => r._id.toString() === roleId);
      if (role) {
        if (role.permissions.administrator) {
          permissions = {
            canManageChannels: true,
            canManageServer: true,
            canManageMessages: true
          };
        } else {
          permissions.canManageChannels = permissions.canManageChannels || role.permissions.manageChannels;
          permissions.canManageServer = permissions.canManageServer || role.permissions.manageServer;
          permissions.canManageMessages = permissions.canManageMessages || role.permissions.manageMessages;
        }
      }
    });
    
    setMemberPermissions(permissions);
  };

  return (
    <div className="server-container">
      <ServerSidebar 
        server={server}
        categories={categories}
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        onCreateChannel={() => setShowCreateChannelModal(true)}
        onCreateCategory={() => setShowCreateCategoryModal(true)}
        onServerSettings={() => setShowServerSettingsModal(true)}
        permissions={memberPermissions}
      />
      
      <ChannelContent 
        channel={selectedChannel}
        messages={messages}
        pinnedMessages={pinnedMessages}
        showPinnedMessages={showPinnedMessages}
        onTogglePinnedMessages={() => setShowPinnedMessages(!showPinnedMessages)}
        newMessage={newMessage}
        onNewMessageChange={handleTyping}
        onSendMessage={sendMessage}
        onEditMessage={handleMessageEdit}
        onDeleteMessage={handleMessageDelete}
        onReactToMessage={handleReaction}
        onPinMessage={handlePinMessage}
        onCreateThread={createThread}
        onReplyToMessage={setMessageReplying}
        replyingTo={messageReplying}
        onCancelReply={() => setMessageReplying(null)}
        editingMessage={editingMessage}
        onSaveEdit={saveMessageEdit}
        onCancelEdit={() => setEditingMessage(null)}
        typingUsers={typingUsers}
        mentionSuggestions={mentionSuggestions}
        onSelectMention={applyMention}
        server={server}
        currentUser={user}
        permissions={memberPermissions}
      />
      
      <MembersList 
        members={members} 
        server={server}
        onlineUsers={onlineUsers}
      />
      
      {showCreateChannelModal && (
        <CreateChannelModal 
          serverId={serverId}
          categories={categories}
          onClose={() => setShowCreateChannelModal(false)}
          onCreated={fetchServerData}
        />
      )}
      
      {showCreateCategoryModal && (
        <CreateCategoryModal 
          serverId={serverId}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={fetchServerData}
        />
      )}
      
      {showServerSettingsModal && (
        <ServerSettingsModal 
          server={server}
          onClose={() => setShowServerSettingsModal(false)}
          onUpdated={fetchServerData}
          permissions={memberPermissions}
        />
      )}
    </div>
  );
};

export default Server; 