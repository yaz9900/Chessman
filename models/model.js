const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const model = tf.sequential();
try{
    model.add(tf.layers.dense({
        batchInputShape : [null, 8, 8, 12],
        units: 768,
        activation: 'relu',
        kernelInitializer: 'VarianceScaling'
    }));
}catch(err){throw(err)}

try{
    model.add(tf.layers.flatten());
}catch(err){throw(err)}

try{
    model.add(tf.layers.dense({
        // inputShape: [768],
        units: 4672,
        activation: 'relu',
        kernelInitializer: 'VarianceScaling'
    }));
}catch(err){throw(err)}

// try{
//     model.add(tf.layers.dense({
//         // inputShape: [4672],
//         units: 4672,
//         kernelInitializer: 'VarianceScaling',
//         activation: 'relu'
//     }));
// }catch(err){throw(err)}

// try{
//     model.add(tf.layers.dense({
//         // inputShape: [4672],
//         units: 4672,
//         kernelInitializer: 'VarianceScaling',
//         activation: 'relu'
//     }));
// }catch(err){throw(err)}

try{
    model.add(tf.layers.dense({
        // inputShape: [4672],
        units: 4672,
        kernelInitializer: 'VarianceScaling',
        activation: 'sigmoid'
    }));
}catch(err){throw(err)}

try{
    model.add(tf.layers.reshape({targetShape: [8, 8, 73]}));
}catch(err){throw(err)}

try{
    model.compile({
        //loss: "meanSquaredError",
        optimizer: tf.train.adagrad(0.06),
    })
}catch(err){throw(err)}
// const input = tf.layers.dense({units: 4672, 
//                                batchInputShape : [null, 8, 8, 12],
//                                kernelInitializer: 'VarianceScaling',
//                                activation: 'softmax'});
// //const flatLayer = tf.layers.flatten({inputShape: [8, 8, 12]})

// const denseLayer = tf.layers.dense({units: 4672, 
//                                     //kernelInitializer: 'VarianceScaling',
//                                     activation: 'softmax'});
// const outputLayer = tf.layers.dense({units: 4672, 
//                                     kernelInitializer: 'VarianceScaling',
//                                     activation: 'softmax'})

// const outputShape = tf.layers.reshape({targetShape: [8, 8, 73]})

// const model = tf.sequential();

// model.add(input)
// //model.add(flatLayer)
// model.add(denseLayer)
// model.add(denseLayer)
// model.add(denseLayer)
//model.add(outputLayer)

// model.add(outputShape)
module.exports = model
