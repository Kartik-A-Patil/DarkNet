import React, { useState } from 'react';

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('screenshots');

  // Mock in-game images organized by folders
  const imageLibrary = {
    screenshots: [
      {
        id: '1',
        name: 'terminal_session_01.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMGEwYTBhIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwZmYwMCI+cm9vdEBkYXJrbmV0OiMgbmV0c3RhdCAtdHVscDwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjYwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDBmZjAwIj50Y3AwIDAgMC4wLjAuMDo4MCBFU1RBQkxJU0hFRDwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjgwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMDBmZjAwIj50Y3AwIDAgMC4wLjAuMDo0NDMgRVNUQUJMSVNIRUQ8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPnRjcDAgMCAwLjAuMC4wOjIyIEVTVEFCTElTSEVEPC90ZXh0Pgo8L3N2Zz4K',
        type: 'Terminal Session'
      },
      {
        id: '2',
        name: 'network_scan_results.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMTExODI3Ii8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwZDRmZiI+Tm1hcCBTY2FuIFJlc3VsdHM8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwZmYwMCI+UG9ydCAyMi90Y3Agb3BlbiAgc3NoPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPlBvcnQgODAvc3ggb3BlbiAgaHR0cDwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjExMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjYwMCI+UG9ydCA0NDMvdGNwIG9wZW4gaHR0cHM8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjY2MDAiPlBvcnQgMzMwNi90Y3Agb3BlbiBteXNxbDwvdGV4dD4KPC9zdmc+Cg==',
        type: 'Network Scan'
      },
      {
        id: '3',
        name: 'exploit_demo.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMWExYTFhIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmMDA0NCI+RXhwbG9pdCBEZW1vbnN0cmF0aW9uPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPltTVUNDRVNTXSBCdWZmZXIgT3ZlcmZsb3cgRGV0ZWN0ZWQ8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI5MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwZmYwMCI+W1NVQ0NFU1NdIFNoZWxsY29kZSBFeGVjdXRlZDwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjExMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwZmYwMCI+W1NVQ0NFU1NdIFJvb3QgQWNjZXNzIEdyYW50ZWQ8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjY2MDAiPlJPT1QgUFJJVklMRUdFUyBPQlRBSU5FRDwvdGV4dD4KPC9zdmc+Cg==',
        type: 'Exploit Demo'
      }
    ],
    evidence: [
      {
        id: '4',
        name: 'vulnerability_report.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMGYxNzJhIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmNjYwMCI+VnVsbmVyYWJpbGl0eSBSZXBvcnQ8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiI+Q1ZFLTIwMjQtMTMzNzwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjkwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmY2NjAwIj5TZXZlcml0eTogQ1JJVElDQUw8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmZmZmYiPkNWU1MgU2NvcmU6IDkuODwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjEzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiI+QWZmZWN0ZWQ6IFdlYiBGcmFtZXdvcms8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmZmZmYiPlN0YXR1czogUGF0Y2hlZDwvdGV4dD4KPC9zdmc+Cg==',
        type: 'Vulnerability Report'
      },
      {
        id: '5',
        name: 'forensic_analysis.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMjExZDJkIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2E3OGJmYSI+Rm9yZW5zaWMgQW5hbHlzaXM8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiI+TWFsd2FyZSBTYW1wbGU6IEhhc2g8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI5MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzAwZmYwMCI+NWQ0MWYwMmFhNDYxYjcyZDNiYjM5ZGY1MzQ4YjQ3ODI8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjY2MDAiPkZhbWlseTogVHJvamFuLkJhbmtlcjwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjEzMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjYwMCI+VGhyZWF0IExldmVsOiBISUdIPC90ZXh0Pgo8L3N2Zz4K',
        type: 'Forensic Analysis'
      }
    ],
    tools: [
      {
        id: '6',
        name: 'metasploit_session.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMGExNDJmIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwZDRmZiI+TWV0YXNwbG9pdCBGcmFtZXdvcms8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI3MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzAwZmYwMCI+bXNmNiA+IHVzZSBleHBsb2l0L3dpbmRvd3MveDY0L3NoZWxsPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iOTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPm1zZjYgZXhwbG9pdChhbmRyb2lkKSA+IHNldCBSIGV4cGxvaXRfc2lnbjwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjExMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjYwMCI+W1NVQ0NFU1NdIEV4cGxvaXQgQ29tcGxldGVkPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iMTMwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjZmY2NjAwIj5TZXR0aW5nIDogc2Vzc2lvbiAxIDo+IHB3bjM8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPk1ldGVycHJldGVyIHNlc3Npb24gb3BlbmVkPC90ZXh0Pgo8L3N2Zz4K',
        type: 'Metasploit Session'
      },
      {
        id: '7',
        name: 'wireshark_capture.png',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjMWU0MDVmIi8+Cjx0ZXh0IHg9IjIwIiB5PSI0MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzM3OWVmZiI+V2lyZXNoYXJrIFBhY2tldCBDYXB0dXJlPC90ZXh0Pgo8dGV4dCB4PSIyMCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZmZmZmYiPjEyMzQ1IFRDUCAxOTIuMTY4LjEuMTAwOjUyMzQ8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSI5MCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmZmZmZiI+MTIzNDYgSFRUUCBHRVQgL2xvZ2luLnBocDwvdGV4dD4KPHR5eHQgeD0iMjAiIHk9IjExMCIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2ZmNjYwMCI+MTIzNDcgSFRUUCBQT1NUIC9sb2dpbi5waHA8L3RleHQ+Cjx0ZXh0IHg9IjIwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiNmZjY2MDAiPkNyZWRlbnRpYWxzIENhcHR1cmVkPC90ZXh0Pgo8L3N2Zz4K',
        type: 'Wireshark Capture'
      }
    ]
  };

  const folders = Object.keys(imageLibrary);
  const currentImages = imageLibrary[selectedFolder as keyof typeof imageLibrary];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <i className="fa fa-folder mr-2 text-blue-400"></i>
            DarkNet File System - Images
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <i className="fa fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex h-96">
          {/* Folder Sidebar */}
          <div className="w-48 bg-gray-700 rounded-l-lg p-3 border-r border-gray-600">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Folders</h3>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedFolder === folder
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className="fa fa-folder mr-2"></i>
                {folder}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 gap-4">
              {currentImages.map((image) => (
                <div
                  key={image.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    onSelectImage(image.url);
                    onClose();
                  }}
                >
                  <div className="bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition-colors">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <div className="text-xs">
                      <div className="text-white font-medium truncate">{image.name}</div>
                      <div className="text-gray-400">{image.type}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{currentImages.length} files in {selectedFolder}</span>
            <span>Select an image to attach to your post</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePicker;
