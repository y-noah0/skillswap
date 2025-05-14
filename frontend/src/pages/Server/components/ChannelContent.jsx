import { useState, useEffect, useRef } from 'react';
import { 
  FaHashtag, 
  FaVolumeUp, 
  FaUserPlus, 
  FaEllipsisH, 
  FaSmile, 
  FaPaperclip,
  FaEdit,
  FaTrash,
  FaReply,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaThumbtack,
  FaCommentAlt
} from 'react-icons/fa';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';
import './ChannelContent.css';
import MessageItem from './MessageItem';
import PinnedMessages from './PinnedMessages';
import MentionSuggestions from './MentionSuggestions';

const ChannelContent = ({
  channel,
  messages,
  pinnedMessages,
  showPinnedMessages,
  onTogglePinnedMessages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onPinMessage,
  onCreateThread,
  onReplyToMessage,
  replyingTo,
  onCancelReply,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
  typingUsers,
  mentionSuggestions,
  onSelectMention,
  server,
  currentUser,
  permissions
}) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [messageContextMenuPos, setMessageContextMenuPos] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);
  
  // Focus input when editing a message
  useEffect(() => {
    if (editingMessage && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [editingMessage]);
  
  // Handle scroll to track if user is at bottom
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setIsAtBottom(atBottom);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Show scroll to bottom button if not at bottom
  const renderScrollToBottomButton = () => {
    if (!isAtBottom && messages.length > 0) {
      return (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          Scroll to bottom
        </button>
      );
    }
    return null;
  };
  
  // Handle emoji selection
  const handleEmojiSelect = (emojiData) => {
    if (showReactionPicker && selectedMessage) {
      onReactToMessage(selectedMessage, emojiData.emoji);
      setShowReactionPicker(false);
      setSelectedMessage(null);
    } else {
      onNewMessageChange({ 
        target: { 
          value: newMessage + emojiData.emoji 
        } 
      });
    }
    setShowEmojiPicker(false);
  };
  
  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowReactionPicker(false);
  };
  
  // Show reaction picker for a message
  const showReactionPickerForMessage = (message, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedMessage(message);
    setShowReactionPicker(true);
    setShowEmojiPicker(true);
  };
  
  // Show context menu for a message
  const showMessageContextMenu = (message, e) => {
    e.preventDefault();
    setSelectedMessage(message);
    setMessageContextMenuPos({ x: e.clientX, y: e.clientY });
  };
  
  // Close context menu
  const closeContextMenu = () => {
    setMessageContextMenuPos(null);
    setSelectedMessage(null);
  };
  
  // Handle message context menu actions
  const handleMessageAction = (action) => {
    if (!selectedMessage) return;
    
    switch (action) {
      case 'edit':
        onEditMessage(selectedMessage);
        break;
      case 'delete':
        onDeleteMessage(selectedMessage);
        break;
      case 'reply':
        onReplyToMessage(selectedMessage);
        break;
      case 'pin':
        onPinMessage(selectedMessage);
        break;
      case 'thread':
        const threadTitle = `Thread: ${selectedMessage.text.substring(0, 50)}${selectedMessage.text.length > 50 ? '...' : ''}`;
        onCreateThread(selectedMessage, threadTitle);
        break;
      default:
        break;
    }
    
    closeContextMenu();
  };
  
  // Check if user can edit/delete message
  const canManageMessage = (message) => {
    if (!message || !currentUser) return false;
    return message.senderId === currentUser._id || permissions.canManageMessages;
  };
  
  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    
    let typingText = '';
    if (typingUsers.length === 1) {
      const typingUser = server?.members.find(m => m.userId === typingUsers[0]);
      const displayName = typingUser?.nickname || typingUser?.userId || 'Someone';
      typingText = `${displayName} is typing...`;
    } else if (typingUsers.length <= 3) {
      const typingUserNames = typingUsers.map(userId => {
        const typingUser = server?.members.find(m => m.userId === userId);
        return typingUser?.nickname || typingUser?.userId || 'Someone';
      });
      typingText = `${typingUserNames.join(', ')} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
    
    return (
      <div className="typing-indicator">
        <div className="typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="typing-text">{typingText}</span>
      </div>
    );
  };
  
  // Render message input
  const renderMessageInput = () => {
    return (
      <div className="message-input-container">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="reply-indicator">
            <span className="reply-text">
              Replying to <span className="reply-user">
                {server?.members.find(m => m.userId === replyingTo.senderId)?.nickname || replyingTo.senderId}
              </span>
            </span>
            <button className="cancel-reply" onClick={onCancelReply}>
              <FaTimesCircle />
            </button>
          </div>
        )}
        
        {/* Edit indicator */}
        {editingMessage && (
          <div className="edit-indicator">
            <span className="edit-text">
              Editing message
            </span>
            <button className="cancel-edit" onClick={onCancelEdit}>
              <FaTimesCircle />
            </button>
          </div>
        )}
        
        {/* Message input form */}
        <form onSubmit={editingMessage ? onSaveEdit : onSendMessage} className="message-form">
          <div className="message-input-wrapper">
            <button 
              type="button" 
              className="emoji-button" 
              onClick={toggleEmojiPicker}
            >
              <FaSmile />
            </button>
            
            <textarea
              ref={messageInputRef}
              className="message-input"
              value={newMessage}
              onChange={onNewMessageChange}
              placeholder={`Message ${channel ? `#${channel.name}` : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  editingMessage ? onSaveEdit() : onSendMessage(e);
                }
              }}
            />
            
            <button type="button" className="attachment-button">
              <FaPaperclip />
            </button>
          </div>
          
          {mentionSuggestions.length > 0 && (
            <MentionSuggestions 
              suggestions={mentionSuggestions} 
              onSelect={onSelectMention} 
            />
          )}
          
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker 
                onEmojiClick={handleEmojiSelect} 
                previewConfig={{ showPreview: false }} 
                searchPlaceholder="Search emoji..."
                width="320px"
                height="400px"
              />
            </div>
          )}
        </form>
        
        {renderTypingIndicator()}
      </div>
    );
  };
  
  // Render message context menu
  const renderMessageContextMenu = () => {
    if (!messageContextMenuPos || !selectedMessage) return null;
    
    const canEditDelete = canManageMessage(selectedMessage);
    
    return (
      <div 
        className="message-context-menu"
        style={{ 
          top: messageContextMenuPos.y, 
          left: messageContextMenuPos.x 
        }}
      >
        <div className="context-menu-arrow"></div>
        <ul>
          <li onClick={() => handleMessageAction('reply')}>
            <FaReply /> Reply
          </li>
          <li onClick={() => handleMessageAction('thread')}>
            <FaCommentAlt /> Create Thread
          </li>
          {canEditDelete && (
            <>
              <li onClick={() => handleMessageAction('edit')}>
                <FaEdit /> Edit
              </li>
              <li onClick={() => handleMessageAction('delete')}>
                <FaTrash /> Delete
              </li>
            </>
          )}
          {permissions.canManageMessages && (
            <li onClick={() => handleMessageAction('pin')}>
              <FaThumbtack /> {selectedMessage.isPinned ? 'Unpin' : 'Pin'}
            </li>
          )}
          <li onClick={() => window.navigator.clipboard.writeText(selectedMessage.text)}>
            <FaExternalLinkAlt /> Copy Text
          </li>
        </ul>
      </div>
    );
  };
  
  if (!channel) {
    return (
      <div className="channel-content-empty">
        <div className="empty-state">
          <FaHashtag size={48} />
          <h2>No channel selected</h2>
          <p>Select a channel to start chatting</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="channel-content">
      {/* Channel header */}
      <div className="channel-header">
        <div className="channel-info">
          {channel.type === 'text' ? (
            <FaHashtag className="channel-icon" />
          ) : (
            <FaVolumeUp className="channel-icon" />
          )}
          <h2 className="channel-name">{channel.name}</h2>
          {channel.description && (
            <span className="channel-description">{channel.description}</span>
          )}
        </div>
        
        <div className="channel-actions">
          {pinnedMessages.length > 0 && (
            <button 
              className={`channel-action-btn ${showPinnedMessages ? 'active' : ''}`}
              onClick={onTogglePinnedMessages}
              title="Pinned Messages"
            >
              <FaThumbtack />
              <span className="badge">{pinnedMessages.length}</span>
            </button>
          )}
          <button className="channel-action-btn" title="Invite Users">
            <FaUserPlus />
          </button>
          <button className="channel-action-btn" title="Channel Settings">
            <FaEllipsisH />
          </button>
        </div>
      </div>
      
      {/* Main content layout */}
      <div className="channel-layout">
        {/* Pinned messages sidebar */}
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <PinnedMessages 
            pinnedMessages={pinnedMessages} 
            onClose={onTogglePinnedMessages}
            onMessageClick={(msg) => {
              setSelectedMessage(msg);
              const msgElement = document.getElementById(`message-${msg._id}`);
              if (msgElement) {
                msgElement.scrollIntoView({ behavior: 'smooth' });
                // Highlight message briefly
                msgElement.classList.add('highlight');
                setTimeout(() => {
                  msgElement.classList.remove('highlight');
                }, 2000);
              }
            }}
          />
        )}
        
        {/* Messages container */}
        <div 
          className="messages-container" 
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="empty-channel">
              <div className="welcome-message">
                <h3>Welcome to #{channel.name}!</h3>
                <p>This is the start of the #{channel.name} channel.</p>
                {channel.description && (
                  <div className="channel-description-welcome">
                    <strong>Description:</strong> {channel.description}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => {
                // Check if this message should be grouped with the previous one
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const shouldGroup = prevMessage && 
                                   message.senderId === prevMessage.senderId &&
                                   new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000; // 5 minutes
                
                return (
                  <MessageItem
                    key={message._id}
                    message={message}
                    prevMessage={prevMessage}
                    shouldGroup={shouldGroup}
                    onContextMenu={(e) => showMessageContextMenu(message, e)}
                    onReaction={(e) => showReactionPickerForMessage(message, e)}
                    onReply={() => {
                      onReplyToMessage(message);
                      closeContextMenu();
                    }}
                    onEdit={() => {
                      onEditMessage(message);
                      closeContextMenu();
                    }}
                    onDelete={() => {
                      onDeleteMessage(message);
                      closeContextMenu();
                    }}
                    onPin={() => {
                      onPinMessage(message);
                      closeContextMenu();
                    }}
                    onCreateThread={() => {
                      const threadTitle = `Thread: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`;
                      onCreateThread(message, threadTitle);
                      closeContextMenu();
                    }}
                    currentUser={currentUser}
                    server={server}
                    permissions={permissions}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {renderScrollToBottomButton()}
        </div>
      </div>
      
      {/* Message input */}
      {renderMessageInput()}
      
      {/* Context menu */}
      {renderMessageContextMenu()}
      
      {/* Background overlay for closing menus */}
      {(showEmojiPicker || messageContextMenuPos) && (
        <div 
          className="overlay" 
          onClick={() => {
            setShowEmojiPicker(false);
            setShowReactionPicker(false);
            closeContextMenu();
          }}
        />
      )}
    </div>
  );
};

export default ChannelContent; 