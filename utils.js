const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

//const string for parsing the board state returned by chess.js
const PAWN =  'p'
const ROOK = 'r'
const KNIGHT = 'n'
const BISHOP ='b'
const QUEEN = 'q'
const KING = 'k'


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
      27, 26, 25, 24, 23, 22, 21, "N", 14, 15, 16, 17, 18, 19, 20, //8
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


exports.toInput = async function(boardArray, color){

    //define the board building rules based on color of the player
    if(color === 'w'){
        player = 'w'
        opponent = 'b'
        top = 7
        bottom = 0
    }else{
        player = 'b'
        opponent = 'w'
        top = 0
        bottom = 7
    }
    info = 'player is: ' + player + "\n Board State:"



    var visualBoard = []
    var input = []
    if(color==='w'){

        for(a=0; a<=7; a++){
            visualBoard[a] = []
            input[a] =[];
            for(b=0; b<8; b++){
                var boardCell = boardArray[a][b]
                if(boardCell === null){
                    input[a][b] = EMPTY
                    visualBoard[a][b] = " ";
                }else if(boardCell.color === player){
                    if(boardCell.type == PAWN){input[a][b] = PAWN_PLAYER_ARR; visualBoard[a][b] = PAWN.toUpperCase();}
                    if(boardCell.type == ROOK){input[a][b] = ROOK_PLAYER_ARR; visualBoard[a][b] = ROOK.toUpperCase();}
                    if(boardCell.type == KNIGHT){input[a][b] = KNIGHT_PLAYER_ARR; visualBoard[a][b] = KNIGHT.toUpperCase();}
                    if(boardCell.type == BISHOP){input[a][b] = BISHOP_PLAYER_ARR; visualBoard[a][b] = BISHOP.toUpperCase();}
                    if(boardCell.type == QUEEN){input[a][b] = QUEEN_PLAYER_ARR; visualBoard[a][b] = QUEEN.toUpperCase();}
                    if(boardCell.type == KING){input[a][b] = KING_PLAYER_ARR; visualBoard[a][b] = KING.toUpperCase();}
                }else if(boardCell.color === opponent){
                    if(boardCell.type === PAWN){input[a][b] = PAWN_OPPONENT_ARR; visualBoard[a][b] = PAWN}
                    if(boardCell.type === ROOK){input[a][b] = ROOK_OPPONENT_ARR; visualBoard[a][b] = ROOK}
                    if(boardCell.type === KNIGHT){input[a][b] = KNIGHT_OPPONENT_ARR; visualBoard[a][b] = KNIGHT}
                    if(boardCell.type === BISHOP){input[a][b] = BISHOP_OPPONENT_ARR; visualBoard[a][b] = BISHOP}
                    if(boardCell.type === QUEEN){input[a][b] = QUEEN_OPPONENT_ARR; visualBoard[a][b] = QUEEN}
                    if(boardCell.type === KING){input[a][b] = KING_OPPONENT_ARR; visualBoard[a][b] = KING}
                }
                
            }
    
        }
    }else{
        for(a=7; a>=0; a--){
            visualBoard[a] = []
            input[a] =[];
            for(b=7; b>=0; b--){
                var boardCell = boardArray[7-a][7-b]
                
                if(boardCell === null){
                    input[a][b] = EMPTY
                    visualBoard[a][b] = " ";
                }else if(boardCell.color === player){
                    if(boardCell.type == PAWN){input[a][b] = PAWN_PLAYER_ARR; visualBoard[a][b] = PAWN}
                    if(boardCell.type == ROOK){input[a][b] = ROOK_PLAYER_ARR; visualBoard[a][b] = ROOK}
                    if(boardCell.type == KNIGHT){input[a][b] = KNIGHT_PLAYER_ARR; visualBoard[a][b] = KNIGHT}
                    if(boardCell.type == BISHOP){input[a][b] = BISHOP_PLAYER_ARR; visualBoard[a][b] = BISHOP}
                    if(boardCell.type == QUEEN){input[a][b] = QUEEN_PLAYER_ARR; visualBoard[a][b] = QUEEN}
                    if(boardCell.type == KING){input[a][b] = KING_PLAYER_ARR; visualBoard[a][b] = KING}
                }else if(boardCell.color === opponent){
                    if(boardCell.type === PAWN){input[a][b] = PAWN_OPPONENT_ARR; visualBoard[a][b] = PAWN.toUpperCase();}
                    if(boardCell.type === ROOK){input[a][b] = ROOK_OPPONENT_ARR; visualBoard[a][b] = ROOK.toUpperCase();}
                    if(boardCell.type === KNIGHT){input[a][b] = KNIGHT_OPPONENT_ARR; visualBoard[a][b] = KNIGHT.toUpperCase();}
                    if(boardCell.type === BISHOP){input[a][b] = BISHOP_OPPONENT_ARR; visualBoard[a][b] = BISHOP.toUpperCase();}
                    if(boardCell.type === QUEEN){input[a][b] = QUEEN_OPPONENT_ARR; visualBoard[a][b] = QUEEN.toUpperCase();}
                    if(boardCell.type === KING){input[a][b] = KING_OPPONENT_ARR; visualBoard[a][b] = KING.toUpperCase();}
                }
                
            }
    
        }
    }

    // for(a=0; a<8; a++){

    //     input[a] =[];
    //     for(b=0; b<8; b++){
    //         var boardCell = boardArray[a][b]
    //         if(boardCell === null){
    //             input[a][b] = EMPTY
    //         }else if(boardCell.color === player){
    //             if(boardCell.type == PAWN){input[a][b] = PAWN_PLAYER_ARR}
    //             if(boardCell.type == ROOK){input[a][b] = ROOK_PLAYER_ARR}
    //             if(boardCell.type == KNIGHT){input[a][b] = KNIGHT_PLAYER_ARR}
    //             if(boardCell.type == BISHOP){input[a][b] = BISHOP_PLAYER_ARR}
    //             if(boardCell.type == QUEEN){input[a][b] = QUEEN_PLAYER_ARR}
    //             if(boardCell.type == KING){input[a][b] = KING_PLAYER_ARR}
    //         }else if(boardCell.color === opponent){
    //             if(boardCell.type === PAWN){input[a][b] = PAWN_OPPONENT_ARR}
    //             if(boardCell.type === ROOK){input[a][b] = ROOK_OPPONENT_ARR}
    //             if(boardCell.type === KNIGHT){input[a][b] = KNIGHT_OPPONENT_ARR}
    //             if(boardCell.type === BISHOP){input[a][b] = BISHOP_OPPONENT_ARR}
    //             if(boardCell.type === QUEEN){input[a][b] = QUEEN_OPPONENT_ARR}
    //             if(boardCell.type === KING){input[a][b] = KING_OPPONENT_ARR}
    //         }
            
    //     }

    // }
    
 
    // console.debug(info)
    // console.debug(visualBoard)
    return tf.tensor4d([input]);
}


