// ============================================
// CHESS UI - BOARD RENDERING & INTERACTIONS
// ============================================

class ChessUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.game = new ChessGame();
        this.init();
    }

    init() {
        this.createBoard();
        this.attachEventListeners();
        console.log('♟️ Chess UI Initialized');
    }

    createBoard() {
        const boardHTML = `
            <div class="chess-container">
                <div class="chess-header">
                    <h2>♟️ Chess with Nila</h2>
                    <p class="status">White to move</p>
                </div>
                
                <div class="chess-board" id="chessBoard">
                    ${this.generateBoardSquares()}
                </div>
                
                <div class="chess-info">
                    <div class="captured-pieces">
                        <div class="captured-white">
                            <strong>Captured (Black):</strong>
                            <span id="capturedBlack"></span>
                        </div>
                        <div class="captured-black">
                            <strong>Captured (White):</strong>
                            <span id="capturedWhite"></span>
                        </div>
                    </div>
                    
                    <div class="chess-controls">
                        <button onclick="window.chessUI.resetGame()">New Game</button>
                        <button onclick="window.chessUI.getHint()">Get Hint</button>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = boardHTML;
    }

    generateBoardSquares() {
        let squares = '';
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const isLight = (row + col) % 2 === 0;
                const piece = this.game.getPieceAt(row, col);
                const squareId = `${files[col]}${8 - row}`;
                
                squares += `
                    <div 
                        class="chess-square ${isLight ? 'light' : 'dark'}"
                        data-row="${row}"
                        data-col="${col}"
                        id="square-${row}-${col}"
                    >
                        <span class="piece">${piece ? piece.symbol : ''}</span>
                        <span class="square-label">${squareId}</span>
                    </div>
                `;
            }
        }
        
        return squares;
    }

    attachEventListeners() {
        const squares = document.querySelectorAll('.chess-square');
        
        squares.forEach(square => {
            square.addEventListener('click', (e) => this.handleSquareClick(e));
        });
    }

    handleSquareClick(e) {
        const square = e.target.closest('.chess-square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        if (!this.game.selectedSquare) {
            // Select piece
            const piece = this.game.getPieceAt(row, col);
            if (piece && piece.color === this.game.currentPlayer) {
                this.game.selectedSquare = { row, col };
                this.game.validMoves = this.game.getValidMoves(row, col);
                this.highlightSquares();
            }
        } else {
            // Make move
            const move = this.game.makeMove(
                this.game.selectedSquare.row,
                this.game.selectedSquare.col,
                row,
                col
            );
            
            this.game.selectedSquare = null;
            this.game.validMoves = [];
            
            if (move) {
                this.updateBoard();
                setTimeout(() => this.makeAIMove(), 500);
            } else {
                this.highlightSquares();
            }
        }
    }

    highlightSquares() {
        document.querySelectorAll('.chess-square').forEach(sq => sq.classList.remove('selected', 'valid'));
        
        if (this.game.selectedSquare) {
            const sq = document.getElementById(
                `square-${this.game.selectedSquare.row}-${this.game.selectedSquare.col}`
            );
            sq?.classList.add('selected');
            
            this.game.validMoves.forEach(move => {
                const sq = document.getElementById(`square-${move.row}-${move.col}`);
                sq?.classList.add('valid');
            });
        }
    }

    updateBoard() {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.game.getPieceAt(row, col);
                const sq = document.getElementById(`square-${row}-${col}`);
                if (sq) {
                    sq.querySelector('.piece').textContent = piece ? piece.symbol : '';
                }
            }
        }
        
        // Update status
        document.querySelector('.status').textContent = 
            `${this.game.currentPlayer.charAt(0).toUpperCase() + this.game.currentPlayer.slice(1)} to move`;
        
        // Update captured pieces
        this.updateCapturedPieces();
    }

    updateCapturedPieces() {
        const capturedBlack = this.game.capturedPieces.white
            .map(p => p.symbol).join(' ');
        const capturedWhite = this.game.capturedPieces.black
            .map(p => p.symbol).join(' ');
        
        document.getElementById('capturedBlack').textContent = capturedBlack || 'None';
        document.getElementById('capturedWhite').textContent = capturedWhite || 'None';
    }

    makeAIMove() {
        const aiMove = this.game.getAIMove();
        if (aiMove) {
            this.game.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
            this.updateBoard();
        }
    }

    getHint() {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.game.board[r][c] && this.game.board[r][c].color === 'white') {
                    const validMoves = this.game.getValidMoves(r, c);
                    validMoves.forEach(m => moves.push({ from: { r, c }, to: m }));
                }
            }
        }
        
        if (moves.length > 0) {
            const hint = moves[Math.floor(Math.random() * moves.length)];
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const from = `${files[hint.from.c]}${8 - hint.from.r}`;
            const to = `${files[hint.to.col]}${8 - hint.to.row}`;
            alert(`Try: ${from} to ${to}`);
        }
    }

    resetGame() {
        this.game.resetGame();
        this.createBoard();
        this.attachEventListeners();
    }
}
