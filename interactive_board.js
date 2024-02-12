var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop(source, target) {
    // see if the move is legal
    newPiece = null
    piece = game.get(source)
    if (piece.type == "p" &&
        (piece.color == "w" && target[1] == "8" ||
            piece.color == "b" && target[1] == "1")) {
        newPiece = getPromotion()
    }

    var move = game.move({
        from: source,
        to: target,
        promotion: newPiece
    })

    // illegal move
    if (move === null) return 'snapback'

    updateStatus()
}

function getPromotion() {
    var userInput;
    var validChoices = ["q", "Q", "R", "r", "B", "b", "N", "n"];

    do {
        userInput = window.prompt("Promote to: (Q)ueen, (R)ook, (B)ishop, or k(N)ight");

        if (userInput === null) {
            return; // Exit the function if the user cancels
        }

        userInput = userInput.trim(); // Remove leading and trailing whitespaces

        if (!validChoices.includes(userInput)) {
            alert("Invalid choice.");
        }

    } while (!validChoices.includes(userInput));

    return userInput.toLowerCase()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(game.fen())
}

function updateStatus() {
    var status = ''

    var moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            status += ', ' + moveColor + ' is in check'
        }
    }

    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn())
}

function copyText(elementId) {
    /* Get the text content based on the provided element ID */
    var textToCopy = document.getElementById(elementId).innerText;

    /* Create a new ClipboardItem */
    var clipboardItem = new ClipboardItem({ "text/plain": new Blob([textToCopy], { type: "text/plain" }) });

    /* Use the Clipboard API to write to the clipboard */
    navigator.clipboard.write([clipboardItem]).then(function () {
        /* Optionally, provide some feedback to the user */
        alert("Text has been copied to the clipboard: " + textToCopy);
    }).catch(function (err) {
        /* Handle errors */
        console.error("Unable to copy text to clipboard", err);
    });
}

// Sample navigation function (replace with your specific logic)
function navigate(direction) {
    var userInput = document.getElementById('userInput').value;

    // Add your logic here based on user input and direction (back/forward)
    // For now, let's just log the input to the console
    console.log('User Input:', userInput);
}

// Sample submit function (replace with your specific logic)
function submitFENPGN() {
    var userInput = document.getElementById('userInput').value;
    try {
        game.load(userInput)
        board.position(game.fen())
        updateStatus()
        console.log("loaded " + userInput)
    } catch (e) {
        console.log(e)
    }

    // try {
    //     game.loadPgn(userInput)
    //     board.position(game.fen())
    //     updateStatus()
    //     console.log("loaded " + userInput)
    // } catch (e) {
    //     console.log(e)
    // }

    
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: "chessboardjs/img/chesspieces/wikipedia/{piece}.png"
}
board = Chessboard('board', config)

updateStatus()
