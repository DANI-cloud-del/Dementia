// ============================================
// CHESS GAME - SMART AI & LIMITED SPEECH (FIXED)
// ============================================

class ChessGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.board = this.initializeBoard();
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'ongoing';
        this.moveCount = 0;
        this.speechQueue = [];
        this.isSpeaking = false;
        
        this.pieceValues = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0
        };
        
        this.init();
    }

    init() {
        this.createBoardHTML();
        this.attachEventListeners();
        this.speakGreeting();
        console.log('♟️ Chess Game Initialized with Smart AI');
    }

    // ============================================
    // SMART SPEECH QUEUE SYSTEM
    // ============================================
    queueSpeech(text, priority = 'normal') {
        this.speechQueue.push({ text, priority, timestamp: Date.now() });
        this.processSpeechQueue();
    }

    processSpeechQueue() {
        if (this.isSpeaking || this.speechQueue.length === 0) return;
        const speech = this.speechQueue.shift();
        this.nilaSpeak(speech.text);
    }

    speakGreeting() {
        const greetings = [
            "Let's play chess!",
            "Ready to play chess?",
            "I'm ready. Your move!"
        ];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        this.queueSpeech(greeting, 'high');
    }

    nilaSpeak(text) {
        console.log('🎤 Nila:', text);
        this.isSpeaking = true;

        if (window.nila && window.nila.speak) {
            window.nila.speak(text).finally(() => {
                this.isSpeaking = false;
                setTimeout(() => this.processSpeechQueue(), 300);
            });
        } else if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            
            utterance.onend = () => {
                this.isSpeaking = false;
                setTimeout(() => this.processSpeechQueue(), 300);
            };
            
            utterance.onerror = () => {
                this.isSpeaking = false;
                setTimeout(() => this.processSpeechQueue(), 300);
            };
            
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            this.isSpeaking = false;
            setTimeout(() => this.processSpeechQueue(), 300);
        }

        this.showNilaComment(text);
    }

    showNilaComment(text) {
        const commentEl = document.getElementById('nila-comment');
        if (commentEl) {
            commentEl.textContent = `Nila: "${text}"`;
            commentEl.style.opacity = '1';
        }
    }

    // ============================================
    // MOVE QUALITY EVALUATION (FIXED)
    // ============================================
    evaluateMoveQuality(fromRow, fromCol, toRow, toCol, boardState) {
        const piece = boardState[fromRow][fromCol];
        const target = boardState[toRow][toCol];
        
        // SAFETY CHECK: Ensure piece exists
        if (!piece) {
            console.warn('⚠️ No piece at', fromRow, fromCol);
            return 0;
        }

        let quality = 0;

        // Capture evaluation
        if (target) {
            quality += this.pieceValues[target.type] * 10;
        }

        // Piece safety - check if destination is under attack
        const isUnderAttack = this.isSquareUnderAttack(toRow, toCol, piece.color, boardState);
        if (isUnderAttack && !target) {
            quality -= 5;
        }

        // Piece activity
        if (piece.type === 'queen' || piece.type === 'rook') {
            const straightMoves = this.countMovesInDirections(toRow, toCol, [[0,1],[0,-1],[1,0],[-1,0]], boardState);
            quality += straightMoves * 0.5;
        }

        if (piece.type === 'bishop') {
            const diagMoves = this.countMovesInDirections(toRow, toCol, [[1,1],[1,-1],[-1,1],[-1,-1]], boardState);
            quality += diagMoves * 0.3;
        }

        return quality;
    }

    isSquareUnderAttack(row, col, color, boardState) {
        const opponent = color === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (boardState[r][c] && boardState[r][c].color === opponent) {
                    const moves = this.getSimpleMoves(r, c, boardState);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    countMovesInDirections(row, col, directions, boardState) {
        let count = 0;
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isValidSquare(newRow, newCol)) break;
                count++;
                if (boardState[newRow][newCol]) break;
            }
        });
        return count;
    }

    // ============================================
    // REACT TO GOOD MOVES ONLY
    // ============================================
    reactToMove(piece, quality, captured) {
        if (quality > 8 || captured) {
            const reactions = {
                pawn: ["Nice pawn move!", "Good advancement!"],
                knight: ["Knight fork!", "Nice maneuver!"],
                bishop: ["Diagonal strategy!", "Smart bishop!"],
                rook: ["Powerful rook move!", "Good placement!"],
                queen: ["Bold queen move!", "Strong!"],
                king: ["King activation!"]
            };

            const typeReactions = reactions[piece.type] || [];
            if (typeReactions.length > 0) {
                const reaction = typeReactions[Math.floor(Math.random() * typeReactions.length)];
                this.queueSpeech(reaction, 'normal');
            }
        }
    }

    // ============================================
    // SMART AI - BEST MOVE SELECTION
    // ============================================
    getAIMove() {
        const moves = [];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].color === 'black') {
                    const validMoves = this.getValidMoves(r, c);
                    validMoves.forEach(m => {
                        const quality = this.evaluateMoveQuality(r, c, m.row, m.col, this.board);
                        moves.push({ 
                            from: {r, c}, 
                            to: m, 
                            quality: quality,
                            piece: this.board[r][c]
                        });
                    });
                }
            }
        }

        if (moves.length === 0) return null;

        moves.sort((a, b) => b.quality - a.quality);
        
        const topCount = Math.min(Math.max(3, Math.floor(moves.length / 5)), 5);
        const selectedMove = moves[Math.floor(Math.random() * topCount)];

        return selectedMove;
    }

    reactToAIMove(moveData) {
        const quality = moveData.quality;
        const piece = moveData.piece;

        if (quality > 10) {
            const reactions = {
                pawn: ["Advancing my pawns!"],
                knight: ["Knight fork!"],
                bishop: ["Bishop attack!"],
                rook: ["Rook power!"],
                queen: ["Queen strikes!"],
                king: ["King's moving!"]
            };

            const typeReactions = reactions[piece.type] || [];
            if (typeReactions.length > 0) {
                const reaction = typeReactions[Math.floor(Math.random() * typeReactions.length)];
                this.queueSpeech(reaction, 'normal');
            }
        }
    }

    // ============================================
    // BOARD INITIALIZATION
    // ============================================
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        board[0][0] = { type: 'rook', color: 'black', symbol: '♖' };
        board[0][1] = { type: 'knight', color: 'black', symbol: '♘' };
        board[0][2] = { type: 'bishop', color: 'black', symbol: '♗' };
        board[0][3] = { type: 'queen', color: 'black', symbol: '♕' };
        board[0][4] = { type: 'king', color: 'black', symbol: '♔' };
        board[0][5] = { type: 'bishop', color: 'black', symbol: '♗' };
        board[0][6] = { type: 'knight', color: 'black', symbol: '♘' };
        board[0][7] = { type: 'rook', color: 'black', symbol: '♖' };
        
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black', symbol: '♙' };
        }
        
        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: 'pawn', color: 'white', symbol: '♟' };
        }
        
        board[7][0] = { type: 'rook', color: 'white', symbol: '♜' };
        board[7][1] = { type: 'knight', color: 'white', symbol: '♞' };
        board[7][2] = { type: 'bishop', color: 'white', symbol: '♝' };
        board[7][3] = { type: 'queen', color: 'white', symbol: '♛' };
        board[7][4] = { type: 'king', color: 'white', symbol: '♚' };
        board[7][5] = { type: 'bishop', color: 'white', symbol: '♝' };
        board[7][6] = { type: 'knight', color: 'white', symbol: '♞' };
        board[7][7] = { type: 'rook', color: 'white', symbol: '♜' };
        
        return board;
    }

    // ============================================
    // CREATE BOARD HTML
    // ============================================
    createBoardHTML() {
        let boardHTML = `
            <div class="chess-game-wrapper">
                <div class="chess-header">
                    <h2>♟️ Chess with Nila</h2>
                    <p class="turn-indicator" id="turnIndicator">White to move</p>
                    <div class="nila-comment" id="nila-comment"></div>
                </div>
                
                <div class="chess-board-container">
                    <div class="chess-board" id="chessBoard">
        `;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const piece = this.board[row][col];
                
                boardHTML += `
                    <div 
                        class="chess-square ${isLight ? 'light' : 'dark'}"
                        data-row="${row}"
                        data-col="${col}"
                        id="square-${row}-${col}"
                    >
                        <span class="piece">${piece ? piece.symbol : ''}</span>
                    </div>
                `;
            }
        }
        
        boardHTML += `
                    </div>
                </div>
                
                <div class="chess-info">
                    <div class="captured-pieces">
                        <div class="captured-white">
                            <strong>Black Lost:</strong>
                            <span id="capturedWhite">-</span>
                        </div>
                        <div class="captured-black">
                            <strong>White Lost:</strong>
                            <span id="capturedBlack">-</span>
                        </div>
                    </div>
                    
                    <div class="chess-controls">
                        <button onclick="window.chessGame.resetGame()" class="chess-btn">New Game</button>
                        <button onclick="window.chessGame.showHint()" class="chess-btn">Hint</button>
                        <button onclick="window.chessGame.undoMove()" class="chess-btn">Undo</button>
                    </div>
                </div>

                <div class="game-over-modal" id="gameOverModal" style="display: none;">
                    <div class="modal-content">
                        <h3 id="gameOverTitle">Game Over!</h3>
                        <p id="gameOverMessage">The game has ended.</p>
                        <button onclick="window.chessGame.resetGame()" class="modal-btn">Play Again</button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = boardHTML;
    }

    // ============================================
    // MOVE VALIDATION
    // ============================================
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }
        
        return moves;
    }

    getSimpleMoves(row, col, boardState = null) {
        if (!boardState) boardState = this.board;
        const piece = boardState[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMovesOnBoard(row, col, boardState);
                break;
            case 'knight':
                moves = this.getKnightMovesOnBoard(row, col, boardState);
                break;
            case 'bishop':
                moves = this.getDiagonalMovesOnBoard(row, col, boardState);
                break;
            case 'rook':
                moves = this.getStraightMovesOnBoard(row, col, boardState);
                break;
            case 'queen':
                moves = [...this.getStraightMovesOnBoard(row, col, boardState), ...this.getDiagonalMovesOnBoard(row, col, boardState)];
                break;
            case 'king':
                moves = this.getKingMovesOnBoard(row, col, boardState);
                break;
        }
        
        return moves;
    }

    getPawnMoves(row, col) {
        let moves = [];
        const direction = this.board[row][col].color === 'white' ? -1 : 1;
        const startRow = this.board[row][col].color === 'white' ? 6 : 1;
        
        const forwardRow = row + direction;
        if (this.isValidSquare(forwardRow, col) && !this.board[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        [-1, 1].forEach(offset => {
            const newCol = col + offset;
            const newRow = row + direction;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getPawnMovesOnBoard(row, col, boardState) {
        let moves = [];
        const direction = boardState[row][col].color === 'white' ? -1 : 1;
        const startRow = boardState[row][col].color === 'white' ? 6 : 1;
        
        const forwardRow = row + direction;
        if (this.isValidSquare(forwardRow, col) && !boardState[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            
            if (row === startRow && !boardState[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        [-1, 1].forEach(offset => {
            const newCol = col + offset;
            const newRow = row + direction;
            if (this.isValidSquare(newRow, newCol)) {
                const target = boardState[newRow][newCol];
                if (target && target.color !== boardState[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        
        offsets.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getKnightMovesOnBoard(row, col, boardState) {
        const moves = [];
        const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        
        offsets.forEach(([dr, dc]) => {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.isValidSquare(newRow, newCol)) {
                const target = boardState[newRow][newCol];
                if (!target || target.color !== boardState[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getBishopMoves(row, col) {
        return this.getDiagonalMoves(row, col);
    }

    getRookMoves(row, col) {
        return this.getStraightMoves(row, col);
    }

    getQueenMoves(row, col) {
        return [...this.getStraightMoves(row, col), ...this.getDiagonalMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isValidSquare(newRow, newCol)) {
                    const target = this.board[newRow][newCol];
                    if (!target || target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return moves;
    }

    getKingMovesOnBoard(row, col, boardState) {
        const moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isValidSquare(newRow, newCol)) {
                    const target = boardState[newRow][newCol];
                    if (!target || target.color !== boardState[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return moves;
    }

    getStraightMoves(row, col) {
        const moves = [];
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    getStraightMovesOnBoard(row, col, boardState) {
        const moves = [];
        const directions = [[0,1],[0,-1],[1,0],[-1,0]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = boardState[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== boardState[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    getDiagonalMoves(row, col) {
        const moves = [];
        const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    getDiagonalMovesOnBoard(row, col, boardState) {
        const moves = [];
        const directions = [[1,1],[1,-1],[-1,1],[-1,-1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = boardState[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== boardState[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // ============================================
    // GAME STATUS CHECK
    // ============================================
    checkGameStatus() {
        let whiteKingExists = false;
        let blackKingExists = false;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c]) {
                    if (this.board[r][c].type === 'king') {
                        if (this.board[r][c].color === 'white') whiteKingExists = true;
                        if (this.board[r][c].color === 'black') blackKingExists = true;
                    }
                }
            }
        }

        if (!whiteKingExists) {
            this.endGame('king_captured', 'black');
            return true;
        }

        if (!blackKingExists) {
            this.endGame('king_captured', 'white');
            return true;
        }

        return false;
    }

    endGame(status, winner) {
        this.gameStatus = status;
        
        const modal = document.getElementById('gameOverModal');
        const titleEl = document.getElementById('gameOverTitle');
        const messageEl = document.getElementById('gameOverMessage');

        if (status === 'king_captured') {
            titleEl.textContent = winner === 'white' ? '🎉 You Win!' : '🎮 Nila Wins!';
            messageEl.textContent = winner === 'white' 
                ? 'Congratulations! You captured my king and won the game!' 
                : 'I captured your king! Good game!';
        }

        modal.style.display = 'flex';
        
        const endMessage = winner === 'white' 
            ? "You won! Excellent play!"
            : "Checkmate! I win this round!";
        this.queueSpeech(endMessage, 'high');
    }

    // ============================================
    // MAKE MOVE
    // ============================================
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        let captured = false;

        // Calculate quality BEFORE moving
        const quality = this.evaluateMoveQuality(fromRow, fromCol, toRow, toCol, this.board);

        if (this.board[toRow][toCol]) {
            this.capturedPieces[this.currentPlayer].push(this.board[toRow][toCol]);
            captured = true;
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        this.gameHistory.push({ 
            from: {row: fromRow, col: fromCol}, 
            to: {row: toRow, col: toCol}, 
            piece,
            quality,
            captured
        });
        this.moveCount++;

        this.reactToMove(piece, quality, captured);

        if (this.checkGameStatus()) {
            return;
        }

        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateBoard();

        if (this.currentPlayer === 'black') {
            setTimeout(() => this.makeAIMove(), 1200);
        }
    }

    makeAIMove() {
        const moveData = this.getAIMove();
        if (moveData) {
            const piece = this.board[moveData.from.r][moveData.from.c];
            let captured = false;

            if (this.board[moveData.to.row][moveData.to.col]) {
                this.capturedPieces['black'].push(this.board[moveData.to.row][moveData.to.col]);
                captured = true;
            }

            this.board[moveData.to.row][moveData.to.col] = piece;
            this.board[moveData.from.r][moveData.from.c] = null;

            this.gameHistory.push({ 
                from: {row: moveData.from.r, col: moveData.from.c}, 
                to: moveData.to, 
                piece,
                quality: moveData.quality,
                captured
            });
            this.moveCount++;

            this.reactToAIMove(moveData);

            if (this.checkGameStatus()) {
                return;
            }

            this.currentPlayer = 'white';
            this.updateBoard();
        }
    }

    // ============================================
    // UI UPDATES
    // ============================================
    updateBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const sq = document.getElementById(`square-${row}-${col}`);
                if (sq) {
                    const piece = this.board[row][col];
                    sq.querySelector('.piece').textContent = piece ? piece.symbol : '';
                }
            }
        }

        document.getElementById('turnIndicator').textContent = 
            `${this.currentPlayer === 'white' ? '♟️' : '♙'} ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} to move`;

        document.getElementById('capturedWhite').textContent = 
            this.capturedPieces.white.map(p => p.symbol).join(' ') || '-';
        document.getElementById('capturedBlack').textContent = 
            this.capturedPieces.black.map(p => p.symbol).join(' ') || '-';
    }

    // ============================================
    // HELPERS
    // ============================================
    resetGame() {
        this.board = this.initializeBoard();
        this.selectedSquare = null;
        this.validMoves = [];
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameStatus = 'ongoing';
        this.moveCount = 0;
        this.speechQueue = [];
        this.isSpeaking = false;
        
        document.getElementById('gameOverModal').style.display = 'none';
        this.updateBoard();
        this.clearHighlights();
        this.speakGreeting();
    }

    undoMove() {
        if (this.gameHistory.length === 0) return;
        const last = this.gameHistory.pop();
        this.board[last.from.row][last.from.col] = last.piece;
        this.board[last.to.row][last.to.col] = null;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.moveCount--;
        this.updateBoard();
    }

    showHint() {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].color === 'white') {
                    const validMoves = this.getValidMoves(r, c);
                    validMoves.forEach(m => {
                        const quality = this.evaluateMoveQuality(r, c, m.row, m.col, this.board);
                        moves.push({ from: {r, c}, to: m, quality });
                    });
                }
            }
        }

        if (moves.length > 0) {
            moves.sort((a, b) => b.quality - a.quality);
            const hint = moves[0];
            const files = ['a','b','c','d','e','f','g','h'];
            const from = `${files[hint.from.c]}${8-hint.from.r}`;
            const to = `${files[hint.to.col]}${8-hint.to.row}`;
            this.queueSpeech(`Try ${from} to ${to}.`, 'high');
        }
    }

    clearHighlights() {
        document.querySelectorAll('.chess-square').forEach(sq => {
            sq.classList.remove('selected', 'valid-move');
        });
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    attachEventListeners() {
        const squares = document.querySelectorAll('.chess-square');

        squares.forEach(square => {
            square.addEventListener('click', (e) => {
                if (this.gameStatus !== 'ongoing') return;
                if (this.currentPlayer !== 'white') return;

                const row = parseInt(square.dataset.row);
                const col = parseInt(square.dataset.col);

                if (!this.selectedSquare) {
                    const piece = this.board[row][col];
                    if (piece && piece.color === this.currentPlayer) {
                        this.selectedSquare = { row, col };
                        this.validMoves = this.getValidMoves(row, col);
                        this.highlightSquares();
                    }
                } else {
                    const isValid = this.validMoves.some(m => m.row === row && m.col === col);
                    if (isValid) {
                        this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                        this.selectedSquare = null;
                        this.validMoves = [];
                        this.clearHighlights();
                    } else {
                        const piece = this.board[row][col];
                        if (piece && piece.color === this.currentPlayer) {
                            this.selectedSquare = { row, col };
                            this.validMoves = this.getValidMoves(row, col);
                            this.highlightSquares();
                        } else {
                            this.selectedSquare = null;
                            this.validMoves = [];
                            this.clearHighlights();
                        }
                    }
                }
            });
        });
    }

    highlightSquares() {
        this.clearHighlights();

        if (this.selectedSquare) {
            const sq = document.getElementById(`square-${this.selectedSquare.row}-${this.selectedSquare.col}`);
            sq?.classList.add('selected');

            this.validMoves.forEach(move => {
                const sq = document.getElementById(`square-${move.row}-${move.col}`);
                sq?.classList.add('valid-move');
            });
        }
    }
}
