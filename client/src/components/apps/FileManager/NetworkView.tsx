import React from 'react';

interface NetworkViewProps {
  className?: string;
}

const NetworkView: React.FC<NetworkViewProps> = ({ className }) => {
  return (
    <div className={`network-view ${className || ''}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Network View</h3>
        <div className="text-gray-400">
          Network devices and connections will be displayed here.
        </div>
      </div>
    </div>
  );
};

export default NetworkView;