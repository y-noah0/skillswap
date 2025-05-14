import { useState } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { 
  FaReply, 
  FaEdit, 
  FaTrash, 
  FaSmile, 
  FaThumbtack, 
  FaCommentAlt,
  FaLink
} from 'react-icons/fa';
import './MessageItem.css';

const MessageItem = ({
  message,
  prevMessage,
  shouldGroup,
  onContextMenu,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onCreateThread,
  currentUser,
  server,
  permissions
}) => {
  const [showActions, setShowActions] = useState(false);
  
  if (message.isDeleted) {
    return (
      <div 
        id={`message-${message._id}`}
        className={`message-item ${shouldGroup ? 'grouped' : ''} deleted`}
      >
        <div className="message-deleted">
          <span>Message deleted</span>
        </div>
      </div>
    );
  }
  
  // Get sender information
  const sender = server?.members.find(m => m.userId === message.senderId);
  const senderName = sender?.nickname || message.senderId;
  
  // Check if user can edit/delete this message
  const canManageMessage = message.senderId === currentUser?._id || permissions?.canManageMessages;
  
  // Format timestamp
  const timestamp = new Date(message.createdAt);
  const timeString = format(timestamp, 'h:mm a');
  const dateString = format(timestamp, 'MMMM d, yyyy');
  
  // Format reply
  const replyingTo = message.replyTo ? 
    messages?.find(m => m._id === message.replyTo) || null : null;
  
  const replyingSender = replyingTo ? 
    server?.members.find(m => m.userId === replyingTo.senderId) : null;
  
  // Get message reactions
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    return (
      <div className="message-reactions">
        {message.reactions.map((reaction, index) => (
          <button 
            key={`${reaction.emoji}-${index}`} 
            className={`reaction ${reaction.users?.includes(currentUser?._id) ? 'user-reacted' : ''}`}
            onClick={() => onReaction({ target: { value: reaction.emoji } })}
          >
            <span className="reaction-emoji">{reaction.emoji}</span>
            <span className="reaction-count">{reaction.users?.length || 0}</span>
          </button>
        ))}
      </div>
    );
  };
  
  // Render message content with markdown and mentions
  const renderContent = () => {
    let content = message.text;
    
    // Process mentions
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach(userId => {
        const mentionedUser = server?.members.find(m => m.userId === userId);
        const displayName = mentionedUser?.nickname || userId;
        
        // Replace @username with styled mention
        const mentionRegex = new RegExp(`@${displayName}`, 'g');
        content = content.replace(mentionRegex, `<span class="mention">@${displayName}</span>`);
      });
    }
    
    // Use Markdown for formatting if enabled
    if (message.formattingType === 'markdown') {
      return (
        <ReactMarkdown>{content}</ReactMarkdown>
      );
    }
    
    // Otherwise return with HTML for mentions
    return (
      <div dangerouslySetInnerHTML={{ __html: content }} />
    );
  };
  
  // Message actions menu
  const renderMessageActions = () => {
    if (!showActions) return null;
    
    return (
      <div className="message-actions">
        <button className="message-action-btn" onClick={onReply} title="Reply">
          <FaReply />
        </button>
        
        <button className="message-action-btn" onClick={onCreateThread} title="Create Thread">
          <FaCommentAlt />
        </button>
        
        <button className="message-action-btn" onClick={onReaction} title="Add Reaction">
          <FaSmile />
        </button>
        
        {canManageMessage && (
          <>
            <button className="message-action-btn" onClick={onEdit} title="Edit">
              <FaEdit />
            </button>
            <button className="message-action-btn" onClick={onDelete} title="Delete">
              <FaTrash />
            </button>
          </>
        )}
        
        {permissions?.canManageMessages && (
          <button 
            className={`message-action-btn ${message.isPinned ? 'active' : ''}`} 
            onClick={onPin} 
            title={message.isPinned ? 'Unpin' : 'Pin'}
          >
            <FaThumbtack />
          </button>
        )}
      </div>
    );
  };
  
  // Check if we should show a date divider
  const shouldShowDateDivider = () => {
    if (!prevMessage) return true;
    
    const prevDate = new Date(prevMessage.createdAt);
    return prevDate.toDateString() !== timestamp.toDateString();
  };
  
  return (
    <>
      {shouldShowDateDivider() && (
        <div className="date-divider">
          <span>{dateString}</span>
        </div>
      )}
      
      <div 
        id={`message-${message._id}`}
        className={`message-item ${shouldGroup ? 'grouped' : ''} ${message.isPinned ? 'pinned' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onContextMenu={onContextMenu}
      >
        {!shouldGroup && (
          <div className="message-avatar">
            {/* You can use an actual avatar image here if available */}
            <div className="avatar-placeholder">
              {senderName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <div className="message-content">
          {!shouldGroup && (
            <div className="message-header">
              <span className="message-author">{senderName}</span>
              <span className="message-timestamp">{timeString}</span>
              {message.isEdited && (
                <span className="edited-indicator">(edited)</span>
              )}
              {message.isPinned && (
                <span className="pinned-indicator">
                  <FaThumbtack size={12} />
                </span>
              )}
            </div>
          )}
          
          {/* Reply reference */}
          {message.replyTo && replyingTo && (
            <div className="message-reply-to">
              <FaReply className="reply-icon" />
              <span className="reply-author">
                {replyingSender?.nickname || replyingTo.senderId}
              </span>
              <span className="reply-content">
                {replyingTo.text.length > 50 
                  ? replyingTo.text.substring(0, 50) + '...' 
                  : replyingTo.text}
              </span>
            </div>
          )}
          
          <div className="message-body">
            {renderContent()}
            
            {message.threadId && (
              <div className="thread-indicator" onClick={onCreateThread}>
                <FaCommentAlt size={12} />
                <span>Thread</span>
              </div>
            )}
            
            {renderReactions()}
          </div>
        </div>
        
        {showActions && renderMessageActions()}
      </div>
    </>
  );
};

export default MessageItem; 