// uses list of legal moves created by engine to set all illegal moves to zero, this will be used by the 
// when training the model to teach it to avoid making illegal moves and also to only consider
// legal moves when choosing the highes Q value
exports.legalise = async function(modelOutput, legalMoves){
    movesLength = legalMoves.length

    //Makes a mask with ones for the legal moves
    maskLegalMoves = tf.buffer([1,8,8,73]); 

    //fill out the buffer with the indices of legal moves
    for(i=0; i<movesLength; i++){
        index = moveToIndex(legalMoves[i])
        await maskLegalMoves.set(1, 0, index.X, index.Y, index.Z)
    }
    maskLegalMoves = await maskLegalMoves.toTensor()

    //make a legal moves tensor out of multiplication of model output and mask
    legalisedMoves = await tf.mul(maskLegalMoves, modelOutput)

    return legalisedMoves
}


// finds the index of Highest Q value in the Output array
exports.findQindex = async function(inputTensor){
    indexOfTensor = []
    test = await inputTensor.data()
    T1 = await inputTensor.max(0),
    T2 = await T1.max(0),
    T3 = await T2.max(0),
    T4 = await T3.max(0),

    I1 = await inputTensor.argMax(0)
    I2 = await T1.argMax(0);
    I3 = await T2.argMax(0);
    I4 = await T3.argMax(0)


    data4 = await I4.data()
    index4 = data4[0]
    data3 = await I3.slice([index4], [1])
    index3 = (await data3.data())[0]
    data2 = await I2.slice([index3, index4], [1,1])
    index2 = (await data2.data())[0]
    data1 = await I1.slice([index2, index3, index4], [1,1,1])
    index1 = (await data1.data())[0]
     
    indexOfTensor[0] = index1
    indexOfTensor[1] = index2
    indexOfTensor[2] = index3
    indexOfTensor[3] = index4

    // iindex = []
    // iindex[0] = index1
    // iindex[1] = index2
    // iindex[2] = index3
    // iindex[3] = index4

    // console.log(iindex)
    return indexOfTensor;
}

