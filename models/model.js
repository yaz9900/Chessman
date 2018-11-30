const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');


const input = tf.layers.dense({units: 768, 
                               inputShape: [8, 8, 12],
                               kernelInitializer: 'VarianceScaling',
                               activation: 'softmax'});
const flatLayer = tf.layers.flatten({inputShape: [8, 8, 12]})

const denseLayer = tf.layers.dense({units: 768, 
                                    //kernelInitializer: 'VarianceScaling',
                                    activation: 'softmax'});
const outputLayer = tf.layers.dense({units: 4672, 
                                    kernelInitializer: 'VarianceScaling',
                                    activation: 'softmax'})

const outputShape = tf.layers.reshape({targetShape: [8, 8, 73]})

const model = tf.sequential();

//model.add(input)
model.add(flatLayer)
model.add(denseLayer)
model.add(denseLayer)
model.add(denseLayer)
model.add(outputLayer)

model.add(outputShape)

module.exports = model