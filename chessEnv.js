
var Chess = require('./node_modules/chess.js').Chess;
var utils = require('./utils')
const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');


var model = require('./models/model')
var config = undefined
//init loop

var chess = new Chess();
var memory= []
var gameMemory = []

PlayGame = async function(){
    //Playing loop
        //initialise game
    chess.reset()
    turnCount = 0        
            //take turn
    while(memory.length<1000){
        //console.log(chess.ascii())
        board = chess.board() //get board
        color = chess.turn() //get color of the figures moving this turn, b = black, w = white
        modelInput = await utils.toInput(board, color) //convert board to a standart model input
        modelOutput = await model.predict(modelInput) //get model output
        legalMoves = chess.moves({verbose: true}) //get all legal moves
        legalOutput = await utils.legalise(modelOutput, legalMoves)//zero all illegal moves in model output
        randLegalOutput = await utils.randomiseMoves(legalOutput, {min: 0.9, max:1.1})

        moveIndex = await utils.findQindex(randLegalOutput) //get the index of a highes Q value in the legalised output
        moveNotation = utils.indexToMove(moveIndex, color) //convert index to move notation acceptable by chess engine
        results = chess.move(moveNotation); //make a move
        if(!results){

            console.log("move failed")
            console.log("move made:")
            console.log(moveNotation)
            console.log('move index: ')
            console.log(moveIndex)
            console.log("possible Moves")
            for(i=0; i<legalMoves.length; i++){
                reg = /p/;
                if(legalMoves[i].flags.match(reg)){
                    console.log(legalMoves[i])
                }
            }
            err = "failed to make a move"
            throw err;
        }
        //store data to memory
        gameMemory[gameMemory.length]={
                                color: color,
                                board: board,
                                input: modelInput,
                                output: modelOutput,
                                adjustedOutput: undefined,
                                index: moveIndex,
                            } //store turn information in game memory
        if(chess.game_over()){
            //Process memory of this game
            normalMemory = await utils.normaliseMemory(gameMemory)
            memory.push.apply(memory, normalMemory)
            chess.reset()
            gameMemory=[]
            str = "memory length:" + memory.length
            console.log(str)
        }
    }
    await teachModel(memory,config)


}

//Training loop
teachModel = async function(memory, config){
    batchSize = 10;
    memory = utils.shuffle(memory)
    





}








    //randomise data
    //batch data
    //train on data




    PlayGame()