exports.indexToMove = function(inputIndex, color){
    var toX = 0;
    var toY = 0;
    var Y = inputIndex[1]
    var X = inputIndex[2]
    var Z = inputIndex[3]

    promotion = undefined;
    if(Z<56){
        //All possible queen moves, covers everything except Knight moves and pawn promotions

        if(Z<7){//Vertical UP
            toX= X + Z + 1; //Moves up on board
            toY= Y;             //stays same on horizontal
        }else
        if(Z<14){//Vertial DOWN
            Z = Z-7;
            toX= X - Z - 1; //Moves left on board
            toY= Y;             //stays same on horizontal
        }else
        if(Z<21){//Horizontal RIGHT
            Z = Z- 14;
            toX= X                //stays same on vertical
            toY= Y + Z + 1; //Moves right on horiontal
        }else
        if(Z<28){//Horizontal LEFT
            Z = Z - 21;
            toX= X                //stays same on vertical
            toY= Y - Z - 1; //Moves left on horiontal
        }else
        if(Z<35){//Diagonal NE
            Z =Z- 28;
            toX= X + Z + 1; //Moves up on vertical
            toY= Y + Z + 1; //moves right on horizontal
        }else
        if(Z<42){//Diagonal SW
            Z = Z- 35; 
            toX= X - Z - 1; //Moves down on vertical
            toY= Y - Z - 1; //moves left on horizontal
        }else
        if(Z<49){//Diagonal NW
            Z =Z- 42;
            toX= X + Z + 1; //moves up on vertical 
            toY= Y - Z - 1; //moves left on horizontal
        }else
        if(Z<56){// Diagonal SE
            Z = Z- 49;
            toX= X - Z - 1; //moves down on vertical
            toY= Y + Z + 1; //moves right on horiontal
        }
    }else{
        //Covers all possible Knight moves 
        switch(Z){
            case 56: //moves 2 up 1 right
                toX = X + 2
                toY = Y + 1
                break
            case 57: //moves 2 up 1 left
                toX = X + 2
                toY = Y - 1
                break
            case 58: //moves 2 down 1 right
                toX = X - 2
                toY = Y + 1
                break
            case 59: //moves 2 down 1 left
                toX = X - 2
                toY = Y - 1
                break
            case 60: //moves 2 right 1 up
                toX = X + 1
                toY = Y + 2
                break
            case 61: //moves 2 right 1 down
                toX = X - 1
                toY = Y + 2
                break
            case 62: //moves 2 left 1 up
                toX = X + 1
                toY = Y - 2
                break
            case 63: //moves 2 left 1 down
                toX = X - 1
                toY = Y - 2
                break

            //Covers all Pawn promotions
            
            case 64: //move up, promote to queen
                toX = X + 1
                toY = Y
                promotion = 'q'
                break
            case 65: //move up promote to knight
                toX = X + 1
                toY = Y
                promotion = 'n'
                break 
            case 66: //move diagonal right, promote to queen
                toX = X + 1
                toY = Y + 1
                promotion = 'q'
                break
            case 67: //move diagonal right, promote to knight
                toX = X + 1
                toY = Y + 1
                promotion = 'n'
                break
            case 68: //move diagonal left, promote to queen
                toX = X + 1
                toY = Y - 1
                promotion = 'q'
                break
            case 69: //move diagonal left, promote to knight
                toX = X + 1
                toY = Y - 1
                promotion = 'n'
                break
            // case 71:
            // case 72:
        }
    }


    if(color == "w"){
        var to = ''+String.fromCharCode(97 + toY)+(toX+1);
        var from = ''+String.fromCharCode(97 + Y)+(X+1);
    }else{
        var to = ''+String.fromCharCode(97 + (7-toY))+((7-toX)+1);
        var from = ''+String.fromCharCode(97 + (7-Y))+((7-X)+1);
    }
    // var to = ''+String.fromCharCode(97 + toY)+(toX+1);
    // var from = ''+String.fromCharCode(97 + Y)+(X+1);
    if(promotion){
        return {from: from, to: to, promotion: promotion}
    }else{
        return {from: from, to: to}
    }

}

