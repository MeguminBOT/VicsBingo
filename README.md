# 🎯 Vic's Bingo Card Generator

A modern, responsive web application for generating and playing custom bingo cards. Create unlimited unique bingo cards with your own content and play them directly in your browser!

## 🌟 Features

### 🎨 Card Generation
- **Flexible Grid Sizes**: Create bingo cards from 3x3 up to 10x10
- **Two Generation Modes**:
  - **Random Pool Mode**: Enter a list of items that will be randomly distributed across different cards
  - **Traditional Bingo Mode**: Auto-generated with classic bingo numbers (1-75) distributed across B-I-N-G-O columns
- **Smart Validation**: Generate cards with any number of items - warnings and confirmations for optimal card variety
- **Dynamic Input Area**: Always-visible input that updates based on your settings
- **Multiple Cards**: Generate up to 50 unique cards at once
- **Custom Titles**: Add personalized titles to your bingo cards
- **Free Center Square**: Customizable center square text for odd-sized grids

### 🎮 Interactive Gameplay
- **Click-to-Play**: Upload and play bingo cards directly in your browser
- **Smart Win Detection**: Automatic detection of bingo patterns (rows, columns, diagonals)
- **Multiple File Support**: Load cards from HTML or custom .bingo format files
- **Card Selection**: Choose from multiple cards when uploading multi-card files
- **Game Reset**: Easily reset game state to start over
- **Caller Mode**: Built-in spinning wheel for calling out items during games

### 📱 Modern User Experience
- **Dark Mode**: Toggle between light and dark themes with preference saving
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Touch Friendly**: Large touch targets and optimized mobile interactions
- **Accessibility**: Keyboard navigation, screen reader support, and high contrast mode
- **Print Optimized**: Clean print layouts for physical bingo cards

### 💾 Export Options
- **Multiple Formats**: Download as HTML (for printing) or .bingo (for playing)
- **Individual Downloads**: Download single cards or bulk zip files
- **Custom File Format**: Proprietary .bingo format preserves all game data
- **Organized Output**: Automatically named files with timestamps and descriptions

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Choose your card size and number of cards to generate
3. Choose your generation mode:
   - **Random Pool**: Enter a list of items (one per line) to be randomly distributed across cards
   - **Traditional Bingo**: Click "Traditional Bingo" button for auto-generated B-I-N-G-O number cards
4. The input area updates dynamically based on your settings and shows minimum recommended items
5. Click "Generate Cards & Show Preview" to create your cards
6. Download individual cards or bulk zip files

### Smart Generation
- **Flexible Item Count**: Generate cards with any number of items
- **Automatic Warnings**: Get notified if you have fewer than the recommended number of items
- **Confirmation Dialogs**: Choose to proceed with fewer items if desired
- **Item Repetition**: When needed, items are intelligently repeated and shuffled for variety

### Playing Bingo
1. Switch to the "Play Bingo" tab
2. Upload a bingo card file (HTML or .bingo format)
3. Click cells to mark them as called
4. The game automatically detects when you have bingo!

### Caller Mode (Host a Game)
1. Switch to the "Play Bingo" tab and select "Caller Mode"
2. Upload a .bingo file (contains the complete item list)
3. Use the spinning wheel to randomly select and call out items
4. Track all called items in the list below the wheel
5. Reset to start over or continue until all items are called

### Traditional Bingo Mode
The Traditional Bingo mode creates authentic bingo cards with numbers distributed according to classic bingo rules:
- **B Column**: Numbers 1-15
- **I Column**: Numbers 16-30  
- **N Column**: Numbers 31-45 (with FREE center)
- **G Column**: Numbers 46-60
- **O Column**: Numbers 61-75

This mode automatically sets your grid to 5×5 and generates the complete set of 75 traditional bingo numbers for authentic gameplay.

## 🛠️ Technical Features

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)
- No server required - runs entirely in the browser

### File Formats
- **HTML Format**: Perfect for printing, includes embedded CSS
- **.bingo Format**: Custom JSON format that preserves all game state
- **ZIP Downloads**: Organized file packages with README instructions

### Responsive Design
- Mobile-first approach with progressive enhancement
- Touch-optimized interactions for mobile devices
- Adaptive grid sizing for different screen sizes
- Consistent experience across all devices

## 📁 Project Structure

```
Bingo-Card-Generator/
├── index.html          # Main application page
├── styles.css          # Complete styling with dark mode support
├── script.js           # Full application logic
├── README.md           # This file
└── LICENSE             # Project license
```

## 🎯 Use Cases

- **Custom Themed Bingo**: Create bingo cards with your own topics and items
- **Traditional Number Bingo**: Use traditional mode for classic B-I-N-G-O number games
- **Educational Games**: Make learning bingo for classrooms or training sessions
- **Party & Events**: Themed bingo for parties, celebrations, or team building
- **Holiday Fun**: Seasonal bingo cards for holidays and special occasions
- **Virtual Events**: Share .bingo files for remote play sessions
- **Corporate Training**: Interactive learning and ice breaker activities
- **Game Hosting**: Use caller mode to host bingo games with the built-in spinning wheel

## 📱 Mobile Features

- **Responsive Grid**: Automatically scales for mobile screens
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Optimized UI**: Collapsed navigation and streamlined controls
- **Fast Loading**: Minimal dependencies for quick mobile loading

## 🔄 Version History

### v2.0.0 (Current)
- **Simplified Interface**: Removed redundant "Same Items" mode for cleaner UX
- **Always-Visible Input**: Dynamic input area that updates based on settings
- **Traditional Bingo Mode**: Auto-generated B-I-N-G-O number cards (1-75)
- **Smart Validation**: Generate cards with any number of items, with helpful warnings
- **Flexible Generation**: Intelligent item repetition and shuffling when needed
- **Improved Terminology**: Updated UI text for clarity ("Minimum recommended" vs "Required")
- **Caller Mode**: Built-in spinning wheel for hosting bingo games
- **Enhanced .bingo Format**: Now includes complete item lists for caller functionality

### v1.0.0
- Initial release with full feature set
- Dark mode support
- Mobile responsiveness
- Custom .bingo file format
- Multiple export options

## 🤝 Contributing

This is an open-source project. Feel free to:
- Report bugs or suggest features
- Submit pull requests
- Fork and customize for your needs
- Share your improvements with the community
---

**Enjoy creating and playing your custom bingo games!** 🎯
