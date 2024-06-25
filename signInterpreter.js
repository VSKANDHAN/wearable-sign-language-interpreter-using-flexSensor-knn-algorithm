const SerialPort = require('serialport').SerialPort;
const Readline = require('@serialport/parser-readline').ReadlineParser;
const say = require('say');
const fs = require('fs');
const csv = require('csv-parser');

const port = new SerialPort({ path: "COM3", baudRate: 9600 });

const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Load the CSV file containing sign data
const signData = [];

fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
        // Convert sensor values from string to number
        const sensorValues = Object.values(row).slice(0, -1).map(Number);
        const sign = row.sign;
        // Push an object with sensor values and sign to the signData array
        signData.push({ sensorValues, sign });
    })
    .on('end', () => {
        console.log('Sign data loaded');
    });

let lastIdentifiedSign = null; // Variable to store the last identified sign

parser.on('data', function (data) {
    const values = data.split(',');
    const flex1Value = parseInt(values[0]);
    const flex2Value = parseInt(values[1]);
    const flex3Value = parseInt(values[2]);
    const flex4Value = parseInt(values[3]);
    const flex5Value = parseInt(values[4]);

    const staticSensorValues = [flex1Value, flex2Value, flex3Value, flex4Value, flex5Value];

    // Identify the sign
    const identifiedSign = identifySign(staticSensorValues);

    // Check if the identified sign has changed since the last time
    if (identifiedSign && identifiedSign !== lastIdentifiedSign) {
        console.log('Identified sign:', identifiedSign);
        say.speak(identifiedSign);
        lastIdentifiedSign = identifiedSign; // Update the last identified sign
    }
});

// Function to calculate Euclidean distance between two arrays
function euclideanDistance(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        throw new Error('Arrays must have the same length');
    }

    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
        sum += Math.pow(arr1[i] - arr2[i], 2);
    }

    return Math.sqrt(sum);
}

// Function to identify the sign based on sensor data using kNN algorithm
function identifySign(sensorValues, k = 3) {
    // Calculate distances between the provided sensor values and all samples in the signData
    const distances = signData.map(({ sensorValues: csvValues, sign }) => ({
        distance: euclideanDistance(csvValues, sensorValues),
        sign
    }));

    // Sort the distances in ascending order
    distances.sort((a, b) => a.distance - b.distance);

    // Take the first k elements from the sorted distances
    const nearestNeighbors = distances.slice(0, k);

    // Count the occurrences of each sign among the nearest neighbors
    const signCounts = nearestNeighbors.reduce((counts, { sign }) => {
        counts[sign] = (counts[sign] || 0) + 1;
        return counts;
    }, {});

    // Find the sign with the highest count
    const identifiedSign = Object.keys(signCounts).reduce((maxSign, sign) => {
        if (signCounts[sign] > signCounts[maxSign]) {
            return sign;
        } else {
            return maxSign;
        }
    });

    return identifiedSign;
}
