
var Chess = require('./chess').Chess;
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
    try{
    //Playing loop
        //initialise game
    chess.reset()
    turnCount = 0        
            //take turn
    while(memory.length<100){
        //console.log(chess.ascii())
        board = chess.board() //get board
        color = chess.turn() //get color of the figures moving this turn, b = black, w = white
        modelInput = await utils.toInput(board, color) //convert board to a standart model input
        modelOutput = await model.predict(modelInput) //get model output
        modelData = await modelOutput.data()
        legalMoves = chess.moves({verbose: true}) //get all legal moves
        legalOutput = await utils.legalise(modelOutput, legalMoves)//zero all illegal moves in model output
        randLegalOutput = await utils.randomiseMoves(legalOutput, {min: 0.9, max:1.1})

        moveIndex = await utils.findQindex(randLegalOutput) //get the index of a highes Q value in the legalised output
        moveNotation = utils.indexToMove(moveIndex, color) //convert index to move notation acceptable by chess engine
        results = chess.move(moveNotation); //make a move
        console.log(moveIndex)
        if(!results){

            console.log("move failed")
            console.log(chess.ascii())
            console.log("legal Moves:")
            console.log(legalMoves)
            console.log("move made:")
            console.log(moveNotation)
            console.log('move index: ')
            console.log(moveIndex)

            // console.log("input")
            // console.log(modelInput)
            // console.log("output")
            // console.log(modelOutput)




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

    }catch(err){
        throw(err)
    }
}

//Training loop
teachModel = async function(memory, config){
    var batchSize = 10;
    var memory = utils.shuffle(memory)
    var batchInput = [];
    var batchOutput = [];
    while(memory.length>0){
        memCell = memory.pop()
        batchInput.push(memCell.input.max(0))
        batchOutput.push(memCell.adjustedOutput.max(0),)
        if(batchInput.length == 10){
            a = await tf.stack(batchInput);
            b = await tf.stack(batchOutput)
            h = await model.fit(a, b, {
                batchSize: batchSize,
                epochs: 1
            });
            console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);
            batchInput = [];
            batchOutput = [];
        }
    }
    // if(batchInput.length != 0){
    //     h = await model.fit(batchInput, batchOutput, {
    //         epochs: 1
    //     });
    //     console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);
    //     batchInput = [];
    //     batchOutput = [];
    // }

}








    //randomise data
    //batch data
    //train on data



try{
    PlayGame()
}catch(err){
    throw(err)
}