moveToIndex = function(move){
    from = parsePosition(move.from)
    to = parsePosition(move.to)
    indexOfMove = {}
    //I have to parse the moves based on the color of the figures model plays with.
    //As the model doesnt know the color of the pictures on the board
    //I have to change the move parsing mechanics based on the current color
    //I "flip" the move's idices and location when I color is black  and flip it back in
    // a parse move function 
    

        
    
    if(move.color == 'w'){
        indexOfMove.X = from.X 
        indexOfMove.Y = from.Y - 1
        indexOfMove.Z = RAYS[112 - 15 * (to.Y- from.Y) + (to.X - from.X)] 
    }else{
        indexOfMove.X = 7-from.X
        indexOfMove.Y = 8-from.Y 
        indexOfMove.Z = RAYS[112 - 15 * ((8-to.Y)- (8-from.Y)) + ((8-to.X) -(8- from.X))] 
    }


    //move promotion checks the promotion element, if the element is present there is six speceific moves that can be made, and they dont fit into the RAYS array, 
    //so I have to process them separately.
    //as there is no practical reasons to promote to anytnig other than queen or knight I ingnore all other possible promotions.
    if(move.promotion){
        if(move.promotion == 'n'){
            indexOfMove.promotion = 'n'
            switch(indexOfMove.Z){
                case 0:
                    indexOfMove.Z = 64
                    break;
                case 28:
                    indexOfMove.Z = 66
                    break;
                case 42:
                    indexOfMove.Z = 68
                    break;
            }
        }else{
            index.promotion = 'q'
            switch(indexOfMove.Z){
                case 0:
                    indexOfMove.Z = 65
                    break;
                case 28:
                    indexOfMove.Z = 67
                    break;
                case 42:
                    indexOfMove.Z = 69
                    break;
            }
        }
    }
    // index.X = from.X
    // index.Y = from.Y -1
    // index.Z = RAYS[112 - 15 * (to.Y- from.Y) + (to.X - from.X)] 
    
    return indexOfMove
}

parsePosition = function(position){
    indexOfPosition = {}

    indexOfPosition.X = (position.slice(0).charCodeAt(0) - 97);
    temp = position.slice(1)
    indexOfPosition.Y = parseInt(position.slice(1))
    return indexOfPosition
}

exports.randomiseMoves = async function(legalMoves, range){
    seed = await tf.randomUniform([1,8,8,73], 0.9, 1.1)
    return await legalMoves.mul(seed)


}

//Reworks the the memory so it can be used to train the model
exports.normaliseMemory = async function(gameMemory){
    normalMemory = gameMemory
    //temporary memory separated by color of the player. It is separated for easier processing.
    memoryWhite = [];
    memoryBlack = [];
    //Assembles the points for player and opponent for each turn
    playerPoints = [];
    opponentPoints = [];
    lastColor = gameMemory[0].color
    //check for failed turns, throw debug error in case it is
    for(i=1; i<gameMemory.length; i++){
        if(lastColor == gameMemory[i].color){
            err = "the turn failed at: " + i +", at color: " + gameMemory[i].color
            console.debug(err)
        }
        lastColor = gameMemory[i].color
    }
    //Split memory in two parts: Memory of black moves and White moves for easier processing and calculate points on the board
    for(i=0; i<gameMemory.length; i++){
        points = countPoints(gameMemory[i].board)

        if(gameMemory[i].color == 'w'){
            temp = {
                pointsPLayer: points.white,
                pointsOpponent: points.black,

                input: gameMemory[i].input,
                output: gameMemory[i].output,
                board: gameMemory[i].board,
                index: gameMemory[i].index,
                adjustedOutput: undefined,
            }
            memoryWhite[memoryWhite.length] = temp
        }else{
            temp ={
                pointsPLayer: points.black,
                pointsOpponent: points.white,

                input: gameMemory[i].input,
                output: gameMemory[i].output,
                board: gameMemory[i].board,
                index: gameMemory[i].index,
                adjustedOutput: undefined,
            }

            memoryBlack[memoryBlack.length] = temp
        }
    }

    //calculate rewards for the moves
    memoryWhite = calculateReward(memoryWhite);
    memoryBlack = calculateReward(memoryBlack);

    // concatenate memory back together
    normalMemory = memoryWhite.concat(memoryBlack)

    //remove low value moves that will contribute little to teaching the model
    normalMemory = cullLowValue(normalMemory)

    //calculate adjusted output that will be used in traing the model as a labeled data
    normalMemory =  await calculateAdjustedOutput(normalMemory)

    return normalMemory
}


