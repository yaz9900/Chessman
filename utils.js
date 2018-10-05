//Const arrays for assembling the board state                        
const PAWN_PLAYER_ARR      = [1,0,0,0,0,0,0,0,0,0,0,0]
const ROOK_PLAYER_ARR      = [0,1,0,0,0,0,0,0,0,0,0,0]
const KNIGHT_PLAYER_ARR    = [0,0,1,0,0,0,0,0,0,0,0,0]
const BISHOP_PLAYER_ARR    = [0,0,0,1,0,0,0,0,0,0,0,0]
const QUEEN_PLAYER_ARR     = [0,0,0,0,1,0,0,0,0,0,0,0]
const KING_PLAYER_ARR      = [0,0,0,0,0,1,0,0,0,0,0,0]

const PAWN_OPPONENT_ARR    = [0,0,0,0,0,0,1,0,0,0,0,0]
const ROOK_OPPONENT_ARR    = [0,0,0,0,0,0,0,1,0,0,0,0]
const KNIGHT_OPPONENT_ARR  = [0,0,0,0,0,0,0,0,1,0,0,0]
const BISHOP_OPPONENT_ARR  = [0,0,0,0,0,0,0,0,0,1,0,0]
const QUEEN_OPPONENT_ARR   = [0,0,0,0,0,0,0,0,0,0,1,0]
const KING_OPPONENT_ARR    = [0,0,0,0,0,0,0,0,0,0,0,1]

const EMPTY                = [0,0,0,0,0,0,0,0,0,0,0,0]


//Attack vectors for parsing the Z index of the move from change of the board state
// to get an index for Z axis  use formula Zindex = 112 - 15 * Ymove + Xmove 
// Where Zindex is the Z index you need to find
// Ymove is how many squares in vertical direction piece have moved, up is positive
// Xmove is how many squares in horizontal direction piece have moved, right is positive

const RAYS = [
    // 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,  
      48,  0,  0,  0,  0,  0,  0,  6,  0,  0,  0,  0,  0,  0, 34, //1
       0, 47,  0,  0,  0,  0,  0,  5,  0,  0,  0,  0,  0, 33,  0, //2
       0,  0, 46,  0,  0,  0,  0,  4,  0,  0,  0,  0, 32,  0,  0, //3
       0,  0,  0, 45,  0,  0,  0,  3,  0,  0,  0, 31,  0,  0,  0, //4
       0,  0,  0,  0, 44,  0,  0,  2,  0,  0, 30,  0,  0,  0,  0, //5
       0,  0,  0,  0,  0, 43, 57,  1, 56, 29,  0,  0,  0,  0,  0, //6
       0,  0,  0,  0,  0, 62, 42,  0, 28, 60,  0,  0,  0,  0,  0, //7
      27, 26, 25, 24, 23, 22, 21,  0, 14, 15, 16, 17, 18, 19, 20, //8
       0,  0,  0,  0,  0, 63, 35,  7, 49, 61,  0,  0,  0,  0,  0, //9
       0,  0,  0,  0,  0, 36, 59,  8, 58, 50,  0,  0,  0,  0,  0, //10
       0,  0,  0,  0, 37,  0,  0,  9,  0,  0, 51,  0,  0,  0,  0, //11
       0,  0,  0, 38,  0,  0,  0, 10,  0,  0,  0, 52,  0,  0,  0, //12
       0,  0, 39,  0,  0,  0,  0, 11,  0,  0,  0,  0, 53,  0,  0, //13
       0, 40,  0,  0,  0,  0,  0, 12,  0,  0,  0,  0,  0, 54,  0, //14
      41,  0,  0,  0,  0,  0,  0, 13,  0,  0,  0,  0,  0,  0, 55  //15
   ];


