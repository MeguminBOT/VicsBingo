class BingoCardGenerator {
    constructor() {
        this.cardSize = 5;
        this.numCards = 5;
        this.freeText = 'FREE';
        this.cardTitle = '';
        this.outputFormat = 'bingo';
        this.inputValues = [];
        this.initializeEventListeners();
        this.initializeTabs();
        this.initializeGamePlayer();
        this.initializeThemeToggle();
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
        });

        document.getElementById('numCards').addEventListener('change', (e) => {
            this.numCards = parseInt(e.target.value);
        });

        document.getElementById('freeText').addEventListener('input', (e) => {
            this.freeText = e.target.value.trim() || 'FREE';
        });

        document.getElementById('cardTitle').addEventListener('input', (e) => {
            this.cardTitle = e.target.value.trim();
        });

        document.getElementById('generateGrid').addEventListener('click', () => {
            this.generateInputGrid();
        });

        document.getElementById('generateCards').addEventListener('click', () => {
            this.generateAndDownloadCards();
        });
    }

    generateInputGrid() {
        const gridContainer = document.getElementById('inputGrid');
        const generateSection = document.getElementById('generateSection');
        
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${this.cardSize}, 1fr)`;
        gridContainer.setAttribute('data-size', this.cardSize);
        
        const totalCells = this.cardSize * this.cardSize;
        const centerIndex = Math.floor(totalCells / 2);
        
        for (let i = 0; i < totalCells; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = i === centerIndex && this.cardSize % 2 === 1 ? this.freeText : `Item ${i + 1}`;
            input.dataset.index = i;
            
            if (i === centerIndex && this.cardSize % 2 === 1) {
                input.value = this.freeText;
                input.classList.add('center-cell');
                input.readOnly = true;
            }
            
            gridContainer.appendChild(input);
        }
        
        generateSection.style.display = 'block';
        document.getElementById('preview').innerHTML = '';
    }

    collectInputValues() {
        const inputs = document.querySelectorAll('#inputGrid input');
        const values = [];
        
        inputs.forEach(input => {
            if (input.value.trim()) {
                values.push(input.value.trim());
            }
        });
        
        return values;
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
        const totalCells = this.cardSize * this.cardSize;
        const centerIndex = Math.floor(totalCells / 2);
        const isOddSize = this.cardSize % 2 === 1;
        
        // Filter out the custom FREE text from values and shuffle
        const availableValues = values.filter(v => v !== this.freeText);
        const shuffledValues = this.shuffleArray(availableValues);
        
        // Create card array
        const cardValues = [];
        let valueIndex = 0;
        
        for (let i = 0; i < totalCells; i++) {
            if (i === centerIndex && isOddSize) {
                cardValues.push(this.freeText);
            } else {
                if (valueIndex < shuffledValues.length) {
                    cardValues.push(shuffledValues[valueIndex]);
                    valueIndex++;
                } else {
                    // If we run out of unique values, start reusing them
                    cardValues.push(shuffledValues[valueIndex % shuffledValues.length]);
                    valueIndex++;
                }
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
            alert('Please fill in at least one cell!');
            return;
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
                <h2>All Generated Cards (${this.numCards} total)</h2>
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
            alert('An error occurred while generating the cards. Please try again.');
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
            cards: cards
        };
    }

    generateSingleCardData(values, cardNumber) {
        const totalCells = this.cardSize * this.cardSize;
        const centerIndex = Math.floor(totalCells / 2);
        const isOddSize = this.cardSize % 2 === 1;
        
        // Filter out the custom FREE text from values and shuffle
        const availableValues = values.filter(v => v !== this.freeText);
        const shuffledValues = this.shuffleArray(availableValues);
        
        // Create card array
        const cardValues = [];
        let valueIndex = 0;
        
        for (let i = 0; i < totalCells; i++) {
            if (i === centerIndex && isOddSize) {
                cardValues.push({
                    content: this.freeText,
                    isCenter: true,
                    checked: true // Center is pre-checked
                });
            } else {
                if (valueIndex < shuffledValues.length) {
                    cardValues.push({
                        content: shuffledValues[valueIndex],
                        isCenter: false,
                        checked: false
                    });
                    valueIndex++;
                } else {
                    // If we run out of unique values, start reusing them
                    cardValues.push({
                        content: shuffledValues[valueIndex % shuffledValues.length],
                        isCenter: false,
                        checked: false
                    });
                    valueIndex++;
                }
            }
        }
        
        return {
            cardNumber: cardNumber,
            gridSize: this.cardSize,
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