//Count points from the board. Each side has points calculated separately
//Returns an object with .white as points for white side and .black as points for black side 
countPoints = function(board){
    pointsW = 0;
    pointsB = 0;
    for(a=0; a<8; a++){
        for(b=0; b<8; b++){
            if(board[a][b] === null){
            }else if(board[a][b].color === 'w'){
                switch(board[a][b].type){
                    case PAWN:      pointsW +=1;   break 
                    case ROOK:      pointsW +=3;   break
                    case KNIGHT:    pointsW +=3;   break
                    case BISHOP:    pointsW +=5;   break
                    case QUEEN:     pointsW +=9;   break
                    case KING:      pointsW +=100; break
                } 
            }else if(board[a][b].color === 'b'){
                switch(board[a][b].type){
                    case PAWN:      pointsB +=1;   break 
                    case ROOK:      pointsB +=3;   break
                    case KNIGHT:    pointsB +=3;   break
                    case BISHOP:    pointsB +=5;   break
                    case QUEEN:     pointsB +=9;   break
                    case KING:      pointsB +=100; break
                } 
            }   
        }
    }

    return {white: pointsW, black: pointsB}
}

//Calculates the Reward for the memory provided 
calculateReward = function(tempMemory){
    // console.log("passed memory")
    // console.log(tempMemory.length)
    if( tempMemory[tempMemory.length-1].pointsPLayer >=100 && tempMemory[tempMemory.length-1].pointsPLayer >=100){
        tempMemory[tempMemory.length-1].reward = 0;
        console.log('draw')
    }else{
        tempMemory[tempMemory.length-1].reward = (tempMemory[tempMemory.length-1].pointsPLayer - tempMemory[tempMemory.length-1].pointsOpponent)*0.1
        console.log('win')
    }
    for(i=(tempMemory.length-2); i>=0; i--){
        tempMemory[i].reward = ((tempMemory[i+1].pointsPLayer - tempMemory[i].pointsPLayer) - (tempMemory[i+1].pointsOpponent - tempMemory[i].pointsOpponent))*0.1
        if(tempMemory[i+1] != undefined ){
            tempMemory[i].reward += tempMemory[i+1].reward * 0.64;
        }
    }
    return tempMemory
}

cullLowValue = function(memory){

    oldLength = memory.length
    for(i=0; i<memory.length; i++){
        if(Math.abs(memory[i].reward)<0.001 ){
            memory.splice(i, 1)
        }
    }
    console.log('memory culled, \n old length: ')
    console.log(oldLength)
    console.log('new length')
    console.log(memory.length)
    return memory
}

// calculates the adjusted output that will be used as a labeled data to teach the neural network
// the 
calculateAdjustedOutput = async function(memory){
    //go through each memory cell
    for(i = 0; i<memory.length; i++){
        //create a buffer with same dimensions as the output tensor
        buffer  = tf.buffer([1,8,8,73]);
        //add reward to the buffer using index of the move made. 
        //the buffer.set() function cannot accept index of the move as an array, so I had to make it accept it piece wise, redo for cleaner look later
        buffer.set(memory[i].reward, memory[i].index[0], memory[i].index[1], memory[i].index[2], memory[i].index[3])
        buffer = await buffer.toTensor()
        //add buffer to output
        memory[i].adjustedOutput =  memory[i].output.add(buffer)
    }
    //return the memory
    return memory
}

//shuffle code taken from https://bost.ocks.org/mike/shuffle/
exports.shuffle = function(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
}