//toInput converts the board information to the tensor that can be fed to the tensorflow model,
//It the output is an 4dim tensor with the shape of [8,8,12,1] where 0th and 1st dimensions represent the board
// 2nd dimension represents 12 possible figures on board (6 disctict types of 2 colors)
// 3rd dimension represents the batch of the board state, as we process 1 turn at a time, it is 1
// but it is possible to precess multiple board states at the same time

//As I want the model be able to learn and play both black and white pieces, I convert the board to 
//to always have bottom of the board be the side the model currently plays, for example
//if the model takes turn with white figures, the 1st row will be at the bottom of the board
//if the model takes turn with black figures, the 8th row will be at the bottom of the board
//Using this method, there is almost no effective difference for the model which color are
//the figures that model uses.


exports.toInput = function(boardArray, color){
    //define the board building rules based on color of the player
    if(color === 'w'){
        player = 'w'
        opponent = 'b'
        top = 8
        bottom = 0
    }else{
        player = 'b'
        opponent = 'w'
        top = 0
        bottom = 8
    }


    var input = []


    for(a=top; a<bottom; a++){
        input[a] =[];
        for(b=0; b<8; b++){
            var boardCell = board[a][b]
            if(boardCell === null){
                input[a][b] = EMPTY
            }else if(boardCell.color === player){
                if(boardCell.type == PAWN){input[a][b] = PAWN_PLAYER_ARR}
                if(boardCell.type == ROOK){input[a][b] = ROOK_PLAYER_ARR}
                if(boardCell.type == KNIGHT){input[a][b] = KNIGHT_PLAYER_ARR}
                if(boardCell.type == BISHOP){input[a][b] = BISHOP_PLAYER_ARR}
                if(boardCell.type == QUEEN){input[a][b] = QUEEN_PLAYER_ARR}
                if(boardCell.type == KING){input[a][b] = KING_PLAYER_ARR}
            }else if(boardCell.color === opponent){
                if(boardCell.type === PAWN){input[a][b] = PAWN_OPPONENT_ARR}
                if(boardCell.type === ROOK){input[a][b] = ROOK_OPPONENT_ARR}
                if(boardCell.type === KNIGHT){input[a][b] = KNIGHT_OPPONENT_ARR}
                if(boardCell.type === BISHOP){input[a][b] = BISHOP_OPPONENT_ARR}
                if(boardCell.type === QUEEN){input[a][b] = QUEEN_OPPONENT_ARR}
                if(boardCell.type === KING){input[a][b] = KING_OPPONENT_ARR}
            }
            
        }
    }


    return tf.tensor4d([input]);
}


// uses list of legal moves created by engine to set all illegal moves to zero, this will be used by the 
// when training the model to teach it to avoid making illegal moves and also to only consider
// legal moves when choosing the highes Q value
exports.legalise = function(modelOutput, legalMoves){
    movesLength = legalMoves.length

    //Makes a mask with ones for the legal moves
    maskLegalMoves = tf.buffer([8,8,73]); 

    //fill out the buffer with the indices of legal moves
    for(i=0; i<movesLength; i++){
        index = moveToIndex(legalMoves[i])
        await maskLegalMoves.set(1, index.X, index.Y, index.Z)
    }

    //make a legal moves tensor out of multiplication of model output and mask
    legalisedMoves = await tf.mul(modelOutput, maskLegalMoves)

    return legalisedMoves
}


// finds the index of Highest Q value in the Output array
exports.findQindex = function(inputTensor){
    

    return maxIndex;
}

exports.indexToMove = function(index, color){


    return move;
}

moveToIndex = function(move){
    from = ParsePositionIndex(moves[i].from)
    to = ParsePositionIndex(moves[i].to)

    index.X = from.X
    index.Y = from.Y
    index.Z = 112 - 15 * (to.Y- from.Y) + (to.X - from.X) 
    return index
}

parsePosition = function(position){
    var index
    var temp
    index.X = (position.slice(0).charCodeAt(0) - 97);
    temp = position.slice(1)
    index.Y = 8 - parseInt(position.slice(1))
    return position
}
