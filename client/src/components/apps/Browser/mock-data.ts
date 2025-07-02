export const mockSites: { [key: string]: string } = {
  "https://www.youtube.com": `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>MyTube</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0f0f; color: white; margin: 0; overflow-x: hidden; }
            .header { background-color: #212121; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #333; position: sticky; top: 0; z-index: 100; }
            .logo { color: #ff0000; font-weight: bold; font-size: 24px; display: flex; align-items: center; cursor: pointer; }
            .logo::before { content: '▶'; margin-right: 8px; }
            .search-container { display: flex; align-items: center; flex-grow: 1; max-width: 600px; margin: 0 40px; }
            .search-bar { flex-grow: 1; padding: 12px 16px; background-color: #121212; border: 2px solid #303030; color: white; border-radius: 40px; outline: none; transition: all 0.2s; }
            .search-bar:focus { border-color: #065fd4; }
            .search-btn { background-color: #303030; border: none; padding: 12px 20px; border-radius: 0 40px 40px 0; cursor: pointer; margin-left: -2px; }
            .search-btn:hover { background-color: #404040; }
            .nav-menu { display: flex; gap: 20px; }
            .nav-item { padding: 8px 16px; border-radius: 18px; cursor: pointer; transition: background-color 0.2s; }
            .nav-item:hover { background-color: #303030; }
            .sidebar { width: 240px; background-color: #0f0f0f; position: fixed; top: 56px; left: 0; height: 100vh; padding: 12px 0; overflow-y: auto; }
            .sidebar-item { padding: 10px 24px; cursor: pointer; display: flex; align-items: center; gap: 16px; transition: background-color 0.2s; }
            .sidebar-item:hover { background-color: #272727; }
            .sidebar-item.active { background-color: #272727; }
            .main-content { margin-left: 240px; padding: 20px; }
            .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
            .video-card { cursor: pointer; transition: transform 0.2s; }
            .video-card:hover { transform: scale(1.02); }
            .video-thumbnail { position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; }
            .video-thumbnail img { width: 100%; height: 100%; object-fit: cover; }
            .video-duration { position: absolute; bottom: 8px; right: 8px; background-color: rgba(0,0,0,0.8); color: white; padding: 2px 4px; border-radius: 2px; font-size: 12px; font-weight: 500; }
            .video-info { padding: 12px 0; display: flex; gap: 12px; }
            .channel-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(45deg, #ff0000, #ff6600); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
            .video-details { flex: 1; }
            .video-title { font-weight: 500; margin: 0 0 4px 0; line-height: 1.4; font-size: 16px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
            .video-meta { font-size: 14px; color: #aaa; }
            .video-stats { margin-top: 4px; font-size: 14px; color: #aaa; }
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); z-index: 1000; }
            .modal-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; max-width: 900px; background-color: #212121; border-radius: 12px; padding: 0; overflow: hidden; }
            .video-player { width: 100%; aspect-ratio: 16/9; background: linear-gradient(45deg, #1a1a1a, #333); display: flex; align-items: center; justify-content: center; color: #666; font-size: 18px; }
            .modal-info { padding: 20px; }
            .close-btn { position: absolute; top: 10px; right: 15px; color: white; font-size: 28px; cursor: pointer; z-index: 1001; }
            .trending-section { margin-bottom: 40px; }
            .section-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; padding-left: 4px; }
            .loading { text-align: center; padding: 40px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">MyTube</div>
            <div class="search-container">
                <input type="text" class="search-bar" id="search" placeholder="Search videos...">
                <button class="search-btn" id="search-btn">🔍</button>
            </div>
            <div class="nav-menu">
                <div class="nav-item">📺 Subscriptions</div>
                <div class="nav-item">📚 Library</div>
                <div class="nav-item">📈 Trending</div>
            </div>
        </div>
        <div class="sidebar">
            <div class="sidebar-item active">🏠 Home</div>
            <div class="sidebar-item">🔥 Trending</div>
            <div class="sidebar-item">📺 Subscriptions</div>
            <div class="sidebar-item">📚 Library</div>
            <div class="sidebar-item">📖 History</div>
            <div class="sidebar-item">⏰ Watch Later</div>
            <div class="sidebar-item">👍 Liked Videos</div>
            <div class="sidebar-item">📱 Gaming</div>
            <div class="sidebar-item">🎵 Music</div>
            <div class="sidebar-item">🎬 Movies</div>
            <div class="sidebar-item">📺 Live</div>
        </div>
        <div class="main-content">
            <div class="trending-section">
                <div class="section-title">Trending Videos</div>
                <div class="video-grid" id="video-grid"></div>
            </div>
        </div>
        <div class="modal" id="video-modal">
            <span class="close-btn" id="close-modal">&times;</span>
            <div class="modal-content">
                <div class="video-player" id="video-player">▶ Video would play here</div>
                <div class="modal-info">
                    <h2 id="modal-title"></h2>
                    <div id="modal-meta"></div>
                    <div id="modal-description"></div>
                </div>
            </div>
        </div>
        <script>
            const videos = [
                { id: 1, title: 'Advanced React Patterns: Custom Hooks & Context', channel: 'DevMastery', views: '2.3M', time: '2 days ago', duration: '15:32', description: 'Learn advanced React patterns including custom hooks, context API, and performance optimization techniques.' },
                { id: 2, title: 'The Perfect Pasta Carbonara - Italian Chef Recipe', channel: 'CucinaItaliana', views: '890K', time: '1 week ago', duration: '12:45', description: 'Authentic Italian carbonara recipe passed down through generations.' },
                { id: 3, title: 'Lofi Hip Hop Radio - beats to relax/study to', channel: 'ChillHop Music', views: '45M', time: 'Live', duration: 'LIVE', description: '24/7 lofi hip hop radio for studying, working, and relaxing.' },
                { id: 4, title: 'Full Body HIIT Workout - 20 Minutes No Equipment', channel: 'FitnessBlender', views: '5.2M', time: '3 days ago', duration: '20:15', description: 'High intensity interval training workout that requires no equipment.' },
                { id: 5, title: 'Exploring Hidden Gems in Switzerland 🇨🇭', channel: 'WanderlustDiary', views: '1.8M', time: '5 days ago', duration: '18:22', description: 'Journey through lesser-known beautiful locations in the Swiss Alps.' },
                { id: 6, title: 'Build a Modern Coffee Table - Woodworking Project', channel: 'ModernMaker', views: '640K', time: '1 week ago', duration: '25:18', description: 'Step-by-step guide to building a modern coffee table with basic tools.' },
                { id: 7, title: 'Cryptocurrency Explained: Bitcoin vs Ethereum vs Solana', channel: 'CryptoEducation', views: '3.1M', time: '4 days ago', duration: '16:47', description: 'Comprehensive comparison of major cryptocurrencies and their use cases.' },
                { id: 8, title: 'Acoustic Session: Indie Folk Originals', channel: 'IndieSounds', views: '420K', time: '2 weeks ago', duration: '28:33', description: 'Original indie folk songs performed in an intimate acoustic setting.' },
                { id: 9, title: 'Machine Learning Explained in 10 Minutes', channel: 'TechSimplified', views: '7.8M', time: '1 month ago', duration: '10:12', description: 'Simple explanation of machine learning concepts for beginners.' },
                { id: 10, title: 'Japanese Street Food Tour - Tokyo Night Market', channel: 'FoodieAdventures', views: '2.7M', time: '6 days ago', duration: '22:08', description: 'Exploring the best street food vendors in Tokyo\'s bustling night markets.' },
                { id: 11, title: 'Photography Tips: Golden Hour Portraits', channel: 'PhotoPro', views: '980K', time: '1 week ago', duration: '14:28', description: 'Master the art of portrait photography during golden hour.' },
                { id: 12, title: 'Minimalist Home Tour - Small Space Big Ideas', channel: 'MinimalLiving', views: '1.5M', time: '3 weeks ago', duration: '19:44', description: 'Tour of a beautifully designed minimalist apartment with clever storage solutions.' }
            ];

            const videoGrid = document.getElementById('video-grid');
            const searchInput = document.getElementById('search');
            const modal = document.getElementById('video-modal');
            const closeModal = document.getElementById('close-modal');

            function getRandomThumbnail(seed) {
                return \`https://picsum.photos/seed/\${seed}/640/360\`;
            }

            function formatViews(views) {
                if (views.includes('M')) return views;
                if (views.includes('K')) return views;
                return views;
            }

            function renderVideos(videoList) {
                if (videoList.length === 0) {
                    videoGrid.innerHTML = '<div class="loading">No videos found matching your search.</div>';
                    return;
                }
                
                videoGrid.innerHTML = '';
                videoList.forEach(video => {
                    const card = document.createElement('div');
                    card.className = 'video-card';
                    const channelInitial = video.channel.charAt(0);
                    
                    card.innerHTML = \`
                        <div class="video-thumbnail">
                            <img src="\${getRandomThumbnail(video.id)}" alt="\${video.title}" loading="lazy">
                            <div class="video-duration">\${video.duration}</div>
                        </div>
                        <div class="video-info">
                            <div class="channel-avatar">\${channelInitial}</div>
                            <div class="video-details">
                                <h3 class="video-title">\${video.title}</h3>
                                <div class="video-meta">\${video.channel}</div>
                                <div class="video-stats">\${video.views} views • \${video.time}</div>
                            </div>
                        </div>
                    \`;
                    
                    card.onclick = () => openVideoModal(video);
                    videoGrid.appendChild(card);
                });
            }

            function openVideoModal(video) {
                document.getElementById('modal-title').textContent = video.title;
                document.getElementById('modal-meta').innerHTML = \`
                    <div style="margin: 10px 0; color: #aaa;">
                        <strong>\${video.channel}</strong> • \${video.views} views • \${video.time}
                    </div>
                \`;
                document.getElementById('modal-description').textContent = video.description;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }

            function closeVideoModal() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredVideos = videos.filter(v => 
                    v.title.toLowerCase().includes(searchTerm) || 
                    v.channel.toLowerCase().includes(searchTerm) ||
                    v.description.toLowerCase().includes(searchTerm)
                );
                renderVideos(filteredVideos);
            });

            document.getElementById('search-btn').addEventListener('click', () => {
                const searchTerm = searchInput.value.toLowerCase();
                if (searchTerm) {
                    const filteredVideos = videos.filter(v => 
                        v.title.toLowerCase().includes(searchTerm) || 
                        v.channel.toLowerCase().includes(searchTerm)
                    );
                    renderVideos(filteredVideos);
                }
            });

            closeModal.addEventListener('click', closeVideoModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeVideoModal();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeVideoModal();
            });

            // Sidebar navigation
            document.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });

            renderVideos(videos);
        </script>
    </body>
    </html>
  `,
  "https://www.spotify.com": `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>DarkBeats</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000; color: white; margin: 0; display: flex; overflow: hidden; }
            .sidebar { background: linear-gradient(180deg, #1db954 0%, #191414 100%); width: 240px; height: 100vh; position: fixed; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; }
            .logo { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
            .logo::before { content: '🎵'; color: #ff0066; }
            .nav-section { margin-bottom: 30px; }
            .nav-title { font-size: 14px; font-weight: 700; color: #b3b3b3; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
            .nav-item { padding: 12px 0; cursor: pointer; font-weight: 500; opacity: 0.7; transition: all 0.2s; display: flex; align-items: center; gap: 16px; border-radius: 4px; }
            .nav-item:hover { opacity: 1; background-color: rgba(255,255,255,0.1); padding-left: 8px; }
            .nav-item.active { opacity: 1; background-color: rgba(255, 0, 102, 0.2); color: #ff0066; padding-left: 8px; }
            .main-content { margin-left: 240px; padding: 24px 32px; flex-grow: 1; height: 100vh; overflow-y: auto; background: linear-gradient(180deg, #2a1a2e 0%, #121212 50%); }
            .header { margin-bottom: 32px; }
            .greeting { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
            .time-based { color: #b3b3b3; font-size: 16px; }
            .section { margin-bottom: 48px; }
            .section-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: white; }
            .quick-access { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 48px; }
            .quick-item { background: rgba(255,255,255,0.1); border-radius: 4px; display: flex; align-items: center; cursor: pointer; transition: all 0.3s; overflow: hidden; }
            .quick-item:hover { background: rgba(255,255,255,0.2); transform: scale(1.02); }
            .quick-item img { width: 80px; height: 80px; object-fit: cover; }
            .quick-item-info { padding: 0 16px; font-weight: 600; }
            .playlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; }
            .playlist-card { background-color: #181818; padding: 16px; border-radius: 8px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden; }
            .playlist-card:hover { background-color: #282828; transform: translateY(-4px); }
            .playlist-card img { width: 100%; aspect-ratio: 1; border-radius: 8px; margin-bottom: 16px; object-fit: cover; }
            .playlist-title { font-weight: 700; margin-bottom: 4px; font-size: 16px; }
            .playlist-description { color: #b3b3b3; font-size: 14px; line-height: 1.4; }
            .play-button { position: absolute; bottom: 16px; right: 16px; width: 48px; height: 48px; background-color: #ff0066; border-radius: 50%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.3s; cursor: pointer; }
            .playlist-card:hover .play-button { opacity: 1; transform: translateY(0); }
            .play-button::before { content: '▶'; color: black; font-size: 18px; margin-left: 2px; }
            .now-playing { position: fixed; bottom: 0; left: 0; right: 0; background-color: #181818; border-top: 1px solid #282828; padding: 16px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
            .current-track { display: flex; align-items: center; gap: 12px; flex: 1; }
            .current-track img { width: 56px; height: 56px; border-radius: 4px; }
            .track-info h4 { margin: 0; font-size: 14px; }
            .track-info p { margin: 0; color: #b3b3b3; font-size: 12px; }
            .player-controls { display: flex; align-items: center; gap: 16px; flex: 1; justify-content: center; }
            .control-btn { background: none; border: none; color: #b3b3b3; cursor: pointer; padding: 8px; border-radius: 50%; transition: color 0.2s; }
            .control-btn:hover { color: white; }
            .control-btn.play { background-color: white; color: black; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
            .progress-bar { width: 100%; height: 4px; background-color: #404040; border-radius: 2px; margin: 8px 0; position: relative; }
            .progress { height: 100%; background-color: #ff0066; border-radius: 2px; width: 30%; }
            .volume-controls { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div class="logo">DarkBeats</div>
            <div class="nav-section">
                <div class="nav-item active">🏠 Home</div>
                <div class="nav-item">🔍 Search</div>
                <div class="nav-item">📚 Your Library</div>
            </div>
            <div class="nav-section">
                <div class="nav-title">Playlists</div>
                <div class="nav-item">❤️ Liked Songs</div>
                <div class="nav-item">📥 Recently Played</div>
                <div class="nav-item">⏰ Made For You</div>
            </div>
        </div>
        <div class="main-content">
            <div class="header">
                <div class="greeting">Good evening</div>
                <div class="time-based">Discover underground beats and dark melodies</div>
            </div>
            
            <div class="quick-access">
                <div class="quick-item">
                    <img src="https://picsum.photos/seed/liked/80" alt="Liked Songs">
                    <div class="quick-item-info">Liked Songs</div>
                </div>
                <div class="quick-item">
                    <img src="https://picsum.photos/seed/recent/80" alt="Recently Played">
                    <div class="quick-item-info">Recently Played</div>
                </div>
                <div class="quick-item">
                    <img src="https://picsum.photos/seed/discover/80" alt="Discover Weekly">
                    <div class="quick-item-info">Discover Weekly</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Made for you</div>
                <div class="playlist-grid" id="made-for-you"></div>
            </div>

            <div class="section">
                <div class="section-title">Recently played</div>
                <div class="playlist-grid" id="recently-played"></div>
            </div>
        </div>

        <div class="now-playing">
            <div class="current-track">
                <img src="https://picsum.photos/seed/playing/56" alt="Current Track">
                <div class="track-info">
                    <h4>Ghost in the Machine</h4>
                    <p>Darksynth Collective</p>
                </div>
            </div>
            <div class="player-controls">
                <button class="control-btn">🔀</button>
                <button class="control-btn">⏮</button>
                <button class="control-btn play">▶</button>
                <button class="control-btn">⏭</button>
                <button class="control-btn">🔁</button>
                <div class="progress-bar"><div class="progress"></div></div>
            </div>
            <div class="volume-controls">
                <button class="control-btn">🔊</button>
                <div class="progress-bar" style="width: 100px;"><div class="progress" style="width: 60%;"></div></div>
            </div>
        </div>

        <script>
            const madeForYou = [
                { name: 'Dark Wave Mix', description: 'Synthwave and darksynth essentials', cover: 'https://picsum.photos/seed/discover/200' },
                { name: 'Underground Radar', description: 'New tracks from the underground', cover: 'https://picsum.photos/seed/radar/200' },
                { name: 'Cyberpunk Mix', description: 'Futuristic electronic beats', cover: 'https://picsum.photos/seed/mix1/200' },
                { name: 'Shadow Beats', description: 'Dark ambient and industrial', cover: 'https://picsum.photos/seed/mix2/200' }
            ];

            const recentlyPlayed = [
                { name: 'Neon Nights', description: '50 songs • Synthwave collection', cover: 'https://picsum.photos/seed/chill/200' },
                { name: 'Hacker Anthems', description: '100 songs • Code to this', cover: 'https://picsum.photos/seed/workout/200' },
                { name: 'Dark Ambient Focus', description: '2h 30min • Deep concentration', cover: 'https://picsum.photos/seed/lofi/200' },
                { name: 'Industrial Classics', description: '75 songs • Raw power', cover: 'https://picsum.photos/seed/jazz/200' },
                { name: 'Cyberpunk 2077', description: '60 songs • Night City vibes', cover: 'https://picsum.photos/seed/synth/200' },
                { name: 'Darkwave Sessions', description: '40 songs • Gothic electronica', cover: 'https://picsum.photos/seed/acoustic/200' }
            ];

            function renderPlaylists(container, playlists) {
                const grid = document.getElementById(container);
                grid.innerHTML = '';
                playlists.forEach((playlist, index) => {
                    const card = document.createElement('div');
                    card.className = 'playlist-card';
                    card.innerHTML = \`
                        <img src="\${playlist.cover}" alt="\${playlist.name}">
                        <h3 class="playlist-title">\${playlist.name}</h3>
                        <p class="playlist-description">\${playlist.description}</p>
                        <div class="play-button"></div>
                    \`;
                    card.onclick = () => playPlaylist(playlist.name);
                    grid.appendChild(card);
                });
            }

            function playPlaylist(name) {
                document.querySelector('.track-info h4').textContent = \`Now Playing: \${name}\`;
                document.querySelector('.track-info p').textContent = 'Dark Electronic Artists';
                document.querySelector('.control-btn.play').innerHTML = '⏸';
            }

            // Simulate progress bar animation
            setInterval(() => {
                const progress = document.querySelector('.player-controls .progress');
                const currentWidth = parseFloat(progress.style.width) || 30;
                if (currentWidth < 100) {
                    progress.style.width = (currentWidth + 0.5) + '%';
                } else {
                    progress.style.width = '0%';
                }
            }, 1000);

            // Navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            });

            renderPlaylists('made-for-you', madeForYou);
            renderPlaylists('recently-played', recentlyPlayed);
        </script>
    </body>
    </html>
  `,
  "https://www.coinbase.com": `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Coinbase - Buy & Sell Bitcoin, Ethereum, and more</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #050f19; margin: 0; line-height: 1.6; }
            .header { background-color: #ffffff; padding: 16px 24px; border-bottom: 1px solid #e7ebee; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
            .logo { color: #0052ff; font-weight: 900; font-size: 28px; display: flex; align-items: center; }
            .logo::before { content: '₿'; margin-right: 8px; }
            .nav-links { display: flex; gap: 32px; }
            .nav-link { color: #050f19; text-decoration: none; font-weight: 500; padding: 8px 0; transition: color 0.2s; }
            .nav-link:hover { color: #0052ff; }
            .auth-buttons { display: flex; gap: 12px; }
            .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
            .btn-primary { background-color: #0052ff; color: white; }
            .btn-primary:hover { background-color: #0040cc; }
            .btn-secondary { background-color: transparent; color: #0052ff; border: 2px solid #0052ff; }
            .btn-secondary:hover { background-color: #0052ff; color: white; }
            .main { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
            .hero-section { text-align: center; margin-bottom: 48px; padding: 48px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; color: white; }
            .hero-title { font-size: 48px; font-weight: 900; margin-bottom: 16px; }
            .hero-subtitle { font-size: 20px; opacity: 0.9; margin-bottom: 32px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 48px; }
            .stat-card { background: white; border: 1px solid #e7ebee; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; }
            .stat-card:hover { transform: translateY(-2px); }
            .stat-number { font-size: 32px; font-weight: 900; color: #0052ff; margin-bottom: 8px; }
            .stat-label { color: #666; font-weight: 500; }
            .portfolio-section { margin-bottom: 48px; }
            .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
            .section-title { font-size: 28px; font-weight: 700; color: #050f19; }
            .refresh-btn { background: linear-gradient(135deg, #0052ff, #0040cc); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
            .refresh-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 82, 255, 0.3); }
            .portfolio-value { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
            .portfolio-total { font-size: 36px; font-weight: 900; margin-bottom: 8px; }
            .portfolio-change { display: flex; align-items: center; gap: 8px; font-size: 18px; }
            .crypto-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
            .crypto-table th { background-color: #f8fafc; padding: 20px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
            .crypto-table td { padding: 20px; border-bottom: 1px solid #f3f4f6; transition: background-color 0.2s; }
            .crypto-table tr:hover { background-color: #f9fafb; }
            .crypto-row { cursor: pointer; }
            .asset-info { display: flex; align-items: center; gap: 12px; }
            .asset-icon { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(45deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
            .asset-name { font-weight: 600; }
            .asset-ticker { color: #6b7280; font-size: 14px; }
            .price-up { color: #059669; font-weight: 600; }
            .price-down { color: #dc2626; font-weight: 600; }
            .price-neutral { color: #374151; font-weight: 600; }
            .change-indicator { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 600; }
            .trending-section { background: #f8fafc; padding: 32px; border-radius: 16px; margin-top: 48px; }
            .trending-coins { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
            .trending-coin { background: white; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s; cursor: pointer; }
            .trending-coin:hover { transform: scale(1.02); }
            .loading-animation { display: none; width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #0052ff; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">Coinbase</div>
            <div class="nav-links">
                <a href="#" class="nav-link">Prices</a>
                <a href="#" class="nav-link">Learn</a>
                <a href="#" class="nav-link">Individuals</a>
                <a href="#" class="nav-link">Businesses</a>
            </div>
            <div class="auth-buttons">
                <button class="btn btn-secondary">Sign in</button>
                <button class="btn btn-primary">Get started</button>
            </div>
        </div>
        
        <div class="main">
            <div class="hero-section">
                <h1 class="hero-title">Jump start your crypto portfolio</h1>
                <p class="hero-subtitle">Coinbase is the easiest place to buy and sell cryptocurrency</p>
                <button class="btn btn-primary" style="font-size: 18px; padding: 16px 32px;">Get started today</button>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">$327B+</div>
                    <div class="stat-label">Quarterly volume traded</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100M+</div>
                    <div class="stat-label">Verified users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Countries supported</div>
                </div>
            </div>

            <div class="portfolio-section">
                <div class="section-header">
                    <h2 class="section-title">Your Portfolio</h2>
                    <button class="refresh-btn" id="refresh-btn">
                        <div class="loading-animation" id="loading"></div>
                        <span id="refresh-text">🔄 Refresh Prices</span>
                    </button>
                </div>
                
                <div class="portfolio-value">
                    <div class="portfolio-total" id="portfolio-total">$156,847.92</div>
                    <div class="portfolio-change" id="portfolio-change">
                        <span class="change-indicator price-up">↗ +$2,847.23 (+1.85%)</span>
                        <span style="opacity: 0.8;">Today</span>
                    </div>
                </div>

                <table class="crypto-table">
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Price</th>
                            <th>24h Change</th>
                            <th>Holdings</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody id="crypto-tbody"></tbody>
                </table>
            </div>

            <div class="trending-section">
                <h3 class="section-title">Trending</h3>
                <div class="trending-coins" id="trending-coins"></div>
            </div>
        </div>

        <script>
            const assets = [
                { 
                    name: 'Bitcoin', 
                    ticker: 'BTC', 
                    balance: 2.5, 
                    price: 45230.50, 
                    change24h: 2.3,
                    icon: '₿'
                },
                { 
                    name: 'Ethereum', 
                    ticker: 'ETH', 
                    balance: 15.8, 
                    price: 3127.85, 
                    change24h: -1.2,
                    icon: 'Ξ'
                },
                { 
                    name: 'Solana', 
                    ticker: 'SOL', 
                    balance: 120, 
                    price: 98.42, 
                    change24h: 5.7,
                    icon: '◎'
                },
                { 
                    name: 'Cardano', 
                    ticker: 'ADA', 
                    balance: 5000, 
                    price: 0.52, 
                    change24h: -0.8,
                    icon: '₳'
                },
                { 
                    name: 'Chainlink', 
                    ticker: 'LINK', 
                    balance: 200, 
                    price: 14.73, 
                    change24h: 3.4,
                    icon: '🔗'
                }
            ];

            const trendingCoins = [
                { name: 'Dogecoin', ticker: 'DOGE', price: 0.087, change: 12.5 },
                { name: 'Polygon', ticker: 'MATIC', price: 1.23, change: -3.2 },
                { name: 'Avalanche', ticker: 'AVAX', price: 23.45, change: 8.7 },
                { name: 'Cosmos', ticker: 'ATOM', price: 12.67, change: 4.1 }
            ];

            function formatPrice(price) {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: price < 1 ? 4 : 2
                }).format(price);
            }

            function formatChange(change) {
                const arrow = change >= 0 ? '↗' : '↘';
                const className = change >= 0 ? 'price-up' : 'price-down';
                return \`<span class="change-indicator \${className}">\${arrow} \${Math.abs(change).toFixed(2)}%</span>\`;
            }

            function renderAssets() {
                const tbody = document.getElementById('crypto-tbody');
                tbody.innerHTML = '';
                
                assets.forEach(asset => {
                    const value = asset.balance * asset.price;
                    const row = document.createElement('tr');
                    row.className = 'crypto-row';
                    
                    row.innerHTML = \`
                        <td>
                            <div class="asset-info">
                                <div class="asset-icon">\${asset.icon}</div>
                                <div>
                                    <div class="asset-name">\${asset.name}</div>
                                    <div class="asset-ticker">\${asset.ticker}</div>
                                </div>
                            </div>
                        </td>
                        <td class="price">\${formatPrice(asset.price)}</td>
                        <td>\${formatChange(asset.change24h)}</td>
                        <td>\${asset.balance.toLocaleString()} \${asset.ticker}</td>
                        <td style="font-weight: 600;">\${formatPrice(value)}</td>
                    \`;
                    
                    row.onclick = () => showAssetDetails(asset);
                    tbody.appendChild(row);
                });
            }

            function renderTrendingCoins() {
                const container = document.getElementById('trending-coins');
                container.innerHTML = '';
                
                trendingCoins.forEach(coin => {
                    const coinEl = document.createElement('div');
                    coinEl.className = 'trending-coin';
                    
                    coinEl.innerHTML = \`
                        <div>
                            <div style="font-weight: 600;">\${coin.name}</div>
                            <div style="color: #6b7280; font-size: 14px;">\${coin.ticker}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: 600;">\${formatPrice(coin.price)}</div>
                            \${formatChange(coin.change)}
                        </div>
                    \`;
                    
                    container.appendChild(coinEl);
                });
            }

            function updatePrices() {
                const loadingEl = document.getElementById('loading');
                const refreshText = document.getElementById('refresh-text');
                
                loadingEl.style.display = 'block';
                refreshText.textContent = 'Updating...';
                
                setTimeout(() => {
                    assets.forEach(asset => {
                        const changePercent = (Math.random() - 0.5) * 0.1;
                        asset.price *= (1 + changePercent);
                        asset.change24h = (Math.random() - 0.4) * 10; // -4% to +6% range
                    });
                    
                    trendingCoins.forEach(coin => {
                        const changePercent = (Math.random() - 0.5) * 0.15;
                        coin.price *= (1 + changePercent);
                        coin.change = (Math.random() - 0.3) * 20;
                    });
                    
                    renderAssets();
                    renderTrendingCoins();
                    updatePortfolioTotal();
                    
                    loadingEl.style.display = 'none';
                    refreshText.textContent = '🔄 Refresh Prices';
                }, 1500);
            }

            function updatePortfolioTotal() {
                const total = assets.reduce((sum, asset) => sum + (asset.balance * asset.price), 0);
                const change = (Math.random() - 0.3) * 5000; // Simulate daily change
                const changePercent = (change / total) * 100;
                
                document.getElementById('portfolio-total').textContent = formatPrice(total);
                
                const changeEl = document.getElementById('portfolio-change');
                const arrow = change >= 0 ? '↗' : '↘';
                const className = change >= 0 ? 'price-up' : 'price-down';
                
                changeEl.innerHTML = \`
                    <span class="change-indicator \${className}">
                        \${arrow} \${formatPrice(Math.abs(change))} (\${Math.abs(changePercent).toFixed(2)}%)
                    </span>
                    <span style="opacity: 0.8;">Today</span>
                \`;
            }

            function showAssetDetails(asset) {
                alert(\`\${asset.name} (\${asset.ticker})\\nPrice: \${formatPrice(asset.price)}\\nHoldings: \${asset.balance} \${asset.ticker}\\nValue: \${formatPrice(asset.balance * asset.price)}\`);
            }

            document.getElementById('refresh-btn').addEventListener('click', updatePrices);

            // Auto-refresh every 30 seconds
            setInterval(() => {
                const isVisible = document.visibilityState === 'visible';
                if (isVisible) {
                    assets.forEach(asset => {
                        const microChange = (Math.random() - 0.5) * 0.01;
                        asset.price *= (1 + microChange);
                    });
                    renderAssets();
                }
            }, 30000);

            renderAssets();
            renderTrendingCoins();
        </script>
    </body>
    </html>
  `,
};