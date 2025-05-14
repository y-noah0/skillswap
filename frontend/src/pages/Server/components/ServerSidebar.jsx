import { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaCog, FaHashtag, FaVolumeUp, FaUserPlus } from 'react-icons/fa';
import './ServerSidebar.css';

const ServerSidebar = ({ 
  server,
  categories,
  channels,
  selectedChannel,
  onSelectChannel,
  onCreateChannel,
  onCreateCategory,
  onServerSettings,
  permissions
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  
  // Toggle category collapsed state
  const toggleCategory = (categoryId) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Get channels for a specific category
  const getChannelsForCategory = (categoryId) => {
    return channels.filter(channel => channel.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };
  
  // Get channels without a category
  const getUncategorizedChannels = () => {
    return channels.filter(channel => !channel.categoryId)
      .sort((a, b) => a.order - b.order);
  };

  // Get channel icon based on type
  const getChannelIcon = (channel) => {
    if (channel.type === 'text') {
      return <FaHashtag className="channel-icon" />;
    } else if (channel.type === 'voice') {
      return <FaVolumeUp className="channel-icon" />;
    }
    return <FaHashtag className="channel-icon" />;
  };

  // Get channel status class
  const getChannelClass = (channel) => {
    let classes = 'channel-item';
    
    if (selectedChannel && selectedChannel._id === channel._id) {
      classes += ' active';
    }
    
    if (channel.type === 'voice' && channel.activeUsers?.length > 0) {
      classes += ' voice-active';
    }
    
    return classes;
  };

  return (
    <div className="server-sidebar">
      <div className="server-header">
        <h1>{server?.name || 'Loading...'}</h1>
        <div className="server-actions">
          {permissions.canManageServer && (
            <button className="icon-button" onClick={onServerSettings} title="Server Settings">
              <FaCog />
            </button>
          )}
          <button className="icon-button" onClick={() => {}} title="Invite">
            <FaUserPlus />
          </button>
        </div>
      </div>
      
      <div className="channels-container">
        {/* Uncategorized channels */}
        {getUncategorizedChannels().length > 0 && (
          <div className="uncategorized-channels">
            {getUncategorizedChannels().map(channel => (
              <div 
                key={channel._id}
                className={getChannelClass(channel)}
                onClick={() => onSelectChannel(channel)}
              >
                {getChannelIcon(channel)}
                <span className="channel-name">{channel.name}</span>
                {channel.type === 'voice' && channel.activeUsers?.length > 0 && (
                  <span className="voice-users-count">{channel.activeUsers.length}</span>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Categories with their channels */}
        {categories.sort((a, b) => a.order - b.order).map(category => (
          <div key={category._id} className="category-container">
            <div className="category-header" onClick={() => toggleCategory(category._id)}>
              {collapsedCategories[category._id] ? (
                <FaChevronRight className="category-icon" />
              ) : (
                <FaChevronDown className="category-icon" />
              )}
              <span className="category-name">{category.name}</span>
              {permissions.canManageChannels && (
                <button 
                  className="icon-button add-channel-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateChannel(category._id);
                  }}
                  title="Create Channel"
                >
                  <FaPlus size={12} />
                </button>
              )}
            </div>
            
            {!collapsedCategories[category._id] && (
              <div className="category-channels">
                {getChannelsForCategory(category._id).map(channel => (
                  <div 
                    key={channel._id}
                    className={getChannelClass(channel)}
                    onClick={() => onSelectChannel(channel)}
                  >
                    {getChannelIcon(channel)}
                    <span className="channel-name">{channel.name}</span>
                    {channel.type === 'voice' && channel.activeUsers?.length > 0 && (
                      <span className="voice-users-count">{channel.activeUsers.length}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {permissions.canManageChannels && (
        <div className="sidebar-footer">
          <button className="create-button" onClick={() => onCreateCategory()}>
            <FaPlus size={12} /> Create Category
          </button>
          <button className="create-button" onClick={() => onCreateChannel()}>
            <FaPlus size={12} /> Create Channel
          </button>
        </div>
      )}
    </div>
  );
};

export default ServerSidebar; 