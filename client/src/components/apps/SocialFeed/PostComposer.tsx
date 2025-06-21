import React, { useState } from 'react';
import { User } from './types';
import ImagePicker from './ImagePicker';

interface PostComposerProps {
  currentUser: User;
  newPost: string;
  setNewPost: (post: string) => void;
  handlePost: (image?: string) => void;
}

const PostComposer: React.FC<PostComposerProps> = ({
  currentUser,
  newPost,
  setNewPost,
  handlePost
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = () => {
    handlePost(selectedImage || undefined);
    setSelectedImage(null);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex space-x-3">
        <div className="post-avatar">
          {currentUser.avatar}
        </div>
        <div className="flex-1">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's happening in the cyber world?"
            className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
            rows={3}
          />
          
          {selectedImage && (
            <div className="mt-3 relative">
              <img 
                src={selectedImage} 
                alt="Upload preview" 
                className="max-h-48 rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-1 hover:bg-opacity-100"
              >
                <i className="fa fa-times"></i>
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowImagePicker(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
              >
                <i className="fa fa-image"></i>
              </button>
              <button className="text-gray-400 hover:text-green-400 transition-colors">
                <i className="fa fa-code"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-xs ${
                newPost.length > 280 ? 'text-red-400' : 
                newPost.length > 240 ? 'text-yellow-400' : 
                'text-gray-400'
              }`}>
                {280 - newPost.length}
              </span>
              
              <button
                onClick={handleSubmit}
                disabled={!newPost.trim() || newPost.length > 280}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
};

export default PostComposer;
