class BingoCardGenerator {
    constructor() {
        this.cardSize = 5;
        this.numCards = 5;
        this.freeText = 'FREE';
        this.cardTitle = '';
        this.outputFormat = 'bingo';
        this.inputValues = [];
        this.isTraditionalMode = false; // Track traditional bingo mode
        this.initializeEventListeners();
        this.initializeTabs();
        this.initializeGamePlayer();
        this.initializeThemeToggle();
        this.initializeInputArea(); // Always show input area
        this.callerItems = []; // Items available for calling
        this.calledItems = []; // Items that have been called
        this.isSpinning = false; // Track if wheel is currently spinning
        this.resizeListener = null; // Track resize listener for cleanup
    }

    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    initializeGamePlayer() {
        const uploadButton = document.getElementById('uploadButton');
        const fileUpload = document.getElementById('fileUpload');
        const resetButton = document.getElementById('resetGame');
        const checkWinButton = document.getElementById('checkWin');

        // Initialize player mode switching
        this.initializePlayerModes();

        uploadButton.addEventListener('click', () => {
            fileUpload.click();
        });

        fileUpload.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        resetButton.addEventListener('click', () => {
            this.resetGame();
        });

        checkWinButton.addEventListener('click', () => {
            this.checkForBingo();
        });

        // Add drag and drop functionality
        this.initializeDragAndDrop();
        
        // Initialize caller mode
        this.initializeCallerMode();
    }

    initializeDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            this.handleDrop(e);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            
            // Check if it's a valid file type
            if (file.name.toLowerCase().endsWith('.bingo') || file.name.toLowerCase().endsWith('.html')) {
                this.processDroppedFile(file);
            } else {
                alert('Please drop a valid .bingo or .html file');
            }
        }
    }

    processDroppedFile(file) {
        const fileName = document.getElementById('fileName');
        fileName.textContent = `Selected: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.toLowerCase().endsWith('.bingo')) {
                    this.parseBingoFormatFile(e.target.result, file.name);
                } else {
                    this.parseAndDisplayCard(e.target.result, file.name);
                }
            } catch (error) {
                alert('Error reading the file. Please make sure it\'s a valid bingo card file.');
                console.error('File parsing error:', error);
            }
        };
        reader.readAsText(file);
    }

    initializeEventListeners() {
        document.getElementById('cardSize').addEventListener('change', (e) => {
            this.cardSize = parseInt(e.target.value);
            this.updateInputArea(); // Update the input area when card size changes
        });

        document.getElementById('numCards').addEventListener('change', (e) => {
            this.numCards = parseInt(e.target.value);
        });

        document.getElementById('freeText').addEventListener('input', (e) => {
            this.freeText = e.target.value.trim() || 'FREE';
            this.updateInputArea(); // Update the input area when free text changes
        });

        document.getElementById('cardTitle').addEventListener('input', (e) => {
            this.cardTitle = e.target.value.trim();
        });

        document.getElementById('traditionalMode').addEventListener('click', () => {
            this.generateTraditionalBingo();
        });

        document.getElementById('generateCards').addEventListener('click', () => {
            this.generateAndDownloadCards();
        });
    }

    initializeInputArea() {
        // Always show the input area on page load
        const gridContainer = document.getElementById('inputGrid');
        const generateSection = document.getElementById('generateSection');
        
        generateSection.style.display = 'block';
        this.generateInputGrid();
    }

    updateInputArea() {
        // Reset traditional mode when updating input area (user is making changes)
        this.isTraditionalMode = false;
        
        // Update the instructions dynamically when settings change
        const instructionsDiv = document.querySelector('.random-pool-instructions');
        if (instructionsDiv) {
            const totalCells = this.cardSize * this.cardSize;
            const centerCell = this.cardSize % 2 === 1 ? 1 : 0;
            const requiredItems = totalCells - centerCell;
            const recommendedItems = Math.max(requiredItems + 10, Math.floor(requiredItems * 1.5));

            instructionsDiv.innerHTML = `
                <h3>🎯 Bingo Card Generator</h3>
                <p>Enter a list of items (one per line) that will be randomly distributed across different cards.</p>
                <div class="pool-stats">
                    <strong>Grid Size:</strong> ${this.cardSize}×${this.cardSize} (${totalCells} cells total)<br>
                    <strong>Minimum recommended:</strong> At least ${requiredItems} items${centerCell ? ' (center square will be "' + this.freeText + '")' : ''}<br>
                    <strong>Recommended:</strong> ${recommendedItems}+ items for good variety between cards
                </div>
            `;
        }

        // Update the counter
        const textarea = document.getElementById('randomPoolItems');
        if (textarea) {
            const event = new Event('input');
            textarea.dispatchEvent(event);
        }
    }

    generateInputGrid() {
        const gridContainer = document.getElementById('inputGrid');
        const generateSection = document.getElementById('generateSection');
        
        gridContainer.innerHTML = '';
        generateSection.style.display = 'block';
        document.getElementById('preview').innerHTML = '';

        // Always use the random pool input format
        this.generateRandomPoolGrid(gridContainer);
    }

    generateRandomPoolGrid(gridContainer) {
        gridContainer.className = 'random-pool-input';
        gridContainer.style.gridTemplateColumns = '1fr';
        gridContainer.removeAttribute('data-size');
        
        const totalCells = this.cardSize * this.cardSize;
        const centerCell = this.cardSize % 2 === 1 ? 1 : 0; // 1 if odd size (has center), 0 if even
        const requiredItems = totalCells - centerCell;
        const recommendedItems = Math.max(requiredItems + 10, Math.floor(requiredItems * 1.5));

        const instructionsDiv = document.createElement('div');
        instructionsDiv.className = 'random-pool-instructions';
        instructionsDiv.innerHTML = `
            <h3>🎯 Bingo Card Generator</h3>
            <p>Enter a list of items (one per line) that will be randomly distributed across different cards.</p>
            <div class="pool-stats">
                <strong>Grid Size:</strong> ${this.cardSize}×${this.cardSize} (${totalCells} cells total)<br>
                <strong>Minimum recommended:</strong> At least ${requiredItems} items${centerCell ? ' (center square will be "' + this.freeText + '")' : ''}<br>
                <strong>Recommended:</strong> ${recommendedItems}+ items for good variety between cards
            </div>
        `;
        gridContainer.appendChild(instructionsDiv);

        const textarea = document.createElement('textarea');
        textarea.id = 'randomPoolItems';
        textarea.className = 'random-pool-textarea';
        textarea.placeholder = `Enter your items here (one per line):\n\nExample:\nApple\nBanana\nCherry\nDate\nEggplant\nFig\nGrape\n...`;
        textarea.rows = Math.max(10, Math.min(20, recommendedItems));
        gridContainer.appendChild(textarea);

        const counterDiv = document.createElement('div');
        counterDiv.className = 'item-counter';
        counterDiv.innerHTML = `<span id="itemCount">0</span> items entered (minimum: ${requiredItems})`;
        gridContainer.appendChild(counterDiv);

        // Add real-time counter
        textarea.addEventListener('input', () => {
            const items = this.parseRandomPoolItems(textarea.value);
            const countElement = document.getElementById('itemCount');
            countElement.textContent = items.length;
            
            if (items.length < requiredItems) {
                counterDiv.className = 'item-counter insufficient';
            } else if (items.length < recommendedItems) {
                counterDiv.className = 'item-counter sufficient';
            } else {
                counterDiv.className = 'item-counter optimal';
            }
        });
    }

    parseRandomPoolItems(text) {
        return text.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0 && item !== this.freeText);
    }

    generateTraditionalBingo() {
        // Set to 5x5 for traditional bingo if not already
        if (this.cardSize !== 5) {
            this.cardSize = 5;
            document.getElementById('cardSize').value = '5';
        }

        // Set traditional FREE text
        this.freeText = 'FREE';
        document.getElementById('freeText').value = 'FREE';

        // Set traditional mode flag
        this.isTraditionalMode = true;

        // Generate traditional bingo numbers (1-75 distributed across B-I-N-G-O columns)
        const bingoNumbers = this.generateTraditionalBingoNumbers();
        
        // Fill the textarea with traditional bingo numbers
        const textarea = document.getElementById('randomPoolItems');
        if (textarea) {
            textarea.value = bingoNumbers.join('\n');
            
            // Trigger the counter update
            const event = new Event('input');
            textarea.dispatchEvent(event);
        }

        // Update the instructions to show traditional mode
        const instructionsDiv = document.querySelector('.random-pool-instructions');
        if (instructionsDiv) {
            instructionsDiv.innerHTML = `
                <h3>🎲 Traditional Bingo Mode</h3>
                <p>Auto-generated with traditional bingo numbers (1-75) distributed across B-I-N-G-O columns.</p>
                <div class="pool-stats">
                    <strong>B Column:</strong> 1-15 | <strong>I Column:</strong> 16-30 | <strong>N Column:</strong> 31-45 | <strong>G Column:</strong> 46-60 | <strong>O Column:</strong> 61-75<br>
                    <strong>Grid Size:</strong> 5×5 (25 cells total with FREE center)<br>
                    <strong>Pool Size:</strong> 75 traditional bingo numbers
                </div>
            `;
        }
    }

    generateTraditionalBingoNumbers() {
        // Traditional bingo uses 75 numbers distributed across columns:
        // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
        const numbers = [];
        
        // B column (1-15)
        for (let i = 1; i <= 15; i++) {
            numbers.push(`B${i}`);
        }
        
        // I column (16-30)
        for (let i = 16; i <= 30; i++) {
            numbers.push(`I${i}`);
        }
        
        // N column (31-45)
        for (let i = 31; i <= 45; i++) {
            numbers.push(`N${i}`);
        }
        
        // G column (46-60)
        for (let i = 46; i <= 60; i++) {
            numbers.push(`G${i}`);
        }
        
        // O column (61-75)
        for (let i = 61; i <= 75; i++) {
            numbers.push(`O${i}`);
        }
        
        return numbers;
    }

    collectInputValues() {
        const textarea = document.getElementById('randomPoolItems');
        if (!textarea) return [];
        
        return this.parseRandomPoolItems(textarea.value);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generateSingleCard(values, cardNumber) {
        // Check if we're in traditional bingo mode by looking at the values
        const isTraditionalBingo = this.isTraditionalMode && values.length === 75 && 
                                   values.every(v => v.match(/^[BINGO]\d+$/));
        
        if (isTraditionalBingo) {
            return this.generateTraditionalBingoCard(values, cardNumber);
        } else {
            return this.generateRandomCard(values, cardNumber);
        }
    }

    generateTraditionalBingoCard(values, cardNumber) {
        // Traditional bingo is always 5x5 with center FREE
        const cardValues = [];
        
        // Separate numbers by column
        const bNumbers = values.filter(v => v.startsWith('B')); // B1-B15
        const iNumbers = values.filter(v => v.startsWith('I')); // I16-I30
        const nNumbers = values.filter(v => v.startsWith('N')); // N31-N45
        const gNumbers = values.filter(v => v.startsWith('G')); // G46-G60
        const oNumbers = values.filter(v => v.startsWith('O')); // O61-O75
        
        // Shuffle each column's numbers
        const shuffledB = this.shuffleArray(bNumbers).slice(0, 5); // 5 numbers for B column
        const shuffledI = this.shuffleArray(iNumbers).slice(0, 5); // 5 numbers for I column
        const shuffledN = this.shuffleArray(nNumbers).slice(0, 4); // 4 numbers for N column (center is FREE)
        const shuffledG = this.shuffleArray(gNumbers).slice(0, 5); // 5 numbers for G column
        const shuffledO = this.shuffleArray(oNumbers).slice(0, 5); // 5 numbers for O column
        
        // Build the card row by row, column by column
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (row === 2 && col === 2) {
                    // Center square is always FREE
                    cardValues.push(this.freeText);
                } else if (col === 0) {
                    // B column
                    cardValues.push(shuffledB[row]);
                } else if (col === 1) {
                    // I column
                    cardValues.push(shuffledI[row]);
                } else if (col === 2) {
                    // N column - skip center (row 2)
                    const nIndex = row < 2 ? row : row - 1;
                    cardValues.push(shuffledN[nIndex]);
                } else if (col === 3) {
                    // G column
                    cardValues.push(shuffledG[row]);
                } else {
                    // O column
                    cardValues.push(shuffledO[row]);
                }
            }
        }
        
        return this.createCardHTML(cardValues, cardNumber);
    }

    generateRandomCard(values, cardNumber) {
        const totalCells = this.cardSize * this.cardSize;
        const centerIndex = Math.floor(totalCells / 2);
        const isOddSize = this.cardSize % 2 === 1;
        
        // Filter out the custom FREE text from values and shuffle
        const availableValues = values.filter(v => v !== this.freeText);
        
        // If we don't have enough unique values, we'll need to repeat some
        const requiredValues = totalCells - (isOddSize ? 1 : 0);
        let valuesToUse = [];
        
        if (availableValues.length >= requiredValues) {
            // We have enough unique values
            valuesToUse = this.shuffleArray(availableValues).slice(0, requiredValues);
        } else {
            // We need to repeat some values
            valuesToUse = [];
            const shuffledValues = this.shuffleArray(availableValues);
            
            for (let i = 0; i < requiredValues; i++) {
                valuesToUse.push(shuffledValues[i % shuffledValues.length]);
            }
            
            // Shuffle again to distribute the repeated items randomly
            valuesToUse = this.shuffleArray(valuesToUse);
        }
        
        // Create card array
        const cardValues = [];
        let valueIndex = 0;
        
        for (let i = 0; i < totalCells; i++) {
            if (i === centerIndex && isOddSize) {
                cardValues.push(this.freeText);
            } else {
                cardValues.push(valuesToUse[valueIndex]);
                valueIndex++;
            }
        }
        
        return this.createCardHTML(cardValues, cardNumber);
    }

    createCardHTML(values, cardNumber) {
        const centerIndex = Math.floor(values.length / 2);
        const isOddSize = this.cardSize % 2 === 1;
        
        // Determine the card title
        let displayTitle = 'BINGO';
        if (this.cardTitle) {
            displayTitle = this.cardTitle;
        }
        
        // Always append the card number after a " | " symbol
        displayTitle += ` | Card #${cardNumber}`;
        
        let html = `
            <div class="preview-card miniature">
                <h4>${displayTitle}</h4>
                <div class="bingo-card miniature" style="grid-template-columns: repeat(${this.cardSize}, 1fr);">
        `;
        
        values.forEach((value, index) => {
            const isCenter = index === centerIndex && isOddSize;
            const cellClass = isCenter ? 'bingo-cell center' : 'bingo-cell';
            html += `<div class="${cellClass}">${value}</div>`;
        });
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = document.getElementById('fileName');
        fileName.textContent = `Selected: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.toLowerCase().endsWith('.bingo')) {
                    this.parseBingoFormatFile(e.target.result, file.name);
                } else {
                    this.parseAndDisplayCard(e.target.result, file.name);
                }
            } catch (error) {
                alert('Error reading the file. Please make sure it\'s a valid bingo card file.');
                console.error('File parsing error:', error);
            }
        };
        reader.readAsText(file);
    }

    parseAndDisplayCard(htmlContent, fileName) {
        // Create a temporary DOM to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Find the first bingo card in the HTML
        const bingoCard = doc.querySelector('.bingo-card');
        if (!bingoCard) {
            alert('No bingo card found in the uploaded file.');
            return;
        }

        const cells = bingoCard.querySelectorAll('.bingo-cell');
        if (cells.length === 0) {
            alert('No bingo cells found in the uploaded file.');
            return;
        }

        // Calculate grid size
        const gridSize = Math.sqrt(cells.length);
        if (gridSize !== Math.floor(gridSize)) {
            alert('Invalid bingo card format.');
            return;
        }

        // Extract cell content
        const cellData = Array.from(cells).map((cell, index) => ({
            content: cell.textContent.trim(),
            isCenter: cell.classList.contains('center'),
            index: index
        }));

        this.displayPlayableCard(cellData, gridSize, fileName);
    }

    displayPlayableCard(cellData, gridSize, fileName) {
        const gameArea = document.getElementById('gameArea');
        const playableCard = document.getElementById('playableCard');
        
        gameArea.style.display = 'block';
        
        // Extract title from filename or use default
        let displayTitle = fileName.replace('.html', '').replace(/-/g, ' ');
        displayTitle = displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1);
        
        let html = `
            <div class="card-title">Playing: ${displayTitle}</div>
            <div class="playable-bingo-card" style="grid-template-columns: repeat(${gridSize}, 1fr);">
        `;
        
        cellData.forEach((cell, index) => {
            const cellClass = cell.isCenter ? 'playable-bingo-cell center checked' : 'playable-bingo-cell';
            html += `<div class="${cellClass}" data-index="${index}" data-is-center="${cell.isCenter}">${cell.content}</div>`;
        });
        
        html += '</div>';
        playableCard.innerHTML = html;
        
        // Add click listeners to cells
        const playableCells = playableCard.querySelectorAll('.playable-bingo-cell');
        playableCells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.dataset.isCenter !== 'true') {
                    cell.classList.toggle('checked');
                }
                this.updateWinStatus();
            });
        });

        // Store grid size for win checking
        this.currentGridSize = gridSize;
        this.updateWinStatus();
    }

    parseBingoFormatFile(jsonContent, fileName) {
        try {
            const bingoData = JSON.parse(jsonContent);
            
            // Validate format
            if (bingoData.format !== "bingo-card-generator-v1") {
                throw new Error("Unsupported .bingo file format");
            }
            
            if (!bingoData.cards || bingoData.cards.length === 0) {
                throw new Error("No cards found in .bingo file");
            }
            
            // Show card selection if multiple cards
            if (bingoData.cards.length > 1) {
                this.showCardSelection(bingoData, fileName);
            } else {
                this.displayBingoCard(bingoData.cards[0], bingoData.metadata, fileName);
            }
            
        } catch (error) {
            throw new Error(`Invalid .bingo file: ${error.message}`);
        }
    }

    showCardSelection(bingoData, fileName) {
        const gameArea = document.getElementById('gameArea');
        gameArea.style.display = 'block';
        
        const playableCard = document.getElementById('playableCard');
        
        let html = `
            <div class="card-selection">
                <h3>Select a Card to Play</h3>
                <p>${bingoData.metadata.title} - ${bingoData.cards.length} cards available</p>
                <div class="card-buttons">
        `;
        
        bingoData.cards.forEach((card, index) => {
            html += `<button class="btn btn-primary card-select-btn" data-card-index="${index}">
                Card #${card.cardNumber}
            </button>`;
        });
        
        html += `
                </div>
                <div class="selected-card-area" style="display: none;"></div>
            </div>
        `;
        
        playableCard.innerHTML = html;
        
        // Add click listeners to card selection buttons
        const cardButtons = playableCard.querySelectorAll('.card-select-btn');
        cardButtons.forEach(button => {
            button.addEventListener('click', () => {
                const cardIndex = parseInt(button.dataset.cardIndex);
                this.displayBingoCard(bingoData.cards[cardIndex], bingoData.metadata, fileName);
            });
        });
    }

    displayBingoCard(cardData, metadata, fileName) {
        const gameArea = document.getElementById('gameArea');
        const playableCard = document.getElementById('playableCard');
        
        gameArea.style.display = 'block';
        
        let displayTitle = metadata.title;
        // Card number is already included in metadata.title, no need to add it again
        
        let html = `
            <div class="card-title">${displayTitle}</div>
            <div class="playable-bingo-card" style="grid-template-columns: repeat(${cardData.gridSize}, 1fr);">
        `;
        
        cardData.cells.forEach((cell, index) => {
            const cellClass = cell.isCenter ? 'playable-bingo-cell center' : 'playable-bingo-cell';
            const checkedClass = cell.checked ? ' checked' : '';
            html += `<div class="${cellClass}${checkedClass}" data-index="${index}" data-is-center="${cell.isCenter}">${cell.content}</div>`;
        });
        
        html += '</div>';
        playableCard.innerHTML = html;
        
        // Add click listeners to cells
        const playableCells = playableCard.querySelectorAll('.playable-bingo-cell');
        playableCells.forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.dataset.isCenter !== 'true') {
                    cell.classList.toggle('checked');
                }
                this.updateWinStatus();
            });
        });

        // Store grid size for win checking
        this.currentGridSize = cardData.gridSize;
        this.updateWinStatus();
    }

    resetGame() {
        const playableCells = document.querySelectorAll('.playable-bingo-cell');
        playableCells.forEach(cell => {
            if (cell.dataset.isCenter !== 'true') {
                cell.classList.remove('checked');
            }
        });
        this.updateWinStatus();
    }

    checkForBingo() {
        const result = this.calculateBingo();
        const winStatus = document.getElementById('winStatus');
        
        if (result.hasBingo) {
            winStatus.className = 'win-status bingo';
            winStatus.textContent = `🎉 BINGO! (${result.lines.join(', ')})`;
        } else {
            winStatus.className = 'win-status no-bingo';
            winStatus.textContent = 'No Bingo yet. Keep playing!';
        }
    }

    updateWinStatus() {
        // Auto-check for bingo when cells are clicked
        setTimeout(() => this.checkForBingo(), 100);
    }

    calculateBingo() {
        const cells = document.querySelectorAll('.playable-bingo-cell');
        if (!cells.length) return { hasBingo: false, lines: [] };

        const gridSize = this.currentGridSize;
        const checkedCells = Array.from(cells).map(cell => cell.classList.contains('checked'));
        const lines = [];

        // Check rows
        for (let row = 0; row < gridSize; row++) {
            let isComplete = true;
            for (let col = 0; col < gridSize; col++) {
                if (!checkedCells[row * gridSize + col]) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) lines.push(`Row ${row + 1}`);
        }

        // Check columns
        for (let col = 0; col < gridSize; col++) {
            let isComplete = true;
            for (let row = 0; row < gridSize; row++) {
                if (!checkedCells[row * gridSize + col]) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) lines.push(`Column ${col + 1}`);
        }

        // Check diagonal (top-left to bottom-right)
        let diagonalComplete = true;
        for (let i = 0; i < gridSize; i++) {
            if (!checkedCells[i * gridSize + i]) {
                diagonalComplete = false;
                break;
            }
        }
        if (diagonalComplete) lines.push('Diagonal \\');

        // Check diagonal (top-right to bottom-left)
        diagonalComplete = true;
        for (let i = 0; i < gridSize; i++) {
            if (!checkedCells[i * gridSize + (gridSize - 1 - i)]) {
                diagonalComplete = false;
                break;
            }
        }
        if (diagonalComplete) lines.push('Diagonal /');

        return {
            hasBingo: lines.length > 0,
            lines: lines
        };
    }

    async generateAndDownloadCards() {
        const values = this.collectInputValues();
        
        if (values.length === 0) {
            alert('Please fill in at least one item!');
            return;
        }

        // Validate and warn about item count
        const totalCells = this.cardSize * this.cardSize;
        const centerCell = this.cardSize % 2 === 1 ? 1 : 0;
        const requiredItems = totalCells - centerCell;
        const recommendedItems = Math.max(requiredItems + 10, Math.floor(requiredItems * 1.5));
        
        if (values.length < requiredItems) {
            const shortage = requiredItems - values.length;
            const proceed = confirm(`⚠️ Warning: You only have ${values.length} items, but need at least ${requiredItems} for a ${this.cardSize}×${this.cardSize} grid.\n\nThis means ${shortage} items will be repeated on each card.\n\nDo you want to proceed anyway?`);
            if (!proceed) {
                return;
            }
        } else if (values.length < recommendedItems) {
            const proceed = confirm(`💡 Recommendation: You have ${values.length} items, but we recommend ${recommendedItems}+ items for a ${this.cardSize}×${this.cardSize} grid to ensure good variety between cards.\n\nYour cards will still work, but may have more repeated items.\n\nDo you want to proceed?`);
            if (!proceed) {
                return;
            }
        }
        
        const loadingSpinner = document.getElementById('loadingSpinner');
        const generateButton = document.getElementById('generateCards');
        
        // Show loading state
        loadingSpinner.style.display = 'flex';
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
        
        try {
            // Generate cards HTML
            const cardsHTML = [];
            for (let i = 1; i <= this.numCards; i++) {
                cardsHTML.push(this.generateSingleCard(values, i));
            }
            
            // Show preview with individual download buttons
            const previewSection = document.getElementById('preview');
            
            // Create description based on item count
            const totalCells = this.cardSize * this.cardSize;
            const centerCell = this.cardSize % 2 === 1 ? 1 : 0;
            const requiredItems = totalCells - centerCell;
            
            let modeDescription = 'Each card has randomly selected items from your pool';
            if (values.length < requiredItems) {
                const repeatedItems = requiredItems - values.length;
                modeDescription += ` (${repeatedItems} items repeated per card due to limited pool size)`;
            }
            
            const previewCards = cardsHTML.map((cardHTML, index) => {
                const cardNumber = index + 1;
                return `
                    <div class="preview-miniature">
                        ${cardHTML}
                        <div class="download-buttons">
                            <button class="btn btn-small btn-download" data-card="${cardNumber}" data-format="html">
                                📄 HTML
                            </button>
                            <button class="btn btn-small btn-download" data-card="${cardNumber}" data-format="bingo">
                                🎯 .bingo
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            previewSection.innerHTML = `
                <h2>Generated Cards (${this.numCards} total)</h2>
                <p class="mode-description"><strong>Mode:</strong> 🎲 Random Pool - ${modeDescription}</p>
                <div class="preview-grid">
                    ${previewCards}
                </div>
                <div class="bulk-download-section">
                    <p>Or download all cards as a zip file:</p>
                    <div class="format-selection">
                        <label for="outputFormat">Output Format:</label>
                        <select id="outputFormat">
                            <option value="html">HTML Files (for printing)</option>
                            <option value="bingo" selected>Custom .bingo Format (for playing)</option>
                            <option value="both">Both Formats</option>
                        </select>
                    </div>
                </div>
            `;
            
            // Add event listeners for individual download buttons
            this.addIndividualDownloadListeners(values, cardsHTML);
            
            // Re-attach the output format event listener since we recreated the element
            document.getElementById('outputFormat').addEventListener('change', (e) => {
                this.outputFormat = e.target.value;
            });
            
            // Set the current output format value
            document.getElementById('outputFormat').value = this.outputFormat;
            
            // Create and add bulk download button
            const bulkDownloadSection = document.querySelector('.bulk-download-section');
            const bulkDownloadButton = document.createElement('button');
            bulkDownloadButton.className = 'btn btn-primary';
            bulkDownloadButton.textContent = 'Download All as ZIP';
            bulkDownloadButton.addEventListener('click', async () => {
                bulkDownloadButton.disabled = true;
                bulkDownloadButton.textContent = 'Creating ZIP...';
                
                try {
                    // Create files based on selected format
                    if (this.outputFormat === 'html') {
                        await this.createZipFile(cardsHTML);
                    } else if (this.outputFormat === 'bingo') {
                        await this.createBingoFormatFile(values);
                    } else if (this.outputFormat === 'both') {
                        await this.createBothFormatsFile(cardsHTML, values);
                    }
                } catch (error) {
                    console.error('Error creating ZIP:', error);
                    alert('Error creating ZIP file. Please try again.');
                } finally {
                    bulkDownloadButton.disabled = false;
                    bulkDownloadButton.textContent = 'Download All as ZIP';
                }
            });
            bulkDownloadSection.appendChild(bulkDownloadButton);
            
        } catch (error) {
            console.error('Error generating cards:', error);
            alert('An error occurred while generating the cards: ' + error.message);
        } finally {
            // Hide loading state
            loadingSpinner.style.display = 'none';
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Cards & Show Preview';
        }
    }

    async createZipFile(cardsHTML) {
        const zip = new JSZip();
        
        // Create base filename from title or default
        const baseFileName = this.cardTitle ? 
            this.cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') :
            'bingo-card';
        
        // Create individual HTML files for each card
        cardsHTML.forEach((cardHTML, index) => {
            const completeHTML = this.createCompleteHTMLFile(cardHTML, index + 1);
            const fileName = this.numCards > 1 ? `${baseFileName}-${index + 1}.html` : `${baseFileName}.html`;
            zip.file(fileName, completeHTML);
        });
        
        // Create a combined HTML file with all cards
        const allCardsHTML = this.createCompleteHTMLFile(cardsHTML.join(''), 'all');
        zip.file(`${baseFileName}-all-cards.html`, allCardsHTML);
        
        // Create a README file
        const titleText = this.cardTitle || 'Bingo Cards';
        const readme = `# ${titleText}

This ZIP file contains ${this.numCards} bingo cards in HTML format.

## Files:
- ${baseFileName}-1.html through ${baseFileName}-${this.numCards}.html: Individual card files
- ${baseFileName}-all-cards.html: All cards in one file for easy printing
- README.txt: This file

## How to use:
1. Open any HTML file in your web browser
2. Print the page (Ctrl+P or Cmd+P)
3. For best results, set margins to minimum and enable background graphics

Card Title: ${titleText}
Card Size: ${this.cardSize}x${this.cardSize}
Generated on: ${new Date().toLocaleString()}
`;
        
        zip.file('README.txt', readme);
        
        // Generate and download the ZIP file
        const content = await zip.generateAsync({type: 'blob'});
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        const zipFileName = this.cardTitle ? 
            `${baseFileName}-${this.cardSize}x${this.cardSize}-${new Date().toISOString().split('T')[0]}.zip` :
            `bingo-cards-${this.cardSize}x${this.cardSize}-${new Date().toISOString().split('T')[0]}.zip`;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    async createBingoFormatFile(values) {
        const baseFileName = this.cardTitle ? 
            this.cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') :
            'bingo-cards';
        
        if (this.numCards === 1) {
            // Single card - download directly
            const cardData = this.generateSingleCardData(values, 1);
            
            // Create title with card number
            let cardTitle = this.cardTitle || 'BINGO';
            cardTitle += ' | Card #1';
            
            const bingoData = {
                format: "bingo-card-generator-v1",
                metadata: {
                    title: cardTitle,
                    cardSize: this.cardSize,
                    centerText: this.freeText,
                    numCards: 1,
                    generatedDate: new Date().toISOString(),
                    generatedWith: "Bingo Card Generator"
                },
                masterList: values.filter(v => v !== this.freeText),
                callerList: values.filter(v => v !== this.freeText), // Complete list for caller mode
                cards: [cardData]
            };
            
            const jsonString = JSON.stringify(bingoData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseFileName}.bingo`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            // Multiple cards - create ZIP with separate .bingo files
            const zip = new JSZip();
            
            // Create individual .bingo files for each card
            for (let i = 1; i <= this.numCards; i++) {
                const cardData = this.generateSingleCardData(values, i);
                
                // Create title with card number after " | " symbol
                let cardTitle = this.cardTitle || 'BINGO';
                cardTitle += ` | Card #${i}`;
                
                const bingoData = {
                    format: "bingo-card-generator-v1",
                    metadata: {
                        title: cardTitle,
                        cardSize: this.cardSize,
                        centerText: this.freeText,
                        numCards: 1,
                        cardNumber: i,
                        generatedDate: new Date().toISOString(),
                        generatedWith: "Bingo Card Generator"
                    },
                    masterList: values.filter(v => v !== this.freeText),
                    callerList: values.filter(v => v !== this.freeText), // Complete list for caller mode
                    cards: [cardData]
                };
                
                const jsonString = JSON.stringify(bingoData, null, 2);
                const fileName = `${baseFileName}-${i}.bingo`;
                zip.file(fileName, jsonString);
            }
            
            // Create a master file with all cards
            const allCardsData = this.createBingoFormatData(values);
            const allCardsJson = JSON.stringify(allCardsData, null, 2);
            zip.file(`${baseFileName}-all-cards.bingo`, allCardsJson);
            
            // Create README
            const titleText = this.cardTitle || 'Bingo Cards';
            const readme = `# ${titleText}

This ZIP file contains ${this.numCards} bingo cards in .bingo format.

## Files:
- ${baseFileName}-1.bingo through ${baseFileName}-${this.numCards}.bingo: Individual card files
- ${baseFileName}-all-cards.bingo: All cards in one file (for multi-card selection)
- README.txt: This file

## .bingo Format:
Each .bingo file contains complete card data in JSON format that can be imported into the Bingo Card Generator for playing.

## How to use:
1. Upload any individual .bingo file to play a specific card
2. Upload the "all-cards.bingo" file to choose from multiple cards
3. Share individual .bingo files with players for their specific cards

Card Title: ${titleText}
Card Size: ${this.cardSize}x${this.cardSize}
Generated on: ${new Date().toLocaleString()}
`;
            
            zip.file('README.txt', readme);
            
            // Generate and download the ZIP file
            const content = await zip.generateAsync({type: 'blob'});
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            const zipFileName = `${baseFileName}-${this.cardSize}x${this.cardSize}-${new Date().toISOString().split('T')[0]}.zip`;
            a.download = zipFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }

    async createBothFormatsFile(cardsHTML, values) {
        const zip = new JSZip();
        
        // Add HTML files
        const baseFileName = this.cardTitle ? 
            this.cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') :
            'bingo-card';
        
        cardsHTML.forEach((cardHTML, index) => {
            const completeHTML = this.createCompleteHTMLFile(cardHTML, index + 1);
            const fileName = this.numCards > 1 ? `${baseFileName}-${index + 1}.html` : `${baseFileName}.html`;
            zip.file(fileName, completeHTML);
        });
        
        const allCardsHTML = this.createCompleteHTMLFile(cardsHTML.join(''), 'all');
        zip.file(`${baseFileName}-all-cards.html`, allCardsHTML);
        
        // Add .bingo format file
        const bingoData = this.createBingoFormatData(values);
        const jsonString = JSON.stringify(bingoData, null, 2);
        zip.file(`${baseFileName}.bingo`, jsonString);
        
        // Create README
        const titleText = this.cardTitle || 'Bingo Cards';
        const readme = `# ${titleText}

This ZIP file contains ${this.numCards} bingo cards in multiple formats.

## Files:
- ${baseFileName}.bingo: Custom format file for easy importing and playing
- ${baseFileName}-1.html through ${baseFileName}-${this.numCards}.html: Individual HTML card files for printing
- ${baseFileName}-all-cards.html: All cards in one HTML file for easy printing
- README.txt: This file

## .bingo Format:
The .bingo file contains all card data in a structured JSON format that can be imported back into the generator for easy sharing and playing.

## How to use:
1. For printing: Open any HTML file in your web browser and print
2. For playing: Upload the .bingo file in the "Play Bingo" tab
3. For sharing: Share the .bingo file - it's smaller and contains all the data

Card Title: ${titleText}
Card Size: ${this.cardSize}x${this.cardSize}
Generated on: ${new Date().toLocaleString()}
`;
        
        zip.file('README.txt', readme);
        
        // Generate and download the ZIP file
        const content = await zip.generateAsync({type: 'blob'});
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        const zipFileName = `${baseFileName}-${this.cardSize}x${this.cardSize}-${new Date().toISOString().split('T')[0]}.zip`;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    createBingoFormatData(values) {
        // Generate all card variations
        const cards = [];
        for (let i = 1; i <= this.numCards; i++) {
            const cardData = this.generateSingleCardData(values, i);
            cards.push(cardData);
        }
        
        return {
            format: "bingo-card-generator-v1",
            metadata: {
                title: this.cardTitle ? `${this.cardTitle} | All Cards` : "BINGO | All Cards",
                cardSize: this.cardSize,
                centerText: this.freeText,
                numCards: this.numCards,
                generatedDate: new Date().toISOString(),
                generatedWith: "Bingo Card Generator"
            },
            masterList: values.filter(v => v !== this.freeText),
            callerList: values.filter(v => v !== this.freeText), // Complete list for caller mode
            cards: cards
        };
    }

    generateSingleCardData(values, cardNumber) {
        // Check if we're in traditional bingo mode
        const isTraditionalBingo = this.isTraditionalMode && values.length === 75 && 
                                   values.every(v => v.match(/^[BINGO]\d+$/));
        
        if (isTraditionalBingo) {
            return this.generateTraditionalBingoCardData(values, cardNumber);
        }
        
        const totalCells = this.cardSize * this.cardSize;
        const centerIndex = Math.floor(totalCells / 2);
        const isOddSize = this.cardSize % 2 === 1;
        
        // For random mode, shuffle and distribute
        const availableValues = values.filter(v => v !== this.freeText);
        const requiredValues = totalCells - (isOddSize ? 1 : 0);
        
        let valuesToUse = [];
        
        if (availableValues.length >= requiredValues) {
            // We have enough unique values
            valuesToUse = this.shuffleArray(availableValues).slice(0, requiredValues);
        } else {
            // We need to repeat some values
            valuesToUse = [];
            const shuffledValues = this.shuffleArray(availableValues);
            
            for (let i = 0; i < requiredValues; i++) {
                valuesToUse.push(shuffledValues[i % shuffledValues.length]);
            }
            
            // Shuffle again to distribute the repeated items randomly
            valuesToUse = this.shuffleArray(valuesToUse);
        }
        
        let cardValues = [];
        let valueIndex = 0;
        
        for (let i = 0; i < totalCells; i++) {
            if (i === centerIndex && isOddSize) {
                cardValues.push({
                    content: this.freeText,
                    isCenter: true,
                    checked: true // Center is pre-checked
                });
            } else {
                cardValues.push({
                    content: valuesToUse[valueIndex],
                    isCenter: false,
                    checked: false
                });
                valueIndex++;
            }
        }
        
        return {
            cardNumber: cardNumber,
            gridSize: this.cardSize,
            cells: cardValues
        };
    }

    generateTraditionalBingoCardData(values, cardNumber) {
        // Separate numbers by column
        const bNumbers = values.filter(v => v.startsWith('B')); // B1-B15
        const iNumbers = values.filter(v => v.startsWith('I')); // I16-I30
        const nNumbers = values.filter(v => v.startsWith('N')); // N31-N45
        const gNumbers = values.filter(v => v.startsWith('G')); // G46-G60
        const oNumbers = values.filter(v => v.startsWith('O')); // O61-O75
        
        // Shuffle each column's numbers
        const shuffledB = this.shuffleArray(bNumbers).slice(0, 5);
        const shuffledI = this.shuffleArray(iNumbers).slice(0, 5);
        const shuffledN = this.shuffleArray(nNumbers).slice(0, 4);
        const shuffledG = this.shuffleArray(gNumbers).slice(0, 5);
        const shuffledO = this.shuffleArray(oNumbers).slice(0, 5);
        
        const cardValues = [];
        
        // Build the card row by row, column by column
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (row === 2 && col === 2) {
                    // Center square is always FREE
                    cardValues.push({
                        content: this.freeText,
                        isCenter: true,
                        checked: true
                    });
                } else if (col === 0) {
                    // B column
                    cardValues.push({
                        content: shuffledB[row],
                        isCenter: false,
                        checked: false
                    });
                } else if (col === 1) {
                    // I column
                    cardValues.push({
                        content: shuffledI[row],
                        isCenter: false,
                        checked: false
                    });
                } else if (col === 2) {
                    // N column - skip center (row 2)
                    const nIndex = row < 2 ? row : row - 1;
                    cardValues.push({
                        content: shuffledN[nIndex],
                        isCenter: false,
                        checked: false
                    });
                } else if (col === 3) {
                    // G column
                    cardValues.push({
                        content: shuffledG[row],
                        isCenter: false,
                        checked: false
                    });
                } else {
                    // O column
                    cardValues.push({
                        content: shuffledO[row],
                        isCenter: false,
                        checked: false
                    });
                }
            }
        }
        
        return {
            cardNumber: cardNumber,
            gridSize: 5, // Traditional bingo is always 5x5
            cells: cardValues
        };
    }

    createCompleteHTMLFile(cardHTML, cardNumber) {
        // Create appropriate title for the HTML file
        let fileTitle = 'BINGO';
        if (this.cardTitle) {
            fileTitle = this.cardTitle;
        }
        
        // Always append the card number after a " | " symbol for individual cards
        if (cardNumber !== 'all') {
            fileTitle += ` | Card #${cardNumber}`;
        } else {
            fileTitle = this.cardTitle ? `${this.cardTitle} | All Cards` : 'BINGO | All Cards';
        }
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileTitle}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }

        .preview-card {
            background: white;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 20px;
            margin: 20px auto;
            max-width: 600px;
            page-break-after: always;
        }

        .preview-card h3 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 1.5rem;
            color: #333;
        }

        .bingo-card {
            display: grid;
            gap: 2px;
            background: #333;
            border: 3px solid #333;
            border-radius: 10px;
            overflow: hidden;
            margin: 0 auto;
            max-width: 500px;
        }

        .bingo-cell {
            background: white;
            padding: 15px 5px;
            text-align: center;
            font-size: 0.8rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 60px;
            word-wrap: break-word;
            hyphens: auto;
        }

        .bingo-cell.center {
            background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
            color: white;
            font-weight: bold;
            font-size: 1rem;
        }

        @media print {
            body {
                padding: 0;
            }
            
            .preview-card {
                border: 2px solid #333;
                margin: 0;
                max-width: none;
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    ${cardHTML}
</body>
</html>`;
    }

    addIndividualDownloadListeners(values, cardsHTML) {
        const downloadButtons = document.querySelectorAll('.btn-download');
        
        downloadButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const cardNumber = parseInt(e.target.getAttribute('data-card'));
                const format = e.target.getAttribute('data-format');
                
                // Disable button temporarily
                e.target.disabled = true;
                const originalText = e.target.innerHTML;
                e.target.innerHTML = '⏳';
                
                try {
                    if (format === 'html') {
                        await this.downloadSingleHTMLCard(cardsHTML[cardNumber - 1], cardNumber);
                    } else if (format === 'bingo') {
                        await this.downloadSingleBingoCard(values, cardNumber);
                    }
                } catch (error) {
                    console.error('Error downloading card:', error);
                    alert('Error downloading card. Please try again.');
                } finally {
                    // Re-enable button
                    e.target.disabled = false;
                    e.target.innerHTML = originalText;
                }
            });
        });
    }

    async downloadSingleHTMLCard(cardHTML, cardNumber) {
        const baseFileName = this.cardTitle ? 
            this.cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') :
            'bingo-card';
        
        const fileName = `${baseFileName}-${cardNumber}.html`;
        
        // Create title with card number after " | " symbol
        let cardTitle = this.cardTitle || 'BINGO';
        cardTitle += ` | Card #${cardNumber}`;
        
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${cardTitle}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5; 
        }
        ${this.getBingoCardCSS()}
    </style>
</head>
<body>
    ${cardHTML}
</body>
</html>`;
        
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadSingleBingoCard(values, cardNumber) {
        const baseFileName = this.cardTitle ? 
            this.cardTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') :
            'bingo-card';
        
        const fileName = `${baseFileName}-${cardNumber}.bingo`;
        const cardData = this.generateSingleCardData(values, cardNumber);
        
        // Create title with card number after " | " symbol
        let cardTitle = this.cardTitle || 'BINGO';
        cardTitle += ` | Card #${cardNumber}`;
        
        const bingoData = {
            format: "bingo-card-generator-v1",
            metadata: {
                title: cardTitle,
                cardSize: this.cardSize,
                centerText: this.freeText,
                numCards: 1,
                cardNumber: cardNumber,
                generatedDate: new Date().toISOString(),
                generatedWith: "Bingo Card Generator"
            },
            masterList: values.filter(v => v !== this.freeText),
            callerList: values.filter(v => v !== this.freeText), // Complete list for caller mode
            cards: [cardData]
        };
        
        const blob = new Blob([JSON.stringify(bingoData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getBingoCardCSS() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
                padding: 20px;
            }

            .bingo-card {
                display: grid;
                gap: 2px;
                background: #333;
                border: 3px solid #333;
                border-radius: 10px;
                overflow: hidden;
                margin: 0 auto;
                max-width: 500px;
            }

            .bingo-cell {
                background: white;
                padding: 15px 5px;
                text-align: center;
                font-size: 0.8rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 60px;
                word-wrap: break-word;
                hyphens: auto;
            }

            .bingo-cell.center {
                background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
                color: white;
                font-weight: bold;
                font-size: 1rem;
            }
        `;
    }

    initializePlayerModes() {
        const modeButtons = document.querySelectorAll('.mode-button');
        const playerModes = document.querySelectorAll('.player-mode');

        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetMode = button.getAttribute('data-mode');
                
                // Remove active class from all buttons and modes
                modeButtons.forEach(btn => btn.classList.remove('active'));
                playerModes.forEach(mode => mode.classList.remove('active'));
                
                // Add active class to clicked button and corresponding mode
                button.classList.add('active');
                document.getElementById(`${targetMode}-mode`).classList.add('active');
            });
        });
    }

    initializeCallerMode() {
        const callerUploadButton = document.getElementById('callerUploadButton');
        const callerFileUpload = document.getElementById('callerFileUpload');
        const spinButton = document.getElementById('spinButton');
        const resetCallerButton = document.getElementById('resetCaller');
        const callerDropZone = document.getElementById('callerDropZone');

        callerUploadButton.addEventListener('click', () => {
            callerFileUpload.click();
        });

        callerFileUpload.addEventListener('change', (e) => {
            this.handleCallerFileUpload(e);
        });

        spinButton.addEventListener('click', () => {
            this.spinWheel();
        });

        resetCallerButton.addEventListener('click', () => {
            this.resetCaller();
        });

        // Initialize drag and drop
        this.initializeCallerDragAndDrop(callerDropZone, callerFileUpload);
    }

    initializeCallerDragAndDrop(dropZone, fileInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.name.toLowerCase().endsWith('.bingo')) {
                    // Create a mock event object for handleCallerFileUpload
                    const mockEvent = {
                        target: {
                            files: [file]
                        }
                    };
                    this.handleCallerFileUpload(mockEvent);
                } else {
                    alert('Please upload a .bingo file. Only .bingo files contain the complete item list for calling.');
                }
            }
        });
    }

    handleCallerFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.bingo')) {
            alert('Please upload a .bingo file. Only .bingo files contain the complete item list for calling.');
            return;
        }

        const callerFileName = document.getElementById('callerFileName');
        callerFileName.textContent = `Selected: ${file.name}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCallerBingoFile(e.target.result, file.name);
            } catch (error) {
                alert('Error reading the .bingo file. Please make sure it\'s a valid file.');
                console.error('Caller file parsing error:', error);
            }
        };
        reader.readAsText(file);
    }

    parseCallerBingoFile(jsonContent, fileName) {
        try {
            const bingoData = JSON.parse(jsonContent);
            
            if (bingoData.format !== "bingo-card-generator-v1") {
                throw new Error("Unsupported .bingo file format");
            }
            
            if (!bingoData.callerList || bingoData.callerList.length === 0) {
                throw new Error("No caller list found in .bingo file");
            }
            
            this.loadCallerItems(bingoData.callerList, bingoData.metadata);
            
        } catch (error) {
            throw new Error(`Invalid .bingo file: ${error.message}`);
        }
    }

    loadCallerItems(items, metadata) {
        this.callerItems = [...items];
        this.calledItems = [];
        
        // Update UI
        const callerArea = document.getElementById('callerArea');
        const callerTitle = document.getElementById('callerTitle');
        
        callerArea.style.display = 'block';
        callerTitle.textContent = `Calling: ${metadata.title || 'Bingo Items'}`;
        
        this.updateCallerStats();
        this.createSpinningWheel();
        this.updateCalledItemsList();
    }

    createSpinningWheel() {
        const wheelSegments = document.getElementById('wheelSegments');
        wheelSegments.innerHTML = '';
        
        if (this.callerItems.length === 0) {
            wheelSegments.innerHTML = '<div class="wheel-empty">No items remaining</div>';
            return;
        }
        
        const itemsToShow = this.callerItems.length; // Show ALL items, not just 12
        const anglePerSegment = 360 / itemsToShow;
        
        // Create SVG for pie segments
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('viewBox', '0 0 400 400');
        
        const centerX = 200;
        const centerY = 200;
        const radius = 180;
        
        for (let i = 0; i < itemsToShow; i++) {
            // Calculate angles
            const startAngle = (i * anglePerSegment - 90) * Math.PI / 180; // -90 to start from top
            const endAngle = ((i + 1) * anglePerSegment - 90) * Math.PI / 180;
            
            // Calculate path coordinates
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
            
            // Create SVG path for pie segment
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            path.setAttribute('d', pathData);
            
            // Generate a bright, distinct color for each segment
            const hue = (i * 360) / itemsToShow;
            const saturation = 70 + (i % 3) * 10;
            const lightness = 45 + (i % 2) * 10;
            path.setAttribute('fill', `hsl(${hue}, ${saturation}%, ${lightness}%)`);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            
            svg.appendChild(path);
            
            // Create text label
            const textAngle = (i + 0.5) * anglePerSegment - 90; // Center of segment
            const textRadius = radius * 0.7; // Position text at 70% of radius
            const textX = centerX + textRadius * Math.cos(textAngle * Math.PI / 180);
            const textY = centerY + textRadius * Math.sin(textAngle * Math.PI / 180);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('fill', 'white');
            
            // Adjust font size based on number of items and segment size
            let fontSize = 12;
            if (itemsToShow > 20) fontSize = 10;
            if (itemsToShow > 40) fontSize = 8;
            if (itemsToShow > 60) fontSize = 6;
            
            text.setAttribute('font-size', fontSize);
            text.setAttribute('font-weight', 'bold');
            text.style.filter = 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))';
            
            // Rotate text if needed for better readability
            if (textAngle > 90 && textAngle < 270) {
                text.setAttribute('transform', `rotate(${textAngle + 180} ${textX} ${textY})`);
            } else {
                text.setAttribute('transform', `rotate(${textAngle} ${textX} ${textY})`);
            }
            
            text.textContent = this.callerItems[i];
            svg.appendChild(text);
        }
        
        wheelSegments.appendChild(svg);
    }

    spinWheel() {
        if (this.isSpinning || this.callerItems.length === 0) return;
        
        this.isSpinning = true;
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = true;
        spinButton.textContent = '🌀';
        
        const wheel = document.getElementById('spinningWheel');
        
        // Add spinning class for animation
        wheel.classList.add('spinning');
        
        // Calculate random rotation (multiple full spins + random position)
        const minSpins = 3;
        const maxSpins = 6;
        const spins = minSpins + Math.random() * (maxSpins - minSpins);
        const finalAngle = Math.random() * 360;
        const totalRotation = (spins * 360) + finalAngle;
        
        // Apply rotation
        wheel.style.transform = `rotate(${totalRotation}deg)`;
        
        // After animation completes
        setTimeout(() => {
            this.selectWinningItem(finalAngle);
            this.isSpinning = false;
            spinButton.disabled = false;
            spinButton.textContent = '🎯 SPIN';
            wheel.classList.remove('spinning');
        }, 3000);
    }

    selectWinningItem(finalAngle) {
        if (this.callerItems.length === 0) return;
        
        // Normalize angle and calculate which segment was selected
        const normalizedAngle = (360 - (finalAngle % 360)) % 360;
        const itemsOnWheel = this.callerItems.length; // Use actual number of items
        const segmentAngle = 360 / itemsOnWheel;
        const selectedIndex = Math.floor(normalizedAngle / segmentAngle) % itemsOnWheel;
        
        // Get the selected item
        const selectedItem = this.callerItems[selectedIndex];
        
        // Move item from caller items to called items
        this.callerItems.splice(selectedIndex, 1);
        this.calledItems.unshift(selectedItem); // Add to beginning for latest-first order
        
        // Update UI
        this.updateCallerStats();
        this.updateCalledItemsList();
        this.createSpinningWheel(); // Recreate wheel without the called item
        
        // Show selection announcement
        this.announceSelection(selectedItem);
    }

    announceSelection(item) {
        // Create a temporary announcement
        const announcement = document.createElement('div');
        announcement.className = 'selection-announcement';
        announcement.textContent = `Called: ${item}`;
        announcement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end));
            color: white;
            padding: 2rem 3rem;
            border-radius: 15px;
            font-size: 1.5rem;
            font-weight: bold;
            box-shadow: 0 10px 30px var(--shadow);
            z-index: 1000;
            animation: announceItem 3s ease;
        `;
        
        // Add animation keyframes if not already added
        if (!document.querySelector('#announce-animation')) {
            const style = document.createElement('style');
            style.id = 'announce-animation';
            style.textContent = `
                @keyframes announceItem {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(announcement);
        
        // Remove after animation
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 3000);
    }

    updateCallerStats() {
        const remainingCount = document.getElementById('remainingCount');
        remainingCount.textContent = `${this.callerItems.length} items remaining`;
        
        // Disable spin button if no items left
        const spinButton = document.getElementById('spinButton');
        if (this.callerItems.length === 0) {
            spinButton.disabled = true;
            spinButton.textContent = '🏁 DONE';
        }
    }

    updateCalledItemsList() {
        const calledItemsList = document.getElementById('calledItems');
        calledItemsList.innerHTML = '';
        
        if (this.calledItems.length === 0) {
            calledItemsList.innerHTML = '<div class="no-items">No items called yet</div>';
            return;
        }
        
        this.calledItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = index === 0 ? 'called-item latest-called' : 'called-item';
            itemElement.textContent = item;
            calledItemsList.appendChild(itemElement);
        });
    }

    resetCaller() {
        if (this.calledItems.length === 0) return;
        
        const confirmReset = confirm('Reset all items and start over? This will put all called items back into the pool.');
        if (!confirmReset) return;
        
        // Move all called items back to caller items
        this.callerItems = [...this.callerItems, ...this.calledItems];
        this.calledItems = [];
        
        // Update UI
        this.updateCallerStats();
        this.updateCalledItemsList();
        this.createSpinningWheel();
        
        // Re-enable spin button
        const spinButton = document.getElementById('spinButton');
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN';
    }

    initializeThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('bingoTheme') || 'light';
        this.setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
            localStorage.setItem('bingoTheme', newTheme);
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeIcon = document.querySelector('.theme-icon');
        
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BingoCardGenerator();
});
