// ============================================
// CHESS ENGINE - NILA CHESS GAME
// ============================================

class ChessGame {
    constructor() {
        console.log('♟️ Initializing Chess Game');
        this.board = this.initializeBoard();
        this.currentPlayer = 'white'; // white starts
        this.gameHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameStatus = 'ongoing'; // ongoing, checkmate, stalemate, check
        this.capturedPieces = { white: [], black: [] };
    }

    // ============================================
    // BOARD INITIALIZATION
    // ============================================
    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up white pieces (bottom)
        board[7][0] = { type: 'rook', color: 'white', symbol: '♜' };
        board[7][1] = { type: 'knight', color: 'white', symbol: '♞' };
        board[7][2] = { type: 'bishop', color: 'white', symbol: '♝' };
        board[7][3] = { type: 'queen', color: 'white', symbol: '♛' };
        board[7][4] = { type: 'king', color: 'white', symbol: '♚' };
        board[7][5] = { type: 'bishop', color: 'white', symbol: '♝' };
        board[7][6] = { type: 'knight', color: 'white', symbol: '♞' };
        board[7][7] = { type: 'rook', color: 'white', symbol: '♜' };
        
        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: 'pawn', color: 'white', symbol: '♟' };
        }
        
        // Set up black pieces (top)
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
        
        return board;
    }

    // ============================================
    // MOVE VALIDATION
    // ============================================
    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    getPawnMoves(row, col, color) {
        let moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        const forwardRow = row + direction;
        if (this.isValidSquare(forwardRow, col) && !this.board[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            
            // Double move from start
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.board[doubleRow][col]) {
                    moves.push({ row: doubleRow, col });
                }
            }
        }
        
        // Captures
        [col - 1, col + 1].forEach(captureCol => {
            const captureRow = row + direction;
            if (this.isValidSquare(captureRow, captureCol)) {
                const target = this.board[captureRow][captureCol];
                if (target && target.color !== color) {
                    moves.push({ row: captureRow, col: captureCol });
                }
            }
        });
        
        return moves;
    }

    getKnightMoves(row, col, color) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        return knightMoves
            .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
            .filter(move => {
                if (!this.isValidSquare(move.row, move.col)) return false;
                const target = this.board[move.row][move.col];
                return !target || target.color !== color;
            });
    }

    getBishopMoves(row, col, color) {
        return this.getDiagonalMoves(row, col, color);
    }

    getRookMoves(row, col, color) {
        return this.getStraightMoves(row, col, color);
    }

    getQueenMoves(row, col, color) {
        return [...this.getStraightMoves(row, col, color), ...this.getDiagonalMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const kingMoves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (this.isValidSquare(newRow, newCol)) {
                    const target = this.board[newRow][newCol];
                    if (!target || target.color !== color) {
                        kingMoves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        return kingMoves;
    }

    getStraightMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    getDiagonalMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        directions.forEach(([dr, dc]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        
        return moves;
    }

    // ============================================
    // GAME LOGIC
    // ============================================
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const validMoves = this.getValidMoves(fromRow, fromCol);
        const isValid = validMoves.some(m => m.row === toRow && m.col === toCol);
        
        if (!isValid) return false;
        
        // Capture piece if exists
        if (this.board[toRow][toCol]) {
            this.capturedPieces[this.currentPlayer].push(this.board[toRow][toCol]);
        }
        
        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Record move
        this.gameHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            timestamp: Date.now()
        });
        
        // Check for game status
        this.updateGameStatus();
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        return true;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Simulate move
        const piece = this.board[fromRow][fromCol];
        const target = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Find king
        let kingRow, kingCol;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].type === 'king' && this.board[r][c].color === color) {
                    kingRow = r;
                    kingCol = c;
                }
            }
        }
        
        // Check if in check
        let inCheck = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = this.board[r][c];
                if (square && square.color !== color) {
                    const moves = this.getSimpleMoves(r, c, square.type);
                    if (moves.some(m => m.row === kingRow && m.col === kingCol)) {
                        inCheck = true;
                    }
                }
            }
        }
        
        // Undo move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = target;
        
        return inCheck;
    }

    getSimpleMoves(row, col, type) {
        // Simpler move calculation without recursion
        const color = this.board[row][col].color;
        
        switch (type) {
            case 'pawn':
                return this.getPawnMoves(row, col, color);
            case 'knight':
                return this.getKnightMoves(row, col, color);
            case 'bishop':
                return this.getBishopMoves(row, col, color);
            case 'rook':
                return this.getRookMoves(row, col, color);
            case 'queen':
                return this.getQueenMoves(row, col, color);
            case 'king':
                return this.getKingMoves(row, col, color);
            default:
                return [];
        }
    }

    updateGameStatus() {
        const opponent = this.currentPlayer === 'white' ? 'black' : 'white';
        let hasValidMoves = false;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].color === opponent) {
                    if (this.getValidMoves(r, c).length > 0) {
                        hasValidMoves = true;
                    }
                }
            }
        }
        
        if (!hasValidMoves) {
            this.gameStatus = 'checkmate'; // Simplified
        }
    }

    // ============================================
    // AI MOVE
    // ============================================
    getAIMove() {
        const moves = [];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].color === 'black') {
                    const validMoves = this.getValidMoves(r, c);
                    validMoves.forEach(move => {
                        moves.push({ from: { row: r, col: c }, to: move });
                    });
                }
            }
        }
        
        if (moves.length === 0) return null;
        
        // Smart move selection (prioritize captures and attacks)
        const captureMoves = moves.filter(m => this.board[m.to.row][m.to.col]);
        return (captureMoves.length > 0 ? captureMoves : moves)[Math.floor(Math.random() * (captureMoves.length || moves.length))];
    }

    // ============================================
    // BOARD REPRESENTATION
    // ============================================
    getBoardState() {
        return this.board.map(row => [...row]);
    }

    getPieceAt(row, col) {
        return this.board[row][col];
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.gameStatus = 'ongoing';
        this.capturedPieces = { white: [], black: [] };
    }
}
