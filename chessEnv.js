
var Chess = require('./node_modules/chess.js').Chess;
var utils = require('./utils')
const tf = require('@tensorflow/tfjs-node');

//init loop
var chess = new Chess();



//Playing loop
    //initialise game
chess.reset()
turnCount = 0        
        //take turn

while(memory.length<100){
    board = chess.board() //get board
    color = chess.turn //get color of the figures moving this turn, b = black, w = white
    modelInput = utils.toInput(board, color) //convert board to a standart model input
    modelOutput = model.predict(modelInput) //get model output
    legalMoves = chess.moves({verbose: true}) //get all legal moves
    legalOutput = utils.legalise(modelOutput, legalMoves) //zero all illegal moves in model output
    moveIndex = utils.findQindex(legalOutput) //get the index of a highes Q value in the legalised output
    moveNotation = utils.indexToMove(moveIndex, color) //convert index to move notation acceptable by chess engine
    chess.move(moveNotation); //make a move

    gameMemory[turnCount]={
                            board: board,
                            output: legalOutput,
                            index: moveIndex
                          } //store turn information in game memory


    if(chess.game_over()){

        chess.reset()
        turnCount = 0     

    }
}
        //store data to memory
    //Process memory of this game
//Training loop
    //randomise data
    //batch data
    //train on data